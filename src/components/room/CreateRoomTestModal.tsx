"use client";

import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Upload,
  X,
  FileText,
  Clock,
  Globe,
  Loader2,
  AlertCircle,
  ChevronDown,
  Layers,
} from "lucide-react";
import { createTestInRoom } from "@/lib/roomActions";
import type { ExamCustomizationOptions } from "@/lib/examTypes";

const LOADING_MESSAGES = [
  "Reading your notes and visual diagrams…",
  "Formulating NEET-calibrated MCQs & options…",
  "Generating step-by-step diagnostic solutions…",
  "Scheduling the room test for all participants…",
];

const NEET_SUBJECTS = ["Auto / Mixed", "Physics", "Chemistry", "Biology"];
const QUESTION_COUNT_OPTIONS = [5, 10, 15, 20, 25, 45];
const DIFFICULTY_OPTIONS: Array<{
  value: ExamCustomizationOptions["difficulty"];
  label: string;
  desc: string;
}> = [
  { value: "MIXED", label: "Standard NEET", desc: "Realistic 25% E / 50% M / 25% H distribution" },
  { value: "EASY", label: "Foundation", desc: "Concept booster & direct NCERT facts" },
  { value: "HARD", label: "Rank Booster", desc: "Analytical, multi-step & tricky edge cases" },
];

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

const DURATION_OPTIONS = [
  { value: 180, label: "3 Hours (Full NEET Mock)" },
  { value: 60, label: "1 Hour (Quick Test)" },
  { value: 90, label: "1.5 Hours (Sectional)" },
  { value: 200, label: "3h 20m (NTA Standard)" },
];

interface CreateRoomTestModalProps {
  isOpen: boolean;
  roomId: string;
  roomName: string;
  onClose: () => void;
  onTestCreated: () => void;
}

