"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Copy,
  Check,
  Share2,
  Plus,
  Play,
  Trophy,
  Clock,
  Calendar,
  Layers,
  Crown,
  FileCheck2,
  Lock,
  CalendarClock,
} from "lucide-react";
import type { RoomDetailsResponse, RoomTestItem } from "@/lib/roomActions";
import RoomMultiTestTrendChart from "@/components/room/RoomMultiTestTrendChart";
import CreateRoomTestModal from "@/components/room/CreateRoomTestModal";
import UpcomingTestAlertBanner from "@/components/room/UpcomingTestAlertBanner";

interface PersistentRoomHubClientProps {
  initialData: NonNullable<RoomDetailsResponse["room"]>;
}

function RoomTestCard({
  test,
  roomCode,
}: {
  test: RoomTestItem;
  roomCode: string;
}) {
  const [now, setNow] = useState(Date.now());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const scheduledMs = new Date(test.scheduledAt).getTime();
  const durationMs = (test.durationMinutes + 15) * 60 * 1000;
  const isPastScheduled = now >= scheduledMs;
  const isWindowExpired = now > scheduledMs + durationMs;

  const isLive = !test.hasUserSubmitted && !isWindowExpired && isPastScheduled;
  const isUpcoming = !isPastScheduled && !test.hasUserSubmitted;

  const diffMs = Math.max(0, scheduledMs - now);
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  const countdownText =
    diffHours > 0
      ? `${diffHours}h ${diffMinutes}m ${diffSeconds}s`
      : `${diffMinutes}m ${diffSeconds}s`;

  const scheduledDate = new Date(test.scheduledAt);
  const formattedDate = scheduledDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const formattedTime = scheduledDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-black/[.08] bg-white p-5 shadow-xs transition-all hover:border-black/[.2] hover:shadow-md dark:border-white/[.1] dark:bg-zinc-950 dark:hover:border-white/[.25]">
      <div>
        <div className="flex items-center justify-between gap-2">
          {isLive ? (
            <span className="flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Exam
            </span>
          ) : isUpcoming ? (
            <span className="flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <Clock className="h-3 w-3" /> Upcoming Test
            </span>
          ) : (
            <span className="rounded-md bg-zinc-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              Finished
            </span>
          )}

          <span className="text-[10px] font-medium text-zinc-400">
            {test.finishedCount}/{test.totalParticipants} Submitted
          </span>
        </div>

        <h4 className="mt-3 text-base font-bold text-black dark:text-zinc-50 line-clamp-2">
          {test.title}
        </h4>

        <div className="mt-4 flex flex-col gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-blue-500" />
            <span suppressHydrationWarning>
              {formattedDate} at {formattedTime}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-indigo-500" />
            <span>
              {test.durationMinutes} Mins · {test.questionCount} Questions
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 border-t border-black/[.06] pt-3.5 dark:border-white/[.08]">
        {test.hasUserSubmitted ? (
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              Score: {test.userScore !== null && test.userScore > 0 ? `+${test.userScore}` : test.userScore ?? 0}
            </span>
            <Link
              href={`/dashboard/room/${roomCode}/test/${test.examId}`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-100 px-3.5 py-1.5 text-xs font-bold text-black hover:bg-zinc-200 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
            >
              <Trophy className="h-3.5 w-3.5 text-amber-500" />
              Leaderboard & Breakdown
            </Link>
          </div>
        ) : isLive ? (
          <Link
            href={`/dashboard/room/${roomCode}/test/${test.examId}`}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            Take Test Now ({test.durationMinutes}m)
          </Link>
        ) : isUpcoming ? (
          <div className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-black/[.08] bg-zinc-50 py-2.5 text-xs font-semibold text-zinc-500 dark:border-white/[.1] dark:bg-zinc-900/60 dark:text-zinc-400">
            <Lock className="h-3.5 w-3.5 text-zinc-400" />
            <span suppressHydrationWarning>
              Starts in <strong suppressHydrationWarning>{mounted ? countdownText : "..."}</strong>
            </span>
          </div>
        ) : (
          <Link
            href={`/dashboard/room/${roomCode}/test/${test.examId}`}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-black/[.1] bg-zinc-50 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-white/[.1] dark:bg-zinc-900 dark:text-zinc-300"
          >
            <Trophy className="h-3.5 w-3.5 text-amber-500" />
            View Results
          </Link>
        )}
      </div>
    </div>
  );
}

