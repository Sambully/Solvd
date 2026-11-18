import { prisma } from "@/lib/prisma";
import type { AnswerMap } from "@/lib/examTypes";
import type { QuestionStatus, QuestionStatusMap } from "@/lib/ntaTypes";
import { mapShuffledToOriginalOptionIndex } from "@/lib/optionShuffle";

export type HydratedAttempt = {
  attemptId: string;
  startedAt: string;
  expiresAt: string;
  remainingSeconds: number;
  currentQuestionIndex: number;
  answers: AnswerMap;
  statusMap: QuestionStatusMap;
};

export type AnswerUpsertInput = {
  questionId: string;
  selectedOptionIndex: number | null;
  status?: QuestionStatus;
};

const VALID_STATUSES = new Set<QuestionStatus>([
  "NOT_VISITED",
  "NOT_ANSWERED",
  "ANSWERED",
  "MARKED_FOR_REVIEW",
  "ANSWERED_AND_MARKED_FOR_REVIEW",
]);

function buildHydratedAttempt(
  attempt: {
    id: string;
    startedAt: Date;
    expiresAt: Date;
    currentQuestionIndex: number;
    savedAnswers: Array<{
      questionId: string;
      selectedOptionIndex: number | null;
      status: string;
    }>;
  },
  orderedQuestionIds: string[]
): HydratedAttempt {
  const answers: AnswerMap = {};
  const statusMap: QuestionStatusMap = {};

  const safeCurrentIndex =
    orderedQuestionIds.length > 0
      ? Math.max(0, Math.min(attempt.currentQuestionIndex, orderedQuestionIds.length - 1))
      : 0;

  orderedQuestionIds.forEach((qid, idx) => {
    statusMap[qid] = idx === 0 || idx === safeCurrentIndex ? "NOT_ANSWERED" : "NOT_VISITED";
  });

  for (const row of attempt.savedAnswers) {
    if (row.selectedOptionIndex !== null && row.selectedOptionIndex !== undefined) {
      answers[row.questionId] = row.selectedOptionIndex;
    }
    if (VALID_STATUSES.has(row.status as QuestionStatus)) {
      statusMap[row.questionId] = row.status as QuestionStatus;
    }
  }

  const remainingSeconds = Math.max(
    0,
    Math.floor((attempt.expiresAt.getTime() - Date.now()) / 1000)
  );

  return {
    attemptId: attempt.id,
    startedAt: attempt.startedAt.toISOString(),
    expiresAt: attempt.expiresAt.toISOString(),
    remainingSeconds,
    currentQuestionIndex: safeCurrentIndex,
    answers,
    statusMap,
  };
}

/**
 * Peeks for an existing IN_PROGRESS ExamAttempt for a user+exam (+optional room).
 * If found and already past expiresAt, auto-finalizes it and returns status "EXPIRED".
 */
export async function getActiveExamAttempt(params: {
  userId: string;
  examId: string;
  roomId?: string | null;
  roomExamId?: string | null;
  orderedQuestionIds: string[];
}): Promise<
  | { status: "NONE" }
  | { status: "IN_PROGRESS"; attempt: HydratedAttempt }
  | { status: "EXPIRED"; finalizedAttemptId: string; score: number }
> {
  const { userId, examId, roomId = null, roomExamId = null, orderedQuestionIds } = params;

  const existing = await prisma.examAttempt.findFirst({
    where: {
      userId,
      examId,
      roomId,
      roomExamId,
      status: "IN_PROGRESS",
    },
    include: {
      savedAnswers: {
        select: {
          questionId: true,
          selectedOptionIndex: true,
          status: true,
        },
      },
    },
    orderBy: { startedAt: "desc" },
  });

  if (!existing) {
    return { status: "NONE" };
  }

  if (existing.expiresAt.getTime() <= Date.now()) {
    const finalized = await finalizeExamAttempt({
      userId,
      attemptId: existing.id,
      markExpired: true,
    });
    return {
      status: "EXPIRED",
      finalizedAttemptId: finalized.finalizedAttemptId,
      score: finalized.score,
    };
  }

  return {
    status: "IN_PROGRESS",
    attempt: buildHydratedAttempt(existing, orderedQuestionIds),
  };
}

