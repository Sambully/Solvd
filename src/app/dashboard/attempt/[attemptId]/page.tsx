import Link from "next/link";
import { redirect } from "next/navigation";
import { Check, X, Minus, ArrowLeft, RotateCcw } from "lucide-react";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { prisma } from "@/lib/prisma";
import type { AnswerMap } from "@/lib/examTypes";

export default async function AttemptResultPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  const user = await getOrCreateUser();
  if (!user) redirect("/sign-in");

  const attempt = await prisma.attempt.findFirst({
    where: { id: attemptId, userId: user.id },
    include: {
      exam: {
        include: { questions: { orderBy: { id: "asc" } } },
      },
    },
  });

  if (!attempt) redirect("/dashboard");

  const answers = (attempt.answers ?? {}) as AnswerMap;
  const questions = attempt.exam.questions;
  const totalQuestions = questions.length;
  const maxScore = totalQuestions * 4;

  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;

  for (const q of questions) {
    const sel = answers[q.id];
    if (sel === undefined) {
      unattemptedCount += 1;
    } else if (sel === q.correctOptionIndex) {
      correctCount += 1;
    } else {
      incorrectCount += 1;
    }
  }

  // Calculated NEET score: (+4 * correct) - (1 * incorrect)
  const totalScore = attempt.score ?? (correctCount * 4 - incorrectCount);
  const attemptedCount = correctCount + incorrectCount;
  const accuracyPercent =
    attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;
  const scorePercent =
    maxScore > 0 ? Math.max(0, Math.round((totalScore / maxScore) * 100)) : 0;

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6 sm:p-8">
      {/* Back and Reattempt toolbar */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <Link
          href={`/dashboard/exam/${attempt.exam.id}`}
          className="inline-flex items-center gap-1.5 rounded-xl bg-black px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reattempt Test
        </Link>
      </div>


      {/* NEET Score Overview Card */}
      <div className="rounded-2xl border border-black/[.08] bg-white p-6 shadow-sm dark:border-white/[.1] dark:bg-zinc-950 sm:p-8">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="inline-block rounded-md bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              NEET CBT Result
            </span>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-black dark:text-zinc-50">
              {attempt.exam.title}
            </h1>
          </div>
          <div className="mt-4 sm:mt-0 text-left sm:text-right">
            <span className="text-xs text-zinc-400">Total NEET Score</span>
            <div className="text-3xl font-extrabold tracking-tight text-black dark:text-zinc-50 sm:text-4xl">
              <span className={totalScore >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}>
                {totalScore > 0 ? `+${totalScore}` : totalScore}
              </span>
              <span className="text-xl font-medium text-zinc-400"> / {maxScore}</span>
            </div>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-50/50 p-4 dark:bg-emerald-950/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                Correct (+4)
              </span>
              <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="mt-2 text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {correctCount}
            </p>
            <span className="text-xs text-emerald-600/80">+{correctCount * 4} marks</span>
          </div>

          <div className="rounded-xl border border-red-500/20 bg-red-50/50 p-4 dark:bg-red-950/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-red-700 dark:text-red-400">
                Incorrect (-1)
              </span>
              <X className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            <p className="mt-2 text-2xl font-bold text-red-700 dark:text-red-300">
              {incorrectCount}
            </p>
            <span className="text-xs text-red-600/80">-{incorrectCount} marks</span>
          </div>

          <div className="rounded-xl border border-black/[.08] bg-zinc-50/50 p-4 dark:border-white/[.1] dark:bg-zinc-900/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Skipped (0)
              </span>
              <Minus className="h-4 w-4 text-zinc-400" />
            </div>
            <p className="mt-2 text-2xl font-bold text-zinc-800 dark:text-zinc-200">
              {unattemptedCount}
            </p>
            <span className="text-xs text-zinc-400">0 marks</span>
          </div>

          <div className="rounded-xl border border-black/[.08] bg-zinc-50/50 p-4 dark:border-white/[.1] dark:bg-zinc-900/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Accuracy
              </span>
              <span className="text-xs font-semibold text-zinc-500">{scorePercent}% score</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-zinc-800 dark:text-zinc-200">
              {accuracyPercent}%
            </p>
            <span className="text-xs text-zinc-400">{attemptedCount} attempted</span>
          </div>
        </div>
      </div>

      {/* Per-Question Detailed Review */}
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-black dark:text-zinc-50">
          Question-by-Question Solution & Analysis
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Review explanations, correct answers, and your selections.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {questions.map((question, qi) => {
          const options = question.options as string[];
          const selected = answers[question.id];
          const correct = question.correctOptionIndex;
          const isCorrect = selected === correct;
          const isAttempted = selected !== undefined;

          let badgeClass = "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";
          let badgeText = "Unattempted (0)";
          if (isAttempted) {
            if (isCorrect) {
              badgeClass = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300";
              badgeText = "+4 Correct";
            } else {
              badgeClass = "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300";
              badgeText = "-1 Incorrect";
            }
          }

          return (
            <div
              key={question.id}
              className="rounded-2xl border border-black/[.08] bg-white p-5 shadow-xs dark:border-white/[.1] dark:bg-zinc-950 sm:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {qi + 1}
                  </span>
                  <p className="text-base font-medium text-black dark:text-zinc-50">
                    {question.questionText}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass}`}>
                  {badgeText}
                </span>
              </div>

              {/* Options list */}
              <div className="mt-5 flex flex-col gap-2.5 pl-0 sm:pl-9">
                {options.map((opt, i) => {
                  const isCorrectOption = i === correct;
                  const isChosenWrong = i === selected && !isCorrect;
                  const isChosenCorrect = i === selected && isCorrect;

                  let borderStyle =
                    "border-black/[.08] text-zinc-700 dark:border-white/[.1] dark:text-zinc-300 bg-white dark:bg-zinc-900";
                  if (isCorrectOption) {
                    borderStyle =
                      "border-emerald-500/40 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200 font-medium";
                  } else if (isChosenWrong) {
                    borderStyle =
                      "border-red-500/40 bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-200";
                  }

                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors ${borderStyle}`}
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                          isCorrectOption
                            ? "border-emerald-600 bg-emerald-600 text-white"
                            : isChosenWrong
                            ? "border-red-500 bg-red-500 text-white"
                            : "border-black/[.15] text-zinc-500 dark:border-white/[.2]"
                        }`}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="flex-1">{opt}</span>
                      {isChosenCorrect && (
                        <span className="rounded-md bg-emerald-200/60 px-2 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                          Your Answer (Correct)
                        </span>
                      )}
                      {isCorrectOption && !isChosenCorrect && (
                        <span className="rounded-md bg-emerald-200/60 px-2 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                          Correct Answer
                        </span>
                      )}
                      {isChosenWrong && (
                        <span className="rounded-md bg-red-200/60 px-2 py-0.5 text-xs font-bold text-red-800 dark:bg-red-900/60 dark:text-red-300">
                          Your Answer (Wrong)
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Explanation block */}
              {question.explanation && (
                <div className="mt-4 rounded-xl border border-black/[.05] bg-zinc-50 p-4 dark:border-white/[.05] dark:bg-zinc-900/60 sm:ml-9">
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Explanation
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                    {question.explanation}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}

