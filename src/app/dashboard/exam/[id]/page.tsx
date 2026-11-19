import Link from "next/link";
import { redirect } from "next/navigation";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { prisma } from "@/lib/prisma";
import { checkExamAttemptEligibility } from "@/lib/attemptService";
import ExamRunner, { type RunnerQuestion } from "@/components/ExamRunner";
import { submitAttempt } from "./actions";
import { AlertCircle, ArrowLeft, Trophy } from "lucide-react";

export default async function ExamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getOrCreateUser();
  if (!user) redirect("/sign-in");

  const exam = await prisma.exam.findFirst({
    where: { id, userId: user.id },
    include: {
      // NOTE: correctOptionIndex is deliberately NOT selected — the client
      // must never receive the answer key. Scoring happens server-side.
      questions: {
        select: { id: true, questionText: true, options: true },
        orderBy: { id: "asc" },
      },
    },
  });

  if (!exam) redirect("/dashboard");

  const questions: RunnerQuestion[] = exam.questions.map((q) => ({
    id: q.id,
    questionText: q.questionText,
    options: q.options as string[],
  }));

  // Enforce Backend Eligibility and Attempt Limits
  const eligibility = await checkExamAttemptEligibility({
    userId: user.id,
    examId: exam.id,
    roomId: null,
    roomExamId: null,
    orderedQuestionIds: questions.map((q) => q.id),
  });

  // If an in-progress attempt expired while the user was away, auto-finalized -> go straight to results
  if (eligibility.reason === "EXPIRED" && eligibility.finalizedAttemptId) {
    redirect(`/dashboard/attempt/${eligibility.finalizedAttemptId}`);
  }

  // If student reached the attempt limit and has no active attempt to resume
  if (!eligibility.eligible && eligibility.reason === "EXAM_ATTEMPT_LIMIT_REACHED") {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-col items-center justify-center p-6 sm:p-12 min-h-[70vh] text-center">
        <div className="w-full rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
            <Trophy className="h-7 w-7" />
          </div>

          <h1 className="mt-4 text-2xl font-black tracking-tight text-zinc-950 dark:text-zinc-50">
            Exam Attempt Limit Reached
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            You have completed all <strong>{eligibility.maxAttempts} allowed attempts</strong> for{" "}
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">&ldquo;{exam.title}&rdquo;</span>.
          </p>

          <div className="mt-6 rounded-2xl bg-zinc-50 p-4 border border-zinc-200/80 dark:bg-zinc-900/60 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5 text-left">
            <div className="flex items-center justify-between">
              <span>Attempts Used:</span>
              <strong className="font-mono text-zinc-900 dark:text-zinc-100">
                {eligibility.attemptsUsed} / {eligibility.maxAttempts}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Status:</span>
              <span className="text-amber-700 dark:text-amber-400 font-bold">
                Max Attempts Exhausted
              </span>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            {eligibility.finalizedAttemptId && (
              <Link
                href={`/dashboard/attempt/${eligibility.finalizedAttemptId}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-xs font-bold text-white transition-all hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 shadow-md"
              >
                <Trophy className="h-4 w-4" />
                <span>Review Latest Attempt</span>
              </Link>
            )}

            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-3 text-xs font-bold text-zinc-800 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 transition-all shadow-xs"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // If blocked by another limit (e.g. concurrent or daily limit)
  if (!eligibility.eligible) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-col items-center justify-center p-6 sm:p-12 min-h-[70vh] text-center">
        <div className="w-full rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400">
            <AlertCircle className="h-7 w-7" />
          </div>

          <h1 className="mt-4 text-2xl font-black tracking-tight text-zinc-950 dark:text-zinc-50">
            Cannot Start Exam
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {eligibility.error || "You are currently not eligible to start a new exam attempt."}
          </p>

          <div className="mt-8 flex justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-6 py-3 text-xs font-bold text-white transition-all hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 shadow-md"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <ExamRunner
      examId={exam.id}
      title={exam.title}
      candidateName={user.name}
      durationMinutes={exam.durationMinutes}
      questions={questions}
      initialAttempt={
        eligibility.reason === "RESUME" && eligibility.activeAttempt
          ? eligibility.activeAttempt
          : null
      }
      attemptInfo={{
        currentAttemptNumber: eligibility.attemptsUsed + 1,
        maxAttempts: eligibility.maxAttempts,
      }}
      onSubmit={submitAttempt}
    />
  );
}
