"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { Clock, ChevronLeft, ChevronRight, Loader2, Award, RotateCcw, AlertTriangle } from "lucide-react";
import type { AnswerMap } from "@/lib/examTypes";

export type RunnerQuestion = {
  id: string;
  questionText: string;
  options: string[];
};

type Props = {
  examId: string;
  title: string;
  durationMinutes: number;
  questions: RunnerQuestion[];
  onSubmit: (examId: string, answers: AnswerMap) => Promise<void>;
};

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function ExamRunner({
  examId,
  title,
  durationMinutes,
  questions,
  onSubmit,
}: Props) {
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const submittedRef = useRef(false);

  const totalQuestions = questions.length;
  const maxMarks = totalQuestions * 4;

  const submit = () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    startTransition(() => {
      onSubmit(examId, answers);
    });
  };

  // Keep a ref to the latest submit so the timer can call it without resetting.
  const submitRef = useRef(submit);
  useEffect(() => {
    submitRef.current = submit;
  });

  // Countdown timer
  useEffect(() => {
    if (!started) return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          submitRef.current();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [started]);

  const answeredCount = Object.keys(answers).length;
  const unattemptedCount = totalQuestions - answeredCount;

  // ---- Start screen ----
  if (!started) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-lg rounded-2xl border border-black/[.08] bg-white p-6 shadow-sm dark:border-white/[.1] dark:bg-zinc-950 sm:p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900">
            <Award className="h-6 w-6 text-black dark:text-zinc-50" />
          </div>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-black dark:text-zinc-50">
            {title}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            NEET Computer-Based Test Simulation
          </p>

          <div className="mt-6 grid grid-cols-3 gap-3 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900/50">
            <div>
              <p className="text-2xl font-bold text-black dark:text-zinc-50">
                {totalQuestions}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Questions</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-black dark:text-zinc-50">
                {maxMarks}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Total Marks</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-black dark:text-zinc-50">
                {durationMinutes}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Minutes</p>
            </div>
          </div>

          {/* NEET Marking Scheme Reminder */}
          <div className="mt-6 rounded-xl border border-black/[.08] p-4 text-left dark:border-white/[.1]">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              NEET Marking Scheme
            </p>
            <div className="mt-2 flex flex-col gap-1.5 text-xs">
              <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 font-medium">
                <span>Correct Answer</span>
                <span>+4 Marks</span>
              </div>
              <div className="flex items-center justify-between text-red-600 dark:text-red-400 font-medium">
                <span>Incorrect Answer</span>
                <span>-1 Negative Mark</span>
              </div>
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                <span>Unattempted / Skipped</span>
                <span>0 Marks</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setStarted(true)}
            className="mt-6 w-full rounded-xl bg-black py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Start Exam Now
          </button>
        </div>
      </div>
    );
  }

  // ---- Submitting overlay ----
  if (isPending) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8">
        <Loader2 className="h-8 w-8 animate-spin text-black dark:text-white" />
        <p className="text-base font-medium text-black dark:text-zinc-50">
          Calculating NEET Score & Recording Attempt…
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Applying +4 / -1 marking scheme
        </p>
      </div>
    );
  }

  const q = questions[current];
  const lowTime = timeLeft <= 60;

  // ---- Attempt screen ----
  return (
    <div className="flex flex-1 flex-col">
      {/* Header: title + progress + timer */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-black/[.08] bg-white/95 px-6 py-4 backdrop-blur-md dark:border-white/[.1] dark:bg-black/95">
        <div className="min-w-0 pr-4">
          <p className="truncate text-base font-bold text-black dark:text-zinc-50">
            {title}
          </p>
          <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
            <span>
              Attempted: <strong className="text-black dark:text-zinc-100">{answeredCount}</strong> / {totalQuestions}
            </span>
            <span>·</span>
            <span>
              Left: <strong className="text-zinc-600 dark:text-zinc-300">{unattemptedCount}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold tabular-nums transition-colors ${
              lowTime
                ? "animate-pulse bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                : "bg-zinc-100 text-black dark:bg-zinc-900 dark:text-zinc-50"
            }`}
          >
            <Clock className="h-4 w-4" />
            {formatTime(timeLeft)}
          </div>

          <button
            onClick={() => setShowConfirm(true)}
            className="rounded-xl bg-black px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 sm:text-sm"
          >
            Submit Exam
          </button>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6 lg:flex-row">
        {/* Question Area */}
        <div className="flex flex-1 flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                Question {current + 1} of {totalQuestions}
              </span>
              {answers[q.id] !== undefined && (
                <button
                  onClick={() => {
                    const next = { ...answers };
                    delete next[q.id];
                    setAnswers(next);
                  }}
                  className="flex items-center gap-1 text-xs text-zinc-400 hover:text-red-500 transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  Clear Choice
                </button>
              )}
            </div>

            <h2 className="mt-4 text-lg font-semibold leading-relaxed text-black dark:text-zinc-50">
              {q.questionText}
            </h2>

            {/* Options */}
            <div className="mt-6 flex flex-col gap-3">
              {q.options.map((opt, i) => {
                const selected = answers[q.id] === i;
                return (
                  <button
                    key={i}
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
                    className={`flex items-center gap-4 rounded-xl border p-4 text-left text-sm transition-all ${
                      selected
                        ? "border-black bg-zinc-100/80 shadow-xs dark:border-white dark:bg-zinc-900"
                        : "border-black/[.08] hover:border-black/[.2] hover:bg-zinc-50 dark:border-white/[.1] dark:hover:border-white/[.3] dark:hover:bg-zinc-900/40"
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-colors ${
                        selected
                          ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                          : "border-black/[.2] text-zinc-500 dark:border-white/[.25]"
                      }`}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-base font-normal text-black dark:text-zinc-100">
                      {opt}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="mt-8 flex items-center justify-between border-t border-black/[.08] pt-6 dark:border-white/[.1]">
            <button
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              disabled={current === 0}
              className="flex items-center gap-1.5 rounded-xl border border-black/[.1] px-4 py-2.5 text-sm font-medium text-black transition-colors hover:bg-zinc-50 disabled:opacity-30 dark:border-white/[.15] dark:text-zinc-50 dark:hover:bg-zinc-900"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            {current === totalQuestions - 1 ? (
              <button
                onClick={() => setShowConfirm(true)}
                className="rounded-xl bg-black px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                Submit Exam
              </button>
            ) : (
              <button
                onClick={() => setCurrent((c) => Math.min(totalQuestions - 1, c + 1))}
                className="flex items-center gap-1.5 rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Question Palette Sidebar */}
        <aside className="w-full lg:w-64">
          <div className="rounded-2xl border border-black/[.08] bg-white p-5 shadow-xs dark:border-white/[.1] dark:bg-zinc-950">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Question Palette
            </p>
            <div className="mt-4 grid grid-cols-6 gap-2 sm:grid-cols-8 lg:grid-cols-5">
              {questions.map((question, i) => {
                const isAnswered = answers[question.id] !== undefined;
                const isCurrent = i === current;
                return (
                  <button
                    key={question.id}
                    onClick={() => setCurrent(i)}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                      isCurrent
                        ? "bg-black text-white ring-2 ring-black/40 ring-offset-1 dark:bg-white dark:text-black dark:ring-white/40"
                        : isAnswered
                        ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-black"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-5 border-t border-black/[.08] pt-4 text-xs text-zinc-500 dark:border-white/[.1] flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-600" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                <span>Unattempted ({unattemptedCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-black dark:bg-white" />
                <span>Current Question</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Submit Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-950">
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="text-lg font-bold text-black dark:text-zinc-50">
                Submit your NEET CBT?
              </h3>
            </div>

            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              You have answered <strong className="text-black dark:text-zinc-100">{answeredCount}</strong> out of{" "}
              <strong className="text-black dark:text-zinc-100">{totalQuestions}</strong> questions.
            </p>

            {unattemptedCount > 0 && (
              <p className="mt-1 text-xs text-zinc-400">
                {unattemptedCount} unanswered questions will be marked 0 (no negative marks).
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="rounded-xl border border-black/[.1] px-4 py-2.5 text-sm font-medium text-black hover:bg-zinc-50 dark:border-white/[.15] dark:text-zinc-50 dark:hover:bg-zinc-900"
              >
                Keep Reviewing
              </button>
              <button
                onClick={submit}
                className="rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

