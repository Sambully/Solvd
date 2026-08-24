"use client";

import { AlertCircle, HelpCircle } from "lucide-react";
import type { QuestionStatusMap } from "@/lib/ntaTypes";

interface Props {
  isOpen: boolean;
  examTitle: string;
  totalQuestions: number;
  questionIds: string[];
  statusMap: QuestionStatusMap;
  onConfirmSubmit: () => void;
  onCancel: () => void;
}

export default function NTASubmitModal({
  isOpen,
  examTitle,
  totalQuestions,
  questionIds,
  statusMap,
  onConfirmSubmit,
  onCancel,
}: Props) {
  if (!isOpen) return null;

  let answered = 0;
  let notAnswered = 0;
  let notVisited = 0;
  let markedReview = 0;
  let ansMarkedReview = 0;

  questionIds.forEach((id) => {
    const status = statusMap[id] ?? "NOT_VISITED";
    if (status === "ANSWERED") answered++;
    else if (status === "NOT_ANSWERED") notAnswered++;
    else if (status === "MARKED_FOR_REVIEW") markedReview++;
    else if (status === "ANSWERED_AND_MARKED_FOR_REVIEW") ansMarkedReview++;
    else notVisited++;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs select-none">
      <div className="w-full max-w-xl rounded-2xl border border-zinc-300 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
            <HelpCircle className="h-5 w-5" />
            <h3 className="text-base font-bold uppercase tracking-wider text-black dark:text-zinc-50">
              Exam Summary
            </h3>
          </div>
          <span className="text-xs font-semibold text-zinc-500 truncate max-w-[200px]">
            {examTitle}
          </span>
        </div>

        {/* NTA Tabular Breakdown */}
        <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-100 text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
              <tr>
                <th className="px-4 py-2.5">Section / Status</th>
                <th className="px-4 py-2.5 text-right">No. of Questions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-medium">
              <tr>
                <td className="px-4 py-2 flex items-center gap-2">
                  <span className="h-3 w-3 rounded-t rounded-b-xs bg-[#22c55e]" />
                  <span>Answered</span>
                </td>
                <td className="px-4 py-2 text-right font-bold text-emerald-600 dark:text-emerald-400">
                  {answered}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 flex items-center gap-2">
                  <span className="h-3 w-3 rounded-b rounded-t-xs bg-[#ef4444]" />
                  <span>Not Answered</span>
                </td>
                <td className="px-4 py-2 text-right font-bold text-red-600 dark:text-red-400">
                  {notAnswered}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#eab308]" />
                  <span>Marked for Review</span>
                </td>
                <td className="px-4 py-2 text-right font-bold text-amber-600 dark:text-amber-400">
                  {markedReview}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 flex items-center gap-2">
                  <span className="relative h-3 w-3 rounded-full bg-[#8b5cf6]">
                    <span className="absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                  </span>
                  <span>Answered & Marked for Review (Evaluated)</span>
                </td>
                <td className="px-4 py-2 text-right font-bold text-purple-600 dark:text-purple-400">
                  {ansMarkedReview}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 flex items-center gap-2">
                  <span className="h-3 w-3 rounded border border-zinc-400 bg-zinc-200 dark:bg-zinc-700" />
                  <span>Not Visited</span>
                </td>
                <td className="px-4 py-2 text-right font-bold text-zinc-500">
                  {notVisited}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Important NTA Warning Alert */}
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-300 bg-amber-50/80 p-3 text-xs text-amber-900 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-300">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
          <p className="leading-relaxed">
            Are you sure you want to submit the group? Once submitted, no further changes can be made to your answers.
          </p>
        </div>

        {/* Modal Actions */}
        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-xl border border-zinc-300 px-4 py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
          >
            No, Continue Exam
          </button>
          <button
            onClick={onConfirmSubmit}
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-blue-500 transition-colors shadow-sm"
          >
            Yes, Submit Exam
          </button>
        </div>
      </div>
    </div>
  );
}
