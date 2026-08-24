"use client";

import { ShieldCheck, Zap, Flame } from "lucide-react";
import type { DifficultyStats } from "@/lib/analyticsData";

interface Props {
  breakdown: {
    easy: DifficultyStats;
    medium: DifficultyStats;
    hard: DifficultyStats;
  };
}

function getMasteryBadge(accuracy: number, total: number) {
  if (total === 0) return { label: "No Data", color: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400" };
  if (accuracy >= 80) return { label: "Mastered", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400" };
  if (accuracy >= 60) return { label: "Strong", color: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400" };
  return { label: "Needs Practice", color: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400" };
}

export default function DifficultyMasteryCards({ breakdown }: Props) {
  const tiers = [
    {
      name: "Foundation (Easy)",
      desc: "NCERT direct & recall questions",
      icon: ShieldCheck,
      iconColor: "text-emerald-500",
      stats: breakdown.easy,
      barColor: "bg-emerald-500",
    },
    {
      name: "NEET Standard (Medium)",
      desc: "Conceptual & multi-statement MCQs",
      icon: Zap,
      iconColor: "text-blue-500",
      stats: breakdown.medium,
      barColor: "bg-blue-500",
    },
    {
      name: "Rank Booster (Hard)",
      desc: "Complex numericals & assertion-reasoning",
      icon: Flame,
      iconColor: "text-rose-500",
      stats: breakdown.hard,
      barColor: "bg-rose-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {tiers.map((tier) => {
        const Icon = tier.icon;
        const badge = getMasteryBadge(tier.stats.accuracy, tier.stats.total);

        return (
          <div
            key={tier.name}
            className="flex flex-col justify-between rounded-2xl border border-black/[.08] bg-white p-5 shadow-sm dark:border-white/[.1] dark:bg-zinc-950"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${tier.iconColor}`} />
                  <span className="text-xs font-bold uppercase tracking-wider text-black dark:text-zinc-50">
                    {tier.name}
                  </span>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${badge.color}`}>
                  {badge.label}
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-400">{tier.desc}</p>
            </div>

            <div className="mt-4">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-2xl font-extrabold text-black dark:text-zinc-50">
                    {tier.stats.accuracy}%
                  </span>
                  <span className="text-xs text-zinc-400 ml-1">accuracy</span>
                </div>
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {tier.stats.correct} / {tier.stats.total} Solved
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${tier.barColor}`}
                  style={{ width: `${tier.stats.accuracy}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
