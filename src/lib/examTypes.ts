import { z } from "zod";

export const generatedQuestionSchema = z.object({
  questionText: z.string().min(1),
  options: z.array(z.string().min(1)).length(4),
  correctOptionIndex: z.number().int().min(0).max(3),
  explanation: z.string().default(""),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
});

export const generatedExamSchema = z.object({
  title: z.string().min(1),
  subject: z.string().default("Mixed"),
  questions: z.array(generatedQuestionSchema).min(1).max(60),
});

export type GeneratedQuestion = z.infer<typeof generatedQuestionSchema>;
export type GeneratedExam = z.infer<typeof generatedExamSchema>;

/** Answers submitted from the client: questionId -> selected option index (0-3). */
export type AnswerMap = Record<string, number>;
