"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Users, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { joinRoom } from "@/lib/roomActions";

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function JoinRoomModal({ isOpen, onClose }: JoinRoomModalProps) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const clean = code.trim().toUpperCase();
    if (!clean) {
      setError("Please enter a room code (e.g., SLV-4X9K).");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await joinRoom(clean);
    setLoading(false);

    if (res.success && res.roomCode) {
      onClose();
      router.push(`/dashboard/room/${res.roomCode}`);
    } else {
      setError(res.error || "Failed to join room.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl border border-black/[.08] bg-white p-6 shadow-2xl dark:border-white/[.1] dark:bg-zinc-950">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <Users className="h-4.5 w-4.5" />
            </div>
            <h3 className="text-lg font-bold text-black dark:text-zinc-50">
              Join Group Test Room
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-black dark:hover:bg-zinc-800 dark:hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          Enter the 8-character room code shared by your friend to join their scheduled NEET CBT test.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1.5">
              Room Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError(null);
              }}
              placeholder="SLV-4X9K"
              maxLength={12}
              className="w-full rounded-xl border border-black/[.15] bg-zinc-50/60 px-4 py-3 text-center text-lg font-mono font-bold tracking-widest text-black placeholder:text-zinc-400 focus:border-black focus:bg-white focus:outline-none dark:border-white/[.2] dark:bg-zinc-900/60 dark:text-white dark:focus:border-white dark:focus:bg-zinc-900"
              autoFocus
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-50/80 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-black/[.1] px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-white/[.15] dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-40 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Verifying Code…
                </>
              ) : (
                <>
                  Join Room
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
