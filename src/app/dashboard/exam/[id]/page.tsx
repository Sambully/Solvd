import { redirect } from "next/navigation";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { prisma } from "@/lib/prisma";
import ExamRunner, { type RunnerQuestion } from "@/components/ExamRunner";
import { submitAttempt } from "./actions";

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

  return (
    <ExamRunner
      examId={exam.id}
      title={exam.title}
      candidateName={user.name}
      durationMinutes={exam.durationMinutes}
      questions={questions}
      onSubmit={submitAttempt}
    />
  );
}
