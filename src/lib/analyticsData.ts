import { prisma } from "@/lib/prisma";
import type { AnswerMap } from "@/lib/examTypes";

export interface TestAttemptTrend {
  id: string;
  examId: string;
  title: string;
  date: Date;
  score: number;
  maxScore: number;
  percentage: number;
  accuracy: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  timeSpentSeconds: number;
}

export interface DifficultyStats {
  correct: number;
  total: number;
  accuracy: number;
}

export interface AnalyticsSummary {
  totalAttempts: number;
  totalQuestionsAttempted: number;
  overallAccuracy: number;
  avgScorePercentage: number;
  bestScorePercentage: number;
  totalMarksGained: number;
  totalMarksLost: number;
  avgTimePerQuestionSeconds: number;
  projectedPercentile: string;
  difficultyBreakdown: {
    easy: DifficultyStats;
    medium: DifficultyStats;
    hard: DifficultyStats;
  };
  trends: TestAttemptTrend[];
  insights: string[];
}

export async function getAnalyticsData(userId: string): Promise<AnalyticsSummary> {
  const attempts = await prisma.attempt.findMany({
    where: {
      userId,
      submittedAt: { not: null },
    },
    orderBy: { startedAt: "asc" }, // chronological order for graphs
    include: {
      exam: {
        include: {
          questions: {
            select: {
              id: true,
              correctOptionIndex: true,
              difficulty: true,
            },
          },
        },
      },
    },
  });

  if (attempts.length === 0) {
    return {
      totalAttempts: 0,
      totalQuestionsAttempted: 0,
      overallAccuracy: 0,
      avgScorePercentage: 0,
      bestScorePercentage: 0,
      totalMarksGained: 0,
      totalMarksLost: 0,
      avgTimePerQuestionSeconds: 0,
      projectedPercentile: "N/A",
      difficultyBreakdown: {
        easy: { correct: 0, total: 0, accuracy: 0 },
        medium: { correct: 0, total: 0, accuracy: 0 },
        hard: { correct: 0, total: 0, accuracy: 0 },
      },
      trends: [],
      insights: [
        "Take your first NEET mock test to unlock AI-powered accuracy and score analytics.",
      ],
    };
  }

  let totalCorrect = 0;
  let totalIncorrect = 0;
  let totalUnattempted = 0;
  let totalTimeSeconds = 0;

  const diffCounts = {
    EASY: { correct: 0, total: 0 },
    MEDIUM: { correct: 0, total: 0 },
    HARD: { correct: 0, total: 0 },
  };

  const trends: TestAttemptTrend[] = [];

  for (const attempt of attempts) {
    const answers = (attempt.answers ?? {}) as AnswerMap;
    const questions = attempt.exam.questions;
    const maxScore = questions.length * 4;

    let testCorrect = 0;
    let testIncorrect = 0;
    let testUnattempted = 0;

    for (const q of questions) {
      const selected = answers[q.id];
      const diffKey = q.difficulty as "EASY" | "MEDIUM" | "HARD";
      if (diffCounts[diffKey]) {
        diffCounts[diffKey].total += 1;
      }

      if (selected === undefined) {
        testUnattempted += 1;
      } else if (selected === q.correctOptionIndex) {
        testCorrect += 1;
        if (diffCounts[diffKey]) {
          diffCounts[diffKey].correct += 1;
        }
      } else {
        testIncorrect += 1;
      }
    }

    const testAttempted = testCorrect + testIncorrect;
    const testAccuracy = testAttempted > 0 ? Math.round((testCorrect / testAttempted) * 100) : 0;
    const computedScore = attempt.score ?? (testCorrect * 4 - testIncorrect);
    const scorePercentage = maxScore > 0 ? Math.max(0, Math.min(100, Math.round((computedScore / maxScore) * 100))) : 0;

    const timeSpentSeconds =
      attempt.submittedAt && attempt.startedAt
        ? Math.max(10, Math.round((attempt.submittedAt.getTime() - attempt.startedAt.getTime()) / 1000))
        : attempt.exam.durationMinutes * 60;

    totalCorrect += testCorrect;
    totalIncorrect += testIncorrect;
    totalUnattempted += testUnattempted;
    totalTimeSeconds += timeSpentSeconds;

    trends.push({
      id: attempt.id,
      examId: attempt.exam.id,
      title: attempt.exam.title,
      date: attempt.startedAt,
      score: computedScore,
      maxScore,
      percentage: scorePercentage,
      accuracy: testAccuracy,
      correct: testCorrect,
      incorrect: testIncorrect,
      unattempted: testUnattempted,
      timeSpentSeconds,
    });
  }

  const totalAttempted = totalCorrect + totalIncorrect;
  const overallAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
  const avgScorePercentage = Math.round(
    trends.reduce((sum, t) => sum + t.percentage, 0) / trends.length
  );
  const bestScorePercentage = Math.max(...trends.map((t) => t.percentage));

  const totalMarksGained = totalCorrect * 4;
  const totalMarksLost = totalIncorrect * 1;

  const totalQuestions = totalCorrect + totalIncorrect + totalUnattempted;
  const avgTimePerQuestionSeconds =
    totalQuestions > 0 ? Math.round(totalTimeSeconds / totalQuestions) : 0;

  // Projected NEET Percentile estimate based on average score percentage
  let projectedPercentile = "70 - 75%ile";
  if (avgScorePercentage >= 90) projectedPercentile = "99.5+ %ile (Top 1,000 AIR)";
  else if (avgScorePercentage >= 80) projectedPercentile = "98 - 99%ile (Top 5,000 AIR)";
  else if (avgScorePercentage >= 70) projectedPercentile = "95 - 97%ile";
  else if (avgScorePercentage >= 60) projectedPercentile = "88 - 94%ile";
  else if (avgScorePercentage >= 50) projectedPercentile = "80 - 87%ile";

  // Difficulty stats calculation
  const calcDiff = (d: { correct: number; total: number }): DifficultyStats => ({
    correct: d.correct,
    total: d.total,
    accuracy: d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0,
  });

  const difficultyBreakdown = {
    easy: calcDiff(diffCounts.EASY),
    medium: calcDiff(diffCounts.MEDIUM),
    hard: calcDiff(diffCounts.HARD),
  };

  // Generate tactical AI study insights
  const insights: string[] = [];

  if (totalMarksLost > 0) {
    insights.push(
      `⚠️ Negative Marking Alert: You lost ${totalMarksLost} marks to negative marking across your tests. Eliminating doubtful guesses could boost your overall score by up to ${Math.round(
        totalMarksLost * 1.25
      )} net points.`
    );
  }

  if (difficultyBreakdown.hard.total > 0 && difficultyBreakdown.hard.accuracy < 50) {
    insights.push(
      `🎯 Rank Booster Focus: Hard question accuracy is currently ${difficultyBreakdown.hard.accuracy}%. Focus on multi-concept numericals and assertion-reasoning questions to cross the 650+ mark barrier.`
    );
  } else if (difficultyBreakdown.easy.total > 0 && difficultyBreakdown.easy.accuracy >= 85) {
    insights.push(
      `✨ Solid Foundation: Your NCERT concept recall on easy questions is ${difficultyBreakdown.easy.accuracy}%. Maintain this consistency!`
    );
  }

  if (avgTimePerQuestionSeconds > 65) {
    insights.push(
      `⏱️ Speed Optimization: Average pacing is ${avgTimePerQuestionSeconds}s per question (target: 50–55s). Practice quick elimination of wrong options to save time for physics numericals.`
    );
  } else if (avgTimePerQuestionSeconds > 0 && avgTimePerQuestionSeconds <= 55) {
    insights.push(
      `⚡ Optimal Pacing: Your average pace of ${avgTimePerQuestionSeconds}s per question matches the recommended NEET exam speed.`
    );
  }

  if (trends.length >= 2) {
    const recentDelta = trends[trends.length - 1].percentage - trends[0].percentage;
    if (recentDelta > 0) {
      insights.push(
        `📈 Positive Trajectory: Your score has improved by +${recentDelta}% from your first test to your latest test!`
      );
    }
  }

  return {
    totalAttempts: attempts.length,
    totalQuestionsAttempted: totalAttempted,
    overallAccuracy,
    avgScorePercentage,
    bestScorePercentage,
    totalMarksGained,
    totalMarksLost,
    avgTimePerQuestionSeconds,
    projectedPercentile,
    difficultyBreakdown,
    trends,
    insights,
  };
}
