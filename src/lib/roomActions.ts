"use server";

import { revalidatePath } from "next/cache";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { prisma } from "@/lib/prisma";
import type { AnswerMap } from "@/lib/examTypes";
import { mapShuffledToOriginalOptionIndex } from "@/lib/optionShuffle";

const db = prisma as any;
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
    const existing = await db.testRoom.findUnique({
      where: { roomCode: code },
      select: { id: true },
    });
    if (!existing) return code;
    attempts++;
  }
  return `SLV-${Date.now().toString(36).slice(-4).toUpperCase()}`;
}

export type UserRoomSummary = {
  id: string;
  roomCode: string;
  title: string;
  scheduledAt: Date;
  durationMinutes: number;
  questionCount: number;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  isHost: boolean;
  hostName: string;
  participantCount: number;
  hasSubmitted: boolean;
};

/**
 * Creates a new scheduled group test room for a generated exam.
 */
export async function createRoom(
  examId: string,
  scheduledAtISO: string
): Promise<{ success: boolean; roomCode?: string; roomId?: string; error?: string }> {
  try {
    const user = await getOrCreateUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const exam = await db.exam.findFirst({
      where: { id: examId, userId: user.id },
      select: { id: true, title: true },
    });
    if (!exam) return { success: false, error: "Exam not found or access denied." };

    const scheduledAt = new Date(scheduledAtISO);
    if (isNaN(scheduledAt.getTime())) {
      return { success: false, error: "Invalid scheduled date and time." };
    }

    const roomCode = await generateUniqueRoomCode();

    const room = await db.testRoom.create({
      data: {
        roomCode,
        hostUserId: user.id,
        examId: exam.id,
        scheduledAt,
        status: "SCHEDULED",
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
    console.error("Failed to create test room:", err);
    return { success: false, error: "Failed to create group test room." };
  }
}

/**
 * Joins an existing room with a human-readable room code (e.g. SLV-4X9K).
 */
export async function joinRoom(
  rawRoomCode: string
): Promise<{ success: boolean; roomCode?: string; error?: string }> {
  try {
    const user = await getOrCreateUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const code = rawRoomCode.trim().toUpperCase();
    if (!code) return { success: false, error: "Please enter a valid room code." };

    const room = await db.testRoom.findUnique({
      where: { roomCode: code },
      include: {
        exam: { select: { durationMinutes: true } },
        participants: { select: { userId: true } },
      },
    });

    if (!room) {
      return { success: false, error: "No room found with this code. Please verify and try again." };
    }

    if (room.status === "COMPLETED" || room.status === "CANCELLED") {
      return { success: false, error: "This test room has already ended." };
    }

    // Check if user is already a participant
    const alreadyJoined = room.participants.some((p: any) => p.userId === user.id);
    if (!alreadyJoined) {
      const now = Date.now();
      const expirationMs = room.scheduledAt.getTime() + (room.exam.durationMinutes + 15) * 60 * 1000;
      if (now > expirationMs) {
        return { success: false, error: "This test session has expired and can no longer be joined." };
      }

      await db.roomParticipant.create({
        data: {
          roomId: room.id,
          userId: user.id,
        },
      });
    }

    revalidatePath("/dashboard/room");
    revalidatePath(`/dashboard/room/${code}`);
    return { success: true, roomCode: room.roomCode };
  } catch (err) {
    console.error("Failed to join room:", err);
    return { success: false, error: "Failed to join room. Please try again." };
  }
}

/**
 * Removes a participant from the room (Host-only action).
 */
export async function removeParticipant(
  roomId: string,
  participantUserId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getOrCreateUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const room = await db.testRoom.findUnique({
      where: { id: roomId },
      select: { id: true, hostUserId: true, roomCode: true },
    });

    if (!room || room.hostUserId !== user.id) {
      return { success: false, error: "Only the host can remove participants." };
    }

    if (participantUserId === user.id) {
      return { success: false, error: "Host cannot be removed from the room." };
    }

    await db.roomParticipant.deleteMany({
      where: { roomId, userId: participantUserId },
    });

    revalidatePath(`/dashboard/room/${room.roomCode}`);
    return { success: true };
  } catch (err) {
    console.error("Failed to remove participant:", err);
    return { success: false, error: "Failed to remove participant." };
  }
}

export type RoomParticipantInfo = {
  userId: string;
  name: string;
  email: string;
  isHost: boolean;
  hasSubmitted: boolean;
  joinedAt: Date;
};

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
    participants: RoomParticipantInfo[];
    userAttemptId: string | null;
    isStarted: boolean;
    isExpired: boolean;
    allSubmitted: boolean;
  };
};

