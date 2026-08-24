"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Eye,
  Play,
  RotateCcw,
  Pencil,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
} from "lucide-react";
import type { RecentExam } from "@/lib/dashboardData";
import RenameExamModal from "@/components/RenameExamModal";
import { deleteExam } from "@/lib/examActions";

function formatActivityDate(date: Date) {
  const d = new Date(date);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });

  if (isToday) return `Today, ${time}`;

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${time}`;
  }

  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function performanceNote(percent: number) {
  if (percent >= 80) return "Excellent";
  if (percent >= 60) return "High Performance";
  return "Needs Review";
}

interface Props {
  exam: RecentExam;
  showDelete?: boolean;
  showReattempt?: boolean;
  onDeleted?: (id: string) => void;
}

export default function ExamCardItem({
  exam,
  showDelete = false,
  showReattempt = false,
  onDeleted,
}: Props) {
  const [title, setTitle] = useState(exam.title);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const maxScore = exam.questionCount * 4;
  const isAttempted = Boolean(exam.latestAttemptId);
  const percent =
    isAttempted && maxScore > 0 && exam.score !== null
      ? Math.max(0, Math.min(100, Math.round((exam.score / maxScore) * 100)))
      : 0;

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    setIsDeleting(true);
    const res = await deleteExam(exam.id);
    if (res.success) {
      onDeleted?.(exam.id);
    } else {
      alert(res.error || "Failed to delete exam.");
      setIsDeleting(false);
    }
  }

  return (
    <>
      <li className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-black/[.06] p-4 sm:p-5 last:border-b-0 dark:border-white/[.06] hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
        {/* Left Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm sm:text-base font-semibold text-black dark:text-zinc-50">
              {title}
            </p>
            <button
              onClick={() => setIsRenameOpen(true)}
              className="rounded-md p-1 text-zinc-400 hover:bg-zinc-200 hover:text-black dark:hover:bg-zinc-800 dark:hover:text-white transition-colors"
              title="Rename Test"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatActivityDate(exam.createdAt)}
            </span>
            <span>·</span>
            <span>{exam.questionCount} Questions ({maxScore} Marks)</span>
            <span>·</span>
            {isAttempted ? (
              <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Completed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-zinc-400">
                <Clock className="h-3.5 w-3.5" />
                Not Attempted
              </span>
            )}
          </div>
        </div>

        {/* Right Score & Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
          {isAttempted && (
            <div className="text-left sm:text-right">
              <p className="text-sm font-bold text-black dark:text-zinc-50">
                <span
                  className={
                    exam.score! >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-500"
                  }
                >
                  {exam.score! > 0 ? `+${exam.score}` : exam.score}
                </span>
                <span className="text-xs font-normal text-zinc-400"> / {maxScore}</span>
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {percent}% · {performanceNote(percent)}
              </p>
            </div>
          )}

          <div className="flex items-center gap-2">
            {isAttempted && exam.latestAttemptId ? (
              <>
                <Link
                  href={`/dashboard/attempt/${exam.latestAttemptId}`}
                  className="flex items-center gap-1.5 rounded-xl border border-black/[.15] bg-white px-3.5 py-2 text-xs font-semibold text-black transition-colors hover:bg-zinc-100 dark:border-white/[.2] dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Review Test
                </Link>
                {showReattempt && (
                  <Link
                    href={`/dashboard/exam/${exam.id}`}
                    className="flex items-center gap-1.5 rounded-xl bg-black px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reattempt Test
                  </Link>
                )}
              </>
            ) : (
              <Link
                href={`/dashboard/exam/${exam.id}`}
                className="flex items-center gap-1.5 rounded-xl bg-black px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                <Play className="h-3.5 w-3.5" />
                Start Test
              </Link>
            )}

            {showDelete && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-xl border border-black/[.08] p-2 text-zinc-400 hover:border-red-500/30 hover:bg-red-50 hover:text-red-600 dark:border-white/[.1] dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-colors"
                title="Delete Test"
              >
                {isDeleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </button>
            )}
          </div>
        </div>
      </li>

      <RenameExamModal
        examId={exam.id}
        currentTitle={title}
        isOpen={isRenameOpen}
        onClose={() => setIsRenameOpen(false)}
        onRenamed={(newTitle) => setTitle(newTitle)}
      />
    </>
  );
}
