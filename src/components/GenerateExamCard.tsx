"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2, FileText } from "lucide-react";

const LOADING_MESSAGES = [
  "Reading your material…",
  "Understanding the concepts…",
  "Framing NEET-style questions…",
  "Building your answer key…",
  "Finalizing your exam…",
];

type Status = "idle" | "generating" | "error";

export default function GenerateExamCard() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [msgIndex, setMsgIndex] = useState(0);

  // Rotate the loading messages while generating.
  useEffect(() => {
    if (status !== "generating") return;
    const id = setInterval(() => {
      setMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(id);
  }, [status]);

  async function handleFile(file: File) {
    setFileName(file.name);
    setMsgIndex(0);
    setStatus("generating");
    setError(null);

    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/generate", { method: "POST", body });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Something went wrong.");
      }

      const { examId } = await res.json();
      router.push(`/dashboard/exam/${examId}`);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = ""; // allow re-selecting the same file
  }

  const isGenerating = status === "generating";

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-black/[.08] p-8 text-center dark:border-white/[.1] lg:col-span-2">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={onInputChange}
      />

      {isGenerating ? (
        <div className="flex w-full max-w-sm flex-col items-center gap-4 py-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900">
            <Loader2 className="h-5 w-5 animate-spin text-zinc-600 dark:text-zinc-300" />
          </div>
          <div className="w-full">
            <p className="text-lg font-semibold text-black dark:text-zinc-50">
              Generating your exam
            </p>
            <p className="mt-1 min-h-5 text-sm text-zinc-500 transition-opacity dark:text-zinc-400">
              {LOADING_MESSAGES[msgIndex]}
            </p>
          </div>
          {/* Indeterminate progress bar */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div className="solvd-progress h-full w-1/3 rounded-full bg-black dark:bg-white" />
          </div>
          {fileName && (
            <p className="flex items-center gap-1.5 text-xs text-zinc-400">
              <FileText className="h-3.5 w-3.5" />
              {fileName}
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900">
            <Upload className="h-5 w-5 text-zinc-500" />
          </div>
          <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
            Generate New Exam
          </h2>
          <p className="max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
            Upload your syllabus PDF, notes, or a question paper to create a
            custom NEET mock test.
          </p>
          {error && (
            <p className="max-w-sm text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          <button
            onClick={() => inputRef.current?.click()}
            className="mt-2 rounded-lg bg-black px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {error ? "Try Again" : "Browse Files"}
          </button>
        </>
      )}
    </div>
  );
}
