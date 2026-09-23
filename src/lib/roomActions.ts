"use server";

import { revalidatePath } from "next/cache";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { prisma } from "@/lib/prisma";
import type { AnswerMap } from "@/lib/examTypes";
import { mapShuffledToOriginalOptionIndex } from "@/lib/optionShuffle";
import { getStudentColor } from "@/lib/roomConstants";

const ROOM_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

async function generateUniqueRoomCode(): Promise<string> {
  let attempts = 0;
  while (attempts < 10) {
    let suffix = "";
    for (let i = 0; i < 4; i++) {
      suffix += ROOM_CODE_CHARS.charAt(
        Math.floor(Math.random() * ROOM_CODE_CHARS.length)
      );
    }
    const code = `SLV-${suffix}`;
    const existing = await prisma.testRoom.findUnique({
      where: { roomCode: code },
      select: { id: true },
    });
    if (!existing) return code;
    attempts++;
  }
  return `SLV-${Date.now().toString(36).slice(-4).toUpperCase()}`;
}

export type PersistentRoomSummary = {
  id: string;
  roomCode: string;
  name: string;
  isHost: boolean;
  hostName: string;
  participantCount: number;
  testCount: number;
  createdAt: Date;
  latestTestTitle?: string | null;
};

/**
 * Fetches all persistent rooms the current user is a member or host of.
 */
