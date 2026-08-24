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

const MAX_TOTAL_BYTES = 30 * 1024 * 1024; // 30 MB combined

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
        { error: "Total upload size exceeds 30 MB. Please reduce file sizes." },
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
            "The Gemini API rate limit or quota was temporarily reached. Please wait a few seconds and try again.",
        },
        { status: 429 }
      );
    }
    if (/timed out|timeout/i.test(raw)) {
      return NextResponse.json(
        {
          error:
            "Generation took too long for the uploaded materials. Try uploading fewer pages or smaller files.",
        },
        { status: 504 }
      );
    }
    return NextResponse.json(
      {
        error:
          "We couldn't generate an exam from these files. Please verify the documents contain readable text, diagrams, or questions and try again.",
      },
      { status: 502 }
    );
  }

  const durationMinutes = generated.questions.length; // ~1 min per question for NEET pace

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
          difficulty: q.difficulty,
        })),
      },
    },
  });

  return NextResponse.json({ examId: exam.id });
}

