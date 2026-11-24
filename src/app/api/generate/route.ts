import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { generateExamFromFiles, type InputFile } from "@/lib/gemini";
import type { ExamCustomizationOptions, GeneratedExam } from "@/lib/examTypes";
import { prisma } from "@/lib/prisma";
import {
  acquireJobForProcessing,
  cacheJobGeminiResponse,
  markJobCompleted,
  markJobFailed,
} from "@/lib/generationJobService";

export const maxDuration = 300;

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]);

const MAX_TOTAL_BYTES = 10 * 1024 * 1024; // 10 MB combined (keeps per-request Gemini cost bounded)
const MAX_FILE_COUNT = 5;

// Per-user daily generation cap to protect API cost from abuse/loops.
// Override with GENERATE_DAILY_LIMIT in the environment.
const DAILY_GENERATION_LIMIT = Number(process.env.GENERATE_DAILY_LIMIT) || 10;

function inferMimeType(fileName: string, mimeType: string): string {
  if (ALLOWED_MIME_TYPES.has(mimeType)) return mimeType;
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  return mimeType;
}

export async function POST(req: Request) {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: cap the number of exam generations per user per rolling 24h.
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const usedToday = await prisma.exam.count({
    where: { userId: user.id, createdAt: { gte: since } },
  });
  if (usedToday >= DAILY_GENERATION_LIMIT) {
    return NextResponse.json(
      {
        error: `You've reached your daily limit of ${DAILY_GENERATION_LIMIT} exam generations. Please try again tomorrow.`,
      },
      { status: 429 }
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data upload" }, { status: 400 });
  }

  // Idempotency: Extract or assign unique request_id
  const rawRequestId =
    formData.get("requestId")?.toString().trim() ||
    req.headers.get("x-request-id")?.trim() ||
    null;
  const requestId =
    rawRequestId && rawRequestId.length >= 8 ? rawRequestId : crypto.randomUUID();

  // Coordinate job state: prevents duplicate parallel runs and recovers from previous DB failure
  const claim = await acquireJobForProcessing({ requestId, userId: user.id });

  // 1. If this exact request was already completed, return existing examId immediately (0 Gemini calls)
  if (claim.isCompleted && claim.job.examId) {
    return NextResponse.json({
      examId: claim.job.examId,
      status: "COMPLETED",
      isReplay: true,
    });
  }

  // 2. If another request is currently processing this exact requestId, avoid duplicate parallel Gemini calls
  if (!claim.canProcess) {
    return NextResponse.json(
      {
        error: "This exam generation is already in progress. Please wait a moment.",
        status: "PROCESSING",
      },
      { status: 409 }
    );
  }

  // Support both "files" (multiple) and "file" (single)
  const fileEntries = [
    ...formData.getAll("files"),
    ...formData.getAll("file"),
  ].filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (fileEntries.length === 0 && !claim.hasCachedResult) {
    return NextResponse.json(
      { error: "Please upload at least one PDF or image file." },
      { status: 400 }
    );
  }

  if (fileEntries.length > MAX_FILE_COUNT) {
    return NextResponse.json(
      { error: `Please upload at most ${MAX_FILE_COUNT} files at a time.` },
      { status: 400 }
    );
  }

  // Parse exam customization parameters
  const rawQuestionCount = Number(formData.get("questionCount"));
  const questionCount =
    Number.isInteger(rawQuestionCount) && rawQuestionCount >= 5 && rawQuestionCount <= 60
      ? rawQuestionCount
      : 15;

  const rawSubject = formData.get("subject")?.toString().trim();
  const subject = rawSubject && rawSubject.length > 0 ? rawSubject : "Mixed";

  const rawDifficulty = formData.get("difficulty")?.toString().trim();
  const difficulty = (["EASY", "MEDIUM", "HARD", "MIXED"].includes(rawDifficulty ?? "")
    ? rawDifficulty
    : "MIXED") as ExamCustomizationOptions["difficulty"];

  const customizationOptions: ExamCustomizationOptions = {
    questionCount,
    subject,
    difficulty,
  };

  let totalBytes = 0;
  const inputFiles: InputFile[] = [];

  for (const file of fileEntries) {
    totalBytes += file.size;
    if (totalBytes > MAX_TOTAL_BYTES) {
      return NextResponse.json(
        { error: "Total upload size exceeds 10 MB. Please reduce file sizes or upload fewer pages." },
        { status: 413 }
      );
    }

    const mimeType = inferMimeType(file.name, file.type);
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json(
        {
          error: `Unsupported file type for "${file.name}". Please upload PDFs or images (PNG, JPG, JPEG, WEBP).`,
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    inputFiles.push({
      buffer,
      mimeType,
      fileName: file.name,
    });
  }

  let generated: GeneratedExam;

  // 3. Idempotent Recovery:
  // If questions were already generated by Gemini on a previous attempt whose DB save failed,
  // skip Gemini entirely and recover directly from the cached result!
  if (claim.hasCachedResult && claim.job.cachedResult) {
    generated = claim.job.cachedResult;
  } else {
    try {
      generated = await generateExamFromFiles(inputFiles, customizationOptions);
      // Immediately cache Gemini's output before attempting DB save
      await cacheJobGeminiResponse({ requestId, generatedExam: generated });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      await markJobFailed({ requestId, errorMessage: errorMsg });
      console.error("Exam generation failed:", err);
      const raw = err instanceof Error ? err.message : "";
      const status = (err as { status?: number })?.status;

      if (
        status === 429 ||
        /RESOURCE_EXHAUSTED|quota|spending cap|billing|rate limit/i.test(raw)
      ) {
        return NextResponse.json(
          {
            error:
              "The assessment engine server is currently processing high volume. Please wait a few seconds and try again.",
          },
          { status: 429 }
        );
      }
      if (/timed out|timeout/i.test(raw)) {
        return NextResponse.json(
          {
            error:
              "Processing took too long for the uploaded materials. Try uploading fewer pages or smaller files.",
          },
          { status: 504 }
        );
      }
      return NextResponse.json(
        {
          error:
            raw.includes("Invalid JSON") || raw.includes("schema")
              ? "The examination engine encountered a formatting issue on these materials. Please try generating again or select specific chapter pages."
              : "We couldn't generate an exam from these files. Please verify the documents contain readable text, diagrams, or notes and try again.",
        },
        { status: 502 }
      );
    }
  }

  const rawDuration = Number(formData.get("durationMinutes"));
  const durationMinutes =
    Number.isInteger(rawDuration) && rawDuration > 0
      ? rawDuration
      : 180; // Default 3 hours (180 minutes) for NEET mock standard

  const summaryFileName =
    inputFiles.length === 1
      ? inputFiles[0].fileName
      : inputFiles.length > 1
      ? `${inputFiles[0].fileName} (+${inputFiles.length - 1} more)`
      : "Uploaded Study Notes";

  // 4. Atomic Transactional Persistence
  try {
    const exam = await prisma.$transaction(async (tx) => {
      const material = await tx.uploadedMaterial.create({
        data: {
          userId: user.id,
          fileName: summaryFileName,
          status: "READY",
        },
      });

      const createdExam = await tx.exam.create({
        data: {
          userId: user.id,
          materialId: material.id,
          title: generated.title || `${subject} NEET Mock`,
          durationMinutes,
          status: "DRAFT",
          questions: {
            create: generated.questions.map((q) => ({
              questionText: q.questionText,
              options: q.options,
              correctOptionIndex: q.correctOptionIndex,
              explanation: q.explanation || null,
              diagramSvg: q.diagramSvg || null,
              difficulty: q.difficulty,
            })),
          },
        },
      });

      return createdExam;
    });

    // 5. Mark request completed only after successful persistence
    await markJobCompleted({ requestId, examId: exam.id });

    return NextResponse.json({ examId: exam.id, status: "COMPLETED" });
  } catch (dbErr) {
    console.error("Database persistence failed for generated exam:", dbErr);
    const dbMsg = dbErr instanceof Error ? dbErr.message : "Database write error";
    // Mark job as failed, but preserves cachedResult for zero-cost retry!
    await markJobFailed({ requestId, errorMessage: dbMsg });

    return NextResponse.json(
      {
        error:
          "Questions were generated successfully, but saving them to the database encountered a temporary issue. Click 'Try Again' to retry saving without re-generating.",
        requestId,
        canRetrySave: true,
      },
      { status: 500 }
    );
  }
}