export async function getUserRooms(): Promise<{
  success: boolean;
  rooms: PersistentRoomSummary[];
  error?: string;
}> {
  try {
    const user = await getOrCreateUser();
    if (!user) return { success: false, rooms: [], error: "Unauthorized" };

    const rooms = await prisma.testRoom.findMany({
      where: {
        OR: [
          { hostUserId: user.id },
          { participants: { some: { userId: user.id } } },
        ],
      },
      include: {
        hostUser: { select: { id: true, name: true } },
        participants: { select: { id: true } },
        roomExams: {
          include: {
            exam: { select: { title: true } },
          },
          orderBy: { scheduledAt: "desc" },
          take: 1,
        },
        _count: {
          select: {
            participants: true,
            roomExams: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const summaries: PersistentRoomSummary[] = rooms.map((r) => ({
      id: r.id,
      roomCode: r.roomCode,
      name: r.name,
      isHost: r.hostUserId === user.id,
      hostName: r.hostUser.name,
      participantCount: r._count.participants,
      testCount: r._count.roomExams,
      createdAt: r.createdAt,
      latestTestTitle: r.roomExams[0]?.exam.title ?? null,
    }));

    return { success: true, rooms: summaries };
  } catch (err) {
    console.error("Failed to fetch user rooms:", err);
    return { success: false, rooms: [], error: "Failed to load study rooms." };
  }
}

/**
 * Creates a persistent study group room.
 */
export async function createStudyRoom(
  roomName: string
): Promise<{ success: boolean; roomCode?: string; roomId?: string; error?: string }> {
  try {
    const user = await getOrCreateUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const name = roomName.trim() || "NEET Study Circle";
    const roomCode = await generateUniqueRoomCode();

    const room = await prisma.testRoom.create({
      data: {
        roomCode,
        name,
        hostUserId: user.id,
        participants: {
          create: {
            userId: user.id,
          },
        },
      },
    });

    revalidatePath("/dashboard/room");
    return { success: true, roomCode: room.roomCode, roomId: room.id };
  } catch (err) {
    console.error("Failed to create study room:", err);
    return { success: false, error: "Failed to create study room." };
  }
}

/**
 * Deletes a persistent study room (Host only).
 */
export async function deleteStudyRoom(
  roomId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getOrCreateUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const room = await prisma.testRoom.findUnique({
      where: { id: roomId },
      select: { id: true, hostUserId: true, roomCode: true },
    });

    if (!room) return { success: false, error: "Room not found." };
    if (room.hostUserId !== user.id) {
      return { success: false, error: "Only the room host can delete this study circle." };
    }

    // Delete attempts associated with this room
    await prisma.attempt.deleteMany({
      where: { roomId: room.id },
    });

    // Delete room exams
    await prisma.roomExam.deleteMany({
      where: { roomId: room.id },
    });

    // Delete participants
    await prisma.roomParticipant.deleteMany({
      where: { roomId: room.id },
    });

    // Delete the room
    await prisma.testRoom.delete({
      where: { id: room.id },
    });

    revalidatePath("/dashboard/room");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("Failed to delete study room:", err);
    return { success: false, error: "Failed to delete study room." };
  }
}

/**
 * Leaves a persistent study room (Non-host participant).
 */
export async function leaveStudyRoom(
  roomId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getOrCreateUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const room = await prisma.testRoom.findUnique({
      where: { id: roomId },
      select: { id: true, hostUserId: true, roomCode: true },
    });

    if (!room) return { success: false, error: "Room not found." };

    if (room.hostUserId === user.id) {
      return {
        success: false,
        error: "As the host, you cannot leave the room. You can delete the room instead.",
      };
    }

    await prisma.roomParticipant.deleteMany({
      where: {
        roomId: room.id,
        userId: user.id,
      },
    });

    revalidatePath("/dashboard/room");
    revalidatePath(`/dashboard/room/${room.roomCode}`);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("Failed to leave study room:", err);
    return { success: false, error: "Failed to leave study room." };
  }
}

/**
 * Ensures a user is registered as a participant in a room without triggering revalidatePath (safe for server component rendering).
 */
export async function ensureRoomParticipant(
  rawRoomCode: string,
  userId: string
): Promise<{ success: boolean; roomId?: string; error?: string }> {
  try {
    const code = rawRoomCode.trim().toUpperCase();
    if (!code) return { success: false, error: "Invalid room code." };

    const room = await prisma.testRoom.findUnique({
      where: { roomCode: code },
      include: {
        participants: { select: { userId: true } },
      },
    });

    if (!room) {
      return { success: false, error: "No room found with this code. Please verify and try again." };
    }

    const alreadyJoined = room.participants.some((p) => p.userId === userId);
    if (!alreadyJoined) {
      await prisma.roomParticipant.create({
        data: {
          roomId: room.id,
          userId,
        },
      });
    }

    return { success: true, roomId: room.id };
  } catch (err) {
    console.error("Failed to ensure room participant:", err);
    return { success: false, error: "Failed to verify room participant." };
  }
}

/**
 * Joins a persistent study group room via its short code (e.g. SLV-4X9K).
 */
export async function joinRoom(
  rawRoomCode: string
): Promise<{ success: boolean; roomCode?: string; error?: string }> {
  try {
    const user = await getOrCreateUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const code = rawRoomCode.trim().toUpperCase();
    if (!code) return { success: false, error: "Please enter a valid room code." };

    const res = await ensureRoomParticipant(code, user.id);
    if (!res.success) {
      return { success: false, error: res.error };
    }

    revalidatePath("/dashboard/room");
    revalidatePath(`/dashboard/room/${code}`);
    return { success: true, roomCode: code };
  } catch (err) {
    console.error("Failed to join room:", err);
    return { success: false, error: "Failed to join room. Please try again." };
  }
}

/**
 * Adds a newly generated test to a persistent room.
 */
export async function createTestInRoom(
  roomId: string,
  examId: string,
  scheduledAtISO: string
): Promise<{ success: boolean; roomExamId?: string; error?: string }> {
  try {
    const user = await getOrCreateUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const room = await prisma.testRoom.findUnique({
      where: { id: roomId },
      include: {
        participants: { select: { userId: true } },
      },
    });

    if (!room) return { success: false, error: "Room not found." };

    const isMember = room.participants.some((p) => p.userId === user.id);
    if (!isMember && room.hostUserId !== user.id) {
      return { success: false, error: "Only room members can add tests." };
    }

    const scheduledAt = new Date(scheduledAtISO);
    if (isNaN(scheduledAt.getTime())) {
      return { success: false, error: "Invalid scheduled start time." };
    }

    const roomExam = await prisma.roomExam.create({
      data: {
        roomId: room.id,
        examId,
        scheduledAt,
        status: "SCHEDULED",
      },
    });

    // If the test is scheduled to start in <= 15 minutes, trigger email reminders immediately!
    const diffMs = scheduledAt.getTime() - Date.now();
    if (diffMs <= 15 * 60 * 1000) {
      try {
        const { dispatchPendingReminders } = await import("@/app/api/cron/reminders/route");
        // Fire and forget or await dispatch
        dispatchPendingReminders().catch((err) => {
          console.error("Failed to auto-dispatch immediate test reminders:", err);
        });
      } catch (err) {
        console.error("Error importing reminder dispatcher:", err);
      }
    }

    revalidatePath(`/dashboard/room/${room.roomCode}`);
    return { success: true, roomExamId: roomExam.id };
  } catch (err) {
    console.error("Failed to add test to room:", err);
    return { success: false, error: "Failed to create room test." };
  }
}

export type RoomMemberInfo = {
  userId: string;
  name: string;
  isHost: boolean;
  joinedAt: Date;
  color: { stroke: string; bg: string; label: string };
};

export type RoomTestItem = {
  roomExamId: string;
  examId: string;
  title: string;
  questionCount: number;
  durationMinutes: number;
  scheduledAt: Date;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  isLive: boolean;
  hasUserSubmitted: boolean;
  userScore: number | null;
  finishedCount: number;
  totalParticipants: number;
};

export type StudentTrajectoryPoint = {
  testIndex: number;
  testTitle: string;
  examId: string;
  score: number;
  maxScore: number;
  percentage: number;
  accuracy: number;
  attempted: boolean;
};

export type StudentTrajectorySeries = {
  userId: string;
  name: string;
  isCurrentUser: boolean;
  color: { stroke: string; bg: string; label: string };
  averagePercentage: number;
  points: StudentTrajectoryPoint[];
};

export type RoomDetailsResponse = {
  success: boolean;
  error?: string;
  room?: {
    id: string;
    roomCode: string;
    name: string;
    isHost: boolean;
    currentUserId: string;
    hostName: string;
    members: RoomMemberInfo[];
    tests: RoomTestItem[];
    trajectoryTests: Array<{ index: number; title: string; date: string }>;
    studentTrajectories: StudentTrajectorySeries[];
  };
};

/**
 * Fetches all details for a persistent room: members, test roster, and multi-test variation trajectory.
 */
export async function getRoomDetails(roomCode: string): Promise<RoomDetailsResponse> {
  try {
    const user = await getOrCreateUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const code = roomCode.trim().toUpperCase();
    const room = await prisma.testRoom.findUnique({
      where: { roomCode: code },
      include: {
        hostUser: { select: { id: true, name: true } },
        participants: {
          include: {
            user: { select: { id: true, name: true } },
          },
          orderBy: { joinedAt: "asc" },
        },
        roomExams: {
          include: {
            exam: {
              select: {
                id: true,
                title: true,
                durationMinutes: true,
                _count: { select: { questions: true } },
                questions: { select: { id: true, correctOptionIndex: true } },
              },
            },
            attempts: {
              select: {
                id: true,
                userId: true,
                score: true,
                answers: true,
                submittedAt: true,
              },
            },
          },
          orderBy: { scheduledAt: "asc" },
        },
      },
    });

    if (!room) return { success: false, error: "Room not found." };

    const isMember = room.participants.some((p) => p.userId === user.id);
    if (!isMember) {
      return { success: false, error: "You are not a member of this room." };
    }

    const members: RoomMemberInfo[] = room.participants.map((p, idx) => ({
      userId: p.user.id,
      name: p.user.name,
      isHost: p.user.id === room.hostUserId,
      joinedAt: p.joinedAt,
      color: getStudentColor(idx),
    }));

    const now = Date.now();
    const tests: RoomTestItem[] = [];
    const completedOrAttemptedExams: Array<(typeof room.roomExams)[number]> = [];

    for (const re of room.roomExams) {
      const scheduledMs = new Date(re.scheduledAt).getTime();
      const durationMs = (re.exam.durationMinutes + 15) * 60 * 1000;
      const isPastScheduled = now >= scheduledMs;
      const isWindowExpired = now > scheduledMs + durationMs;

      const userAttempt = re.attempts.find((a) => a.userId === user.id && a.submittedAt !== null);
      const finishedCount = re.attempts.filter((a) => a.submittedAt !== null).length;
      const allFinished = members.length > 0 && finishedCount >= members.length;

      let status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" = re.status;
      if (allFinished || isWindowExpired) {
        status = "COMPLETED";
      } else if (isPastScheduled) {
        status = "IN_PROGRESS";
      }

      const isLive = status === "IN_PROGRESS";

      tests.push({
        roomExamId: re.id,
        examId: re.exam.id,
        title: re.exam.title,
        questionCount: re.exam._count.questions,
        durationMinutes: re.exam.durationMinutes,
        scheduledAt: re.scheduledAt,
        status,
        isLive,
        hasUserSubmitted: Boolean(userAttempt),
        userScore: userAttempt?.score ?? null,
        finishedCount,
        totalParticipants: members.length,
      });

      // Keep for trajectory chart if completed or attempted by at least 1 person
      if (re.attempts.length > 0 || isPastScheduled) {
        completedOrAttemptedExams.push(re);
      }
    }

    // Sort tests latest scheduled first for the UI list
    tests.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

    // Build Multi-Test Trajectory Line Graph Data
    const trajectoryTests = completedOrAttemptedExams.map((re, idx) => ({
      index: idx + 1,
      title: re.exam.title,
      date: new Date(re.scheduledAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    }));

    const studentTrajectories: StudentTrajectorySeries[] = members.map((member) => {
      const points: StudentTrajectoryPoint[] = [];
      let totalPercentage = 0;
      let scoredTestCount = 0;

      completedOrAttemptedExams.forEach((re, idx) => {
        const attempt = re.attempts.find((a) => a.userId === member.userId && a.submittedAt !== null);
        const totalQuestions = re.exam._count.questions;
        const maxScore = totalQuestions * 4;

        if (attempt) {
          const score = attempt.score ?? 0;
          const percentage = maxScore > 0 ? Math.max(0, Math.min(100, Math.round((score / maxScore) * 100))) : 0;
          totalPercentage += percentage;
          scoredTestCount++;

          points.push({
            testIndex: idx + 1,
            testTitle: re.exam.title,
            examId: re.exam.id,
            score,
            maxScore,
            percentage,
            accuracy: percentage,
            attempted: true,
          });
        } else {
          // Did not attempt or missed
          points.push({
            testIndex: idx + 1,
            testTitle: re.exam.title,
            examId: re.exam.id,
            score: 0,
            maxScore,
            percentage: 0,
            accuracy: 0,
            attempted: false,
          });
        }
      });

      const averagePercentage = scoredTestCount > 0 ? Math.round(totalPercentage / scoredTestCount) : 0;

      return {
        userId: member.userId,
        name: member.name,
        isCurrentUser: member.userId === user.id,
        color: member.color,
        averagePercentage,
        points,
      };
    });

    return {
      success: true,
      room: {
        id: room.id,
        roomCode: room.roomCode,
        name: room.name,
        isHost: room.hostUserId === user.id,
        currentUserId: user.id,
        hostName: room.hostUser.name,
        members,
        tests,
        trajectoryTests,
        studentTrajectories,
      },
    };
  } catch (err) {
    console.error("Failed to get persistent room details:", err);
    return { success: false, error: "Failed to load room." };
  }
}

/**
 * Submits an attempt for a specific room exam under anti-leak option shuffling rules.
 */
export async function submitRoomExamAttempt(
  roomId: string,
  examId: string,
  answers: AnswerMap
): Promise<{ success: boolean; attemptId?: string; error?: string }> {
  try {
    const user = await getOrCreateUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const room = await prisma.testRoom.findUnique({
      where: { id: roomId },
      include: {
        participants: true,
        roomExams: { where: { examId } },
      },
    });

    if (!room) return { success: false, error: "Room not found." };

    const isMember = room.participants.some((p) => p.userId === user.id);
    if (!isMember) return { success: false, error: "You are not a member of this room." };

    const roomExam = room.roomExams[0];
    const roomExamId = roomExam?.id ?? null;

    // Check if user already submitted this specific exam in this room
    const existingAttempt = await prisma.attempt.findFirst({
      where: {
        userId: user.id,
        examId,
        roomId: room.id,
        submittedAt: { not: null },
      },
    });

    if (existingAttempt) {
      return { success: true, attemptId: existingAttempt.id };
    }

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: { select: { id: true, correctOptionIndex: true } },
      },
    });

    if (!exam) return { success: false, error: "Exam not found." };

    let correctCount = 0;
    let incorrectCount = 0;

    for (const q of exam.questions) {
      const selectedShuffledIndex = answers[q.id];
      if (selectedShuffledIndex === undefined) continue;

      const originalOptionIndex = mapShuffledToOriginalOptionIndex(
        selectedShuffledIndex,
        user.id,
        q.id
      );

      if (originalOptionIndex === q.correctOptionIndex) {
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
        roomId: room.id,
        roomExamId,
        answers,
        score: totalScore,
        submittedAt: now,
      },
    });

    revalidatePath(`/dashboard/room/${room.roomCode}`);
    revalidatePath(`/dashboard/room/${room.roomCode}/test/${examId}`);
    return { success: true, attemptId: attempt.id };
  } catch (err) {
    console.error("Failed to submit room exam attempt:", err);
    return { success: false, error: "Failed to submit room test attempt." };
  }
}

