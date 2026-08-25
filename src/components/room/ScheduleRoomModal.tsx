"use client";

import { useState, useEffect } from "react";
import { Clock, Calendar, Globe, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { createRoom } from "@/lib/roomActions";

interface ScheduleRoomModalProps {
  isOpen: boolean;
  examId: string;
  examTitle: string;
  durationMinutes: number;
  onRoomCreated: (roomCode: string) => void;
  onCancel: () => void;
}

export default function ScheduleRoomModal({
  isOpen,
  examId,
  examTitle,
  durationMinutes,
  onRoomCreated,
  onCancel,
}: ScheduleRoomModalProps) {
  const [timeZone, setTimeZone] = useState("UTC");
  const [scheduledDateTime, setScheduledDateTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      setTimeZone(tz);

      // Default start time: 10 minutes from now, formatted for datetime-local input
      const start = new Date(Date.now() + 10 * 60 * 1000);
      const localISO = new Date(start.getTime() - start.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setScheduledDateTime(localISO);
    } catch {
      // Fallback
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleConfirmSchedule(e: React.FormEvent) {
    e.preventDefault();
    if (!scheduledDateTime) {
      setError("Please choose a date and start time for the room test.");
      return;
    }

    const selectedDate = new Date(scheduledDateTime);
    if (selectedDate.getTime() <= Date.now() - 60000) {
      setError("Please select a time in the future.");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await createRoom(examId, selectedDate.toISOString());
    setLoading(false);

    if (res.success && res.roomCode) {
      onRoomCreated(res.roomCode);
    } else {
      setError(res.error || "Failed to schedule test room.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl border border-black/[.08] bg-white p-6 shadow-2xl dark:border-white/[.1] dark:bg-zinc-950 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-black dark:text-zinc-50">
              Schedule Group Test Room
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
              {examTitle}
            </p>
          </div>
        </div>

        <form onSubmit={handleConfirmSchedule} className="mt-6 flex flex-col gap-4">
          {/* Time Picker */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 block mb-2">
              Select Start Date & Time
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                value={scheduledDateTime}
                onChange={(e) => {
                  setScheduledDateTime(e.target.value);
                  setError(null);
                }}
                className="w-full rounded-xl border border-black/[.12] bg-zinc-50/70 px-4 py-3 text-sm font-medium text-black focus:border-black focus:bg-white focus:outline-none dark:border-white/[.15] dark:bg-zinc-900 dark:text-white dark:focus:border-white"
                required
              />
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-400">
              <Globe className="h-3.5 w-3.5" />
              <span>Timezone: <strong>{timeZone}</strong> (Auto-converted for all participants)</span>
            </div>
          </div>

          {/* Test Duration & Info Card */}
          <div className="rounded-xl border border-black/[.08] bg-zinc-50/60 p-3.5 dark:border-white/[.08] dark:bg-zinc-900/40 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
              <Clock className="h-4 w-4 text-blue-500" />
              <span>Test Duration:</span>
            </div>
            <span className="font-bold text-black dark:text-zinc-100">
              {durationMinutes} Minutes (NEET Calibrated)
            </span>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-50/80 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="mt-4 flex justify-end gap-3 border-t border-black/[.06] pt-4 dark:border-white/[.08]">
            <button
              type="button"
              onClick={onCancel}
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
                  Creating Room…
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  Confirm & Create Room
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