/**
 * Starts a new IN_PROGRESS ExamAttempt or resumes an existing active one.
 */
export async function startOrResumeExamAttempt(params: {
  userId: string;
  examId: string;
  roomId?: string | null;
  roomExamId?: string | null;
}): Promise<
  | { status: "IN_PROGRESS"; attempt: HydratedAttempt }
  | { status: "EXPIRED"; finalizedAttemptId: string; score: number }
  | { status: "ALREADY_SUBMITTED"; finalizedAttemptId: string }
> {
  const { userId, examId, roomId = null, roomExamId = null } = params;

  let durationMinutes = 180;
  let orderedQuestionIds: string[] = [];
  let roomDeadlineMs: number | null = null;
  let resolvedRoomExamId: string | null = roomExamId;

  if (roomId) {
    const room = await prisma.testRoom.findUnique({
      where: { id: roomId },
      include: {
        participants: { where: { userId }, select: { id: true } },
        roomExams: {
          where: { examId },
          include: {
            exam: {
              include: {
                questions: { select: { id: true }, orderBy: { id: "asc" } },
              },
            },
          },
        },
      },
    });

    if (!room || room.participants.length === 0 || room.roomExams.length === 0) {
      throw new Error("Unauthorized or room exam not found.");
    }

    const roomExam = room.roomExams[0];
    resolvedRoomExamId = roomExam.id;
    durationMinutes = roomExam.exam.durationMinutes || 180;
    orderedQuestionIds = roomExam.exam.questions.map((q) => q.id);

    const scheduledMs = new Date(roomExam.scheduledAt).getTime();
    roomDeadlineMs = scheduledMs + (durationMinutes + 15) * 60 * 1000;

    // Check if already submitted in this room
    const submitted = await prisma.attempt.findFirst({
      where: { userId, examId, roomId, submittedAt: { not: null } },
      select: { id: true },
    });
    if (submitted) {
      return { status: "ALREADY_SUBMITTED", finalizedAttemptId: submitted.id };
    }
  } else {
    const exam = await prisma.exam.findFirst({
      where: { id: examId, userId },
      include: {
        questions: { select: { id: true }, orderBy: { id: "asc" } },
      },
    });

    if (!exam) {
      throw new Error("Exam not found.");
    }

    durationMinutes = exam.durationMinutes || 180;
    orderedQuestionIds = exam.questions.map((q) => q.id);
  }

  const activeCheck = await getActiveExamAttempt({
    userId,
    examId,
    roomId,
    roomExamId: resolvedRoomExamId,
    orderedQuestionIds,
  });

  if (activeCheck.status === "IN_PROGRESS") {
    return activeCheck;
  }
  if (activeCheck.status === "EXPIRED") {
    return activeCheck;
  }

  const startedAt = new Date();
  let expiresMs = startedAt.getTime() + durationMinutes * 60 * 1000;
  if (roomDeadlineMs !== null) {
    expiresMs = Math.min(expiresMs, Math.max(startedAt.getTime() + 1000, roomDeadlineMs));
  }
  const expiresAt = new Date(expiresMs);

  const created = await prisma.examAttempt.create({
    data: {
      examId,
      userId,
      roomId,
      roomExamId: resolvedRoomExamId,
      status: "IN_PROGRESS",
      currentQuestionIndex: 0,
      startedAt,
      expiresAt,
    },
    include: {
      savedAnswers: {
        select: {
          questionId: true,
          selectedOptionIndex: true,
          status: true,
        },
      },
    },
  });

  if (!roomId) {
    await prisma.exam
      .update({
        where: { id: examId },
        data: { status: "ACTIVE" },
      })
      .catch(() => {});
  }

  return {
    status: "IN_PROGRESS",
    attempt: buildHydratedAttempt(created, orderedQuestionIds),
  };
}

