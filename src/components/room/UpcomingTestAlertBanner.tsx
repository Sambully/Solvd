"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BellRing, PlayCircle, Clock, Sparkles, X, ChevronRight } from "lucide-react";
import type { RoomTestItem } from "@/lib/roomActions";

interface UpcomingTestAlertBannerProps {
  roomCode: string;
  roomName: string;
  test: RoomTestItem;
  onDismiss?: () => void;
}

export default function UpcomingTestAlertBanner({
  roomCode,
  roomName,
  test,
  onDismiss,
}: UpcomingTestAlertBannerProps) {
  const [timeLeftMs, setTimeLeftMs] = useState<number>(() => {
    return new Date(test.scheduledAt).getTime() - Date.now();
  });
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const update = () => {
      const diff = new Date(test.scheduledAt).getTime() - Date.now();
      setTimeLeftMs(diff);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [test.scheduledAt]);

  if (isDismissed) return null;

  const isLive = timeLeftMs <= 0;
  const isWithin15Min = timeLeftMs <= 15 * 60 * 1000;

  // Don't show if test is more than 15 mins away or completed
  if (!isWithin15Min && !isLive) return null;
  if (test.status === "COMPLETED" || test.hasUserSubmitted) return null;

  // Format countdown string
  const totalSeconds = Math.max(0, Math.floor(timeLeftMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const countdownText = `${minutes}m ${seconds.toString().padStart(2, "0")}s`;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-zinc-950 via-emerald-950/20 to-zinc-950 p-4 shadow-xl dark:border-emerald-500/30 sm:p-5">
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-emerald-500/10 blur-2xl" />
      <div className="pointer-events-none absolute -left-12 -bottom-12 h-36 w-36 rounded-full bg-indigo-500/10 blur-2xl" />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <BellRing className="h-5 w-5 animate-bounce" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
                {isLive ? "🔴 Test Live Now" : "⏰ Starting In 15 Mins"}
              </span>
              <span className="text-xs text-zinc-400 font-medium">
                {roomName}
              </span>
            </div>

            <h4 className="mt-1 text-sm font-bold text-white sm:text-base">
              {test.title}
            </h4>

            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-zinc-500" />
                {test.durationMinutes} Mins
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                {test.questionCount} Questions
              </span>
              <span>•</span>
              <span className="font-mono font-bold text-emerald-400">
                {isLive ? "Active Test Window" : `Starts in: ${countdownText}`}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <Link
            href={`/dashboard/room/${roomCode}/test/${test.examId}`}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-black shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLive ? (
              <>
                <PlayCircle className="h-4 w-4" />
                <span>Start Test Now</span>
              </>
            ) : (
              <>
                <span>Enter Waiting Lobby</span>
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Link>

          <button
            type="button"
            onClick={() => {
              setIsDismissed(true);
              onDismiss?.();
            }}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
            title="Dismiss alert"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
