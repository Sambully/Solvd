"use client";

import { Sparkles, Lightbulb } from "lucide-react";

interface Props {
  insights: string[];
  projectedPercentile: string;
}

export default function SmartInsightsCard({
  insights,
  projectedPercentile,
}: Props) {
  return (
    <div className="rounded-2xl border border-black/[.08] bg-white p-6 shadow-sm dark:border-white/[.1] dark:bg-zinc-950">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-black/[.08] pb-4 dark:border-white/[.1]">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/60">
            <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-black dark:text-zinc-50">
              AI Tactical Insights & Strategy
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Personalized exam recommendations to maximize your NEET percentile
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-zinc-100 px-3 py-1.5 dark:bg-zinc-900 w-fit">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Est. Standing:
          </span>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {projectedPercentile}
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {insights.map((insight, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 rounded-xl border border-black/[.05] bg-zinc-50/70 p-4 dark:border-white/[.05] dark:bg-zinc-900/50"
          >
            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Lightbulb className="h-3.5 w-3.5" />
            </div>
            <p className="text-xs leading-relaxed text-zinc-700 dark:text-zinc-300 font-medium">
              {insight}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
