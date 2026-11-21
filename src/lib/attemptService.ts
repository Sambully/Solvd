import { prisma } from "@/lib/prisma";
import type { AnswerMap } from "@/lib/examTypes";
import type { QuestionStatus, QuestionStatusMap } from "@/lib/ntaTypes";
import { mapShuffledToOriginalOptionIndex } from "@/lib/optionShuffle";

export const MAX_EXAM_ATTEMPTS = Number(process.env.MAX_EXAM_ATTEMPTS) || 3;
export const MAX_ROOM_ATTEMPTS = 1;
export const MAX_CONCURRENT_ATTEMPTS = Number(process.env.MAX_CONCURRENT_ATTEMPTS) || 2;
export const DAILY_EXAM_ATTEMPT_LIMIT = Number(process.env.DAILY_EXAM_ATTEMPT_LIMIT) || 20;

/**
 * Defined server grace-period policy for Room Exams (60 seconds network buffer).
 * Submissions received within (deadline + 60s) are accepted to accommodate network latency.
 * Submissions received past (deadline + 60s) are strictly rejected on the server.
 */
export const ROOM_EXAM_GRACE_PERIOD_MS = 60 * 1000;

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

export interface EligibilityResult {
  eligible: boolean;
  reason:
    | "ELIGIBLE"
    | "RESUME"
    | "EXPIRED"
    | "NOT_AUTHENTICATED"
    | "EXAM_NOT_FOUND"
    | "UNAUTHORIZED"
    | "ROOM_NOT_FOUND"
    | "NOT_ROOM_MEMBER"
    | "ROOM_TEST_NOT_STARTED"
    | "ROOM_TEST_EXPIRED"
    | "ROOM_ATTEMPT_LIMIT_REACHED"
    | "EXAM_ATTEMPT_LIMIT_REACHED"
    | "CONCURRENT_LIMIT_REACHED"
    | "DAILY_LIMIT_REACHED";
  error?: string;
  existingAttemptId?: string;
  finalizedAttemptId?: string;
  activeAttempt?: HydratedAttempt;
  maxAttempts: number;
  attemptsUsed: number;
  remainingAttempts: number;
}

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
      : attempt.currentQuestionIndex;

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
  orderedQuestionIds?: string[];
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

  // Server-Authoritative Timer Policy:
  // Only Room Exams auto-expire strictly by wall-clock expiresAt.
  // Personal exams allow students to resume, take breaks, and complete self-paced study.
  if (roomId && existing.expiresAt.getTime() <= Date.now()) {
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

  let resolvedQuestionIds = orderedQuestionIds && orderedQuestionIds.length > 0 ? orderedQuestionIds : [];
  if (resolvedQuestionIds.length === 0) {
    const questions = await prisma.question.findMany({
      where: { examId },
      select: { id: true },
      orderBy: { id: "asc" },
    });
    resolvedQuestionIds = questions.map((q) => q.id);
  }

  return {
    status: "IN_PROGRESS",
    attempt: buildHydratedAttempt(existing, resolvedQuestionIds),
  };
}

/**
 * Validates backend eligibility and attempt limits before creating or resuming an exam attempt.
 * Enforces:
 * 1. Active in-progress attempt reuse (Rule: never duplicate attempt ID on refresh)
 * 2. Room membership, schedule window, and strict 1-attempt limit per participant
 * 3. Solo exam ownership and max attempt limit (default: 3)
 * 4. Platform-wide concurrent active attempt limits (default: 2)
 * 5. Rolling daily attempt limits (default: 20 per 24 hours)
 */
