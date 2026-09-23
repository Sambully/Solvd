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
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-7 shadow-sm text-slate-900">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
        onChange={onInputChange}
        className="hidden"
      />

      {status === "generating" ? (
        <div className="flex flex-col items-center justify-center gap-4 py-8 sm:py-12 text-center">
          <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-[#0f172a] text-white shadow-md">
            <Loader2 className="h-7 w-7 sm:h-8 sm:w-8 animate-spin text-amber-400" />
          </div>

          <div className="max-w-md">
            <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-950">
              Generating Authentic CBT Mock
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 font-medium animate-pulse">
              {LOADING_MESSAGES[msgIndex]}
            </p>
          </div>

          {/* Indeterminate smooth progress bar */}
          <div className="h-2 w-full max-w-md overflow-hidden rounded-full bg-slate-100">
            <div className="solvd-progress h-full w-1/3 rounded-full bg-slate-900" />
          </div>

          {/* Staged files count */}
          <p className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <FileCheck className="h-4 w-4 text-emerald-600" />
            Analyzing {files.length} file{files.length > 1 ? "s" : ""} · {questionCount} NEET MCQs
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3 border-b border-slate-100 pb-3 sm:pb-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm sm:text-base font-extrabold tracking-tight text-slate-950 flex items-center gap-1.5">
                  <span className="text-amber-500">⚡</span> Instant Mock Generator
                </span>
                <span className="rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-indigo-700">
                  Solvd CBT Engine
                </span>
              </div>
              <p className="mt-1 text-[11px] sm:text-xs text-slate-500 max-w-2xl">
                Upload handwritten notes or NCERT chapters. Solvd synthesizes high-yield questions with NTA penalty weighting in seconds.
              </p>
            </div>
            <button
              onClick={() => setShowOptions(!showOptions)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold transition-all self-start sm:self-auto ${
                showOptions
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
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
            className={`flex cursor-pointer flex-col items-center justify-center gap-2.5 sm:gap-3 rounded-2xl border-2 border-dashed p-5 sm:p-8 text-center transition-all ${
              isDragging
                ? "border-indigo-500 bg-indigo-50/50"
                : "border-slate-200/90 bg-slate-50/40 hover:border-slate-300 hover:bg-slate-50/80"
            }`}
          >
            {/* OCR Badge on Cloud Icon */}
            <div className="relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl border border-indigo-100 bg-white shadow-xs">
              <UploadCloud className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
              <span className="absolute -top-1.5 -right-1.5 rounded bg-indigo-600 px-1 py-0.2 text-[8px] sm:text-[9px] font-black uppercase text-white shadow-2xs">
                OCR
              </span>
            </div>

            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-900">
                Click to upload or drag & drop handwritten notes
              </p>
              <p className="mt-0.5 text-[11px] sm:text-xs text-slate-400">
                Supported: PDF, JPG, PNG (Max 25MB)
              </p>
              <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold text-amber-900">
                <span className="text-amber-500">⚡</span>
                <span>Generates {questionCount}-question custom NTA module</span>
              </div>
            </div>
          </div>

          {/* Staged Files List */}
          {files.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                <span>Selected Files ({files.length})</span>
                <button
                  onClick={() => inputRef.current?.click()}
                  className="flex items-center gap-1 text-indigo-600 hover:underline font-bold"
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
                      className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50 px-3.5 py-2 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isPdf ? (
                          <FileText className="h-4 w-4 shrink-0 text-red-500" />
                        ) : (
                          <ImageIcon className="h-4 w-4 shrink-0 text-blue-500" />
                        )}
                        <span className="truncate font-semibold text-slate-900">
                          {file.name}
                        </span>
                        <span className="shrink-0 text-slate-400 font-mono">
                          ({formatBytes(file.size)})
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(idx);
                        }}
                        className="ml-2 rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-900 transition-colors"
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
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5 flex flex-col gap-4 animate-in fade-in duration-200">
              {/* Question Count */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Question Count
                </label>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {QUESTION_COUNT_OPTIONS.map((opt) => {
                    const active = questionCount === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setQuestionCount(opt.value)}
                        className={`flex flex-col items-center justify-center rounded-xl border py-2 px-1 text-center transition-all ${
                          active
                            ? "border-slate-900 bg-slate-900 text-white font-bold shadow-xs"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
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
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
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
                        className={`rounded-xl border px-3.5 py-1.5 text-xs font-bold transition-all ${
                          active
                            ? "border-slate-900 bg-slate-900 text-white shadow-xs"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
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
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
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
                        className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all ${
                          active
                            ? "border-slate-900 bg-slate-900 text-white shadow-xs"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
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
            <div className="flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-50 p-3 text-xs font-semibold text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
            <span className="text-[11px] sm:text-xs text-slate-400 font-medium">
              {files.length > 0
                ? `${files.length} file(s) · ${questionCount} Questions (${questionCount * 4} Marks)`
                : "No files chosen yet"}
            </span>

            <button
              onClick={handleGenerate}
              disabled={files.length === 0}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-[#0f172a] px-6 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed active:scale-98"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              Generate NEET Exam
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

