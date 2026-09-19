import { prisma } from "@/lib/prisma";

export type DetailedAttempt = {
  id: string;
  examId: string;
  title: string;
  questionCount: number;
  maxScore: number;
  score: number;
  positiveMarks: number;
  negativeMarks: number;
  accuracy: number;
  submittedAt: Date;
  roomCode?: string;
  roomName?: string;
};

export type UpcomingCohort = {
  roomExamId: string;
  roomId: string;
  roomCode: string;
  roomName: string;
  examTitle: string;
  questionCount: number;
  durationMinutes: number;
  scheduledAt: Date;
  memberCount: number;
};

export type ActiveStudyCircle = {
  id: string;
  roomCode: string;
  name: string;
  memberCount: number;
  isHost: boolean;
  activeTestTitle?: string;
  scheduledTimeText?: string;
};

export type SubjectRadar = {
  subject: string;
  score: number;
  maxScore: number;
  percentage: number;
  aiimsCutoffPercent: number;
};

export type DashboardFullData = {
  totalExamsTaken: number;
  avgScorePercent: number;
  avgScore720: number;
  overallAccuracy: number;
  negativeMarksTotal: number;
  weeklyMocksCount: number;
  percentileRank: number;
  estAirRank: number;
  upcomingCohort: UpcomingCohort | null;
  activeStudyCircles: ActiveStudyCircle[];
  subjectRadar: SubjectRadar[];
  recentAttempts: DetailedAttempt[];
};

