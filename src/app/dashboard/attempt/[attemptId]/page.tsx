import Link from "next/link";
import { redirect } from "next/navigation";
import { Check, X } from "lucide-react";
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
  const total = questions.length;
  const score = attempt.score ?? 0;
  const percent = total > 0 ? Math.round((score / total) * 100) : 0;
  const wrong = total - score;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-8">
      {/* Score summary */}
      <div className="rounded-xl border border-black/[.08] p-6 dark:border-white/[.1]">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Your Result</p>
        <h1 className="mt-1 text-xl font-semibold text-black dark:text-zinc-50">
          {attempt.exam.title}
        </h1>
        <div className="mt-5 flex flex-wrap gap-8">
          <div>
            <p className="text-3xl font-semibold text-black dark:text-zinc-50">
              {score}
              <span className="text-lg text-zinc-400"> / {total}</span>
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Score</p>
          </div>
          <div>
            <p className="text-3xl font-semibold text-black dark:text-zinc-50">
              {percent}
              <span className="text-lg text-zinc-400">%</span>
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Percentage
            </p>
          </div>
          <div>
            <p className="text-3xl font-semibold text-green-600">{score}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Correct</p>
          </div>
          <div>
            <p className="text-3xl font-semibold text-red-500">{wrong}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Incorrect
            </p>
          </div>
        </div>
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-lg bg-black px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          Back to Dashboard
        </Link>
      </div>

      {/* Per-question review */}
      <h2 className="text-sm font-semibold text-black dark:text-zinc-50">
        Review
      </h2>
      <div className="flex flex-col gap-4">
        {questions.map((question, qi) => {
          const options = question.options as string[];
          const selected = answers[question.id];
          const correct = question.correctOptionIndex;
          const isCorrect = selected === correct;
          const attempted = selected !== undefined;

          return (
            <div
              key={question.id}
              className="rounded-xl border border-black/[.08] p-5 dark:border-white/[.1]"
            >
              <div className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                    isCorrect
                      ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                      : "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400"
                  }`}
                >
                  {isCorrect ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <X className="h-3.5 w-3.5" />
                  )}
                </span>
                <p className="text-sm font-medium text-black dark:text-zinc-50">
                  <span className="text-zinc-400">Q{qi + 1}.</span>{" "}
                  {question.questionText}
                </p>
              </div>

              <div className="mt-4 flex flex-col gap-2 pl-9">
                {options.map((opt, i) => {
                  const isCorrectOption = i === correct;
                  const isChosenWrong = i === selected && !isCorrect;

                  let cls =
                    "border-black/[.08] text-zinc-600 dark:border-white/[.1] dark:text-zinc-400";
                  if (isCorrectOption) {
                    cls =
                      "border-green-500/40 bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-300";
                  } else if (isChosenWrong) {
                    cls =
                      "border-red-500/40 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300";
                  }

                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${cls}`}
                    >
                      <span className="text-xs font-medium">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="flex-1">{opt}</span>
                      {isCorrectOption && (
                        <span className="text-xs font-medium text-green-600 dark:text-green-400">
                          Correct answer
                        </span>
                      )}
                      {isChosenWrong && (
                        <span className="text-xs font-medium text-red-500">
                          Your answer
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {!attempted && (
                <p className="mt-2 pl-9 text-xs text-zinc-400">
                  You did not answer this question.
                </p>
              )}

              {question.explanation && (
                <div className="mt-3 ml-9 rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-900">
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Explanation
                  </p>
                  <p className="mt-0.5 text-sm text-zinc-700 dark:text-zinc-300">
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