export async function checkExamAttemptEligibility(params: {
  userId: string;
  examId: string;
  roomId?: string | null;
  roomExamId?: string | null;
  orderedQuestionIds?: string[];
}): Promise<EligibilityResult> {
  const { userId, examId, roomId = null, roomExamId = null, orderedQuestionIds = [] } = params;

  if (!userId) {
    return {
      eligible: false,
      reason: "NOT_AUTHENTICATED",
      error: "Authentication required to attempt exams.",
      maxAttempts: 1,
      attemptsUsed: 0,
      remainingAttempts: 0,
    };
  }

  // 1. Check if user already has an active IN_PROGRESS attempt for this exact exam/room
  const activeCheck = await getActiveExamAttempt({
    userId,
    examId,
    roomId,
    roomExamId,
    orderedQuestionIds,
  });

  const maxAttemptsAllowed = roomId ? MAX_ROOM_ATTEMPTS : MAX_EXAM_ATTEMPTS;

  // Pre-calculate completed attempts for this exam context
  const completedAttempts = await prisma.attempt.count({
    where: {
      userId,
      examId,
      roomId: roomId ?? null,
      submittedAt: { not: null },
    },
  });

  if (activeCheck.status === "IN_PROGRESS") {
    return {
      eligible: true,
      reason: "RESUME",
      existingAttemptId: activeCheck.attempt.attemptId,
      activeAttempt: activeCheck.attempt,
      maxAttempts: maxAttemptsAllowed,
      attemptsUsed: completedAttempts,
      remainingAttempts: Math.max(0, maxAttemptsAllowed - completedAttempts),
    };
  }

  if (activeCheck.status === "EXPIRED") {
    return {
      eligible: false,
      reason: "EXPIRED",
      finalizedAttemptId: activeCheck.finalizedAttemptId,
      error: "Your previous exam session has expired.",
      maxAttempts: maxAttemptsAllowed,
      attemptsUsed: Math.max(1, completedAttempts),
      remainingAttempts: 0,
    };
  }

  // 2. Room Exam Specific Checks
  if (roomId) {
    const room = await prisma.testRoom.findUnique({
      where: { id: roomId },
      include: {
        participants: { where: { userId }, select: { id: true } },
        roomExams: {
          where: { examId },
          include: {
            exam: { select: { id: true, durationMinutes: true } },
          },
        },
      },
    });

    if (!room) {
      return {
        eligible: false,
        reason: "ROOM_NOT_FOUND",
        error: "Study circle room not found.",
        maxAttempts: MAX_ROOM_ATTEMPTS,
        attemptsUsed: 0,
        remainingAttempts: 0,
      };
    }

    if (room.participants.length === 0) {
      return {
        eligible: false,
        reason: "NOT_ROOM_MEMBER",
        error: "You are not a member of this study circle room.",
        maxAttempts: MAX_ROOM_ATTEMPTS,
        attemptsUsed: 0,
        remainingAttempts: 0,
      };
    }

    const roomExam = room.roomExams[0];
    if (!roomExam) {
      return {
        eligible: false,
        reason: "EXAM_NOT_FOUND",
        error: "Test not found in this study circle.",
        maxAttempts: MAX_ROOM_ATTEMPTS,
        attemptsUsed: 0,
        remainingAttempts: 0,
      };
    }

    const now = Date.now();
    const scheduledMs = new Date(roomExam.scheduledAt).getTime();
    const durationMinutes = roomExam.exam.durationMinutes || 180;
    const roomDeadlineMs = scheduledMs + (durationMinutes + 15) * 60 * 1000;

    // Room Test schedule timing
    if (now < scheduledMs - 5 * 60 * 1000) {
      return {
        eligible: false,
        reason: "ROOM_TEST_NOT_STARTED",
        error: "This room test has not started yet. Please wait in the lobby.",
        maxAttempts: MAX_ROOM_ATTEMPTS,
        attemptsUsed: 0,
        remainingAttempts: 1,
      };
    }

    if (now > roomDeadlineMs) {
      return {
        eligible: false,
        reason: "ROOM_TEST_EXPIRED",
        error: "The testing window for this study circle mock has ended.",
        maxAttempts: MAX_ROOM_ATTEMPTS,
        attemptsUsed: 1,
        remainingAttempts: 0,
      };
    }

    // Room Attempt Limit (Strictly 1 attempt)
    const existingRoomAttempt = await prisma.attempt.findFirst({
      where: {
        userId,
        examId,
        roomId,
        submittedAt: { not: null },
      },
      select: { id: true },
    });

    if (existingRoomAttempt) {
      return {
        eligible: false,
        reason: "ROOM_ATTEMPT_LIMIT_REACHED",
        finalizedAttemptId: existingRoomAttempt.id,
        error: "Each participant is limited to 1 attempt for a Study Circle mock test.",
        maxAttempts: MAX_ROOM_ATTEMPTS,
        attemptsUsed: 1,
        remainingAttempts: 0,
      };
    }

    return {
      eligible: true,
      reason: "ELIGIBLE",
      maxAttempts: MAX_ROOM_ATTEMPTS,
      attemptsUsed: 0,
      remainingAttempts: 1,
    };
  }

  // 3. Solo Exam Specific Checks
  const exam = await prisma.exam.findFirst({
    where: { id: examId },
    select: { id: true, userId: true, status: true },
  });

  if (!exam) {
    return {
      eligible: false,
      reason: "EXAM_NOT_FOUND",
      error: "Exam not found.",
      maxAttempts: MAX_EXAM_ATTEMPTS,
      attemptsUsed: 0,
      remainingAttempts: 0,
    };
  }

  if (exam.userId !== userId) {
    return {
      eligible: false,
      reason: "UNAUTHORIZED",
      error: "You do not have permission to attempt this private exam.",
      maxAttempts: MAX_EXAM_ATTEMPTS,
      attemptsUsed: 0,
      remainingAttempts: 0,
    };
  }

  // Solo Exam Attempt Limit (Completed attempts)
  if (completedAttempts >= MAX_EXAM_ATTEMPTS) {
    const latest = await prisma.attempt.findFirst({
      where: { userId, examId, roomId: null, submittedAt: { not: null } },
      orderBy: { submittedAt: "desc" },
      select: { id: true },
    });

    return {
      eligible: false,
      reason: "EXAM_ATTEMPT_LIMIT_REACHED",
      finalizedAttemptId: latest?.id,
      error: `You have reached the maximum limit of ${MAX_EXAM_ATTEMPTS} attempts for this exam.`,
      maxAttempts: MAX_EXAM_ATTEMPTS,
      attemptsUsed: completedAttempts,
      remainingAttempts: 0,
    };
  }

  // 4. Platform-Wide Limits: Concurrent in-progress attempts
  const concurrentActive = await prisma.examAttempt.count({
    where: {
      userId,
      status: "IN_PROGRESS",
      expiresAt: { gt: new Date() },
    },
  });

  if (concurrentActive >= MAX_CONCURRENT_ATTEMPTS) {
    return {
      eligible: false,
      reason: "CONCURRENT_LIMIT_REACHED",
      error: `You already have ${concurrentActive} active exams in progress. Please submit or finish them before starting a new test.`,
      maxAttempts: MAX_EXAM_ATTEMPTS,
      attemptsUsed: completedAttempts,
      remainingAttempts: Math.max(0, MAX_EXAM_ATTEMPTS - completedAttempts),
    };
  }

  // 5. Platform-Wide Limits: Daily attempt limit
  const past24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const dailyCount = await prisma.examAttempt.count({
    where: {
      userId,
      startedAt: { gte: past24h },
    },
  });

  if (dailyCount >= DAILY_EXAM_ATTEMPT_LIMIT) {
    return {
      eligible: false,
      reason: "DAILY_LIMIT_REACHED",
      error: `You have reached your daily limit of ${DAILY_EXAM_ATTEMPT_LIMIT} exam attempts. Please try again tomorrow.`,
      maxAttempts: MAX_EXAM_ATTEMPTS,
      attemptsUsed: completedAttempts,
      remainingAttempts: 0,
    };
  }

  return {
    eligible: true,
    reason: "ELIGIBLE",
    maxAttempts: MAX_EXAM_ATTEMPTS,
    attemptsUsed: completedAttempts,
    remainingAttempts: MAX_EXAM_ATTEMPTS - completedAttempts,
  };
}

