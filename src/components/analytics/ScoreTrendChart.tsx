"use client";

import { useState } from "react";
import type { TestAttemptTrend } from "@/lib/analyticsData";

interface Props {
  trends: TestAttemptTrend[];
}

export default function ScoreTrendChart({ trends }: Props) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (trends.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-black/[.08] bg-white p-6 dark:border-white/[.1] dark:bg-zinc-950">
        <p className="text-sm text-zinc-400">
          Complete at least one mock test to see your score trajectory.
        </p>
      </div>
    );
  }

  // SVG dimensions & padding
  const width = 680;
  const height = 260;
  const paddingX = 45;
  const paddingY = 35;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  // Calculate points
  const points = trends.map((item, idx) => {
    const x =
      trends.length === 1
        ? width / 2
        : paddingX + (idx / (trends.length - 1)) * chartWidth;
    const y = paddingY + chartHeight - (item.percentage / 100) * chartHeight;
    return { x, y, item, idx };
  });

  // Construct smooth bezier path
  let pathD = "";
  if (points.length === 1) {
    pathD = `M ${paddingX} ${points[0].y} L ${width - paddingX} ${points[0].y}`;
  } else {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const mx = (p0.x + p1.x) / 2;
      pathD += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
  }

  // Area path for gradient fill
  const areaD =
    points.length === 1
      ? `${pathD} L ${width - paddingX} ${height - paddingY} L ${paddingX} ${height - paddingY} Z`
      : `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  const hovered = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <div className="relative flex flex-col rounded-2xl border border-black/[.08] bg-white p-6 shadow-sm dark:border-white/[.1] dark:bg-zinc-950">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-2">
        <div>
          <h3 className="text-base font-bold text-black dark:text-zinc-50">
            Score Progression Trajectory
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            NEET percentage achieved across chronological mock tests
          </p>
        </div>
        {hovered && (
          <div className="flex items-center gap-2 rounded-lg bg-zinc-100 px-3 py-1 text-xs dark:bg-zinc-900">
            <span className="font-semibold text-black dark:text-white truncate max-w-[140px]">
              {hovered.item.title}
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {hovered.item.percentage}% ({hovered.item.score}/{hovered.item.maxScore} M)
            </span>
          </div>
        )}
      </div>

      {/* SVG Chart */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-64 w-full select-none"
        >
          <defs>
            <linearGradient id="scoreAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid horizontal lines */}
          {[0, 25, 50, 75, 100].map((val) => {
            const y = paddingY + chartHeight - (val / 100) * chartHeight;
            return (
              <g key={val}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity="0.08"
                  strokeDasharray="4 4"
                  className="text-black dark:text-white"
                />
                <text
                  x={paddingX - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="currentColor"
                  className="text-zinc-400 font-medium"
                >
                  {val}%
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={areaD} fill="url(#scoreAreaGrad)" />

          {/* Spline Stroke Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Hover Vertical Guide */}
          {hovered && (
            <line
              x1={hovered.x}
              y1={paddingY}
              x2={hovered.x}
              y2={height - paddingY}
              stroke="#10b981"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              strokeOpacity="0.7"
            />
          )}

          {/* Interactive Data Dots */}
          {points.map((p, i) => {
            const isHovered = hoveredIndex === i;
            return (
              <g
                key={p.item.id}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              >
                {/* Glow ring on hover */}
                {isHovered && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="9"
                    fill="#10b981"
                    fillOpacity="0.25"
                    className="animate-pulse"
                  />
                )}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? "5.5" : "4"}
                  fill="#ffffff"
                  stroke="#10b981"
                  strokeWidth={isHovered ? "3" : "2.5"}
                />
                {/* Invisible larger hit target */}
                <circle cx={p.x} cy={p.y} r="18" fill="transparent" />
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-black/[.05] dark:border-white/[.05]">
        <span>← Earliest Attempt</span>
        <span>Latest Mock Exam →</span>
      </div>
    </div>
  );
}