/**
 * Fetches the live state of a room for real-time lobby polling.
 */
export async function getRoomState(roomCode: string): Promise<RoomStateResponse> {
  try {
    const user = await getOrCreateUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const code = roomCode.trim().toUpperCase();
    const room = await db.testRoom.findUnique({
      where: { roomCode: code },
      include: {
        hostUser: { select: { id: true, name: true } },
        exam: {
          select: {
            id: true,
            title: true,
            durationMinutes: true,
            _count: { select: { questions: true } },
          },
        },
        participants: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
          orderBy: { joinedAt: "asc" },
        },
      },
    });

    if (!room) return { success: false, error: "Room not found." };

    const isMember = room.participants.some((p: any) => p.userId === user.id);
    if (!isMember) {
      return { success: false, error: "You are not a participant in this room. Please join first." };
    }

    const now = new Date();
    const isStarted = now.getTime() >= room.scheduledAt.getTime();
    const expirationMs =
      room.scheduledAt.getTime() + (room.exam.durationMinutes + 15) * 60 * 1000;
    const isExpired = now.getTime() > expirationMs;

    const allSubmitted =
      room.participants.length > 0 &&
      room.participants.every((p: any) => p.attemptId !== null);

    let updatedStatus = room.status;
    if (allSubmitted || (isExpired && room.status !== "COMPLETED")) {
      updatedStatus = "COMPLETED";
      if (room.status !== "COMPLETED") {
        await db.testRoom.update({
          where: { id: room.id },
          data: { status: "COMPLETED" },
        });
      }
    } else if (isStarted && room.status === "SCHEDULED") {
      updatedStatus = "IN_PROGRESS";
      await db.testRoom.update({
        where: { id: room.id },
        data: { status: "IN_PROGRESS" },
      });
    }

    const currentUserPart = room.participants.find((p: any) => p.userId === user.id);

    return {
      success: true,
      room: {
        id: room.id,
        roomCode: room.roomCode,
        title: room.exam.title,
        scheduledAt: room.scheduledAt,
        durationMinutes: room.exam.durationMinutes,
        questionCount: room.exam._count.questions,
        status: updatedStatus,
        isHost: room.hostUserId === user.id,
        currentUserId: user.id,
        hostName: room.hostUser.name,
        participants: room.participants.map((p: any) => ({
          userId: p.user.id,
          name: p.user.name,
          email: p.user.email,
          isHost: p.user.id === room.hostUserId,
          hasSubmitted: p.attemptId !== null,
          joinedAt: p.joinedAt,
        })),
        userAttemptId: currentUserPart?.attemptId ?? null,
        isStarted,
        isExpired,
        allSubmitted,
      },
    };
  } catch (err) {
    console.error("Failed to get room state:", err);
    return { success: false, error: "Failed to load room." };
  }
}

/**
 * Submits a room test attempt under anti-leak option shuffling rules.
 */
