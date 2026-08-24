export type QuestionStatus =
  | "NOT_VISITED"
  | "NOT_ANSWERED"
  | "ANSWERED"
  | "MARKED_FOR_REVIEW"
  | "ANSWERED_AND_MARKED_FOR_REVIEW";

export type ExamInterfaceMode = "NTA_OFFICIAL" | "MODERN";

export interface QuestionStatusMap {
  [questionId: string]: QuestionStatus;
}

