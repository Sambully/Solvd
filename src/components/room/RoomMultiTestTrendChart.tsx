"use client";

import { useState } from "react";
import { TrendingUp, Sparkles } from "lucide-react";
import type { StudentTrajectorySeries } from "@/lib/roomActions";

interface RoomMultiTestTrendChartProps {
  trajectoryTests: Array<{ index: number; title: string; date: string }>;
  studentTrajectories: StudentTrajectorySeries[];
}

export default function RoomMultiTestTrendChart({
  trajectoryTests,
  studentTrajectories,
}: RoomMultiTestTrendChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{
    studentName: string;
    testTitle: string;
    percentage: number;
    score: number;
    maxScore: number;
    color: string;
    x: number;
    y: number;
  } | null>(null);

  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);

  const testCount = trajectoryTests.length;

  const width = 760;
  const height = 300;
  const paddingLeft = 50;
  const paddingRight = 45;
  const paddingTop = 35;
  const paddingBottom = 45;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const getX = (testIndex: number) => {
    if (testCount <= 1) return paddingLeft + chartWidth / 2;
    return paddingLeft + (testIndex / (testCount - 1)) * chartWidth;
  };

  const getY = (percentage: number) => {
    const clamped = Math.max(0, Math.min(100, percentage));
    return paddingTop + chartHeight - (clamped / 100) * chartHeight;
  };

  if (testCount === 0) {
    return (
      <div className="rounded-2xl border border-black/[.08] bg-white p-6 shadow-sm dark:border-white/[.1] dark:bg-zinc-950 sm:p-8">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <TrendingUp className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-black dark:text-zinc-50">
              Group Performance Variation Trajectory
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Multi-test comparative score tracking for all room participants.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-black/[.1] bg-zinc-50/50 p-8 text-center dark:border-white/[.1] dark:bg-zinc-900/30">
          <Sparkles className="h-6 w-6 text-amber-500 animate-pulse" />
          <p className="text-sm font-semibold text-black dark:text-zinc-200">
            No room tests completed yet
          </p>
          <p className="max-w-md text-xs text-zinc-400">
            Create and attempt your first group mock test below. As your study group takes multiple tests, each member will get a unique colored line plotting their score trajectory!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-black/[.08] bg-white p-5 shadow-sm dark:border-white/[.1] dark:bg-zinc-950 sm:p-7">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-black/[.06] pb-4 dark:border-white/[.08]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <TrendingUp className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-black dark:text-zinc-50">
              Group Variation Trajectory ({testCount} Test{testCount > 1 ? "s" : ""})
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Unique colored line per student tracking score % variation across all room exams.
            </p>
          </div>
        </div>

        {testCount === 1 && (
          <span className="rounded-md bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            Take 1 more test to draw full trajectory lines!
          </span>
        )}
      </div>

      <div className="relative mt-5 w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[620px]"
        >
          {[0, 25, 50, 75, 100].map((level) => {
            const y = getY(level);
            return (
              <g key={level}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  className="stroke-zinc-200 dark:stroke-zinc-800"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className="text-[10px] font-mono fill-zinc-400"
                >
                  {level}%
                </text>
              </g>
            );
          })}

          {trajectoryTests.map((t, idx) => {
            const x = getX(idx);
            return (
              <g key={t.index}>
                <line
                  x1={x}
                  y1={paddingTop}
                  x2={x}
                  y2={paddingTop + chartHeight}
                  className="stroke-zinc-200/60 dark:stroke-zinc-800/60"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={height - paddingBottom + 18}
                  textAnchor="middle"
                  className="text-[11px] font-bold fill-black dark:fill-zinc-200"
                >
                  Test {t.index}
                </text>
                <text
                  x={x}
                  y={height - paddingBottom + 30}
                  textAnchor="middle"
                  className="text-[9px] fill-zinc-400"
                >
                  {t.date}
                </text>
              </g>
            );
          })}

          {studentTrajectories.map((series) => {
            const isDimmed = activeStudentId !== null && activeStudentId !== series.userId;
            const isHighlighted = activeStudentId === series.userId;

            const pathPoints = series.points.map((pt, idx) => {
              const x = getX(idx);
              const y = getY(pt.percentage);
              return `${x},${y}`;
            });

            const pathD = `M ${pathPoints.join(" L ")}`;

            return (
              <g
                key={series.userId}
                className="transition-opacity duration-200"
                style={{ opacity: isDimmed ? 0.2 : 1 }}
              >
                {testCount > 1 && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke={series.color.stroke}
                    strokeWidth={isHighlighted || series.isCurrentUser ? "3.5" : "2.5"}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {series.points.map((pt, idx) => {
                  const x = getX(idx);
                  const y = getY(pt.percentage);

                  return (
                    <circle
                      key={`${series.userId}-${idx}`}
                      cx={x}
                      cy={y}
                      r={isHighlighted ? 6 : series.isCurrentUser ? 5 : 4.5}
                      fill={series.color.stroke}
                      stroke="#ffffff"
                      strokeWidth={2}
                      className="cursor-pointer transition-transform hover:scale-125"
                      onMouseEnter={() => {
                        setHoveredPoint({
                          studentName: series.name,
                          testTitle: pt.testTitle,
                          percentage: pt.percentage,
                          score: pt.score,
                          maxScore: pt.maxScore,
                          color: series.color.stroke,
                          x,
                          y,
                        });
                      }}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  );
                })}
              </g>
            );
          })}

          {hoveredPoint && (
            <g
              transform={`translate(${Math.min(
                width - 150,
                Math.max(20, hoveredPoint.x - 70)
              )}, ${Math.max(10, hoveredPoint.y - 50)})`}
            >
              <rect
                width="140"
                height="45"
                rx="8"
                className="fill-black/90 dark:fill-zinc-900/95"
                filter="drop-shadow(0 4px 6px rgba(0,0,0,0.3))"
              />
              <text
                x="10"
                y="18"
                className="text-[10px] font-bold fill-white"
              >
                {hoveredPoint.studentName}
              </text>
              <text
                x="10"
                y="34"
                className="text-[11px] font-mono font-extrabold fill-emerald-400"
              >
                {hoveredPoint.percentage}% ({hoveredPoint.score > 0 ? `+${hoveredPoint.score}` : hoveredPoint.score}/{hoveredPoint.maxScore})
              </text>
            </g>
          )}
        </svg>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2.5 border-t border-black/[.06] pt-4 dark:border-white/[.08]">
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mr-1">
          Students:
        </span>
        {studentTrajectories.map((s) => {
          const isActive = activeStudentId === s.userId;
          return (
            <button
              key={s.userId}
              type="button"
              onClick={() => {
                setActiveStudentId(isActive ? null : s.userId);
              }}
              className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                isActive
                  ? "border-black bg-black text-white shadow-xs dark:border-white dark:bg-white dark:text-black"
                  : "border-black/[.08] bg-zinc-50/70 hover:bg-zinc-100 dark:border-white/[.08] dark:bg-zinc-900/60 dark:hover:bg-zinc-900"
              }`}
            >
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: s.color.stroke }}
              />
              <span>{s.name}</span>
              {s.isCurrentUser && (
                <span className="text-[9px] opacity-75 font-normal">(You)</span>
              )}
              <span className="font-mono text-[10px] opacity-80">
                Avg {s.averagePercentage}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
