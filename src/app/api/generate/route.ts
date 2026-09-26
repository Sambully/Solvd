import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { generateExamFromFiles, type InputFile } from "@/lib/gemini";
import type { ExamCustomizationOptions } from "@/lib/examTypes";
import { prisma } from "@/lib/prisma";

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

  // Support both "files" (multiple) and "file" (single)
  const fileEntries = [
    ...formData.getAll("files"),
    ...formData.getAll("file"),
  ].filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (fileEntries.length === 0) {
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

  let generated;
  try {
    generated = await generateExamFromFiles(inputFiles, customizationOptions);
  } catch (err) {
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

  const rawDuration = Number(formData.get("durationMinutes"));
  const durationMinutes =
    Number.isInteger(rawDuration) && rawDuration > 0
      ? rawDuration
      : 180; // Default 3 hours (180 minutes) for NEET mock standard

  const summaryFileName =
    inputFiles.length === 1
      ? inputFiles[0].fileName
      : `${inputFiles[0].fileName} (+${inputFiles.length - 1} more)`;

  const material = await prisma.uploadedMaterial.create({
    data: {
      userId: user.id,
      fileName: summaryFileName,
      status: "READY",
    },
  });

  const exam = await prisma.exam.create({
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

  return NextResponse.json({ examId: exam.id });
}

