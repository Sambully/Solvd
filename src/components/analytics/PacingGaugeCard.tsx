"use client";

import { Timer, Zap, AlertCircle } from "lucide-react";

interface Props {
  avgTimeSeconds: number;
}

export default function PacingGaugeCard({ avgTimeSeconds }: Props) {
  const targetTime = 54; // NEET ideal speed: 54 seconds per question
  const diff = avgTimeSeconds - targetTime;

  let speedStatus = {
    title: "Optimal NEET Pace",
    desc: "Great time management! Keep maintaining this balance of speed and precision.",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500",
  };

  if (avgTimeSeconds === 0) {
    speedStatus = {
      title: "No Data",
      desc: "Complete an exam to calibrate your question pacing.",
      color: "text-zinc-500",
      bg: "bg-zinc-400",
    };
  } else if (diff > 15) {
    speedStatus = {
      title: "Taking Too Long",
      desc: "Spending over 1 minute per question. Practice quick option elimination to avoid rushing at the end.",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500",
    };
  } else if (diff < -25) {
    speedStatus = {
      title: "Rushing Through",
      desc: "Answering unusually fast. Ensure you carefully read questions to avoid silly misread mistakes.",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500",
    };
  }

  // Gauge bar clamped from 0 to 100 seconds
  const gaugePercent = Math.min(100, Math.round((avgTimeSeconds / 100) * 100));

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-black/[.08] bg-white p-6 shadow-sm dark:border-white/[.1] dark:bg-zinc-950">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-black dark:text-zinc-50" />
            <h3 className="text-base font-bold text-black dark:text-zinc-50">
              Pacing & Speed Metric
            </h3>
          </div>
          <span className="text-xs font-semibold text-zinc-400">
            Target: ~54s / Q
          </span>
        </div>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Average duration spent answering each question
        </p>
      </div>

      <div className="my-5">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-black dark:text-zinc-50">
            {avgTimeSeconds}s
          </span>
          <span className="text-xs font-medium text-zinc-400">per question</span>
        </div>

        {/* Speed Bar */}
        <div className="mt-3 relative h-3 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${speedStatus.bg}`}
            style={{ width: `${gaugePercent}%` }}
          />
        </div>

        <div className="mt-1.5 flex justify-between text-[10px] font-medium text-zinc-400">
          <span>Fast (20s)</span>
          <span className="text-black dark:text-white font-bold">NEET Target (54s)</span>
          <span>Slow (90s+)</span>
        </div>
      </div>

      <div className="rounded-xl border border-black/[.05] bg-zinc-50 p-3 dark:border-white/[.05] dark:bg-zinc-900/60">
        <p className={`text-xs font-bold ${speedStatus.color}`}>
          {speedStatus.title}
        </p>
        <p className="mt-0.5 text-[11px] text-zinc-600 dark:text-zinc-400">
          {speedStatus.desc}
        </p>
      </div>
    </div>
  );
}
