"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Users, Trophy, Clock, CheckCircle2 } from "lucide-react";

interface RoomResultsWaitingProps {
  roomCode: string;
  finishedCount: number;
  totalParticipants: number;
  title: string;
}

export default function RoomResultsWaiting({
  roomCode,
  finishedCount,
  totalParticipants,
  title,
}: RoomResultsWaitingProps) {
  const router = useRouter();

  // Poll every 5 seconds to check if remaining friends have submitted
  useEffect(() => {
    const timer = setInterval(() => {
      router.refresh();
    }, 5000);
    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center justify-center gap-6 p-6 sm:p-12 text-center">
      <div className="rounded-2xl border border-black/[.08] bg-white p-8 shadow-xl dark:border-white/[.1] dark:bg-zinc-950 sm:p-10 w-full">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
        </div>

        <h2 className="mt-4 text-2xl font-bold tracking-tight text-black dark:text-zinc-50">
          Your Attempt is Submitted!
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
          Waiting for all room participants to complete their NEET CBT test.
        </p>

        {/* Progress Bar & Status */}
        <div className="mt-8 rounded-xl border border-black/[.08] bg-zinc-50/70 p-5 dark:border-white/[.08] dark:bg-zinc-900/50">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-2">
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-blue-600" />
              Room Submission Progress
            </span>
            <span className="font-mono text-black dark:text-white">
              {finishedCount} / {totalParticipants} Finished
            </span>
          </div>

          <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{
                width: `${totalParticipants > 0 ? (finishedCount / totalParticipants) * 100 : 0}%`,
              }}
            />
          </div>

          <p className="mt-3 flex items-center justify-center gap-2 text-xs text-zinc-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
            The room leaderboard and weak-topic analysis will unlock automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
