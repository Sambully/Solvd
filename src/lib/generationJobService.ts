import { prisma } from "@/lib/prisma";
import type { GeneratedExam } from "@/lib/examTypes";

export type GenerationJobStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface GenerationJobRecord {
  id: string; // Client-provided request_id (UUID)
  userId: string;
  status: GenerationJobStatus;
  examId?: string | null;
  cachedResult?: GeneratedExam | null;
  errorMessage?: string | null;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory store for instant mutex locking & zero-latency duplicate suppression
const inMemoryJobs = new Map<string, GenerationJobRecord>();

// Clean up stale in-memory jobs older than 1 hour to prevent memory leaks
function cleanupOldJobs() {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  for (const [id, job] of inMemoryJobs.entries()) {
    if (job.updatedAt.getTime() < oneHourAgo) {
      inMemoryJobs.delete(id);
    }
  }
}

/**
 * Retrieves an existing job or creates a new one in PENDING status.
 * Coordinates across both in-memory store and PostgreSQL database.
 */
export async function getOrCreateGenerationJob(params: {
  requestId: string;
  userId: string;
}): Promise<GenerationJobRecord> {
  const { requestId, userId } = params;
  cleanupOldJobs();

  // 1. Check in-memory store
  const memJob = inMemoryJobs.get(requestId);
  if (memJob) {
    return memJob;
  }

  // 2. Check database
  try {
    const dbJob = await prisma.examGenerationJob.findUnique({
      where: { id: requestId },
    });

    if (dbJob) {
      const record: GenerationJobRecord = {
        id: dbJob.id,
        userId: dbJob.userId,
        status: dbJob.status as GenerationJobStatus,
        examId: dbJob.examId,
        cachedResult: dbJob.cachedResult as GeneratedExam | null,
        errorMessage: dbJob.errorMessage,
        attempts: dbJob.attempts,
        createdAt: dbJob.createdAt,
        updatedAt: dbJob.updatedAt,
      };
      inMemoryJobs.set(requestId, record);
      return record;
    }
  } catch {
    // If table is not yet migrated, continue with in-memory store
  }

  // 3. Create new job
  const now = new Date();
  const newJob: GenerationJobRecord = {
    id: requestId,
    userId,
    status: "PENDING",
    examId: null,
    cachedResult: null,
    errorMessage: null,
    attempts: 0,
    createdAt: now,
    updatedAt: now,
  };

  inMemoryJobs.set(requestId, newJob);

  try {
    await prisma.examGenerationJob.create({
      data: {
        id: requestId,
        userId,
        status: "PENDING",
        attempts: 0,
      },
    });
  } catch {
    // Graceful fallback to memory
  }

  return newJob;
}

/**
 * Claims a job for processing atomically.
 * Prevents multiple concurrent requests with the same requestId from calling Gemini in parallel.
 */
export async function acquireJobForProcessing(params: {
  requestId: string;
  userId: string;
}): Promise<{
  job: GenerationJobRecord;
  canProcess: boolean;
  isCompleted: boolean;
  hasCachedResult: boolean;
}> {
  const { requestId, userId } = params;
  const job = await getOrCreateGenerationJob({ requestId, userId });

  // If already completed, do not re-run
  if (job.status === "COMPLETED" && job.examId) {
    return {
      job,
      canProcess: false,
      isCompleted: true,
      hasCachedResult: Boolean(job.cachedResult),
    };
  }

  // If currently processing and active (< 3 minutes), avoid concurrent duplicate execution
  const threeMinutesAgo = Date.now() - 3 * 60 * 1000;
  if (job.status === "PROCESSING" && job.updatedAt.getTime() > threeMinutesAgo) {
    return {
      job,
      canProcess: false,
      isCompleted: false,
      hasCachedResult: Boolean(job.cachedResult),
    };
  }

  // Claim job
  job.status = "PROCESSING";
  job.attempts += 1;
  job.updatedAt = new Date();
  job.errorMessage = null;
  inMemoryJobs.set(requestId, job);

  try {
    await prisma.examGenerationJob.update({
      where: { id: requestId },
      data: {
        status: "PROCESSING",
        attempts: { increment: 1 },
        errorMessage: null,
      },
    });
  } catch {
    // Graceful fallback
  }

  return {
    job,
    canProcess: true,
    isCompleted: false,
    hasCachedResult: Boolean(job.cachedResult),
  };
}

/**
 * Caches the Gemini response immediately upon receipt.
 * If database saving fails subsequently, this cached result allows instant retry without re-calling Gemini!
 */
export async function cacheJobGeminiResponse(params: {
  requestId: string;
  generatedExam: GeneratedExam;
}): Promise<void> {
  const { requestId, generatedExam } = params;
  const job = inMemoryJobs.get(requestId);
  if (job) {
    job.cachedResult = generatedExam;
    job.updatedAt = new Date();
  }

  try {
    await prisma.examGenerationJob.update({
      where: { id: requestId },
      data: {
        cachedResult: generatedExam as any,
      },
    });
  } catch {
    // Graceful fallback
  }
}

/**
 * Marks the job as successfully completed and links the created examId.
 */
export async function markJobCompleted(params: {
  requestId: string;
  examId: string;
}): Promise<void> {
  const { requestId, examId } = params;
  const job = inMemoryJobs.get(requestId);
  if (job) {
    job.status = "COMPLETED";
    job.examId = examId;
    job.updatedAt = new Date();
  }

  try {
    await prisma.examGenerationJob.update({
      where: { id: requestId },
      data: {
        status: "COMPLETED",
        examId,
      },
    });
  } catch {
    // Graceful fallback
  }
}

/**
 * Marks the job as failed while preserving any cachedResult for zero-cost retries.
 */
export async function markJobFailed(params: {
  requestId: string;
  errorMessage: string;
}): Promise<void> {
  const { requestId, errorMessage } = params;
  const job = inMemoryJobs.get(requestId);
  if (job) {
    job.status = "FAILED";
    job.errorMessage = errorMessage;
    job.updatedAt = new Date();
  }

  try {
    await prisma.examGenerationJob.update({
      where: { id: requestId },
      data: {
        status: "FAILED",
        errorMessage,
      },
    });
  } catch {
    // Graceful fallback
  }
}
