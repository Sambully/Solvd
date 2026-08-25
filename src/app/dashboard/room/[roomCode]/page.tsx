import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Trophy, Users, AlertCircle, RotateCcw } from "lucide-react";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { prisma } from "@/lib/prisma";
import {
  getRoomState,
  getRoomResults,
  joinRoom,
} from "@/lib/roomActions";
import { shuffleOptionsForParticipant } from "@/lib/optionShuffle";
import RoomWaitingLobby from "@/components/room/RoomWaitingLobby";
import RoomExamClient from "@/components/room/RoomExamClient";
import RoomResultsWaiting from "@/components/room/RoomResultsWaiting";
import RoomLeaderboardChart from "@/components/room/RoomLeaderboardChart";
import RoomLeaderboardTable from "@/components/room/RoomLeaderboardTable";
import RoomWeakTopics from "@/components/room/RoomWeakTopics";
import type { RunnerQuestion } from "@/components/ExamRunner";

export default async function TestRoomPage({
  params,
}: {
  params: Promise<{ roomCode: string }>;
}) {
  const { roomCode } = await params;
  const user = await getOrCreateUser();
  if (!user) redirect("/sign-in");

  // Attempt auto-join in case navigated via direct URL
  await joinRoom(roomCode);

  const stateRes = await getRoomState(roomCode);
  if (!stateRes.success || !stateRes.room) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-black dark:text-zinc-50">
          Room Not Available
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {stateRes.error || "The test room could not be found or you do not have permission."}
        </p>
        <Link
          href="/dashboard/room"
          className="mt-2 rounded-xl bg-black px-5 py-2.5 text-xs font-semibold text-white dark:bg-white dark:text-black"
        >
          Back to Rooms
        </Link>
      </main>
    );
  }

  const room = stateRes.room;

  // =========================================================================
  // Phase 1: Pre-Scheduled Lobby State
  // =========================================================================
  if (!room.isStarted && !room.userAttemptId) {
    return (
      <RoomWaitingLobby
        initialState={room}
        onStartExam={async () => {
          "use server";
          redirect(`/dashboard/room/${room.roomCode}`);
        }}
      />
    );
  }

  // =========================================================================
  // Phase 2: Live Exam State (Anti-Leak Option Shuffling)
  // =========================================================================
  if (room.isStarted && !room.userAttemptId) {
    const dbRoom = await (prisma as any).testRoom.findUnique({
      where: { roomCode: room.roomCode },
      select: { examId: true },
    });

    if (!dbRoom?.examId) redirect("/dashboard/room");

    const examData = await (prisma as any).exam.findUnique({
      where: { id: dbRoom.examId },
      include: {
        questions: {
          select: { id: true, questionText: true, options: true },
          orderBy: { id: "asc" },
        },
      },
    });

    if (!examData) redirect("/dashboard/room");

    // Shuffle options deterministically per student so options A/B/C/D cannot be copied
    const shuffledQuestions: RunnerQuestion[] = (examData.questions as any[]).map((q) => {
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
        examId={examData.id}
        roomCode={room.roomCode}
        title={room.title}
        durationMinutes={room.durationMinutes}
        candidateName={user.name}
        questions={shuffledQuestions}
      />
    );
  }

  // =========================================================================
  // Phase 3 & 4: Submitted / Intermediate Waiting & Room Results Leaderboard
  // =========================================================================
  const resultsRes = await getRoomResults(room.roomCode);

  if (!resultsRes.isReady) {
    return (
      <RoomResultsWaiting
        roomCode={room.roomCode}
        finishedCount={resultsRes.finishedCount ?? 1}
        totalParticipants={resultsRes.totalParticipants ?? 1}
        title={resultsRes.title ?? room.title}
      />
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6 sm:p-8">
      {/* Back and Toolbar */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/room"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Rooms Hub
        </Link>
      </div>

      {/* Leaderboard Header Banner */}
      <div className="rounded-2xl border border-black/[.08] bg-white p-6 shadow-sm dark:border-white/[.1] dark:bg-zinc-950 sm:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              <Trophy className="h-3.5 w-3.5" />
              Room Final Standings
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-black dark:text-zinc-50">
              {resultsRes.title}
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Room Code: <strong className="font-mono text-black dark:text-zinc-200">{resultsRes.roomCode}</strong> · Hosted by {resultsRes.hostName} · {resultsRes.totalQuestions} Questions ({resultsRes.maxScore} Max Marks)
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
      {resultsRes.weakTopics && (
        <RoomWeakTopics weakTopics={resultsRes.weakTopics} />
      )}
    </main>
  );
}
