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
  FileCheck2,
} from "lucide-react";
import type { PersistentRoomSummary } from "@/lib/roomActions";
import JoinRoomModal from "@/components/room/JoinRoomModal";
import CreateRoomModal from "@/components/room/CreateRoomModal";

interface RoomLandingClientProps {
  rooms: PersistentRoomSummary[];
}

function PersistentRoomCard({ room }: { room: PersistentRoomSummary }) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-black/[.08] bg-white p-5 shadow-xs transition-all hover:border-black/[.2] hover:shadow-md dark:border-white/[.1] dark:bg-zinc-950 dark:hover:border-white/[.25]">
      <div>
        <div className="flex items-start justify-between gap-2">
          <span className="rounded-lg border border-black/[.1] bg-zinc-50 px-2.5 py-1 font-mono text-xs font-bold text-black dark:border-white/[.15] dark:bg-zinc-900 dark:text-white">
            {room.roomCode}
          </span>
          {room.isHost ? (
            <span className="flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              <Crown className="h-3 w-3" /> Host
            </span>
          ) : (
            <span className="text-[10px] text-zinc-400">
              Host: <strong>{room.hostName}</strong>
            </span>
          )}
        </div>

        <h3 className="mt-3 text-base font-bold text-black dark:text-zinc-50 line-clamp-1">
          {room.name}
        </h3>

        <div className="mt-4 flex flex-col gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-blue-500" />
              {room.participantCount} Member{room.participantCount > 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-1.5">
              <FileCheck2 className="h-3.5 w-3.5 text-emerald-500" />
              {room.testCount} Test{room.testCount > 1 ? "s" : ""}
            </span>
          </div>

          {room.latestTestTitle ? (
            <p className="mt-2 text-[11px] text-zinc-600 dark:text-zinc-300 truncate bg-zinc-50 dark:bg-zinc-900/60 p-2 rounded-lg border border-black/[.04] dark:border-white/[.04]">
              Latest: <strong className="font-semibold">{room.latestTestTitle}</strong>
            </p>
          ) : (
            <p className="mt-2 text-[11px] text-zinc-400 italic bg-zinc-50/50 dark:bg-zinc-900/30 p-2 rounded-lg">
              No tests created yet. Open room to add one!
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-black/[.06] dark:border-white/[.08] flex items-center justify-between">
        <span className="text-[10px] text-zinc-400 flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          Created {new Date(room.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
        </span>

        <Link
          href={`/dashboard/room/${room.roomCode}`}
          className="inline-flex items-center gap-1.5 rounded-xl bg-black px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          Open Room
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

export default function RoomLandingClient({ rooms }: RoomLandingClientProps) {
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 mb-1.5">
            <Users className="h-3.5 w-3.5" />
            Group Study Rooms
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-black dark:text-zinc-50">
            Study Rooms Hub
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Persistent study circles for you and your friends to schedule multiple mock tests and track group variation on multi-line graphs.
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

          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-black px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            <Plus className="h-4 w-4" />
            Create Study Room
          </button>
        </div>
      </div>

      {/* Rooms Grid */}
      {rooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-black/[.08] bg-white p-12 text-center shadow-xs dark:border-white/[.1] dark:bg-zinc-950">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900">
            <Layers className="h-7 w-7 text-zinc-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-black dark:text-zinc-50">
              No Study Rooms Yet
            </h3>
            <p className="mt-1 max-w-sm text-xs text-zinc-500 dark:text-zinc-400">
              Create a permanent room for your study group or join using a code shared by your friends.
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
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="rounded-xl bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Create Study Room
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <PersistentRoomCard key={room.id} room={room} />
          ))}
        </div>
      )}

      {/* Modals */}
      <JoinRoomModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
      />

      <CreateRoomModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </>
  );
}
