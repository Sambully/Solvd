import { prisma } from "@/lib/prisma";

export type RecentExam = {
  id: string;
  title: string;
  createdAt: Date;
  questionCount: number;
  /** null when the student has generated the paper but not attempted it yet */
  score: number | null;
};

export type DashboardData = {
  totalExamsTaken: number;
  /** average score across all submitted attempts, as a percentage; null when nothing attempted */
  avgScorePercent: number | null;
  recentExams: RecentExam[];
};

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const [recent, scoredAttempts] = await Promise.all([
    // The 5 most recently generated papers
    prisma.exam.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        _count: { select: { questions: true } },
        attempts: {
          where: { submittedAt: { not: null }, score: { not: null } },
          orderBy: { submittedAt: "desc" },
          take: 1,
          select: { score: true },
        },
      },
    }),
    // Every submitted attempt, for the totals
    prisma.attempt.findMany({
      where: { userId, submittedAt: { not: null }, score: { not: null } },
      select: {
        score: true,
        exam: { select: { _count: { select: { questions: true } } } },
      },
    }),
  ]);

  // Average the per-exam NEET percentages: (score / (questions * 4)) * 100, clamped to 0-100%
  const percentages = scoredAttempts
    .filter((a) => a.exam._count.questions > 0)
    .map((a) => {
      const maxMarks = a.exam._count.questions * 4;
      const score = a.score ?? 0;
      return Math.max(0, Math.min(100, (score / maxMarks) * 100));
    });

  const avgScorePercent =
    percentages.length > 0
      ? percentages.reduce((sum, p) => sum + p, 0) / percentages.length
      : null;

  return {
    totalExamsTaken: scoredAttempts.length,
    avgScorePercent,
    recentExams: recent.map((exam) => ({
      id: exam.id,
      title: exam.title,
      createdAt: exam.createdAt,
      questionCount: exam._count.questions,
      score: exam.attempts[0]?.score ?? null,
    })),
  };
}

