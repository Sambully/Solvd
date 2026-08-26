"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  Users,
  Copy,
  Check,
  Share2,
  Trash2,
  Calendar,
  AlertCircle,
  Crown,
  Play,
} from "lucide-react";
import {
  type RoomStateResponse,
  removeParticipant,
  getRoomState,
} from "@/lib/roomActions";

interface RoomWaitingLobbyProps {
  initialState: NonNullable<RoomStateResponse["room"]>;
  onStartExam: () => void;
}

function formatCountdown(targetDate: Date) {
  const diff = Math.max(0, Math.floor((new Date(targetDate).getTime() - Date.now()) / 1000));
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;

  if (diff === 0) return "00:00:00";
  return `${h.toString().padStart(2, "0")}:${m
    .toString()
    .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function RoomWaitingLobby({
  initialState,
  onStartExam,
}: RoomWaitingLobbyProps) {
  const [room, setRoom] = useState(initialState);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(() => formatCountdown(room.scheduledAt));
  const [isReadyToStart, setIsReadyToStart] = useState(() => {
    return Date.now() >= new Date(room.scheduledAt).getTime();
  });

  // Polling for live participant updates every 5 seconds
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      const res = await getRoomState(room.roomCode);
      if (res.success && res.room) {
        setRoom(res.room);
        if (res.room.isStarted) {
          setIsReadyToStart(true);
        }
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [room.roomCode]);

  // Countdown timer tick every 1 second
  useEffect(() => {
    const timer = setInterval(() => {
      const ready = Date.now() >= new Date(room.scheduledAt).getTime();
      setIsReadyToStart(ready);
      setCountdown(formatCountdown(room.scheduledAt));
    }, 1000);

    return () => clearInterval(timer);
  }, [room.scheduledAt]);

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/dashboard/room/${room.roomCode}`
    : `https://solvd.app/dashboard/room/${room.roomCode}`;

  const shareText = `Join my NEET CBT mock test on Solvd! Room Code: ${room.roomCode} — Starts at ${new Date(room.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Join here: ${shareUrl}`;

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

  async function handleRemoveParticipant(userId: string) {
    if (!confirm("Are you sure you want to remove this participant from the room?")) return;
    setRemovingId(userId);
    await removeParticipant(room.id, userId);
    setRemovingId(null);
    const res = await getRoomState(room.roomCode);
    if (res.success && res.room) {
      setRoom(res.room);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6 sm:p-8">
      {/* Top Banner Card */}
      <div className="rounded-2xl border border-black/[.08] bg-white p-6 shadow-sm dark:border-white/[.1] dark:bg-zinc-950 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
              <Users className="h-3.5 w-3.5" />
              Group Test Room Lobby
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-black dark:text-zinc-50">
              {room.title}
            </h1>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Hosted by <strong className="text-black dark:text-zinc-200">{room.hostName}</strong> · {room.questionCount} MCQs · {room.durationMinutes} Minutes
            </p>
          </div>

          {/* Room Code Card */}
          <div className="flex flex-col items-start sm:items-end gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Room Code
            </span>
            <div className="flex items-center gap-2">
              <span className="rounded-xl border border-black/[.1] bg-zinc-50 px-3.5 py-1.5 font-mono text-xl font-extrabold tracking-widest text-black dark:border-white/[.15] dark:bg-zinc-900 dark:text-white">
                {room.roomCode}
              </span>
              <button
                type="button"
                onClick={copyCode}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/[.1] bg-white text-zinc-700 hover:bg-zinc-50 dark:border-white/[.15] dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
                title="Copy Room Code"
              >
                {copiedCode ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Start Countdown Alert */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-blue-500/20 bg-blue-50/50 p-4 dark:border-blue-500/30 dark:bg-blue-950/30">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-900 dark:text-blue-200">
                {isReadyToStart ? "The scheduled start time has arrived!" : "Test starts in:"}
              </p>
              <p className="font-mono text-2xl font-black tracking-tight text-blue-950 dark:text-blue-100">
                {isReadyToStart ? "LIVE NOW" : countdown}
              </p>
            </div>
          </div>

          {isReadyToStart ? (
            <button
              type="button"
              onClick={onStartExam}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-500 transition-all"
            >
              <Play className="h-4 w-4 fill-white" />
              Enter Test Now
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              <Calendar className="h-4 w-4" />
              Scheduled for {new Date(room.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>

        {/* Sharing Bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-black/[.06] pt-4 dark:border-white/[.08]">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Share with your NEET study group:
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex items-center gap-1.5 rounded-lg border border-black/[.1] bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-white/[.15] dark:bg-zinc-900 dark:text-zinc-200"
            >
              {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedLink ? "Link Copied" : "Copy Link"}
            </button>

            <button
              type="button"
              onClick={shareWhatsApp}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#20bd5a] transition-colors"
            >
              <Share2 className="h-3.5 w-3.5" />
              Share to WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* Joined Participants Grid */}
      <div className="rounded-2xl border border-black/[.08] bg-white p-6 shadow-sm dark:border-white/[.1] dark:bg-zinc-950">
        <div className="flex items-center justify-between border-b border-black/[.06] pb-4 dark:border-white/[.08]">
          <div>
            <h2 className="text-base font-bold text-black dark:text-zinc-50">
              Joined Participants ({room.participants.length})
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Live updates every few seconds as friends join.
            </p>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Lobby Active
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(room.participants as any[]).map((p: any) => {
            const isMe = p.userId === room.currentUserId;
            return (
              <div
                key={p.userId}
                className="flex items-center justify-between rounded-xl border border-black/[.06] bg-zinc-50/70 p-3 dark:border-white/[.08] dark:bg-zinc-900/50"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-xs font-bold text-white dark:bg-white dark:text-black">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-xs font-bold text-black dark:text-zinc-100">
                        {p.name}
                      </p>
                      {p.isHost && (
                        <span className="flex items-center gap-0.5 rounded bg-amber-100 px-1 py-0.2 text-[9px] font-extrabold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          <Crown className="h-2.5 w-2.5" /> Host
                        </span>
                      )}
                      {isMe && !p.isHost && (
                        <span className="rounded bg-zinc-200 px-1 py-0.2 text-[9px] font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-400 truncate">
                      Joined {new Date(p.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                {room.isHost && !p.isHost && (
                  <button
                    type="button"
                    onClick={() => handleRemoveParticipant(p.userId)}
                    disabled={removingId === p.userId}
                    className="ml-2 rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors"
                    title="Remove participant"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