/**
 * Alias for submitRoomExamAttempt
 */
export async function submitRoomAttempt(
  roomId: string,
  examId: string,
  answers: AnswerMap
) {
  return submitRoomExamAttempt(roomId, examId, answers);
}

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  name: string;
  score: number;
  maxScore: number;
  percentage: number;
  accuracy: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  timeSpentSeconds: number;
  isCurrentUser: boolean;
  color: { stroke: string; bg: string; label: string };
};

export type WeakTopicQuestion = {
  questionId: string;
  questionText: string;
  explanation: string | null;
  diagramSvg: string | null;
  wrongCount: number;
  totalAttempts: number;
  errorRate: number;
};

export type RoomExamLeaderboardResponse = {
  success: boolean;
  error?: string;
  isReady: boolean;
  title?: string;
  roomName?: string;
  roomCode?: string;
  maxScore?: number;
  totalQuestions?: number;
  leaderboard?: LeaderboardEntry[];
  weakTopics?: WeakTopicQuestion[];
};

/**
 * Retrieves the synchronized leaderboard and diagnostic weak topics for a specific test inside a room.
 */
export async function getRoomExamLeaderboard(
  roomCode: string,
  examId: string
): Promise<RoomExamLeaderboardResponse> {
  try {
    const user = await getOrCreateUser();
    if (!user) return { success: false, isReady: false, error: "Unauthorized" };

    const code = roomCode.trim().toUpperCase();
    const room = await prisma.testRoom.findUnique({
      where: { roomCode: code },
      include: {
        participants: {
          include: {
            user: { select: { id: true, name: true } },
          },
          orderBy: { joinedAt: "asc" },
        },
        roomExams: {
          where: { examId },
          include: {
            exam: {
              include: {
                questions: {
                  select: {
                    id: true,
                    questionText: true,
                    correctOptionIndex: true,
                    explanation: true,
                    diagramSvg: true,
                  },
                },
              },
            },
            attempts: {
              include: {
                user: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });

    if (!room || room.roomExams.length === 0) {
      return { success: false, isReady: false, error: "Room test not found." };
    }

    const roomExam = room.roomExams[0];
    const exam = roomExam.exam;
    const questions = exam.questions;
    const totalQuestions = questions.length;
    const maxScore = totalQuestions * 4;

    const rawEntries: Omit<LeaderboardEntry, "rank">[] = [];
    const questionStats: Record<string, { wrongCount: number; totalAttempts: number }> = {};

    for (const q of questions) {
      questionStats[q.id] = { wrongCount: 0, totalAttempts: 0 };
    }

    room.participants.forEach((part, pIdx) => {
      const color = getStudentColor(pIdx);
      const attempt = roomExam.attempts.find((a) => a.userId === part.user.id && a.submittedAt !== null);

      if (!attempt) {
        rawEntries.push({
          userId: part.user.id,
          name: part.user.name,
          score: 0,
          maxScore,
          percentage: 0,
          accuracy: 0,
          correct: 0,
          incorrect: 0,
          unattempted: totalQuestions,
          timeSpentSeconds: exam.durationMinutes * 60,
          isCurrentUser: part.user.id === user.id,
          color,
        });
        return;
      }

      const answers = (attempt.answers || {}) as Record<string, number>;
      let correct = 0;
      let incorrect = 0;
      let unattempted = 0;

      for (const q of questions) {
        const selectedShuffledIndex = answers[q.id];
        if (selectedShuffledIndex === undefined) {
          unattempted++;
        } else {
          questionStats[q.id].totalAttempts++;
          const originalOptionIndex = mapShuffledToOriginalOptionIndex(
            selectedShuffledIndex,
            part.user.id,
            q.id
          );

          if (originalOptionIndex === q.correctOptionIndex) {
            correct++;
          } else {
            incorrect++;
            questionStats[q.id].wrongCount++;
          }
        }
      }

      const score = attempt.score ?? (correct * 4 - incorrect * 1);
      const attemptedCount = correct + incorrect;
      const accuracy = attemptedCount > 0 ? Math.round((correct / attemptedCount) * 100) : 0;
      const percentage = maxScore > 0 ? Math.max(0, Math.min(100, Math.round((score / maxScore) * 100))) : 0;

      const startedMs = new Date(attempt.startedAt).getTime();
      const submittedMs = attempt.submittedAt ? new Date(attempt.submittedAt).getTime() : startedMs;
      const timeSpentSeconds = Math.max(1, Math.round((submittedMs - startedMs) / 1000));

      rawEntries.push({
        userId: part.user.id,
        name: part.user.name,
        score,
        maxScore,
        percentage,
        accuracy,
        correct,
        incorrect,
        unattempted,
        timeSpentSeconds,
        isCurrentUser: part.user.id === user.id,
        color,
      });
    });

    rawEntries.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
      return a.timeSpentSeconds - b.timeSpentSeconds;
    });

    const leaderboard: LeaderboardEntry[] = rawEntries.map((entry, idx) => ({
      ...entry,
      rank: idx + 1,
    }));

    const weakTopics: WeakTopicQuestion[] = questions
      .map((q) => {
        const stats = questionStats[q.id];
        const errorRate = stats.totalAttempts > 0 ? Math.round((stats.wrongCount / stats.totalAttempts) * 100) : 0;
        return {
          questionId: q.id,
          questionText: q.questionText,
          explanation: q.explanation,
          diagramSvg: q.diagramSvg,
          wrongCount: stats.wrongCount,
          totalAttempts: stats.totalAttempts,
          errorRate,
        };
      })
      .filter((q) => q.wrongCount > 0)
      .sort((a, b) => b.errorRate - a.errorRate || b.wrongCount - a.wrongCount)
      .slice(0, 5);

    return {
      success: true,
      isReady: true,
      title: exam.title,
      roomName: room.name,
      roomCode: room.roomCode,
      maxScore,
      totalQuestions,
      leaderboard,
      weakTopics,
    };
  } catch (err) {
    console.error("Failed to fetch room exam leaderboard:", err);
    return { success: false, isReady: false, error: "Failed to load leaderboard." };
  }
}

/**
 * Legacy compatibility wrapper for getRoomResults
 */
export async function getRoomResults(roomCode: string, examId?: string) {
  const room = await prisma.testRoom.findUnique({
    where: { roomCode: roomCode.trim().toUpperCase() },
    include: {
      roomExams: { orderBy: { scheduledAt: "desc" }, take: 1 },
    },
  });
  const targetExamId = examId || room?.roomExams[0]?.examId;
  if (!targetExamId) return { isReady: false, error: "No test found in room." };
  return getRoomExamLeaderboard(roomCode, targetExamId);
}

/**
 * Legacy compatibility wrapper for removeParticipant
 */
export async function removeParticipant(
  roomId: string,
  participantUserId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getOrCreateUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const room = await prisma.testRoom.findUnique({
      where: { id: roomId },
      select: { id: true, hostUserId: true, roomCode: true },
    });

    if (!room || room.hostUserId !== user.id) {
      return { success: false, error: "Only host can remove participants." };
    }

    await prisma.roomParticipant.deleteMany({
      where: { roomId, userId: participantUserId },
    });

    revalidatePath(`/dashboard/room/${room.roomCode}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: "Failed to remove participant." };
  }
}

export type RoomStateResponse = {
  success: boolean;
  error?: string;
  room?: {
    id: string;
    roomCode: string;
    title: string;
    scheduledAt: Date;
    durationMinutes: number;
    questionCount: number;
    status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
    isHost: boolean;
    currentUserId: string;
    hostName: string;
    participants: Array<{
      userId: string;
      name: string;
      email: string;
      isHost: boolean;
      hasSubmitted: boolean;
      joinedAt: Date;
    }>;
    userAttemptId: string | null;
    isStarted: boolean;
    isExpired: boolean;
    allSubmitted: boolean;
  };
};

/**
 * Legacy compatibility wrapper for getRoomState
 */
export async function getRoomState(roomCode: string): Promise<RoomStateResponse> {
  const details = await getRoomDetails(roomCode);
  if (!details.success || !details.room) return { success: false, error: details.error };
  const r = details.room;
  const firstTest = r.tests[0];
  return {
    success: true,
    room: {
      id: r.id,
      roomCode: r.roomCode,
      title: firstTest?.title || r.name,
      scheduledAt: firstTest?.scheduledAt || new Date(),
      durationMinutes: firstTest?.durationMinutes || 15,
      questionCount: firstTest?.questionCount || 15,
      status: firstTest?.status === "IN_PROGRESS" ? "IN_PROGRESS" : firstTest?.status === "COMPLETED" ? "COMPLETED" : "SCHEDULED",
      isHost: r.isHost,
      currentUserId: r.currentUserId,
      hostName: r.hostName,
      participants: r.members.map((m) => ({
        userId: m.userId,
        name: m.name,
        email: "",
        isHost: m.isHost,
        hasSubmitted: false,
        joinedAt: m.joinedAt,
      })),
      userAttemptId: null,
      isStarted: firstTest?.isLive || false,
      isExpired: false,
      allSubmitted: false,
    },
  };
}

/**
 * Backward compatibility wrapper
 */
export async function createRoom(
  examId: string,
  scheduledAtISO: string
): Promise<{ success: boolean; roomCode?: string; roomId?: string; error?: string }> {
  const roomRes = await createStudyRoom("NEET Study Room");
  if (!roomRes.success || !roomRes.roomId) return roomRes;
  await createTestInRoom(roomRes.roomId, examId, scheduledAtISO);
  return roomRes;
}
