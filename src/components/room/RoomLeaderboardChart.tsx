"use client";

import { useMemo } from "react";
import type { LeaderboardEntry } from "@/lib/roomActions";

interface RoomLeaderboardChartProps {
  leaderboard: LeaderboardEntry[];
  maxScore: number;
}

export default function RoomLeaderboardChart({
  leaderboard,
  maxScore,
}: RoomLeaderboardChartProps) {
  const chartData = useMemo(() => {
    return leaderboard.slice(0, 10); // Top 10 for bar chart
  }, [leaderboard]);

  if (chartData.length === 0) return null;

  const svgWidth = 640;
  const barHeight = 36;
  const rowGap = 16;
  const paddingLeft = 110;
  const paddingRight = 80;
  const availableWidth = svgWidth - paddingLeft - paddingRight;
  const svgHeight = chartData.length * (barHeight + rowGap) + 30;

  return (
    <div className="rounded-2xl border border-black/[.08] bg-white p-5 shadow-sm dark:border-white/[.1] dark:bg-zinc-950 sm:p-6">
      <div className="flex items-center justify-between border-b border-black/[.06] pb-3 dark:border-white/[.08]">
        <div>
          <h3 className="text-sm font-bold text-black dark:text-zinc-50">
            Room Score Comparison
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Comparative NEET scores across room participants (Max: {maxScore} Marks)
          </p>
        </div>
      </div>

      <div className="mt-4 w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto min-w-[500px]"
        >
          {chartData.map((entry, idx) => {
            const y = idx * (barHeight + rowGap) + 15;
            const clampedScore = Math.max(0, entry.score);
            const barWidth = maxScore > 0 ? (clampedScore / maxScore) * availableWidth : 0;
            const isWinner = entry.rank === 1;

            return (
              <g key={entry.userId} className="transition-all duration-300">
                {/* Participant Name on Y-axis */}
                <text
                  x={paddingLeft - 12}
                  y={y + barHeight / 2 + 4}
                  textAnchor="end"
                  className={`text-[12px] font-bold ${
                    entry.isCurrentUser
                      ? "fill-blue-600 dark:fill-blue-400"
                      : isWinner
                      ? "fill-amber-600 dark:fill-amber-400"
                      : "fill-zinc-700 dark:fill-zinc-300"
                  }`}
                >
                  #{entry.rank} {entry.name.slice(0, 10)}
                  {entry.isCurrentUser ? " (You)" : ""}
                </text>

                {/* Background Bar Track */}
                <rect
                  x={paddingLeft}
                  y={y}
                  width={availableWidth}
                  height={barHeight}
                  rx={8}
                  className="fill-zinc-100 dark:fill-zinc-900"
                />

                {/* Score Bar */}
                <rect
                  x={paddingLeft}
                  y={y}
                  width={Math.max(barWidth, 6)}
                  height={barHeight}
                  rx={8}
                  className={`${
                    entry.isCurrentUser
                      ? "fill-blue-600 dark:fill-blue-500"
                      : isWinner
                      ? "fill-amber-500 dark:fill-amber-400"
                      : "fill-zinc-800 dark:fill-zinc-200"
                  }`}
                />

                {/* Score & Accuracy Label */}
                <text
                  x={paddingLeft + Math.max(barWidth, 6) + 10}
                  y={y + barHeight / 2 + 4}
                  textAnchor="start"
                  className="text-[12px] font-extrabold font-mono fill-black dark:fill-zinc-100"
                >
                  {entry.score > 0 ? `+${entry.score}` : entry.score}
                  <tspan className="text-[10px] font-normal fill-zinc-400 font-sans">
                    {" "}({entry.percentage}%)
                  </tspan>
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
