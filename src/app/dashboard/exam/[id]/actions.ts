"use server";

import { redirect } from "next/navigation";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { prisma } from "@/lib/prisma";
import type { AnswerMap } from "@/lib/examTypes";

/**
 * Scores the submitted answers according to authentic NEET rules:
 * +4 for correct, -1 for incorrect, 0 for unattempted.
 * Persists the attempt and redirects to the review page.
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

  let correctCount = 0;
  let incorrectCount = 0;

  for (const q of exam.questions) {
    const selected = answers[q.id];
    if (selected === undefined) {
      // Unattempted: 0 marks
      continue;
    }
    if (selected === q.correctOptionIndex) {
      correctCount += 1;
    } else {
      incorrectCount += 1;
    }
  }

  // Authentic NEET score calculation
  const totalScore = correctCount * 4 - incorrectCount * 1;

  const attempt = await prisma.attempt.create({
    data: {
      examId: exam.id,
      userId: user.id,
      answers,
      score: totalScore,
      submittedAt: new Date(),
    },
  });

  await prisma.exam.update({
    where: { id: exam.id },
    data: { status: "SUBMITTED" },
  });

  redirect(`/dashboard/attempt/${attempt.id}`);
}

