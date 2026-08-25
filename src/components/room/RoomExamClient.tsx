"use client";

import { useRouter } from "next/navigation";
import ExamRunner, { type RunnerQuestion } from "@/components/ExamRunner";
import { submitRoomAttempt } from "@/lib/roomActions";
import type { AnswerMap } from "@/lib/examTypes";

interface RoomExamClientProps {
  roomId: string;
  examId: string;
  roomCode: string;
  title: string;
  durationMinutes: number;
  candidateName: string;
  questions: RunnerQuestion[];
}

export default function RoomExamClient({
  roomId,
  examId,
  roomCode,
  title,
  durationMinutes,
  candidateName,
  questions,
}: RoomExamClientProps) {
  const router = useRouter();

  async function handleRoomSubmit(_examId: string, answers: AnswerMap) {
    const res = await submitRoomAttempt(roomId, examId, answers);
    if (res.success) {
      router.refresh();
    } else {
      alert(res.error || "Failed to submit room test attempt.");
    }
  }

  return (
    <ExamRunner
      examId={examId}
      title={`${title} (Room ${roomCode})`}
      candidateName={candidateName}
      durationMinutes={durationMinutes}
      questions={questions}
      onSubmit={handleRoomSubmit}
    />
  );
}
