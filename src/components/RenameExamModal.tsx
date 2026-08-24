"use client";

import { useState, useTransition } from "react";
import { Loader2, Edit3, X } from "lucide-react";
import { renameExam } from "@/lib/examActions";

interface Props {
  examId: string;
  currentTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onRenamed?: (newTitle: string) => void;
}

export default function RenameExamModal({
  examId,
  currentTitle,
  isOpen,
  onClose,
  onRenamed,
}: Props) {
  const [title, setTitle] = useState(currentTitle);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Exam title cannot be empty.");
      return;
    }

    setError(null);
    startTransition(async () => {
      const res = await renameExam(examId, trimmed);
      if (res.success) {
        onRenamed?.(trimmed);
        onClose();
      } else {
        setError(res.error || "Failed to rename exam.");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border border-black/[.08] bg-white p-6 shadow-2xl dark:border-white/[.1] dark:bg-zinc-950">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900">
              <Edit3 className="h-4 w-4 text-black dark:text-zinc-50" />
            </div>
            <h3 className="text-base font-bold text-black dark:text-zinc-50">
              Rename Exam
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-black dark:hover:bg-zinc-900 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Exam Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Thermodynamics NEET Mock Test"
              className="mt-1.5 w-full rounded-xl border border-black/[.1] bg-transparent px-3.5 py-2.5 text-sm text-black placeholder:text-zinc-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-white/[.15] dark:text-zinc-50 dark:focus:border-white dark:focus:ring-white"
              autoFocus
              maxLength={120}
            />
            <span className="mt-1 block text-right text-[11px] text-zinc-400">
              {title.length}/120
            </span>
          </div>

          {error && (
            <p className="text-xs font-medium text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-xl border border-black/[.1] px-4 py-2 text-xs font-semibold text-black hover:bg-zinc-50 disabled:opacity-50 dark:border-white/[.15] dark:text-zinc-50 dark:hover:bg-zinc-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !title.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-black px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-40 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save Name
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
