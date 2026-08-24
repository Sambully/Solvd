"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  Loader2,
  FileText,
  ImageIcon,
  X,
  Plus,
  Sliders,
  Sparkles,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import type { ExamCustomizationOptions } from "@/lib/examTypes";

const LOADING_MESSAGES = [
  "Reading your uploaded notes & diagrams…",
  "Extracting core NEET concepts & formulas…",
  "Framing authentic single-choice MCQs (4 options)…",
  "Calibrating plausible options & distractor logic…",
  "Generating detailed solution explanations…",
  "Finalizing your computer-based test environment…",
];

const QUESTION_COUNT_OPTIONS = [
  { value: 10, label: "10 Qs", desc: "Quick Quiz" },
  { value: 15, label: "15 Qs", desc: "Standard Practice" },
  { value: 20, label: "20 Qs", desc: "Chapter Test" },
  { value: 30, label: "30 Qs", desc: "Unit Test" },
  { value: 45, label: "45 Qs", desc: "Full NEET Section" },
];

const SUBJECT_OPTIONS = [
  "Auto / Mixed",
  "Physics",
  "Chemistry",
  "Biology",
  "Botany",
  "Zoology",
];

const DIFFICULTY_OPTIONS: Array<{
  value: ExamCustomizationOptions["difficulty"];
  label: string;
  desc: string;
}> = [
  { value: "MIXED", label: "NEET Standard", desc: "Balanced (25% Easy, 50% Med, 25% Hard)" },
  { value: "EASY", label: "Foundation", desc: "Basic & direct concept check" },
  { value: "HARD", label: "Rank Booster", desc: "Advanced multi-step calculations & tricky edge cases" },
];

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function GenerateExamCard() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [questionCount, setQuestionCount] = useState<number>(15);
  const [subject, setSubject] = useState<string>("Auto / Mixed");
  const [difficulty, setDifficulty] = useState<ExamCustomizationOptions["difficulty"]>("MIXED");
  const [showOptions, setShowOptions] = useState(false);

  const [status, setStatus] = useState<"idle" | "generating" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [msgIndex, setMsgIndex] = useState(0);

  // Rotate loading messages while generating
  useEffect(() => {
    if (status !== "generating") return;
    const id = setInterval(() => {
      setMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 2400);
    return () => clearInterval(id);
  }, [status]);

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
      // Deduplicate by name and size
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

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function onDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      addFiles(e.dataTransfer.files);
    }
  }

  async function handleGenerate() {
    if (files.length === 0) {
      setError("Please select or drop at least one study material file first.");
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
      body.append("subject", subject === "Auto / Mixed" ? "Mixed" : subject);
      body.append("difficulty", difficulty || "MIXED");

      const res = await fetch("/api/generate", { method: "POST", body });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Generation failed. Please try again.");
      }

      const { examId } = await res.json();
      router.push(`/dashboard/exam/${examId}`);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  const isGenerating = status === "generating";

  return (
    <div className="flex flex-col rounded-2xl border border-black/[.08] bg-white p-6 shadow-sm dark:border-white/[.1] dark:bg-zinc-950 lg:col-span-2">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="application/pdf,image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
        onChange={onInputChange}
      />

      {isGenerating ? (
        <div className="flex flex-col items-center justify-center gap-5 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900 shadow-inner">
            <Loader2 className="h-7 w-7 animate-spin text-black dark:text-white" />
          </div>

          <div className="max-w-md">
            <h3 className="text-xl font-bold tracking-tight text-black dark:text-zinc-50">
              Generating your NEET CBT
            </h3>
            <p className="mt-1.5 min-h-6 text-sm text-zinc-500 transition-all dark:text-zinc-400">
              {LOADING_MESSAGES[msgIndex]}
            </p>
          </div>

          {/* Indeterminate smooth progress bar */}
          <div className="h-2 w-full max-w-md overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div className="solvd-progress h-full w-1/3 rounded-full bg-black dark:bg-white" />
          </div>

          {/* Staged files count */}
          <p className="flex items-center gap-2 text-xs text-zinc-400">
            <FileCheck className="h-4 w-4 text-emerald-500" />
            Analyzing {files.length} file{files.length > 1 ? "s" : ""} · {questionCount} NEET MCQs
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-black dark:text-zinc-50">
                Generate Custom NEET Mock
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Upload PDFs, scanned notes, or chapter photos to build a timed NEET CBT test.
              </p>
            </div>
            <button
              onClick={() => setShowOptions(!showOptions)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${
                showOptions
                  ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                  : "border-black/[.1] text-zinc-600 hover:bg-zinc-50 dark:border-white/[.15] dark:text-zinc-300 dark:hover:bg-zinc-900"
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              {showOptions ? "Hide Settings" : "Exam Settings"}
            </button>
          </div>

          {/* Drag and Drop Zone */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 text-center transition-all ${
              isDragging
                ? "border-black bg-zinc-50 dark:border-white dark:bg-zinc-900"
                : "border-black/[.12] hover:border-black/[.25] hover:bg-zinc-50/50 dark:border-white/[.15] dark:hover:border-white/[.3] dark:hover:bg-zinc-900/30"
            }`}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900">
              <UploadCloud className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
            </div>

            <div>
              <p className="text-sm font-semibold text-black dark:text-zinc-50">
                Click to browse or drop your notes & papers here
              </p>
              <p className="mt-0.5 text-xs text-zinc-400">
                Supports single/multiple PDFs, JPG, PNG, WEBP (Up to 30 MB)
              </p>
            </div>
          </div>

          {/* Staged Files List */}
          {files.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                <span>Selected Files ({files.length})</span>
                <button
                  onClick={() => inputRef.current?.click()}
                  className="flex items-center gap-1 text-black hover:underline dark:text-zinc-50"
                >
                  <Plus className="h-3.5 w-3.5" /> Add more
                </button>
              </div>

              <div className="max-h-36 overflow-y-auto flex flex-col gap-1.5 pr-1">
                {files.map((file, idx) => {
                  const isPdf = file.name.toLowerCase().endsWith(".pdf");
                  return (
                    <div
                      key={`${file.name}-${idx}`}
                      className="flex items-center justify-between rounded-lg border border-black/[.06] bg-zinc-50/80 px-3 py-2 text-xs dark:border-white/[.08] dark:bg-zinc-900/50"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isPdf ? (
                          <FileText className="h-4 w-4 shrink-0 text-red-500" />
                        ) : (
                          <ImageIcon className="h-4 w-4 shrink-0 text-blue-500" />
                        )}
                        <span className="truncate font-medium text-black dark:text-zinc-200">
                          {file.name}
                        </span>
                        <span className="shrink-0 text-zinc-400">
                          ({formatBytes(file.size)})
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(idx);
                        }}
                        className="ml-2 rounded-md p-1 text-zinc-400 hover:bg-zinc-200 hover:text-black dark:hover:bg-zinc-800 dark:hover:text-white transition-colors"
                        title="Remove file"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Exam Customization Drawer */}
          {showOptions && (
            <div className="rounded-xl border border-black/[.08] bg-zinc-50/50 p-4 dark:border-white/[.08] dark:bg-zinc-900/30 flex flex-col gap-4 animate-in fade-in duration-200">
              {/* Question Count */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Question Count
                </label>
                <div className="mt-2 grid grid-cols-5 gap-2">
                  {QUESTION_COUNT_OPTIONS.map((opt) => {
                    const active = questionCount === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setQuestionCount(opt.value)}
                        className={`flex flex-col items-center justify-center rounded-lg border py-2 px-1 text-center transition-all ${
                          active
                            ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black font-semibold"
                            : "border-black/[.1] bg-white text-zinc-700 hover:bg-zinc-50 dark:border-white/[.1] dark:bg-zinc-900 dark:text-zinc-300"
                        }`}
                      >
                        <span className="text-xs font-bold">{opt.label}</span>
                        <span className="text-[10px] opacity-70 hidden sm:inline">{opt.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subject Focus */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Subject Focus
                </label>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {SUBJECT_OPTIONS.map((subj) => {
                    const active = subject === subj;
                    return (
                      <button
                        key={subj}
                        type="button"
                        onClick={() => setSubject(subj)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                          active
                            ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                            : "border-black/[.1] bg-white text-zinc-700 hover:bg-zinc-50 dark:border-white/[.1] dark:bg-zinc-900 dark:text-zinc-300"
                        }`}
                      >
                        {subj}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Difficulty Level */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Difficulty Calibration
                </label>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {DIFFICULTY_OPTIONS.map((diff) => {
                    const active = difficulty === diff.value;
                    return (
                      <button
                        key={diff.value}
                        type="button"
                        onClick={() => setDifficulty(diff.value)}
                        className={`flex flex-col items-start rounded-lg border p-2.5 text-left transition-all ${
                          active
                            ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                            : "border-black/[.1] bg-white text-zinc-700 hover:bg-zinc-50 dark:border-white/[.1] dark:bg-zinc-900 dark:text-zinc-300"
                        }`}
                      >
                        <span className="text-xs font-bold">{diff.label}</span>
                        <span className="text-[10px] opacity-75 mt-0.5">{diff.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-50/80 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Button */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-zinc-400">
              {files.length > 0
                ? `${files.length} file(s) · ${questionCount} Questions (${questionCount * 4} Marks)`
                : "No files chosen yet"}
            </span>

            <button
              onClick={handleGenerate}
              disabled={files.length === 0}
              className="flex items-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              <Sparkles className="h-4 w-4" />
              Generate NEET Exam
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

