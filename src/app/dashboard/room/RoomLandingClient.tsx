"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  Calendar,
  Clock,
  ArrowRight,
  Trophy,
  Crown,
  LogIn,
  Layers,
} from "lucide-react";
import type { UserRoomSummary } from "@/lib/roomActions";
import JoinRoomModal from "@/components/room/JoinRoomModal";

interface RoomLandingClientProps {
  hostedRooms: UserRoomSummary[];
  joinedRooms: UserRoomSummary[];
}

function RoomCard({ room }: { room: UserRoomSummary }) {
  const isCompleted = room.status === "COMPLETED";
  const isInProgress = room.status === "IN_PROGRESS";

  let statusBadge = (
    <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
      Scheduled
    </span>
  );

  if (isInProgress) {
    statusBadge = (
      <span className="flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Live Now
      </span>
    );
  } else if (isCompleted) {
    statusBadge = (
      <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
        Completed
      </span>
    );
  }

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-black/[.08] bg-white p-5 shadow-xs transition-all hover:border-black/[.2] hover:shadow-md dark:border-white/[.1] dark:bg-zinc-950 dark:hover:border-white/[.25]">
      <div>
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-lg border border-black/[.1] bg-zinc-50 px-2.5 py-1 font-mono text-xs font-bold text-black dark:border-white/[.15] dark:bg-zinc-900 dark:text-white">
            {room.roomCode}
          </span>
          {statusBadge}
        </div>

        <h3 className="mt-3 text-base font-bold text-black dark:text-zinc-50 line-clamp-2">
          {room.title}
        </h3>

        <div className="mt-4 flex flex-col gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {new Date(room.scheduledAt).toLocaleDateString([], {
                month: "short",
                day: "numeric",
              })}{" "}
              at{" "}
              {new Date(room.scheduledAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <div className="flex items-center justify-between mt-1 pt-2 border-t border-black/[.04] dark:border-white/[.05] text-[11px]">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {room.participantCount} Participant{room.participantCount > 1 ? "s" : ""}
            </span>
            <span>{room.questionCount} Questions ({room.durationMinutes}m)</span>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-black/[.06] dark:border-white/[.08] flex items-center justify-between">
        {room.isHost ? (
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            <Crown className="h-3 w-3" /> You are Host
          </span>
        ) : (
          <span className="text-[10px] text-zinc-400">
            Host: <strong>{room.hostName}</strong>
          </span>
        )}

        <Link
          href={`/dashboard/room/${room.roomCode}`}
          className="inline-flex items-center gap-1 rounded-xl bg-black px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {isCompleted ? "Leaderboard" : "Enter Room"}
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

export default function RoomLandingClient({
  hostedRooms,
  joinedRooms,
}: RoomLandingClientProps) {
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "hosted" | "joined">("all");

  const allRooms = [...hostedRooms, ...joinedRooms].filter(
    (room, index, self) => index === self.findIndex((r) => r.id === room.id)
  );

  const displayedRooms =
    activeTab === "hosted"
      ? hostedRooms
      : activeTab === "joined"
      ? joinedRooms
      : allRooms;

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-blue-700 dark:bg-blue-950 dark:text-blue-300 mb-1.5">
            <Users className="h-3.5 w-3.5" />
            Group Practice
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-black dark:text-zinc-50">
            Group Test Rooms
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Schedule shared mock tests from your study notes, invite friends, and compete on private room leaderboards.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsJoinOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-black/[.15] bg-white px-4 py-2.5 text-xs font-bold text-black shadow-2xs hover:bg-zinc-50 dark:border-white/[.2] dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800 transition-colors"
          >
            <LogIn className="h-4 w-4" />
            Join Room
          </button>

          <Link
            href="/dashboard/room/create"
            className="flex items-center gap-1.5 rounded-xl bg-black px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            <Plus className="h-4 w-4" />
            Create Room
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-black/[.06] pb-2 dark:border-white/[.08]">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
            activeTab === "all"
              ? "bg-black text-white dark:bg-white dark:text-black"
              : "text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white"
          }`}
        >
          All Rooms ({allRooms.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("hosted")}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
            activeTab === "hosted"
              ? "bg-black text-white dark:bg-white dark:text-black"
              : "text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white"
          }`}
        >
          Hosted by Me ({hostedRooms.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("joined")}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
            activeTab === "joined"
              ? "bg-black text-white dark:bg-white dark:text-black"
              : "text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white"
          }`}
        >
          Joined Rooms ({joinedRooms.length})
        </button>
      </div>

      {/* Rooms Grid */}
      {displayedRooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-black/[.08] bg-white p-12 text-center shadow-xs dark:border-white/[.1] dark:bg-zinc-950">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900">
            <Layers className="h-7 w-7 text-zinc-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-black dark:text-zinc-50">
              No Test Rooms Found
            </h3>
            <p className="mt-1 max-w-sm text-xs text-zinc-500 dark:text-zinc-400">
              Create a group mock test from chapter notes or join a room code shared by your study partner.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsJoinOpen(true)}
              className="rounded-xl border border-black/[.15] bg-white px-4 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 dark:border-white/[.2] dark:bg-zinc-900 dark:text-zinc-200"
            >
              Enter Code
            </button>
            <Link
              href="/dashboard/room/create"
              className="rounded-xl bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Create First Room
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedRooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}

      {/* Join Modal */}
      <JoinRoomModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
      />
    </>
  );
}
