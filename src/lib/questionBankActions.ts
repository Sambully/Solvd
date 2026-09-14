"use server";

import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ensureCuratedModulesInDb } from "./questionBankData";

/**
 * Instantly synthesizes an authentic Exam from a Question Bank module
 * with 0 Gemini API calls and 0 upload required.
 */
export async function startInstantBankExam(
  moduleId: string,
  targetQuestionCount?: number,
  customDurationMinutes?: number
): Promise<{ success: boolean; examId?: string; error?: string }> {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return { success: false, error: "Please sign in to start a practice test." };
    }

    await ensureCuratedModulesInDb();

    const moduleRecord = await prisma.questionBankModule.findUnique({
      where: { id: moduleId },
      include: { questions: true },
    });

    if (!moduleRecord || moduleRecord.questions.length === 0) {
      return { success: false, error: "Question bank module not found or has no questions." };
    }

    // Shuffle and pick target count
    const shuffled = [...moduleRecord.questions].sort(() => 0.5 - Math.random());
    const count = targetQuestionCount && targetQuestionCount > 0
      ? Math.min(targetQuestionCount, shuffled.length)
      : shuffled.length;
    const selectedQuestions = shuffled.slice(0, count);

    // Standard duration: 1.2 minutes per question (e.g. 15 Qs = 18 mins, 45 Qs = 54 mins, 180 Qs = 200 mins)
    const duration =
      customDurationMinutes && customDurationMinutes > 0
        ? customDurationMinutes
        : Math.max(15, Math.round(selectedQuestions.length * 1.2));

    // Create a virtual UploadedMaterial container
    const material = await prisma.uploadedMaterial.create({
      data: {
        userId: user.id,
        fileName: `[Question Bank] ${moduleRecord.title}`,
        status: "READY",
      },
    });

    // Create the Exam with full NTA questions
    const exam = await prisma.exam.create({
      data: {
        userId: user.id,
        materialId: material.id,
        title: `${moduleRecord.title} (${selectedQuestions.length} Qs)`,
        durationMinutes: duration,
        status: "DRAFT",
        questions: {
          create: selectedQuestions.map((q) => ({
            questionText: q.questionText,
            options: q.options as string[],
            correctOptionIndex: q.correctOptionIndex,
            explanation: q.explanation,
            diagramSvg: q.diagramSvg,
            difficulty: q.difficulty,
          })),
        },
      },
    });

    revalidatePath("/tests");
    revalidatePath("/dashboard");

    return { success: true, examId: exam.id };
  } catch (err) {
    console.error("Failed to start instant exam from bank:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create practice test.",
    };
  }
}

/**
 * Shares an AI-generated exam into the reusable Community Question Bank.
 */
export async function shareExamToQuestionBank(
  examId: string,
  title?: string,
  tags?: string[]
): Promise<{ success: boolean; moduleId?: string; error?: string }> {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return { success: false, error: "Please sign in to share tests." };
    }

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { questions: true },
    });

    if (!exam || exam.questions.length === 0) {
      return { success: false, error: "Exam not found or has no questions." };
    }

    // Check if already shared
    const existing = await prisma.questionBankModule.findFirst({
      where: { sourceExamId: examId },
    });
    if (existing) {
      return { success: true, moduleId: existing.id };
    }

    // Infer subject from title
    let subject = "Mixed";
    const lower = exam.title.toLowerCase();
    if (lower.includes("bio") || lower.includes("botany") || lower.includes("zoology") || lower.includes("genetics")) {
      subject = "Biology";
    } else if (lower.includes("physic") || lower.includes("mechanic") || lower.includes("optic") || lower.includes("electro")) {
      subject = "Physics";
    } else if (lower.includes("chem") || lower.includes("organic") || lower.includes("bonding")) {
      subject = "Chemistry";
    }

    const newModule = await prisma.questionBankModule.create({
      data: {
        title: title || exam.title,
        description: `Community mock test with ${exam.questions.length} NTA NEET MCQs shared by ${user.name}.`,
        subject,
        chapter: "Community Shared",
        difficulty: "MEDIUM",
        isOfficial: false,
        creatorUserId: user.id,
        sourceExamId: exam.id,
        tags: tags && tags.length > 0 ? tags : ["Community Shared", "NEET Mock", `${exam.questions.length} Qs`],
        questions: {
          create: exam.questions.map((q) => ({
            questionText: q.questionText,
            options: q.options as string[],
            correctOptionIndex: q.correctOptionIndex,
            explanation: q.explanation,
            diagramSvg: q.diagramSvg,
            difficulty: q.difficulty,
            subject,
          })),
        },
      },
    });

    revalidatePath("/dashboard/question-bank");
    return { success: true, moduleId: newModule.id };
  } catch (err) {
    console.error("Failed to share exam to question bank:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to share exam to question bank.",
    };
  }
}
