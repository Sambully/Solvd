"use client";

import { Trophy, Medal, Clock, Check, X, Minus } from "lucide-react";
import type { LeaderboardEntry } from "@/lib/roomActions";

interface RoomLeaderboardTableProps {
  leaderboard: LeaderboardEntry[];
  maxScore: number;
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export default function RoomLeaderboardTable({
  leaderboard,
  maxScore,
}: RoomLeaderboardTableProps) {
  return (
    <div className="rounded-2xl border border-black/[.08] bg-white p-5 shadow-sm dark:border-white/[.1] dark:bg-zinc-950 sm:p-6">
      <div className="flex items-center justify-between border-b border-black/[.06] pb-4 dark:border-white/[.08]">
        <div>
          <h3 className="text-base font-bold text-black dark:text-zinc-50">
            Ranked Room Leaderboard
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Final standings based on NEET scores and test submission speed.
          </p>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-black/[.06] text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:border-white/[.08]">
              <th className="py-3 px-3">Rank</th>
              <th className="py-3 px-3">Participant</th>
              <th className="py-3 px-3">NEET Score</th>
              <th className="py-3 px-3">Accuracy</th>
              <th className="py-3 px-3">Breakdown (+4 / -1 / 0)</th>
              <th className="py-3 px-3 text-right">Time Taken</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[.04] dark:divide-white/[.04]">
            {leaderboard.map((entry) => {
              const isWinner = entry.rank === 1;
              const isSecond = entry.rank === 2;
              const isThird = entry.rank === 3;

              let rankBadge = (
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-100 font-mono font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  {entry.rank}
                </span>
              );

              if (isWinner) {
                rankBadge = (
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-100 text-amber-800 shadow-2xs dark:bg-amber-950 dark:text-amber-300">
                    <Trophy className="h-3.5 w-3.5" />
                  </span>
                );
              } else if (isSecond) {
                rankBadge = (
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                    <Medal className="h-3.5 w-3.5" />
                  </span>
                );
              } else if (isThird) {
                rankBadge = (
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-700/20 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
                    <Medal className="h-3.5 w-3.5" />
                  </span>
                );
              }

              return (
                <tr
                  key={entry.userId}
                  className={`transition-colors ${
                    entry.isCurrentUser
                      ? "bg-blue-50/50 dark:bg-blue-950/20 font-medium"
                      : "hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40"
                  }`}
                >
                  <td className="py-3 px-3">{rankBadge}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-black dark:text-zinc-100">
                        {entry.name}
                      </span>
                      {entry.isCurrentUser && (
                        <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          You
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-mono font-extrabold text-sm text-black dark:text-zinc-50">
                      {entry.score > 0 ? `+${entry.score}` : entry.score}
                    </span>
                    <span className="text-zinc-400 text-[10px]"> / {maxScore}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {entry.accuracy}%
                    </span>
                    <span className="text-zinc-400 text-[10px] block">
                      {entry.percentage}% total
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className="text-emerald-600 flex items-center gap-0.5" title="Correct">
                        <Check className="h-3 w-3" />
                        {entry.correct}
                      </span>
                      <span className="text-red-600 flex items-center gap-0.5" title="Incorrect">
                        <X className="h-3 w-3" />
                        {entry.incorrect}
                      </span>
                      <span className="text-zinc-400 flex items-center gap-0.5" title="Skipped">
                        <Minus className="h-3 w-3" />
                        {entry.unattempted}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-zinc-600 dark:text-zinc-400">
                    <div className="flex items-center justify-end gap-1">
                      <Clock className="h-3 w-3 text-zinc-400" />
                      {formatDuration(entry.timeSpentSeconds)}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