export default function PersistentRoomHubClient({
  initialData,
}: PersistentRoomHubClientProps) {
  const router = useRouter();
  const [room, setRoom] = useState(initialData);
  const [isCreateTestOpen, setIsCreateTestOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    setRoom(initialData);
  }, [initialData]);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/dashboard/room/${room.roomCode}`
      : `/dashboard/room/${room.roomCode}`;

  const shareText = `Join my NEET Study Circle "${room.name}" on Solvd! Enter room code: ${room.roomCode} or join directly: ${shareUrl}`;

  function copyCode() {
    navigator.clipboard.writeText(room.roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }

  function copyLink() {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  function shareWhatsApp() {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  }

  return (
    <>
      {/* Room Header Hero */}
      <div className="flex flex-col gap-5 rounded-2xl border border-black/[.08] bg-white p-6 shadow-sm dark:border-white/[.1] dark:bg-zinc-950 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 mb-2">
              <Users className="h-3.5 w-3.5" />
              NEET Study Circle
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-black dark:text-zinc-50">
              {room.name}
            </h1>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Hosted by <strong>{room.hostName}</strong> · {room.members.length} Member{room.members.length > 1 ? "s" : ""} · {room.tests.length} Scheduled Test{room.tests.length > 1 ? "s" : ""}
            </p>
          </div>

          {/* Host Action Buttons */}
          {room.isHost && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCreateTestOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                <Plus className="h-4 w-4" />
                Schedule Mock Test
              </button>
            </div>
          )}
        </div>

        {/* Shareable Code Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/[.06] bg-zinc-50/70 p-3.5 dark:border-white/[.08] dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Invite Code:
            </span>
            <span className="font-mono text-base font-extrabold tracking-wider text-black dark:text-white">
              {room.roomCode}
            </span>
            <button
              type="button"
              onClick={copyCode}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-black/[.1] bg-white shadow-2xs hover:bg-zinc-50 dark:border-white/[.15] dark:bg-zinc-800"
              title="Copy Code"
            >
              {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-zinc-600 dark:text-zinc-300" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex items-center gap-1.5 rounded-lg border border-black/[.1] bg-white px-3 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-white/[.15] dark:bg-zinc-800 dark:text-zinc-200"
            >
              {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedLink ? "Link Copied" : "Copy Invite Link"}
            </button>

            <button
              type="button"
              onClick={shareWhatsApp}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-1 text-xs font-bold text-white shadow-2xs hover:bg-[#20bd5a]"
            >
              <Share2 className="h-3.5 w-3.5" />
              WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* 15-Minute Countdown & Live Test Alert Banner */}
      {(() => {
        const upcomingAlertTest = room.tests.find((t) => {
          if (t.hasUserSubmitted || t.status === "COMPLETED") return false;
          const schedMs = new Date(t.scheduledAt).getTime();
          const diff = schedMs - Date.now();
          const durationMs = (t.durationMinutes + 15) * 60 * 1000;
          return diff <= 15 * 60 * 1000 && Date.now() < schedMs + durationMs;
        });

        if (!upcomingAlertTest) return null;

        return (
          <UpcomingTestAlertBanner
            roomCode={room.roomCode}
            roomName={room.name}
            test={upcomingAlertTest}
          />
        );
      })()}

      {/* Multi-Test Performance Variation Trajectory Graph */}
      <RoomMultiTestTrendChart
        trajectoryTests={room.trajectoryTests}
        studentTrajectories={room.studentTrajectories}
      />

      {/* Tests Roster */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck2 className="h-4.5 w-4.5 text-emerald-500" />
            <h3 className="text-lg font-bold text-black dark:text-zinc-50">
              Room Mock Tests ({room.tests.length})
            </h3>
          </div>

          {room.isHost && (
            <button
              type="button"
              onClick={() => setIsCreateTestOpen(true)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              <Plus className="h-3.5 w-3.5" />
              Schedule Another Test
            </button>
          )}
        </div>

        {room.tests.length === 0 ? (
          room.isHost ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-black/[.08] bg-white p-10 text-center shadow-xs dark:border-white/[.1] dark:bg-zinc-950">
              <Layers className="h-7 w-7 text-zinc-400" />
              <div>
                <h4 className="text-base font-bold text-black dark:text-zinc-100">
                  No Tests Scheduled Yet
                </h4>
                <p className="mt-1 max-w-md text-xs text-zinc-500 dark:text-zinc-400">
                  Upload your chapter notes, textbook PDF, or formulas to schedule the first 3-hour mock test for your group.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateTestOpen(true)}
                className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-black px-4 py-2.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                <Plus className="h-3.5 w-3.5" />
                Schedule First Mock Test
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-black/[.08] bg-white p-10 text-center shadow-xs dark:border-white/[.1] dark:bg-zinc-950">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                <CalendarClock className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-black dark:text-zinc-100">
                  No Upcoming Test
                </h4>
                <p className="mt-1 max-w-md text-xs text-zinc-500 dark:text-zinc-400">
                  Your room host, <strong>{room.hostName}</strong>, has not scheduled a mock test yet. As soon as a test is created, it will appear here with the countdown timer!
                </p>
              </div>
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {room.tests.map((test) => (
              <RoomTestCard
                key={test.roomExamId}
                test={test}
                roomCode={room.roomCode}
              />
            ))}
          </div>
        )}
      </div>

      {/* Member Roster Card */}
      <div className="rounded-2xl border border-black/[.08] bg-white p-6 shadow-sm dark:border-white/[.1] dark:bg-zinc-950">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-4.5 w-4.5 text-blue-500" />
          <h3 className="text-base font-bold text-black dark:text-zinc-50">
            Room Members ({room.members.length})
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {room.members.map((m) => (
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
                  {m.name}
                  {m.isHost && <Crown className="h-3 w-3 text-amber-500 shrink-0" />}
                </p>
                <p className="text-[10px] text-zinc-400" suppressHydrationWarning>
                  Joined {new Date(m.joinedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal to add/schedule test to room */}
      <CreateRoomTestModal
        isOpen={isCreateTestOpen}
        roomId={room.id}
        roomName={room.name}
        onClose={() => setIsCreateTestOpen(false)}
        onTestCreated={() => {
          setIsCreateTestOpen(false);
          router.refresh();
        }}
      />
    </>
  );
}