export async function submitRoomAttempt(
  roomId: string,
  examId: string,
  answers: AnswerMap
): Promise<{ success: boolean; attemptId?: string; error?: string }> {
  try {
    const user = await getOrCreateUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const room = await db.testRoom.findUnique({
      where: { id: roomId },
      include: {
        participants: true,
      },
    });

    if (!room) return { success: false, error: "Room not found." };

    const participant = room.participants.find((p: any) => p.userId === user.id);
    if (!participant) return { success: false, error: "You are not a participant in this room." };

    if (participant.attemptId) {
      return { success: true, attemptId: participant.attemptId };
    }

    const now = new Date();
    if (now.getTime() < room.scheduledAt.getTime() - 10000) {
      return { success: false, error: "Cannot submit before the scheduled start time." };
    }

    const exam = await db.exam.findUnique({
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
      if (selectedShuffledIndex === undefined) {
        continue;
      }

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

    const attempt = await db.attempt.create({
      data: {
        examId: exam.id,
        userId: user.id,
        roomId: room.id,
        answers,
        score: totalScore,
        submittedAt: now,
      },
    });

    await db.roomParticipant.update({
      where: { id: participant.id },
      data: { attemptId: attempt.id },
    });

    const remainingUnfinished = room.participants.filter(
      (p: any) => p.userId !== user.id && p.attemptId === null
    );

    if (remainingUnfinished.length === 0) {
      await db.testRoom.update({
        where: { id: room.id },
        data: { status: "COMPLETED" },
      });
    }

    revalidatePath(`/dashboard/room/${room.roomCode}`);
    return { success: true, attemptId: attempt.id };
  } catch (err) {
    console.error("Failed to submit room attempt:", err);
    return { success: false, error: "Failed to submit room test attempt." };
  }
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

export type RoomResultsResponse = {
  success: boolean;
  error?: string;
  isReady: boolean;
  totalParticipants?: number;
  finishedCount?: number;
  title?: string;
  roomCode?: string;
  hostName?: string;
  maxScore?: number;
  totalQuestions?: number;
  leaderboard?: LeaderboardEntry[];
  weakTopics?: WeakTopicQuestion[];
};

/**
 * Fetches group leaderboard and diagnostic weak topics once ready.
 */
export async function getRoomResults(roomCode: string): Promise<RoomResultsResponse> {
  try {
    const user = await getOrCreateUser();
    if (!user) return { success: false, isReady: false, error: "Unauthorized" };

    const code = roomCode.trim().toUpperCase();
    const room = await db.testRoom.findUnique({
      where: { roomCode: code },
      include: {
        hostUser: { select: { name: true } },
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
        participants: {
          include: {
            user: { select: { id: true, name: true } },
            attempt: true,
          },
        },
      },
    });

    if (!room) return { success: false, isReady: false, error: "Room not found." };

    const totalParticipants = room.participants.length;
    const finishedCount = room.participants.filter((p: any) => p.attemptId !== null).length;

    const now = Date.now();
    const windowExpired =
      now >= room.scheduledAt.getTime() + (room.exam.durationMinutes + 10) * 60 * 1000;

    const isReady =
      room.status === "COMPLETED" ||
      (totalParticipants > 0 && finishedCount === totalParticipants) ||
      windowExpired;

    if (!isReady) {
      return {
        success: true,
        isReady: false,
        totalParticipants,
        finishedCount,
        title: room.exam.title,
        roomCode: room.roomCode,
      };
    }

    const questions = room.exam.questions as any[];
    const totalQuestions = questions.length;
    const maxScore = totalQuestions * 4;

    const rawEntries: Omit<LeaderboardEntry, "rank">[] = [];
    const questionStats: Record<string, { wrongCount: number; totalAttempts: number }> = {};

    for (const q of questions) {
      questionStats[q.id] = { wrongCount: 0, totalAttempts: 0 };
    }

    for (const part of room.participants) {
      const attempt = part.attempt;
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
          timeSpentSeconds: room.exam.durationMinutes * 60,
          isCurrentUser: part.user.id === user.id,
        });
        continue;
      }

      const answers = (attempt.answers ?? {}) as AnswerMap;
      let correct = 0;
      let incorrect = 0;
      let unattempted = 0;

      for (const q of questions) {
        const sel = answers[q.id];
        questionStats[q.id].totalAttempts += 1;

        if (sel === undefined) {
          unattempted += 1;
          questionStats[q.id].wrongCount += 1;
        } else {
          const original = mapShuffledToOriginalOptionIndex(sel, part.user.id, q.id);
          if (original === q.correctOptionIndex) {
            correct += 1;
          } else {
            incorrect += 1;
            questionStats[q.id].wrongCount += 1;
          }
        }
      }

      const attempted = correct + incorrect;
      const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
      const computedScore = attempt.score ?? (correct * 4 - incorrect);
      const percentage = maxScore > 0 ? Math.max(0, Math.round((computedScore / maxScore) * 100)) : 0;

      const timeSpentSeconds =
        attempt.submittedAt && attempt.startedAt
          ? Math.max(10, Math.round((new Date(attempt.submittedAt).getTime() - new Date(attempt.startedAt).getTime()) / 1000))
          : room.exam.durationMinutes * 60;

      rawEntries.push({
        userId: part.user.id,
        name: part.user.name,
        score: computedScore,
        maxScore,
        percentage,
        accuracy,
        correct,
        incorrect,
        unattempted,
        timeSpentSeconds,
        isCurrentUser: part.user.id === user.id,
      });
    }

    rawEntries.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.timeSpentSeconds - b.timeSpentSeconds;
    });

    const leaderboard: LeaderboardEntry[] = rawEntries.map((entry, idx) => ({
      ...entry,
      rank: idx + 1,
    }));

    const weakTopics: WeakTopicQuestion[] = questions
      .map((q: any) => {
        const stat = questionStats[q.id] || { wrongCount: 0, totalAttempts: 0 };
        const errorRate =
          stat.totalAttempts > 0
            ? Math.round((stat.wrongCount / stat.totalAttempts) * 100)
            : 0;
        return {
          questionId: q.id,
          questionText: q.questionText,
          explanation: q.explanation,
          diagramSvg: q.diagramSvg,
          wrongCount: stat.wrongCount,
          totalAttempts: stat.totalAttempts,
          errorRate,
        };
      })
      .filter((q: WeakTopicQuestion) => q.errorRate >= 40)
      .sort((a: WeakTopicQuestion, b: WeakTopicQuestion) => b.errorRate - a.errorRate);

    return {
      success: true,
      isReady: true,
      totalParticipants,
      finishedCount,
      title: room.exam.title,
      roomCode: room.roomCode,
      hostName: room.hostUser.name,
      maxScore,
      totalQuestions,
      leaderboard,
      weakTopics,
    };
  } catch (err) {
    console.error("Failed to get room results:", err);
    return { success: false, isReady: false, error: "Failed to load room leaderboard." };
  }
}

