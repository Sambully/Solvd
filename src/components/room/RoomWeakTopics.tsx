"use client";

import { AlertTriangle, Lightbulb } from "lucide-react";
import type { WeakTopicQuestion } from "@/lib/roomActions";
import DiagramViewer from "@/components/DiagramViewer";

interface RoomWeakTopicsProps {
  weakTopics: WeakTopicQuestion[];
}

export default function RoomWeakTopics({ weakTopics }: RoomWeakTopicsProps) {
  if (weakTopics.length === 0) {
    return (
      <div className="rounded-2xl border border-black/[.08] bg-white p-6 text-center shadow-sm dark:border-white/[.1] dark:bg-zinc-950">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
          <Lightbulb className="h-5 w-5" />
        </div>
        <h4 className="mt-3 text-sm font-bold text-black dark:text-zinc-50">
          Outstanding Group Mastery!
        </h4>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Your room did not have any high-error cluster questions. All participants performed consistently well!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
          <AlertTriangle className="h-4.5 w-4.5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-black dark:text-zinc-50">
            Group Weak Concept Breakdown ({weakTopics.length})
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Questions where 40%+ of the room made errors or dropped marks. Review solutions together.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {weakTopics.map((q, idx) => (
          <div
            key={q.questionId}
            className="rounded-2xl border border-black/[.08] bg-white p-5 shadow-xs dark:border-white/[.1] dark:bg-zinc-950"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-800 dark:bg-amber-900 dark:text-amber-300">
                  {idx + 1}
                </span>
                <p className="text-sm font-semibold text-black dark:text-zinc-100">
                  {q.questionText}
                </p>
              </div>

              <div className="flex flex-col items-end shrink-0">
                <span className="rounded-md bg-red-100 px-2 py-0.5 text-xs font-bold text-red-800 dark:bg-red-950 dark:text-red-300">
                  {q.errorRate}% Group Error
                </span>
                <span className="text-[10px] text-zinc-400 mt-0.5">
                  {q.wrongCount} of {q.totalAttempts} struggled
                </span>
              </div>
            </div>

            {/* Visual Vector Diagram if present */}
            {q.diagramSvg && (
              <div className="mt-3 sm:ml-9">
                <DiagramViewer
                  svgString={q.diagramSvg}
                  title="Concept / Mechanism Diagram"
                />
              </div>
            )}

            {/* Solution & Concept Explanation */}
            {q.explanation && (
              <div className="mt-3 rounded-xl border border-black/[.05] bg-zinc-50/80 p-3.5 sm:ml-9 dark:border-white/[.06] dark:bg-zinc-900/60">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Key Concept Solution
                </p>
                <p className="mt-1 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {q.explanation}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