/**
 * Persists one or more answers and/or currentQuestionIndex against an IN_PROGRESS attempt.
 * Uses Prisma upsert on @@unique([attemptId, questionId]) so existing answers are updated, never duplicated.
 */
export async function saveAttemptProgress(params: {
  userId: string;
  attemptId: string;
  answers?: AnswerUpsertInput[];
  currentQuestionIndex?: number;
}): Promise<
  | { ok: true; savedCount: number; remainingSeconds: number }
  | { ok: false; code: "NOT_FOUND" | "NOT_ACTIVE" | "EXPIRED"; error: string }
> {
  const { userId, attemptId, answers = [], currentQuestionIndex } = params;

  const attempt = await prisma.examAttempt.findFirst({
    where: { id: attemptId, userId },
    include: {
      exam: {
        include: {
          questions: { select: { id: true } },
        },
      },
    },
  });

  if (!attempt) {
    return { ok: false, code: "NOT_FOUND", error: "Exam attempt not found." };
  }

  if (attempt.status !== "IN_PROGRESS") {
    return {
      ok: false,
      code: "NOT_ACTIVE",
      error: "This exam attempt has already been submitted or expired.",
    };
  }

  // Allow a 15s network grace window for final saves triggered right at 00:00
  const GRACE_MS = 15_000;
  if (Date.now() > attempt.expiresAt.getTime() + GRACE_MS) {
    return {
      ok: false,
      code: "EXPIRED",
      error: "Exam timer has expired.",
    };
  }

  const validQuestionIds = new Set(attempt.exam.questions.map((q) => q.id));
  const questionCount = attempt.exam.questions.length;

  // Deduplicate by questionId (last write wins within the same batch)
  const deduped = new Map<string, { selectedOptionIndex: number | null; status: QuestionStatus }>();
  for (const item of answers) {
    if (!item || typeof item.questionId !== "string" || !validQuestionIds.has(item.questionId)) {
      continue;
    }

    const opt = item.selectedOptionIndex;
    const validOpt =
      opt === null || opt === undefined
        ? null
        : Number.isInteger(opt) && opt >= 0 && opt <= 3
        ? opt
        : null;

    const status: QuestionStatus =
      item.status && VALID_STATUSES.has(item.status)
        ? item.status
        : validOpt !== null
        ? "ANSWERED"
        : "NOT_ANSWERED";

    deduped.set(item.questionId, { selectedOptionIndex: validOpt, status });
  }

  const hasValidIndex =
    typeof currentQuestionIndex === "number" &&
    Number.isInteger(currentQuestionIndex) &&
    currentQuestionIndex >= 0 &&
    currentQuestionIndex < questionCount;

  await prisma.$transaction(async (tx) => {
    for (const [questionId, payload] of deduped.entries()) {
      await tx.answer.upsert({
        where: {
          attemptId_questionId: {
            attemptId: attempt.id,
            questionId,
          },
        },
        create: {
          attemptId: attempt.id,
          questionId,
          selectedOptionIndex: payload.selectedOptionIndex,
          status: payload.status,
        },
        update: {
          selectedOptionIndex: payload.selectedOptionIndex,
          status: payload.status,
        },
      });
    }

    if (hasValidIndex) {
      await tx.examAttempt.update({
        where: { id: attempt.id },
        data: { currentQuestionIndex },
      });
    }
  });

  const remainingSeconds = Math.max(
    0,
    Math.floor((attempt.expiresAt.getTime() - Date.now()) / 1000)
  );

  return {
    ok: true,
    savedCount: deduped.size,
    remainingSeconds,
  };
}

/**
 * Finalizes an ExamAttempt using persisted `answers` rows in PostgreSQL as the source of truth.
 * Optionally flushes any final pending client answers before grading.
 * Idempotent: calling twice returns the existing finalized attempt without duplicating rows.
 */