/**
 * Fetches all rooms hosted or joined by the current user.
 */
export async function getUserRooms(): Promise<{
  hostedRooms: UserRoomSummary[];
  joinedRooms: UserRoomSummary[];
}> {
  const user = await getOrCreateUser();
  if (!user) return { hostedRooms: [], joinedRooms: [] };

  const rooms = await db.testRoom.findMany({
    where: {
      OR: [
        { hostUserId: user.id },
        { participants: { some: { userId: user.id } } },
      ],
    },
    orderBy: { scheduledAt: "desc" },
    include: {
      hostUser: { select: { name: true } },
      exam: {
        select: {
          title: true,
          durationMinutes: true,
          _count: { select: { questions: true } },
        },
      },
      participants: {
        select: { userId: true, attemptId: true },
      },
    },
  });

  const hostedRooms: UserRoomSummary[] = [];
  const joinedRooms: UserRoomSummary[] = [];

  for (const r of rooms) {
    const isHost = r.hostUserId === user.id;
    const userPart = r.participants.find((p: any) => p.userId === user.id);
    const summary: UserRoomSummary = {
      id: r.id,
      roomCode: r.roomCode,
      title: r.exam.title,
      scheduledAt: r.scheduledAt,
      durationMinutes: r.exam.durationMinutes,
      questionCount: r.exam._count.questions,
      status: r.status,
      isHost,
      hostName: r.hostUser.name,
      participantCount: r.participants.length,
      hasSubmitted: userPart?.attemptId !== null,
    };

    if (isHost) {
      hostedRooms.push(summary);
    } else {
      joinedRooms.push(summary);
    }
  }

  return { hostedRooms, joinedRooms };
}
