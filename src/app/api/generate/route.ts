import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { generateExamFromPdf } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";

// Gemini generation can take a while for a large, image-heavy PDF (e.g. a
// full-length multi-subject paper with diagrams). 300s is Vercel Pro's cap;
// on Hobby this is silently clamped to 60s regardless of what's set here.
export const maxDuration = 300;

const MAX_BYTES = 15 * 1024 * 1024; // 15 MB (inline request limit territory)

export async function POST(req: Request) {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let file: File | null = null;
  try {
    const formData = await req.formData();
    const entry = formData.get("file");
    if (entry instanceof File) file = entry;
  } catch {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (file.type !== "application/pdf") {
    return NextResponse.json(
      { error: "Please upload a PDF file." },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "File is too large. Please upload a PDF under 15 MB." },
      { status: 413 }
    );
  }

  const pdfBuffer = Buffer.from(await file.arrayBuffer());

  let generated;
  try {
    generated = await generateExamFromPdf(pdfBuffer, file.type);
  } catch (err) {
    console.error("Exam generation failed:", err);
    const raw = err instanceof Error ? err.message : "";
    const status = (err as { status?: number })?.status;

    // Surface known failure modes with distinct messages instead of a generic
    // "try a clearer PDF" that hides the real problem.
    if (
      status === 429 ||
      /RESOURCE_EXHAUSTED|quota|spending cap|billing/i.test(raw)
    ) {
      return NextResponse.json(
        {
          error:
            "The Gemini API has hit its quota or billing cap. Check your key's spending limit in AI Studio and try again.",
        },
        { status: 429 }
      );
    }
    if (/timed out|timeout/i.test(raw)) {
      return NextResponse.json(
        {
          error:
            "Generation took too long for this PDF. Try a shorter chapter or a lower page count.",
        },
        { status: 504 }
      );
    }
    return NextResponse.json(
      {
        error:
          "We couldn't generate an exam from this file. Try a clearer or more text-rich PDF.",
      },
      { status: 502 }
    );
  }

  const durationMinutes = generated.questions.length; // ~1 min per question (NEET pace)

  const material = await prisma.uploadedMaterial.create({
    data: {
      userId: user.id,
      fileName: file.name,
      status: "READY",
    },
  });

  const exam = await prisma.exam.create({
    data: {
      userId: user.id,
      materialId: material.id,
      title: generated.title,
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
