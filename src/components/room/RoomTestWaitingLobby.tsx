"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clock,
  Users,
  Calendar,
  Play,
  ArrowLeft,
  Crown,
  Lock,
} from "lucide-react";
import type { RoomMemberInfo } from "@/lib/roomActions";

interface RoomTestWaitingLobbyProps {
  roomCode: string;
  roomName: string;
  testTitle: string;
  scheduledAt: string;
  durationMinutes: number;
  questionCount: number;
  members: RoomMemberInfo[];
  currentUserId: string;
}

function formatCountdown(targetDateStr: string) {
  const diff = Math.max(0, Math.floor((new Date(targetDateStr).getTime() - Date.now()) / 1000));
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;

  if (diff === 0) return "00:00:00";
  return `${h.toString().padStart(2, "0")}:${m
    .toString()
    .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function RoomTestWaitingLobby({
  roomCode,
  roomName,
  testTitle,
  scheduledAt,
  durationMinutes,
  questionCount,
  members,
  currentUserId,
}: RoomTestWaitingLobbyProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(() => formatCountdown(scheduledAt));
  const [mounted, setMounted] = useState(false);
  const [isReadyToStart, setIsReadyToStart] = useState(() => {
    return Date.now() >= new Date(scheduledAt).getTime();
  });

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      const ready = Date.now() >= new Date(scheduledAt).getTime();
      setIsReadyToStart(ready);
      setCountdown(formatCountdown(scheduledAt));
      if (ready) {
        router.refresh();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [scheduledAt, router]);

  const scheduledDate = new Date(scheduledAt);
  const formattedDate = scheduledDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const formattedTime = scheduledDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6 sm:p-8">
      <div>
        <Link
          href={`/dashboard/room/${roomCode}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to ${roomName} Hub
        </Link>
      </div>

      {/* Main Countdown Hero Card */}
      <div className="flex flex-col items-center justify-center rounded-2xl border border-black/[.08] bg-white p-8 text-center shadow-sm dark:border-white/[.1] dark:bg-zinc-950 sm:p-12">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700 dark:bg-blue-950 dark:text-blue-300 mb-4">
          <Clock className="h-3.5 w-3.5" />
          Upcoming Scheduled Test
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-black dark:text-zinc-50 max-w-xl">
          {testTitle}
        </h1>

        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          Room: <strong className="text-black dark:text-white">{roomName}</strong> ({roomCode}) · {questionCount} Questions ({questionCount * 4} Marks)
        </p>

        {/* Big Countdown Timer */}
        <div className="my-8 flex flex-col items-center justify-center rounded-2xl border border-black/[.06] bg-zinc-50 p-6 dark:border-white/[.08] dark:bg-zinc-900/60 sm:p-8 w-full max-w-md">
          <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
            {isReadyToStart ? "Test is now live" : "Test Starts In"}
          </span>
          <div suppressHydrationWarning className="mt-1 font-mono text-4xl sm:text-5xl font-black tracking-tight text-black dark:text-white">
            {mounted ? countdown : "..."}
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <Calendar className="h-3.5 w-3.5 text-blue-500" />
            <span suppressHydrationWarning>Scheduled for {formattedDate} at {formattedTime}</span>
          </div>
        </div>

        {/* Action Button */}
        {isReadyToStart ? (
          <button
            type="button"
            onClick={() => router.refresh()}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-700 transition-all"
          >
            <Play className="h-4 w-4 fill-current" />
            Enter Test Now ({durationMinutes} Mins)
          </button>
        ) : (
          <div className="flex items-center gap-2 rounded-xl border border-black/[.1] bg-zinc-100 px-6 py-3 text-xs font-semibold text-zinc-500 dark:border-white/[.1] dark:bg-zinc-900 dark:text-zinc-400">
            <Lock className="h-4 w-4 text-zinc-400" />
            <span>Exam screen will automatically unlock at {formattedTime}</span>
          </div>
        )}
      </div>

      {/* Participants List */}
      <div className="rounded-2xl border border-black/[.08] bg-white p-6 shadow-sm dark:border-white/[.1] dark:bg-zinc-950">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-4.5 w-4.5 text-blue-500" />
          <h3 className="text-sm font-bold text-black dark:text-zinc-50">
            Room Members ({members.length})
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {members.map((m) => (
            <div
              key={m.userId}
              className="flex items-center gap-3 rounded-xl border border-black/[.06] bg-zinc-50/60 p-3 dark:border-white/[.08] dark:bg-zinc-900/40"
            >
              <span
                className="h-3 w-3 rounded-full shrink-0 shadow-xs"
                style={{ backgroundColor: m.color.stroke }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-black dark:text-zinc-100 flex items-center gap-1">
                  {m.name} {m.userId === currentUserId && "(You)"}
                  {m.isHost && <Crown className="h-3 w-3 text-amber-500 shrink-0" />}
                </p>
                <p className="text-[10px] text-zinc-400">
                  Ready to attempt
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
