"use client";

import { ChevronLeft, ChevronRight, CheckCircle, RotateCcw, BookmarkPlus } from "lucide-react";
import type { RunnerQuestion } from "@/components/ExamRunner";
import { cleanScientificText } from "@/lib/formatMath";

interface Props {
  question: RunnerQuestion;
  questionIndex: number;
  totalQuestions: number;
  selectedOption: number | undefined;
  fontSize: "sm" | "base" | "lg";
  onSelectOption: (optionIndex: number) => void;
  onSaveAndNext: () => void;
  onSaveAndMarkReview: () => void;
  onMarkReviewAndNext: () => void;
  onClearResponse: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSubmitExam: () => void;
}

export default function NTAQuestionPane({
  question,
  questionIndex,
  totalQuestions,
  selectedOption,
  fontSize,
  onSelectOption,
  onSaveAndNext,
  onSaveAndMarkReview,
  onMarkReviewAndNext,
  onClearResponse,
  onPrevious,
  onNext,
  onSubmitExam,
}: Props) {
  const fontSizeClass =
    fontSize === "sm"
      ? "text-sm leading-relaxed"
      : fontSize === "lg"
      ? "text-xl leading-relaxed"
      : "text-base leading-relaxed";

  return (
    <div className="flex flex-1 flex-col justify-between rounded-xl border border-zinc-300 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 select-none">
      {/* Top Question Meta Banner */}
      <div className="flex flex-wrap items-center justify-between border-b border-zinc-200 bg-zinc-50 px-5 py-3 dark:border-zinc-800 dark:bg-zinc-950/60">
        <div className="flex items-center gap-2">
          <span className="font-bold text-blue-700 dark:text-blue-400 text-sm">
            Question No. {questionIndex + 1}
          </span>
          <span className="text-zinc-400">|</span>
          <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
            Single Choice Type
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
            Marks: +4.00
          </span>
          <span className="text-zinc-300">|</span>
          <span className="text-red-600 dark:text-red-400 font-semibold">
            Negative: -1.00
          </span>
        </div>
      </div>

      {/* Main Question Body */}
      <div className="flex-1 p-5 sm:p-6 overflow-y-auto">
        <h2 className={`font-medium text-zinc-900 dark:text-zinc-100 ${fontSizeClass}`}>
          {cleanScientificText(question.questionText)}
        </h2>

        {/* Options List */}
        <div className="mt-6 flex flex-col gap-3">
          {question.options.map((opt, idx) => {
            const isSelected = selectedOption === idx;

            return (
              <div
                key={idx}
                onClick={() => onSelectOption(idx)}
                className={`flex items-start gap-3.5 rounded-lg border p-3.5 cursor-pointer transition-all ${
                  isSelected
                    ? "border-blue-600 bg-blue-50/70 text-blue-950 ring-1 ring-blue-500 dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-100"
                    : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/80 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/40"
                }`}
              >
                <div className="mt-0.5 flex items-center justify-center pointer-events-none">
                  <input
                    type="radio"
                    name={`nta-q-${question.id}`}
                    checked={isSelected}
                    readOnly
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-xs text-zinc-500 dark:text-zinc-400">
                    ({idx + 1})
                  </span>
                  <span className={`text-sm text-zinc-800 dark:text-zinc-200 ${fontSizeClass}`}>
                    {cleanScientificText(opt)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Official NTA Action Buttons Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-950">
        {/* Left Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onSaveAndNext}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-md bg-[#22c55e] hover:bg-[#16a34a] px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Save & Next
          </button>

          <button
            onClick={onClearResponse}
            disabled={selectedOption === undefined}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-md border border-zinc-300 bg-white hover:bg-zinc-100 px-3.5 py-2 text-xs font-semibold text-zinc-700 disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5 text-zinc-400" />
            Clear Response
          </button>

          <button
            onClick={onSaveAndMarkReview}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-md bg-[#8b5cf6] hover:bg-[#7c3aed] px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-colors"
          >
            <BookmarkPlus className="h-3.5 w-3.5" />
            Save & Mark for Review
          </button>

          <button
            onClick={onMarkReviewAndNext}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-md bg-[#f59e0b] hover:bg-[#d97706] px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-colors"
          >
            Mark for Review & Next
          </button>
        </div>

        {/* Right Navigation & Final Submit Buttons */}
        <div className="flex items-center justify-end gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-200 dark:border-zinc-800">
          <button
            onClick={onPrevious}
            disabled={questionIndex === 0}
            className="flex items-center gap-1 rounded-md border border-zinc-300 bg-white hover:bg-zinc-100 px-3 py-2 text-xs font-semibold text-zinc-700 disabled:opacity-30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          <button
            onClick={onNext}
            disabled={questionIndex === totalQuestions - 1}
            className="flex items-center gap-1 rounded-md border border-zinc-300 bg-white hover:bg-zinc-100 px-3 py-2 text-xs font-semibold text-zinc-700 disabled:opacity-30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>

          <button
            onClick={onSubmitExam}
            className="rounded-md bg-[#0284c7] hover:bg-[#0369a1] px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-colors"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