/**
 * Starts a new IN_PROGRESS ExamAttempt or resumes an existing active one.
 * Uses checkExamAttemptEligibility to enforce:
 * - One attempt belongs to one student and one exam
 * - Reusing the same attemptId when resuming unfinished exams
 * - Preventing duplicate attempt IDs on page refresh
 * - Backend eligibility and attempt limits
 */
export async function startOrResumeExamAttempt(params: {
  userId: string;
  examId: string;
  roomId?: string | null;
  roomExamId?: string | null;
}): Promise<
  | {
      status: "IN_PROGRESS";
      attempt: HydratedAttempt;
      isResume: boolean;
      attemptsUsed: number;
      maxAttempts: number;
    }
  | { status: "EXPIRED"; finalizedAttemptId: string; score: number }
  | { status: "ALREADY_SUBMITTED"; finalizedAttemptId: string }
  | {
      status: "INELIGIBLE";
      reason: string;
      error: string;
      maxAttempts: number;
      attemptsUsed: number;
      finalizedAttemptId?: string;
    }
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
      return {
        status: "INELIGIBLE",
        reason: "UNAUTHORIZED",
        error: "Unauthorized or room exam not found.",
        maxAttempts: MAX_ROOM_ATTEMPTS,
        attemptsUsed: 0,
      };
    }

    const roomExam = room.roomExams[0];
    resolvedRoomExamId = roomExam.id;
    durationMinutes = roomExam.exam.durationMinutes || 180;
    orderedQuestionIds = roomExam.exam.questions.map((q) => q.id);

    const scheduledMs = new Date(roomExam.scheduledAt).getTime();
    roomDeadlineMs = scheduledMs + (durationMinutes + 15) * 60 * 1000;
  } else {
    const exam = await prisma.exam.findFirst({
      where: { id: examId, userId },
      include: {
        questions: { select: { id: true }, orderBy: { id: "asc" } },
      },
    });

    if (!exam) {
      return {
        status: "INELIGIBLE",
        reason: "EXAM_NOT_FOUND",
        error: "Exam not found.",
        maxAttempts: MAX_EXAM_ATTEMPTS,
        attemptsUsed: 0,
      };
    }

    durationMinutes = exam.durationMinutes || 180;
    orderedQuestionIds = exam.questions.map((q) => q.id);
  }

  // Enforce Backend Eligibility & Attempt Limits
  const eligibility = await checkExamAttemptEligibility({
    userId,
    examId,
    roomId,
    roomExamId: resolvedRoomExamId,
    orderedQuestionIds,
  });

  if (eligibility.reason === "RESUME" && eligibility.activeAttempt) {
    return {
      status: "IN_PROGRESS",
      attempt: eligibility.activeAttempt,
      isResume: true,
      attemptsUsed: eligibility.attemptsUsed,
      maxAttempts: eligibility.maxAttempts,
    };
  }

  if (eligibility.reason === "EXPIRED" && eligibility.finalizedAttemptId) {
    return {
      status: "EXPIRED",
      finalizedAttemptId: eligibility.finalizedAttemptId,
      score: 0,
    };
  }

  if (!eligibility.eligible) {
    if (eligibility.finalizedAttemptId && eligibility.reason === "ROOM_ATTEMPT_LIMIT_REACHED") {
      return {
        status: "ALREADY_SUBMITTED",
        finalizedAttemptId: eligibility.finalizedAttemptId,
      };
    }
    return {
      status: "INELIGIBLE",
      reason: eligibility.reason,
      error: eligibility.error || "You are not eligible to start this exam attempt.",
      maxAttempts: eligibility.maxAttempts,
      attemptsUsed: eligibility.attemptsUsed,
      finalizedAttemptId: eligibility.finalizedAttemptId,
    };
  }

  // Create brand new ExamAttempt
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
    isResume: false,
    attemptsUsed: eligibility.attemptsUsed + 1,
    maxAttempts: eligibility.maxAttempts,
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

  // Server-Authoritative Timer Policy:
  // Reject progress autosaves received after room deadline + defined grace period policy (60s).
  // Personal exams remain unrestricted for practice study.
  if (attempt.roomId) {
    if (Date.now() > attempt.expiresAt.getTime() + ROOM_EXAM_GRACE_PERIOD_MS) {
      return {
        ok: false,
        code: "EXPIRED",
        error: "Room exam timer has expired (grace period exceeded). Answers cannot be saved.",
      };
    }
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

  // Server-Authoritative Timer Validation:
  // Validate submission time on the server. Reject submissions received after the deadline + defined grace-period policy (60s).
  // Applies exclusively to Room Exams, not personal exams.
  const isRoomExam = Boolean(attempt.roomId);
  const nowMs = Date.now();
  const deadlineMs = attempt.expiresAt.getTime();
  const isPastGrace = nowMs > deadlineMs + ROOM_EXAM_GRACE_PERIOD_MS;

  if (isRoomExam && !markExpired && isPastGrace) {
    throw new Error(
      "EXAM_DEADLINE_EXCEEDED: Submission rejected because the exam deadline has passed (grace period exceeded)."
    );
  }

  const validQuestionIds = new Set(attempt.exam.questions.map((q) => q.id));

  return await prisma.$transaction(async (tx) => {
    const now = new Date();
    const targetStatus = markExpired ? "EXPIRED" : "SUBMITTED";

    // Conditional atomic database update:
    // UPDATE exam_attempts
    // SET status = $targetStatus, submitted_at = CURRENT_TIMESTAMP
    // WHERE id = $attemptId AND status = 'IN_PROGRESS';
    // Only one request can successfully transition the attempt from IN_PROGRESS.
    const transitionResult = await tx.examAttempt.updateMany({
      where: {
        id: attempt.id,
        status: "IN_PROGRESS",
      },
      data: {
        status: targetStatus,
        submittedAt: now,
      },
    });

    if (transitionResult.count === 0) {
      // The attempt has already been transitioned by another concurrent request.
      // Return the existing result if the same attempt is submitted again.
      const existing = await tx.examAttempt.findUnique({
        where: { id: attempt.id },
        select: { status: true, finalizedAttemptId: true, score: true },
      });

      if (existing?.finalizedAttemptId) {
        return {
          finalizedAttemptId: existing.finalizedAttemptId,
          score: existing.score ?? 0,
        };
      }

      // If the winning concurrent transaction has written the summary Attempt row:
      const existingSummary = await tx.attempt.findFirst({
        where: {
          examId: attempt.examId,
          userId: attempt.userId,
          ...(attempt.roomId ? { roomId: attempt.roomId } : { roomId: null }),
        },
        orderBy: { submittedAt: "desc" },
        select: { id: true, score: true },
      });

      if (existingSummary) {
        return {
          finalizedAttemptId: existingSummary.id,
          score: existingSummary.score ?? 0,
        };
      }

      throw new Error("This exam attempt has already been submitted.");
    }

    // Flush any final client answers into the normalized `answers` table (only if not expired)
    if (!markExpired && (!isRoomExam || !isPastGrace) && finalAnswers && typeof finalAnswers === "object") {
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