export async function getDashboardData(userId: string): Promise<DashboardFullData> {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [submittedAttempts, joinedRooms] = await Promise.all([
    // All submitted attempts by user (solo and room attempts)
    prisma.attempt.findMany({
      where: {
        userId,
        submittedAt: { not: null },
      },
      orderBy: { submittedAt: "desc" },
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            _count: { select: { questions: true } },
          },
        },
        room: {
          select: {
            id: true,
            name: true,
            roomCode: true,
          },
        },
      },
    }),

    // User's joined rooms
    prisma.roomParticipant.findMany({
      where: { userId },
      include: {
        room: {
          include: {
            participants: { select: { userId: true } },
            roomExams: {
              where: {
                scheduledAt: { gte: new Date(now.getTime() - 15 * 60 * 1000) },
              },
              orderBy: { scheduledAt: "asc" },
              include: {
                exam: {
                  select: {
                    id: true,
                    title: true,
                    durationMinutes: true,
                    _count: { select: { questions: true } },
                  },
                },
              },
            },
          },
        },
      },
    }),
  ]);

  // Total exams & stats calculation
  const totalExamsTaken = submittedAttempts.length;
  let totalScore = 0;
  let totalMaxScore = 0;
  let totalNegatives = 0;
  let weeklyMocksCount = 0;

  const recentAttempts: DetailedAttempt[] = submittedAttempts.map((att) => {
    const qCount = att.exam._count.questions || 15;
    const maxScore = qCount * 4;
    const score = att.score ?? 0;

    // Approximate correct vs incorrect based on score: Score = 4C - 1W, C + W <= qCount
    // For realistic NTA reporting:
    const positiveMarks = Math.max(0, score > 0 ? score + Math.max(0, Math.floor((maxScore - score) / 5)) : 0);
    const negativeMarks = Math.max(0, positiveMarks - score);
    const accuracy = maxScore > 0 ? Math.max(0, Math.min(100, Math.round((score / maxScore) * 100))) : 0;

    totalScore += score;
    totalMaxScore += maxScore;
    totalNegatives += negativeMarks;

    if (att.submittedAt && att.submittedAt >= oneWeekAgo) {
      weeklyMocksCount++;
    }

    return {
      id: att.id,
      examId: att.exam.id,
      title: att.exam.title,
      questionCount: qCount,
      maxScore,
      score,
      positiveMarks,
      negativeMarks,
      accuracy,
      submittedAt: att.submittedAt || now,
      roomCode: att.room?.roomCode,
      roomName: att.room?.name,
    };
  });

  const avgScorePercent =
    totalMaxScore > 0 ? Math.max(0, Math.min(100, Math.round((totalScore / totalMaxScore) * 100))) : 0;
  const avgScore720 = Math.round((avgScorePercent / 100) * 720);
  const overallAccuracy = totalMaxScore > 0 ? avgScorePercent : 0;
  const negativeMarksTotal = totalNegatives;

  // Percentile estimate based on score
  const percentileRank = totalExamsTaken > 0
    ? Number((Math.min(99.9, Math.max(50, 60 + (avgScorePercent / 100) * 39.8))).toFixed(1))
    : 0;
  const estAirRank = totalExamsTaken > 0
    ? Math.max(1, Math.round((100 - percentileRank) * 450 + 50))
    : 0;

  // Find next upcoming scheduled room exam across joined rooms
  let upcomingCohort: UpcomingCohort | null = null;
  const activeStudyCircles: ActiveStudyCircle[] = [];

  for (const p of joinedRooms) {
    const r = p.room;
    const nextExam = r.roomExams[0];

    if (nextExam && !upcomingCohort) {
      upcomingCohort = {
        roomExamId: nextExam.id,
        roomId: r.id,
        roomCode: r.roomCode,
        roomName: r.name,
        examTitle: nextExam.exam.title,
        questionCount: nextExam.exam._count.questions,
        durationMinutes: nextExam.exam.durationMinutes,
        scheduledAt: nextExam.scheduledAt,
        memberCount: r.participants.length,
      };
    }

    activeStudyCircles.push({
      id: r.id,
      roomCode: r.roomCode,
      name: r.name,
      memberCount: r.participants.length,
      isHost: r.hostUserId === userId,
      activeTestTitle: nextExam?.exam.title,
      scheduledTimeText: nextExam
        ? `Scheduled for ${new Date(nextExam.scheduledAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`
        : `${r.participants.length} members active`,
    });
  }

  // Calculate real subject-wise performance from user attempts
  let phyScore = 0;
  let phyMax = 0;

  let chemScore = 0;
  let chemMax = 0;

  let bioScore = 0;
  let bioMax = 0;

  for (const att of submittedAttempts) {
    const title = att.exam.title.toLowerCase();
    const qCount = att.exam._count.questions || 15;
    const maxScore = qCount * 4;
    const score = Math.max(0, att.score ?? 0);

    if (
      title.includes("physics") ||
      title.includes("mechanics") ||
      title.includes("optics") ||
      title.includes("electro") ||
      title.includes("kinematics") ||
      title.includes("thermodynamics") ||
      title.includes("rotation")
    ) {
      phyScore += score;
      phyMax += maxScore;
    } else if (
      title.includes("chem") ||
      title.includes("organic") ||
      title.includes("inorganic") ||
      title.includes("bonding") ||
      title.includes("equilibrium")
    ) {
      chemScore += score;
      chemMax += maxScore;
    } else if (
      title.includes("bio") ||
      title.includes("botany") ||
      title.includes("zoology") ||
      title.includes("genetics") ||
      title.includes("ncert") ||
      title.includes("cell") ||
      title.includes("ecology") ||
      title.includes("physiology")
    ) {
      bioScore += score;
      bioMax += maxScore;
    } else {
      // Full mock / Mixed test: partition proportionally (25% Physics, 25% Chemistry, 50% Biology)
      const pScorePart = Math.round(score * 0.25);
      const pMaxPart = Math.round(maxScore * 0.25);
      phyScore += pScorePart;
      phyMax += pMaxPart;

      const cScorePart = Math.round(score * 0.25);
      const cMaxPart = Math.round(maxScore * 0.25);
      chemScore += cScorePart;
      chemMax += cMaxPart;

      const bScorePart = score - pScorePart - cScorePart;
      const bMaxPart = maxScore - pMaxPart - cMaxPart;
      bioScore += bScorePart;
      bioMax += bMaxPart;
    }
  }

  // Calculate real percentages
  const physicsAcc = phyMax > 0 ? Math.max(0, Math.min(100, Math.round((phyScore / phyMax) * 100))) : 0;
  const chemAcc = chemMax > 0 ? Math.max(0, Math.min(100, Math.round((chemScore / chemMax) * 100))) : 0;
  const bioAcc = bioMax > 0 ? Math.max(0, Math.min(100, Math.round((bioScore / bioMax) * 100))) : 0;

  const subjectRadar: SubjectRadar[] = [
    {
      subject: "Physics (Mechanics + Electrodynamics)",
      score: Math.round((physicsAcc / 100) * 180),
      maxScore: 180,
      percentage: physicsAcc,
      aiimsCutoffPercent: 88,
    },
    {
      subject: "Chemistry (Organic + Physical)",
      score: Math.round((chemAcc / 100) * 180),
      maxScore: 180,
      percentage: chemAcc,
      aiimsCutoffPercent: 90,
    },
    {
      subject: "Biology (Botany + Zoology)",
      score: Math.round((bioAcc / 100) * 360),
      maxScore: 360,
      percentage: bioAcc,
      aiimsCutoffPercent: 94,
    },
  ];

  return {
    totalExamsTaken,
    avgScorePercent,
    avgScore720,
    overallAccuracy,
    negativeMarksTotal,
    weeklyMocksCount,
    percentileRank,
    estAirRank,
    upcomingCohort,
    activeStudyCircles,
    subjectRadar,
    recentAttempts,
  };
}

export type RecentExam = {
  id: string;
  title: string;
  createdAt: Date;
  questionCount: number;
  score: number | null;
  latestAttemptId: string | null;
};

export async function getAllExams(userId: string): Promise<RecentExam[]> {
  const exams = await prisma.exam.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { questions: true } },
      attempts: {
        where: { submittedAt: { not: null } },
        orderBy: { submittedAt: "desc" },
        select: { id: true, score: true, roomId: true },
      },
    },
  });

  return exams.map((exam) => {
    const soloAttempts = exam.attempts.filter((a) => !a.roomId);
    return {
      id: exam.id,
      title: exam.title,
      createdAt: exam.createdAt,
      questionCount: exam._count.questions,
      score: soloAttempts[0]?.score ?? null,
      latestAttemptId: soloAttempts[0]?.id ?? null,
    };
  });
}

