"use client";

import { User } from "lucide-react";
import type { QuestionStatus, QuestionStatusMap } from "@/lib/ntaTypes";

interface Props {
  candidateName: string;
  totalQuestions: number;
  currentQuestionIndex: number;
  questionIds: string[];
  statusMap: QuestionStatusMap;
  onSelectQuestion: (index: number) => void;
}

export function NTAStatusBadge({
  status,
  number,
  isCurrent,
}: {
  status: QuestionStatus;
  number: number;
  isCurrent?: boolean;
}) {
  const baseClasses =
    "relative flex h-8 w-8 items-center justify-center text-xs font-bold transition-all select-none";

  const ringClass = isCurrent ? "ring-2 ring-blue-500 ring-offset-1 z-10 scale-105" : "";

  switch (status) {
    case "ANSWERED":
      // NTA Authentic Green Shape (Clipped / Polygon / Rounded)
      return (
        <div
          className={`${baseClasses} ${ringClass} rounded-t-lg rounded-b-sm bg-[#22c55e] text-white shadow-xs`}
        >
          {number}
        </div>
      );

    case "NOT_ANSWERED":
      // NTA Authentic Red Shape
      return (
        <div
          className={`${baseClasses} ${ringClass} rounded-b-lg rounded-t-sm bg-[#ef4444] text-white shadow-xs`}
        >
          {number}
        </div>
      );

    case "MARKED_FOR_REVIEW":
      // NTA Yellow Circle for Marked for Review (Unanswered)
      return (
        <div
          className={`${baseClasses} ${ringClass} rounded-full bg-[#eab308] text-white shadow-xs`}
        >
          {number}
        </div>
      );

    case "ANSWERED_AND_MARKED_FOR_REVIEW":
      // NTA Purple Circle with Green indicator for Save & Mark for Review
      return (
        <div
          className={`${baseClasses} ${ringClass} rounded-full bg-[#8b5cf6] text-white shadow-xs`}
        >
          {number}
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-[#22c55e] ring-1 ring-white" />
        </div>
      );

    case "NOT_VISITED":
    default:
      // NTA Authentic Grey border Box
      return (
        <div
          className={`${baseClasses} ${ringClass} rounded border border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300`}
        >
          {number}
        </div>
      );
  }
}

export default function NTAPalette({
  candidateName,
  totalQuestions,
  currentQuestionIndex,
  questionIds,
  statusMap,
  onSelectQuestion,
}: Props) {
  // Count each status for the legend
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
    <aside className="flex flex-col gap-4 w-full lg:w-72 select-none">
      {/* Candidate Card */}
      <div className="flex items-center gap-3 rounded-xl border border-zinc-300 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border-2 border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
          <User className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1 text-xs">
          <p className="font-bold text-zinc-900 truncate dark:text-zinc-50">
            {candidateName || "Candidate"}
          </p>
          <p className="text-zinc-500 dark:text-zinc-400 font-mono text-[11px]">
            Roll: 2026NEET-0042
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            System ID: CBT-NODE-01
          </p>
        </div>
      </div>

      {/* Official 5-State Legend Card */}
      <div className="rounded-xl border border-zinc-300 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 text-xs">
        <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-3">
          Question Palette Legend
        </p>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-t rounded-b-xs bg-[#22c55e] text-[10px] font-bold text-white">
              {answered}
            </span>
            <span className="text-zinc-700 dark:text-zinc-300">Answered</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-b rounded-t-xs bg-[#ef4444] text-[10px] font-bold text-white">
              {notAnswered}
            </span>
            <span className="text-zinc-700 dark:text-zinc-300">Not Answered</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-zinc-300 bg-zinc-100 text-[10px] font-bold text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {notVisited}
            </span>
            <span className="text-zinc-700 dark:text-zinc-300">Not Visited</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#eab308] text-[10px] font-bold text-white">
              {markedReview}
            </span>
            <span className="text-zinc-700 dark:text-zinc-300">Marked for Review</span>
          </div>

          <div className="col-span-2 flex items-center gap-2 border-t border-zinc-100 dark:border-zinc-800 pt-1.5 mt-1">
            <span className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#8b5cf6] text-[10px] font-bold text-white">
              {ansMarkedReview}
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#22c55e] ring-1 ring-white" />
            </span>
            <span className="text-[10px] text-zinc-600 dark:text-zinc-400 leading-tight">
              Answered & Marked for Review (Evaluated)
            </span>
          </div>
        </div>
      </div>

      {/* Palette Matrix */}
      <div className="rounded-xl border border-zinc-300 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-3">
          <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
            Choose a Question:
          </span>
          <span className="text-[11px] text-zinc-400 font-medium">
            Total: {totalQuestions}
          </span>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-5 gap-2 max-h-[300px] overflow-y-auto pr-1">
          {questionIds.map((id, index) => {
            const status = statusMap[id] ?? "NOT_VISITED";
            const isCurrent = index === currentQuestionIndex;

            return (
              <button
                key={id}
                onClick={() => onSelectQuestion(index)}
                className="flex items-center justify-center p-0.5 focus:outline-none"
              >
                <NTAStatusBadge
                  status={status}
                  number={index + 1}
                  isCurrent={isCurrent}
                />
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
