"use client";

import { Clock, Sparkles, Cloud, CloudOff, Loader2 } from "lucide-react";
import type { ExamInterfaceMode } from "@/lib/ntaTypes";

interface Props {
  examTitle: string;
  timeLeft: number;
  mode: ExamInterfaceMode;
  onToggleMode: () => void;
  fontSize: "sm" | "base" | "lg";
  onChangeFontSize: (size: "sm" | "base" | "lg") => void;
  saveState?: "idle" | "saving" | "saved" | "error";
}

function formatTime(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h.toString().padStart(2, "0")}:${m
    .toString()
    .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function NTAHeader({
  examTitle,
  timeLeft,
  mode,
  onToggleMode,
  fontSize,
  onChangeFontSize,
  saveState = "idle",
}: Props) {
  const isLowTime = timeLeft <= 300; // 5 min warning

  return (
    <header className="border-b border-zinc-300 bg-[#f8fafc] text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 select-none shadow-xs">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-b border-zinc-200 px-4 py-2 text-xs dark:border-zinc-800 bg-[#0f172a] text-white">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold tracking-wider uppercase text-amber-400 text-[11px] sm:text-xs">
            <span className="rounded bg-amber-500/20 px-1.5 py-0.5 border border-amber-400/30">
              NTA CBT SIMULATOR
            </span>
            <span>NATIONAL TESTING AGENCY</span>
          </div>
          <span className="text-zinc-500 hidden sm:inline">|</span>
          <span className="text-zinc-300 truncate max-w-[220px] sm:max-w-md font-medium">
            {examTitle}
          </span>
        </div>

        {/* Live Interface Mode Switcher Button */}
        <button
          onClick={onToggleMode}
          className="mt-1.5 sm:mt-0 flex items-center gap-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 px-3 py-1 text-[11px] font-semibold text-white transition-all shadow-xs"
          title="Switch between Official NTA Software and Modern Solvd UI"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
          Switch to Modern UI
        </button>
      </div>

      {/* Main Controls Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-white dark:bg-zinc-900">
        {/* Left: Language & Zoom Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              View In:
            </label>
            <select className="rounded border border-zinc-300 bg-zinc-50 px-2 py-1 text-xs font-medium text-black focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">
              <option value="en">English</option>
              <option value="hi">Hindi (हिंदी)</option>
            </select>
          </div>

          <div className="hidden sm:flex items-center gap-1 border-l border-zinc-200 pl-3 dark:border-zinc-800">
            <span className="text-xs text-zinc-500 mr-1">Font Size:</span>
            <button
              onClick={() => onChangeFontSize("sm")}
              className={`rounded px-2 py-0.5 text-xs font-bold ${
                fontSize === "sm"
                  ? "bg-zinc-800 text-white dark:bg-white dark:text-black"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              A-
            </button>
            <button
              onClick={() => onChangeFontSize("base")}
              className={`rounded px-2 py-0.5 text-xs font-bold ${
                fontSize === "base"
                  ? "bg-zinc-800 text-white dark:bg-white dark:text-black"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              A
            </button>
            <button
              onClick={() => onChangeFontSize("lg")}
              className={`rounded px-2 py-0.5 text-xs font-bold ${
                fontSize === "lg"
                  ? "bg-zinc-800 text-white dark:bg-white dark:text-black"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              A+
            </button>
          </div>
        </div>

        {/* Right: Sync Status + Authentic NTA Countdown Timer */}
        <div className="flex items-center gap-2.5">
          {saveState !== "idle" && (
            <span
              className={`hidden sm:inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold border ${
                saveState === "saving"
                  ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300"
                  : saveState === "error"
                  ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
              }`}
            >
              {saveState === "saving" ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Saving…</span>
                </>
              ) : saveState === "error" ? (
                <>
                  <CloudOff className="h-3 w-3" />
                  <span>Retrying sync…</span>
                </>
              ) : (
                <>
                  <Cloud className="h-3 w-3" />
                  <span>Saved</span>
                </>
              )}
            </span>
          )}

          <div
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-bold tracking-widest tabular-nums border ${
              isLowTime
                ? "border-red-500 bg-red-50 text-red-600 animate-pulse dark:bg-red-950/60 dark:text-red-400"
                : "border-zinc-300 bg-zinc-100 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            }`}
          >
            <Clock className="h-4 w-4 text-zinc-500" />
            <span>Time Left :</span>
            <span className="font-mono text-base">{formatTime(timeLeft)}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
