"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Plus, Loader2, AlertCircle } from "lucide-react";
import { createStudyRoom } from "@/lib/roomActions";

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateRoomModal({
  isOpen,
  onClose,
}: CreateRoomModalProps) {
  const router = useRouter();
  const [roomName, setRoomName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!roomName.trim()) {
      setError("Please enter a room name.");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await createStudyRoom(roomName.trim());
    setLoading(false);

    if (res.success && res.roomCode) {
      onClose();
      router.push(`/dashboard/room/${res.roomCode}`);
    } else {
      setError(res.error || "Failed to create study room.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl border border-black/[.08] bg-white p-6 shadow-2xl dark:border-white/[.1] dark:bg-zinc-950 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-black dark:text-zinc-50">
              Create Study Room
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Create a permanent room for your study group.
            </p>
          </div>
        </div>

        <form onSubmit={handleCreate} className="mt-5 flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 block mb-1.5">
              Room Name
            </label>
            <input
              type="text"
              placeholder="e.g. Toppers 2026 NEET Circle"
              value={roomName}
              onChange={(e) => {
                setRoomName(e.target.value);
                setError(null);
              }}
              maxLength={60}
              className="w-full rounded-xl border border-black/[.12] bg-zinc-50/70 px-4 py-3 text-sm font-medium text-black focus:border-black focus:bg-white focus:outline-none dark:border-white/[.15] dark:bg-zinc-900 dark:text-white dark:focus:border-white"
              required
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-50/80 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="mt-2 flex justify-end gap-3 border-t border-black/[.06] pt-4 dark:border-white/[.08]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-black/[.1] px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-white/[.15] dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-black px-6 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  Create Room
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
