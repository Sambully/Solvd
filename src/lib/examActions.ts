"use server";

import { revalidatePath } from "next/cache";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { prisma } from "@/lib/prisma";

export async function renameExam(
  examId: string,
  newTitle: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const title = newTitle.trim();
    if (!title || title.length < 1) {
      return { success: false, error: "Exam title cannot be empty." };
    }
    if (title.length > 120) {
      return { success: false, error: "Exam title cannot exceed 120 characters." };
    }

    const exam = await prisma.exam.findFirst({
      where: { id: examId, userId: user.id },
    });

    if (!exam) {
      return { success: false, error: "Exam not found." };
    }

    await prisma.exam.update({
      where: { id: examId },
      data: { title },
    });

    revalidatePath("/dashboard");
    revalidatePath("/tests");
    revalidatePath(`/dashboard/exam/${examId}`);

    return { success: true };
  } catch (err) {
    console.error("Failed to rename exam:", err);
    return { success: false, error: "Failed to update exam title." };
  }
}

export async function deleteExam(
  examId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const exam = await prisma.exam.findFirst({
      where: { id: examId, userId: user.id },
    });

    if (!exam) {
      return { success: false, error: "Exam not found." };
    }

    await prisma.exam.delete({
      where: { id: examId },
    });

    revalidatePath("/dashboard");
    revalidatePath("/tests");

    return { success: true };
  } catch (err) {
    console.error("Failed to delete exam:", err);
    return { success: false, error: "Failed to delete exam." };
  }
}
