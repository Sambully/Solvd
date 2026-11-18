"use server";

import { redirect } from "next/navigation";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { prisma } from "@/lib/prisma";
import type { AnswerMap } from "@/lib/examTypes";
import { finalizeExamAttempt } from "@/lib/attemptService";

/**
 * Scores the submitted answers according to NEET rules (+4 correct, -1 incorrect, 0 unattempted).
 * Uses persisted rows in `exam_attempts` + `answers` as the authoritative source of truth.
 */
export async function submitAttempt(
  examId: string,
  answers: AnswerMap,
  attemptId?: string
) {
  const user = await getOrCreateUser();
  if (!user) redirect("/sign-in");

  // Locate the active ExamAttempt (prefer explicit attemptId, fall back to latest IN_PROGRESS)
  let resolvedAttemptId = attemptId;
  if (!resolvedAttemptId) {
    const active = await prisma.examAttempt.findFirst({
      where: { examId, userId: user.id, roomId: null, status: "IN_PROGRESS" },
      orderBy: { startedAt: "desc" },
      select: { id: true },
    });
    resolvedAttemptId = active?.id;
  }

  if (resolvedAttemptId) {
    const { finalizedAttemptId } = await finalizeExamAttempt({
      userId: user.id,
      attemptId: resolvedAttemptId,
      finalAnswers: answers,
    });
    redirect(`/dashboard/attempt/${finalizedAttemptId}`);
  }

  // Fallback if no ExamAttempt row existed (defensive safety net)
  const exam = await prisma.exam.findFirst({
    where: { id: examId, userId: user.id },
    include: {
      questions: { select: { id: true, correctOptionIndex: true } },
    },
  });

  if (!exam) redirect("/dashboard");

  let correctCount = 0;
  let incorrectCount = 0;

  for (const q of exam.questions) {
    const selected = answers[q.id];
    if (selected === undefined) continue;
    if (selected === q.correctOptionIndex) {
      correctCount += 1;
    } else {
      incorrectCount += 1;
    }
  }

  const totalScore = correctCount * 4 - incorrectCount * 1;
  const now = new Date();

  const attempt = await prisma.attempt.create({
    data: {
      examId: exam.id,
      userId: user.id,
      answers,
      score: totalScore,
      submittedAt: now,
    },
  });

  await prisma.exam.update({
    where: { id: exam.id },
    data: { status: "SUBMITTED" },
  });

  redirect(`/dashboard/attempt/${attempt.id}`);
}
