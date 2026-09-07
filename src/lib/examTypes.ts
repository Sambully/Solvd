import { z } from "zod";

export const generatedQuestionSchema = z.object({
  questionText: z.preprocess((val) => String(val || "").trim(), z.string().min(1)),
  options: z.preprocess((val) => {
    if (Array.isArray(val)) {
      const stringified = val.map((v) => (v === null || v === undefined ? "" : String(v)).trim());
      while (stringified.length < 4) {
        stringified.push(`Option ${stringified.length + 1}`);
      }
      return stringified.slice(0, 4);
    }
    return ["Option A", "Option B", "Option C", "Option D"];
  }, z.array(z.string()).length(4)),
  correctOptionIndex: z.preprocess((val) => {
    const num = Number(val);
    if (!Number.isFinite(num)) return 0;
    if (num >= 0 && num <= 3) return Math.floor(num);
    if (num === 4) return 3; // Normalize 1-based index (1-4)
    return 0;
  }, z.number().int().min(0).max(3)),
  explanation: z.preprocess((val) => (val ? String(val) : ""), z.string().default("")),
  diagramSvg: z.preprocess((val) => {
    if (typeof val === "string" && val.trim().startsWith("<svg") && val.includes("</svg>")) {
      return val.trim();
    }
    return null;
  }, z.string().nullable().optional()),
  difficulty: z.preprocess((val) => {
    const upper = String(val || "").toUpperCase();
    if (upper === "EASY" || upper === "HARD") return upper;
    return "MEDIUM";
  }, z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM")),
});

export const generatedExamSchema = z.object({
  title: z.preprocess((val) => (val ? String(val).trim() : "NEET Mock Exam"), z.string().min(1)),
  subject: z.preprocess((val) => (val ? String(val).trim() : "Mixed"), z.string().default("Mixed")),
  questions: z.array(generatedQuestionSchema).min(1).max(60),
});

export type GeneratedQuestion = z.infer<typeof generatedQuestionSchema>;
export type GeneratedExam = z.infer<typeof generatedExamSchema>;

export interface ExamCustomizationOptions {
  questionCount?: number; // 10, 15, 20, 30, 45
  subject?: string; // "Mixed" | "Physics" | "Chemistry" | "Biology" | "Botany" | "Zoology"
  difficulty?: "MIXED" | "EASY" | "MEDIUM" | "HARD";
}

/** Answers submitted from the client: questionId -> selected option index (0-3). */
export type AnswerMap = Record<string, number>;