export async function finalizeExamAttempt(params: {
  userId: string;
  attemptId: string;
  finalAnswers?: AnswerMap;
  markExpired?: boolean;
}): Promise<{ finalizedAttemptId: string; score: number }> {
  const { userId, attemptId, finalAnswers, markExpired = false } = params;

  const attempt = await prisma.examAttempt.findFirst({
    where: { id: attemptId, userId },
    include: {
      exam: {
        include: {
          questions: {
            select: { id: true, correctOptionIndex: true },
          },
        },
      },
    },
  });

  if (!attempt) {
    throw new Error("Exam attempt not found.");
  }

  // Idempotent return if already finalized
  if (attempt.status !== "IN_PROGRESS" && attempt.finalizedAttemptId) {
    return {
      finalizedAttemptId: attempt.finalizedAttemptId,
      score: attempt.score ?? 0,
    };
  }

  const validQuestionIds = new Set(attempt.exam.questions.map((q) => q.id));

  return await prisma.$transaction(async (tx) => {
    // Re-check status inside transaction to guard against concurrent finalization
    const locked = await tx.examAttempt.findUnique({
      where: { id: attempt.id },
      select: { status: true, finalizedAttemptId: true, score: true },
    });
    if (locked && locked.status !== "IN_PROGRESS" && locked.finalizedAttemptId) {
      return {
        finalizedAttemptId: locked.finalizedAttemptId,
        score: locked.score ?? 0,
      };
    }

    // Flush any final client answers into the normalized `answers` table
    if (finalAnswers && typeof finalAnswers === "object") {
      for (const [questionId, selected] of Object.entries(finalAnswers)) {
        if (!validQuestionIds.has(questionId)) continue;
        if (!Number.isInteger(selected) || selected < 0 || selected > 3) continue;

        await tx.answer.upsert({
          where: {
            attemptId_questionId: {
              attemptId: attempt.id,
              questionId,
            },
          },
          create: {
            attemptId: attempt.id,
            questionId,
            selectedOptionIndex: selected,
            status: "ANSWERED",
          },
          update: {
            selectedOptionIndex: selected,
          },
        });
      }
    }

    // Read authoritative answers from the `answers` table
    const persistedRows = await tx.answer.findMany({
      where: { attemptId: attempt.id },
      select: { questionId: true, selectedOptionIndex: true },
    });

    const answerMap: AnswerMap = {};
    for (const row of persistedRows) {
      if (row.selectedOptionIndex !== null && row.selectedOptionIndex !== undefined) {
        answerMap[row.questionId] = row.selectedOptionIndex;
      }
    }

    let correctCount = 0;
    let incorrectCount = 0;

    for (const q of attempt.exam.questions) {
      const selected = answerMap[q.id];
      if (selected === undefined) continue;

      const effectiveIndex = attempt.roomId
        ? mapShuffledToOriginalOptionIndex(selected, userId, q.id)
        : selected;

      if (effectiveIndex === q.correctOptionIndex) {
        correctCount += 1;
      } else {
        incorrectCount += 1;
      }
    }

    const totalScore = correctCount * 4 - incorrectCount * 1;
    const now = new Date();

    // Sync summary row to `attempts` table (preserves real `startedAt` and compatibility with analytics/dashboard/leaderboards)
    const summaryAttempt = await tx.attempt.create({
      data: {
        examId: attempt.examId,
        userId: attempt.userId,
        roomId: attempt.roomId,
        roomExamId: attempt.roomExamId,
        startedAt: attempt.startedAt,
        submittedAt: now,
        answers: answerMap,
        score: totalScore,
      },
    });

    await tx.examAttempt.update({
      where: { id: attempt.id },
      data: {
        status: markExpired ? "EXPIRED" : "SUBMITTED",
        submittedAt: now,
        score: totalScore,
        finalizedAttemptId: summaryAttempt.id,
      },
    });

    if (!attempt.roomId) {
      await tx.exam.update({
        where: { id: attempt.examId },
        data: { status: markExpired ? "EXPIRED" : "SUBMITTED" },
      });
    }

    return {
      finalizedAttemptId: summaryAttempt.id,
      score: totalScore,
    };
  });
}
