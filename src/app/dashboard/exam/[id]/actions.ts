"use server";

import { redirect } from "next/navigation";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { prisma } from "@/lib/prisma";
import type { AnswerMap } from "@/lib/examTypes";

/**
 * Scores the submitted answers against the stored answer key (no LLM call)
 * and persists the attempt, then redirects to the review page.
 */
export async function submitAttempt(examId: string, answers: AnswerMap) {
  const user = await getOrCreateUser();
  if (!user) redirect("/sign-in");

  const exam = await prisma.exam.findFirst({
    where: { id: examId, userId: user.id },
    include: {
      questions: { select: { id: true, correctOptionIndex: true } },
    },
  });

  if (!exam) redirect("/dashboard");

  let score = 0;
  for (const q of exam.questions) {
    if (answers[q.id] === q.correctOptionIndex) score += 1;
  }

  const attempt = await prisma.attempt.create({
    data: {
      examId: exam.id,
      userId: user.id,
      answers,
      score,
      submittedAt: new Date(),
    },
  });

  await prisma.exam.update({
    where: { id: exam.id },
    data: { status: "SUBMITTED" },
  });

  redirect(`/dashboard/attempt/${attempt.id}`);
}
