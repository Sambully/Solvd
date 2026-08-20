"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { Clock, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
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

  // Countdown timer.
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

  // ---- Start screen ----
  if (!started) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md rounded-xl border border-black/[.08] p-8 text-center dark:border-white/[.1]">
          <h1 className="text-xl font-semibold text-black dark:text-zinc-50">
            {title}
          </h1>
          <div className="mt-6 flex justify-center gap-8">
            <div>
              <p className="text-2xl font-semibold text-black dark:text-zinc-50">
                {questions.length}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Questions
              </p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-black dark:text-zinc-50">
                {durationMinutes}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Minutes
              </p>
            </div>
          </div>
          <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
            The timer starts as soon as you begin. This is a single attempt —
            once you submit, you can&apos;t retake it.
          </p>
          <button
            onClick={() => setStarted(true)}
            className="mt-6 w-full rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Start Exam
          </button>
        </div>
      </div>
    );
  }

  // ---- Submitting overlay ----
  if (isPending) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Scoring your answers…
        </p>
      </div>
    );
  }

  const q = questions[current];
  const lowTime = timeLeft <= 60;

  // ---- Attempt screen ----
  return (
    <div className="flex flex-1 flex-col">
      {/* Header: title + timer */}
      <header className="flex items-center justify-between border-b border-black/[.08] px-6 py-4 dark:border-white/[.1]">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-black dark:text-zinc-50">
            {title}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {answeredCount} of {questions.length} answered
          </p>
        </div>
        <div
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold tabular-nums ${
            lowTime
              ? "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400"
              : "bg-zinc-100 text-black dark:bg-zinc-900 dark:text-zinc-50"
          }`}
        >
          <Clock className="h-4 w-4" />
          {formatTime(timeLeft)}
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6 lg:flex-row">
        {/* Question area */}
        <div className="flex flex-1 flex-col">
          <p className="text-xs font-medium text-zinc-400">
            Question {current + 1} of {questions.length}
          </p>
          <h2 className="mt-2 text-base font-medium text-black dark:text-zinc-50">
            {q.questionText}
          </h2>

          <div className="mt-5 flex flex-col gap-3">
            {q.options.map((opt, i) => {
              const selected = answers[q.id] === i;
              return (
                <button
                  key={i}
                  onClick={() =>
                    setAnswers((a) => ({ ...a, [q.id]: i }))
                  }
                  className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                    selected
                      ? "border-black bg-black/[.03] dark:border-white dark:bg-white/[.06]"
                      : "border-black/[.1] hover:bg-black/[.02] dark:border-white/[.15] dark:hover:bg-white/[.04]"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium ${
                      selected
                        ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                        : "border-black/[.2] text-zinc-500 dark:border-white/[.25]"
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-black dark:text-zinc-50">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Prev / Next */}
          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              disabled={current === 0}
              className="flex items-center gap-1 rounded-lg border border-black/[.1] px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-black/[.03] disabled:opacity-40 dark:border-white/[.15] dark:text-zinc-50 dark:hover:bg-white/[.05]"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            {current === questions.length - 1 ? (
              <button
                onClick={() => setShowConfirm(true)}
                className="rounded-lg bg-black px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                Submit Exam
              </button>
            ) : (
              <button
                onClick={() =>
                  setCurrent((c) => Math.min(questions.length - 1, c + 1))
                }
                className="flex items-center gap-1 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Question palette */}
        <aside className="lg:w-56">
          <div className="rounded-xl border border-black/[.08] p-4 dark:border-white/[.1]">
            <p className="mb-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Questions
            </p>
            <div className="grid grid-cols-6 gap-2 lg:grid-cols-5">
              {questions.map((question, i) => {
                const isAnswered = answers[question.id] !== undefined;
                const isCurrent = i === current;
                return (
                  <button
                    key={question.id}
                    onClick={() => setCurrent(i)}
                    className={`flex h-8 w-8 items-center justify-center rounded-md text-xs font-medium transition-colors ${
                      isCurrent
                        ? "bg-black text-white ring-2 ring-black/30 dark:bg-white dark:text-black dark:ring-white/30"
                        : isAnswered
                          ? "bg-zinc-200 text-black dark:bg-zinc-700 dark:text-zinc-50"
                          : "bg-zinc-50 text-zinc-500 ring-1 ring-inset ring-black/[.08] dark:bg-zinc-900 dark:text-zinc-400 dark:ring-white/[.1]"
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setShowConfirm(true)}
              className="mt-4 w-full rounded-lg border border-black/[.1] px-3 py-2 text-sm font-medium text-black transition-colors hover:bg-black/[.03] dark:border-white/[.15] dark:text-zinc-50 dark:hover:bg-white/[.05]"
            >
              Submit
            </button>
          </div>
        </aside>
      </div>

      {/* Confirm submit modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 dark:bg-zinc-950">
            <h3 className="text-base font-semibold text-black dark:text-zinc-50">
              Submit your exam?
            </h3>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              You&apos;ve answered {answeredCount} of {questions.length}{" "}
              questions. Once submitted, you can&apos;t change your answers.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="rounded-lg border border-black/[.1] px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-black/[.03] dark:border-white/[.15] dark:text-zinc-50 dark:hover:bg-white/[.05]"
              >
                Keep Working
              </button>
              <button
                onClick={submit}
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
