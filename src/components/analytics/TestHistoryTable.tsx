"use client";

import Link from "next/link";
import { Eye, Calendar } from "lucide-react";
import type { TestAttemptTrend } from "@/lib/analyticsData";

interface Props {
  trends: TestAttemptTrend[];
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function TestHistoryTable({ trends }: Props) {
  // Show most recent first in table
  const reversed = [...trends].reverse();

  if (reversed.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-black/[.08] bg-white shadow-sm dark:border-white/[.1] dark:bg-zinc-950 overflow-hidden">
      <div className="border-b border-black/[.08] px-6 py-4 dark:border-white/[.1]">
        <h3 className="text-base font-bold text-black dark:text-zinc-50">
          Completed Mock Test Breakdown
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          History of all test attempts with points breakdown and solution reviews
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-50 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:bg-zinc-900">
            <tr>
              <th className="px-6 py-3">Mock Test</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">NEET Score</th>
              <th className="px-4 py-3">Accuracy</th>
              <th className="px-4 py-3">Breakdown (+4 / -1 / 0)</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[.05] dark:divide-white/[.05]">
            {reversed.map((t) => (
              <tr
                key={t.id}
                className="hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40 transition-colors"
              >
                <td className="px-6 py-4 font-semibold text-black dark:text-zinc-50 max-w-[200px] truncate">
                  {t.title}
                </td>
                <td className="px-4 py-4 text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(t.date)}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span
                    className={`font-bold text-sm ${
                      t.score >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-500"
                    }`}
                  >
                    {t.score > 0 ? `+${t.score}` : t.score}
                  </span>
                  <span className="text-zinc-400 font-normal"> / {t.maxScore}</span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap font-semibold text-black dark:text-zinc-50">
                  {t.accuracy}%
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-bold text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                      +{t.correct}
                    </span>
                    <span className="rounded-md bg-red-50 px-2 py-0.5 font-bold text-red-600 dark:bg-red-950/60 dark:text-red-400">
                      -{t.incorrect}
                    </span>
                    <span className="rounded-md bg-zinc-100 px-2 py-0.5 font-bold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                      {t.unattempted} blank
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <Link
                    href={`/dashboard/attempt/${t.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-black/[.15] bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-zinc-100 dark:border-white/[.2] dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Review
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