export default function CreateRoomTestModal({
  isOpen,
  roomId,
  roomName,
  onClose,
  onTestCreated,
}: CreateRoomTestModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [questionCount, setQuestionCount] = useState<number>(15);
  const [durationMinutes, setDurationMinutes] = useState<number>(180);
  const [subject, setSubject] = useState<string>("Auto / Mixed");
  const [difficulty, setDifficulty] = useState<ExamCustomizationOptions["difficulty"]>("MIXED");
  const [showOptions, setShowOptions] = useState(false);

  const [timeZone, setTimeZone] = useState("UTC");
  const [scheduledDateTime, setScheduledDateTime] = useState("");
  const [status, setStatus] = useState<"idle" | "generating" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      setTimeZone(tz);
      const start = new Date(Date.now() + 5 * 60 * 1000);
      const localISO = new Date(start.getTime() - start.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setScheduledDateTime(localISO);
    } catch {
      // Fallback
    }
  }, [isOpen]);

  useEffect(() => {
    if (status !== "generating") return;
    const id = setInterval(() => {
      setMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 2400);
    return () => clearInterval(id);
  }, [status]);

  if (!isOpen) return null;

  function addFiles(newFiles: FileList | File[]) {
    const valid = Array.from(newFiles).filter((f) => {
      const isPdf = f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
      const isImg = f.type.startsWith("image/") || /\.(png|jpg|jpeg|webp)$/i.test(f.name);
      return isPdf || isImg;
    });

    if (valid.length === 0) {
      setError("Please select PDF documents or images (PNG, JPG, JPEG, WEBP).");
      return;
    }

    setError(null);
    setFiles((prev) => {
      const existingNames = new Set(prev.map((f) => `${f.name}-${f.size}`));
      const filtered = valid.filter((f) => !existingNames.has(`${f.name}-${f.size}`));
      return [...prev, ...filtered];
    });
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) {
      addFiles(e.target.files);
    }
    e.target.value = "";
  }

  async function handleGenerateAndSchedule(e: React.FormEvent) {
    e.preventDefault();
    if (files.length === 0) {
      setError("Please select or drop at least one study material file first.");
      return;
    }

    if (!scheduledDateTime) {
      setError("Please select a scheduled start time for the room test.");
      return;
    }

    setStatus("generating");
    setError(null);
    setMsgIndex(0);

    try {
      const body = new FormData();
      for (const file of files) {
        body.append("files", file);
      }
      body.append("questionCount", questionCount.toString());
      body.append("durationMinutes", durationMinutes.toString());
      body.append("subject", subject === "Auto / Mixed" ? "Mixed" : subject);
      body.append("difficulty", difficulty || "MIXED");

      const res = await fetch("/api/generate", { method: "POST", body });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Exam generation failed. Please check files and retry.");
      }

      const { examId } = await res.json();

      const schedDate = new Date(scheduledDateTime);
      const roomRes = await createTestInRoom(roomId, examId, schedDate.toISOString());

      if (!roomRes.success) {
        throw new Error(roomRes.error || "Failed to schedule test in room.");
      }

      onTestCreated();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  const isGenerating = status === "generating";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-black/[.08] bg-white p-6 shadow-2xl dark:border-white/[.1] dark:bg-zinc-950 sm:p-8">
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="application/pdf,image/png,image/jpeg,image/jpg,image/webp"
          className="hidden"
          onChange={onInputChange}
        />

        <div className="flex items-center justify-between border-b border-black/[.06] pb-4 dark:border-white/[.08]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-black dark:text-zinc-50">
                Create Test in {roomName}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Upload chapter notes/PDFs to schedule a new test for all room members.
              </p>
            </div>
          </div>
          {!isGenerating && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-black dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {isGenerating ? (
          <div className="flex flex-col items-center justify-center gap-5 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900 shadow-inner">
              <Loader2 className="h-7 w-7 animate-spin text-black dark:text-white" />
            </div>

            <div className="max-w-md">
              <h3 className="text-xl font-bold tracking-tight text-black dark:text-zinc-50">
                Generating Group Room Test
              </h3>
              <p className="mt-1.5 min-h-6 text-sm text-zinc-500 transition-all dark:text-zinc-400">
                {LOADING_MESSAGES[msgIndex]}
              </p>
            </div>

            <div className="h-2 w-full max-w-md overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div className="h-full w-full animate-pulse rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
            </div>
          </div>
        ) : (
          <form onSubmit={handleGenerateAndSchedule} className="mt-5 flex flex-col gap-5">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files?.length) {
                  addFiles(e.dataTransfer.files);
                }
              }}
              onClick={() => inputRef.current?.click()}
              className={`group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-7 text-center transition-all ${
                isDragging
                  ? "border-blue-500 bg-blue-50/50 dark:border-blue-400 dark:bg-blue-950/20"
                  : "border-black/[.12] bg-zinc-50/50 hover:border-black/[.3] hover:bg-zinc-50 dark:border-white/[.15] dark:bg-zinc-900/30 dark:hover:border-white/[.3] dark:hover:bg-zinc-900/60"
              }`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-xs transition-transform group-hover:scale-110 dark:bg-zinc-800">
                <Upload className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
              </div>
              <div>
                <p className="text-sm font-semibold text-black dark:text-zinc-200">
                  Click to browse or drop files here
                </p>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  Upload PDF chapter notes, scanned textbook photos, or diagrams
                </p>
              </div>
            </div>

            {files.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  <span>Selected Files ({files.length}):</span>
                  <button
                    type="button"
                    onClick={() => setFiles([])}
                    className="text-red-600 hover:underline dark:text-red-400"
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {files.map((file, idx) => (
                    <div
                      key={`${file.name}-${idx}`}
                      className="flex items-center gap-2 rounded-lg border border-black/[.08] bg-zinc-50 px-2.5 py-1 text-xs dark:border-white/[.1] dark:bg-zinc-900"
                    >
                      <FileText className="h-3.5 w-3.5 text-blue-500" />
                      <span className="max-w-[150px] truncate font-medium text-black dark:text-zinc-200">
                        {file.name}
                      </span>
                      <span className="text-[10px] text-zinc-400">({formatBytes(file.size)})</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(idx);
                        }}
                        className="rounded-full p-0.5 text-zinc-400 hover:bg-zinc-200 hover:text-black dark:hover:bg-zinc-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-xl border border-black/[.08] bg-zinc-50/50 p-4 dark:border-white/[.08] dark:bg-zinc-900/40">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 block mb-2">
                Scheduled Start Date & Time
              </label>
              <input
                type="datetime-local"
                value={scheduledDateTime}
                onChange={(e) => {
                  setScheduledDateTime(e.target.value);
                  setError(null);
                }}
                className="w-full rounded-xl border border-black/[.12] bg-white px-4 py-2.5 text-sm font-medium text-black focus:border-black focus:outline-none dark:border-white/[.15] dark:bg-zinc-900 dark:text-white dark:focus:border-white"
                required
              />
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-zinc-400">
                <Globe className="h-3 w-3" />
                <span>Timezone: <strong>{timeZone}</strong> (Auto-synced for all members)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowOptions(!showOptions)}
              className="flex items-center justify-between text-xs font-semibold text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
            >
              <span className="flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-blue-500" />
                Exam Customization ({questionCount} Qs · {subject} · {difficulty})
              </span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${showOptions ? "rotate-180" : ""}`}
              />
            </button>

            {showOptions && (
              <div className="flex flex-col gap-4 rounded-xl border border-black/[.08] bg-zinc-50/40 p-4 dark:border-white/[.08] dark:bg-zinc-900/30 animate-in fade-in duration-150">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">
                      Question Count
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {QUESTION_COUNT_OPTIONS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setQuestionCount(c)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                            questionCount === c
                              ? "bg-black text-white dark:bg-white dark:text-black"
                              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                          }`}
                        >
                          {c} Questions
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">
                      Exam Duration
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {DURATION_OPTIONS.map((d) => (
                        <button
                          key={d.value}
                          type="button"
                          onClick={() => setDurationMinutes(d.value)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                            durationMinutes === d.value
                              ? "bg-black text-white dark:bg-white dark:text-black"
                              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">
                    Subject Focus
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {NEET_SUBJECTS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSubject(s)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                          subject === s
                            ? "bg-black text-white dark:bg-white dark:text-black"
                            : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">
                    Difficulty Level
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {DIFFICULTY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setDifficulty(opt.value)}
                        className={`flex flex-col text-left p-2.5 rounded-lg border transition-all ${
                          difficulty === opt.value
                            ? "border-black bg-white shadow-xs dark:border-white dark:bg-zinc-800"
                            : "border-black/[.08] bg-zinc-50 hover:bg-zinc-100 dark:border-white/[.08] dark:bg-zinc-900"
                        }`}
                      >
                        <span className="text-xs font-bold text-black dark:text-white">
                          {opt.label}
                        </span>
                        <span className="text-[10px] text-zinc-400 mt-0.5">
                          {opt.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-50/80 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-end gap-3 border-t border-black/[.06] pt-4 dark:border-white/[.08]">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-black/[.1] px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-white/[.15] dark:text-zinc-300 dark:hover:bg-zinc-900"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={files.length === 0}
                className="flex items-center gap-2 rounded-xl bg-black px-6 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                Generate & Schedule Test
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
