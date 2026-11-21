"use client";

import { useRouter } from "next/navigation";
import ExamRunner, { type RunnerQuestion } from "@/components/ExamRunner";
import { submitRoomAttempt } from "@/lib/roomActions";
import type { AnswerMap } from "@/lib/examTypes";
import type { HydratedAttempt } from "@/lib/attemptService";

interface RoomExamClientProps {
  roomId: string;
  roomExamId: string;
  examId: string;
  roomCode: string;
  title: string;
  durationMinutes: number;
  candidateName: string;
  questions: RunnerQuestion[];
  initialAttempt?: HydratedAttempt | null;
}

export default function RoomExamClient({
  roomId,
  roomExamId,
  examId,
  roomCode,
  title,
  durationMinutes,
  candidateName,
  questions,
  initialAttempt = null,
}: RoomExamClientProps) {
  const router = useRouter();

  async function handleRoomSubmit(
    _examId: string,
    answers: AnswerMap,
    attemptId?: string
  ) {
    const res = await submitRoomAttempt(roomId, examId, answers, attemptId);
    if (res.success) {
      router.refresh();
    } else {
      alert(res.error || "Failed to submit room test attempt.");
      router.refresh();
    }
  }

  return (
    <ExamRunner
      examId={examId}
      roomId={roomId}
      roomExamId={roomExamId}
      title={`${title} (Room ${roomCode})`}
      candidateName={candidateName}
      durationMinutes={durationMinutes}
      questions={questions}
      initialAttempt={initialAttempt}
      attemptInfo={{ currentAttemptNumber: 1, maxAttempts: 1 }}
      onSubmit={handleRoomSubmit}
    />
  );
}
