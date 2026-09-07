import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Trophy, AlertCircle } from "lucide-react";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { prisma } from "@/lib/prisma";
import {
  ensureRoomParticipant,
  getRoomExamLeaderboard,
  type RoomMemberInfo,
} from "@/lib/roomActions";
import { shuffleOptionsForParticipant } from "@/lib/optionShuffle";
import { getStudentColor } from "@/lib/roomConstants";
import RoomTestWaitingLobby from "@/components/room/RoomTestWaitingLobby";
import RoomExamClient from "@/components/room/RoomExamClient";
import RoomLeaderboardChart from "@/components/room/RoomLeaderboardChart";
import RoomLeaderboardTable from "@/components/room/RoomLeaderboardTable";
import RoomWeakTopics from "@/components/room/RoomWeakTopics";
import type { RunnerQuestion } from "@/components/ExamRunner";

export default async function RoomTestPage({
  params,
}: {
  params: Promise<{ roomCode: string; examId: string }>;
}) {
  const { roomCode, examId } = await params;
  const user = await getOrCreateUser();
  if (!user) redirect("/sign-in");

  const code = roomCode.trim().toUpperCase();
  await ensureRoomParticipant(code, user.id);

  const room = await prisma.testRoom.findUnique({
    where: { roomCode: code },
    include: {
      hostUser: { select: { id: true, name: true } },
      participants: {
        include: {
          user: { select: { id: true, name: true } },
        },
        orderBy: { joinedAt: "asc" },
      },
      roomExams: {
        where: { examId },
        include: {
          exam: {
            include: {
              questions: {
                select: {
                  id: true,
                  questionText: true,
                  options: true,
                  difficulty: true,
                },
                orderBy: { id: "asc" },
              },
            },
          },
          attempts: {
            where: { userId: user.id },
          },
        },
      },
    },
  });

  if (!room || room.roomExams.length === 0) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-col items-center justify-center gap-4 p-8 text-center min-h-[60vh]">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-black dark:text-zinc-50">
          Test Not Found
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          This mock test does not exist in this study circle.
        </p>
        <Link
          href={`/dashboard/room/${code}`}
          className="mt-2 rounded-xl bg-black px-5 py-2.5 text-xs font-semibold text-white dark:bg-white dark:text-black hover:bg-zinc-800"
        >
          Back to Room Hub
        </Link>
      </main>
    );
  }

  const roomExam = room.roomExams[0];
  const exam = roomExam.exam;
  const userAttempt = roomExam.attempts.find((a) => a.submittedAt !== null);

  const now = Date.now();
  const scheduledMs = new Date(roomExam.scheduledAt).getTime();
  const durationMinutes = exam.durationMinutes || 180;
  const durationMs = (durationMinutes + 15) * 60 * 1000;
  const isPastScheduled = now >= scheduledMs;
  const isWindowExpired = now > scheduledMs + durationMs;

  const members: RoomMemberInfo[] = room.participants.map((p, idx) => ({
    userId: p.user.id,
    name: p.user.name,
    isHost: p.user.id === room.hostUserId,
    joinedAt: p.joinedAt,
    color: getStudentColor(idx),
  }));

  // =========================================================================
  // Phase 1: Pre-Scheduled Lobby (Before Scheduled Start Time)
  // =========================================================================
  if (!isPastScheduled && !userAttempt) {
    return (
      <RoomTestWaitingLobby
        roomCode={room.roomCode}
        roomName={room.name}
        testTitle={exam.title}
        scheduledAt={roomExam.scheduledAt.toISOString()}
        durationMinutes={durationMinutes}
        questionCount={exam.questions.length}
        members={members}
        currentUserId={user.id}
      />
    );
  }

  // =========================================================================
  // Phase 2: Results & Leaderboard (If User Already Submitted or Expired)
  // =========================================================================
  if (userAttempt || isWindowExpired) {
    const resultsRes = await getRoomExamLeaderboard(room.roomCode, examId);

    return (
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <Link
            href={`/dashboard/room/${room.roomCode}`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to ${room.name} Hub
          </Link>
        </div>

        {/* Leaderboard Header Banner */}
        <div className="rounded-2xl border border-black/[.08] bg-white p-6 shadow-sm dark:border-white/[.1] dark:bg-zinc-950 sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                <Trophy className="h-3.5 w-3.5" />
                Test Standings & Leaderboard
              </div>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-black dark:text-zinc-50">
                {resultsRes.title || exam.title}
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Room: <strong className="font-mono text-black dark:text-zinc-200">{room.roomCode}</strong> · {resultsRes.totalQuestions} Questions ({resultsRes.maxScore} Max Marks) · {durationMinutes} Minutes
              </p>
            </div>
          </div>
        </div>

        {/* Comparative Score Bar Chart */}
        {resultsRes.leaderboard && resultsRes.maxScore && (
          <RoomLeaderboardChart
            leaderboard={resultsRes.leaderboard}
            maxScore={resultsRes.maxScore}
          />
        )}

        {/* Ranked Table */}
        {resultsRes.leaderboard && resultsRes.maxScore && (
          <RoomLeaderboardTable
            leaderboard={resultsRes.leaderboard}
            maxScore={resultsRes.maxScore}
          />
        )}

        {/* Group Weak Topics & Error Clusters */}
        {resultsRes.weakTopics && resultsRes.weakTopics.length > 0 && (
          <RoomWeakTopics weakTopics={resultsRes.weakTopics} />
        )}
      </main>
    );
  }

  // =========================================================================
  // Phase 3: Live Exam Taking (Anti-Leak Option Shuffling)
  // =========================================================================
  const shuffledQuestions: RunnerQuestion[] = (exam.questions as any[]).map((q) => {
    const rawOptions = q.options as string[];
    const { shuffledOptions } = shuffleOptionsForParticipant(
      rawOptions,
      user.id,
      q.id
    );
    return {
      id: q.id,
      questionText: q.questionText,
      options: shuffledOptions,
    };
  });

  return (
    <RoomExamClient
      roomId={room.id}
      examId={exam.id}
      roomCode={room.roomCode}
      title={exam.title}
      durationMinutes={durationMinutes}
      candidateName={user.name}
      questions={shuffledQuestions}
    />
  );
}
