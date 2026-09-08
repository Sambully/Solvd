"use client";

import { useState, useMemo } from "react";
import { TrendingUp, Sparkles, Users } from "lucide-react";
import type { StudentTrajectorySeries } from "@/lib/roomActions";

interface RoomMultiTestTrendChartProps {
  trajectoryTests: Array<{ index: number; title: string; date: string }>;
  studentTrajectories: StudentTrajectorySeries[];
}

interface ClusteredStudent {
  userId: string;
  name: string;
  isCurrentUser: boolean;
  color: string;
  score: number;
  maxScore: number;
  percentage: number;
  attempted: boolean;
}

interface ClusteredDataPoint {
  id: string;
  testIndex: number;
  testNumber: number;
  testTitle: string;
  testDate: string;
  percentage: number;
  x: number;
  y: number;
  students: ClusteredStudent[];
  hasCurrentUser: boolean;
}

export default function RoomMultiTestTrendChart({
  trajectoryTests,
  studentTrajectories,
}: RoomMultiTestTrendChartProps) {
  const [hoveredCluster, setHoveredCluster] = useState<ClusteredDataPoint | null>(null);
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

  // Group overlapping points into clusters so multiple students at the same test & score share one dot
  const clusters = useMemo(() => {
    const map = new Map<string, ClusteredDataPoint>();

    trajectoryTests.forEach((t, testIdx) => {
      studentTrajectories.forEach((series) => {
        const pt = series.points[testIdx];
        if (!pt) return;

        const x = getX(testIdx);
        const y = getY(pt.percentage);
        const key = `${testIdx}-${pt.percentage}`;

        if (!map.has(key)) {
          map.set(key, {
            id: key,
            testIndex: testIdx,
            testNumber: t.index,
            testTitle: t.title,
            testDate: t.date,
            percentage: pt.percentage,
            x,
            y,
            students: [],
            hasCurrentUser: false,
          });
        }

        const cluster = map.get(key)!;
        cluster.students.push({
          userId: series.userId,
          name: series.name,
          isCurrentUser: series.isCurrentUser,
          color: series.color.stroke,
          score: pt.score,
          maxScore: pt.maxScore,
          percentage: pt.percentage,
          attempted: pt.attempted,
        });

        if (series.isCurrentUser) {
          cluster.hasCurrentUser = true;
        }
      });
    });

    // Ensure the current user is listed first in the tooltip, then sort by name
    map.forEach((cluster) => {
      cluster.students.sort((a, b) => {
        if (a.isCurrentUser && !b.isCurrentUser) return -1;
        if (!a.isCurrentUser && b.isCurrentUser) return 1;
        return a.name.localeCompare(b.name);
      });
    });

    return Array.from(map.values());
  }, [trajectoryTests, studentTrajectories, chartWidth, chartHeight]);

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
              Multi-test score tracking. Tied scores are grouped together into cluster points.
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
        <div className="relative min-w-[620px]">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto"
          >
            <defs>
              {/* Dynamic gradients for multi-student cluster dots */}
              {clusters
                .filter((c) => c.students.length > 1)
                .map((c) => {
                  return (
                    <linearGradient
                      key={c.id}
                      id={`grad-${c.id}`}
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      {c.students.map((st, i) => {
                        const offset = (i / (c.students.length - 1 || 1)) * 100;
                        return (
                          <stop
                            key={st.userId}
                            offset={`${offset}%`}
                            stopColor={st.isCurrentUser ? "#10b981" : st.color}
                          />
                        );
                      })}
                    </linearGradient>
                  );
                })}
            </defs>

            {/* Y-Axis Grid & Labels */}
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

            {/* X-Axis Grid & Labels */}
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

            {/* Vertical hover crosshair indicator */}
            {hoveredCluster && (
              <line
                x1={hoveredCluster.x}
                y1={paddingTop}
                x2={hoveredCluster.x}
                y2={paddingTop + chartHeight}
                className="stroke-indigo-400/50 dark:stroke-indigo-400/40 pointer-events-none"
                strokeDasharray="3 3"
                strokeWidth="1.5"
              />
            )}

            {/* Continuous Trajectory Lines */}
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
                  style={{ opacity: isDimmed ? 0.15 : 1 }}
                >
                  {testCount > 1 && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke={series.isCurrentUser ? "#10b981" : series.color.stroke}
                      strokeWidth={isHighlighted || series.isCurrentUser ? "3.5" : "2.5"}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                </g>
              );
            })}

            {/* Unified Clustered Dots (Zero overlapping conflicts / Zero flickering) */}
            {clusters.map((cluster) => {
              const isMulti = cluster.students.length > 1;
              const includesActiveStudent =
                activeStudentId !== null &&
                cluster.students.some((s) => s.userId === activeStudentId);
              const isDimmed = activeStudentId !== null && !includesActiveStudent;
              const isHovered = hoveredCluster?.id === cluster.id;

              if (isMulti) {
                // Multi-student unified cluster dot
                return (
                  <g
                    key={cluster.id}
                    className="cursor-pointer"
                    style={{ opacity: isDimmed ? 0.2 : 1 }}
                    onMouseEnter={() => setHoveredCluster(cluster)}
                    onMouseLeave={() => setHoveredCluster(null)}
                  >
                    {/* Outer Glow / Halo */}
                    {(cluster.hasCurrentUser || isHovered) && (
                      <circle
                        cx={cluster.x}
                        cy={cluster.y}
                        r={isHovered ? 13 : 10}
                        fill={cluster.hasCurrentUser ? "#10b981" : "#6366f1"}
                        opacity={isHovered ? 0.35 : 0.2}
                        className="transition-all duration-200"
                      />
                    )}

                    {/* Main Cluster Circle with Gradient Fill */}
                    <circle
                      cx={cluster.x}
                      cy={cluster.y}
                      r={isHovered ? 9 : 8}
                      fill={`url(#grad-${cluster.id})`}
                      stroke={cluster.hasCurrentUser ? "#10b981" : "#ffffff"}
                      strokeWidth={cluster.hasCurrentUser ? 2.5 : 2}
                      className="transition-transform duration-150"
                      filter="drop-shadow(0 2px 4px rgba(0,0,0,0.35))"
                    />

                    {/* Student count badge inside cluster dot */}
                    <text
                      x={cluster.x}
                      y={cluster.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="text-[9px] font-black fill-white select-none pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
                    >
                      {cluster.students.length}
                    </text>
                  </g>
                );
              }

              // Single student dot
              const singleStudent = cluster.students[0];
              const isHighlighted = includesActiveStudent;

              return (
                <g
                  key={cluster.id}
                  className="cursor-pointer"
                  style={{ opacity: isDimmed ? 0.2 : 1 }}
                  onMouseEnter={() => setHoveredCluster(cluster)}
                  onMouseLeave={() => setHoveredCluster(null)}
                >
                  {/* Outer halo */}
                  {(singleStudent.isCurrentUser || isHovered || isHighlighted) && (
                    <circle
                      cx={cluster.x}
                      cy={cluster.y}
                      r={isHovered ? 11 : isHighlighted ? 9 : 7.5}
                      fill={singleStudent.isCurrentUser ? "#10b981" : singleStudent.color}
                      opacity={isHovered ? 0.3 : 0.18}
                      className="transition-all duration-200"
                    />
                  )}

                  <circle
                    cx={cluster.x}
                    cy={cluster.y}
                    r={isHovered ? 7 : isHighlighted ? 6 : singleStudent.isCurrentUser ? 5.5 : 4.5}
                    fill={singleStudent.isCurrentUser ? "#10b981" : singleStudent.color}
                    stroke="#ffffff"
                    strokeWidth={singleStudent.isCurrentUser ? 2.5 : 2}
                    className="transition-all duration-150"
                    filter="drop-shadow(0 1px 3px rgba(0,0,0,0.25))"
                  />
                </g>
              );
            })}
          </svg>

          {/* Smooth HTML Overlay Tooltip (Zero mouse stealing / Zero flickering) */}
          {hoveredCluster && (
            <div
              className="absolute z-40 pointer-events-none transition-all duration-150 ease-out"
              style={{
                left: `${(hoveredCluster.x / width) * 100}%`,
                top: `${(hoveredCluster.y / height) * 100}%`,
                transform:
                  hoveredCluster.y < 75
                    ? "translate(-50%, 14px)"
                    : "translate(-50%, calc(-100% - 14px))",
              }}
            >
              <div className="min-w-[180px] max-w-[280px] rounded-xl border border-zinc-700/80 bg-zinc-950/95 p-3 shadow-2xl backdrop-blur-md text-white text-xs animate-in fade-in zoom-in-95 duration-100">
                {/* Header with Test Info */}
                <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 pb-2 mb-2">
                  <span className="font-bold text-[11px] text-zinc-300 truncate">
                    Test {hoveredCluster.testNumber}: {hoveredCluster.testTitle}
                  </span>
                  <span className="rounded-md bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] font-bold text-zinc-200 shrink-0">
                    {hoveredCluster.percentage}%
                  </span>
                </div>

                {/* List of all students sharing this point */}
                <div className="space-y-1.5">
                  {hoveredCluster.students.map((student) => {
                    return (
                      <div
                        key={student.userId}
                        className="flex items-center justify-between gap-3 text-[11px]"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className="h-2.5 w-2.5 rounded-full shrink-0 border border-black/40"
                            style={{
                              backgroundColor: student.isCurrentUser
                                ? "#10b981"
                                : student.color,
                              boxShadow: student.isCurrentUser
                                ? "0 0 8px rgba(16, 185, 129, 0.7)"
                                : undefined,
                            }}
                          />
                          {student.isCurrentUser ? (
                            <span className="font-bold text-emerald-400 truncate flex items-center gap-1">
                              {student.name}
                              <span className="rounded bg-emerald-950/80 border border-emerald-800/60 px-1 py-0.2 text-[9px] text-emerald-300 font-medium">
                                You
                              </span>
                            </span>
                          ) : (
                            <span
                              className="font-semibold truncate"
                              style={{ color: student.color }}
                            >
                              {student.name}
                            </span>
                          )}
                        </div>

                        <div className="font-mono text-[10px] shrink-0 text-right">
                          {student.attempted ? (
                            <span
                              className={
                                student.isCurrentUser
                                  ? "font-bold text-emerald-400"
                                  : "text-zinc-300"
                              }
                            >
                              {student.score > 0 ? `+${student.score}` : student.score}/{student.maxScore}
                            </span>
                          ) : (
                            <span className="text-zinc-500 italic">Missed</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Tied students note */}
                {hoveredCluster.students.length > 1 && (
                  <div className="mt-2 border-t border-zinc-800/80 pt-1.5 text-[9.5px] text-zinc-400 text-center font-medium">
                    {hoveredCluster.students.length} students at this score point
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Student Legend and Filter Pills */}
      <div className="mt-4 flex flex-wrap items-center gap-2.5 border-t border-black/[.06] pt-4 dark:border-white/[.08]">
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mr-1 flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
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
                  : s.isCurrentUser
                  ? "border-emerald-500/40 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-950 dark:border-emerald-500/30 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 dark:text-emerald-200"
                  : "border-black/[.08] bg-zinc-50/70 hover:bg-zinc-100 dark:border-white/[.08] dark:bg-zinc-900/60 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200"
              }`}
            >
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: s.isCurrentUser ? "#10b981" : s.color.stroke }}
              />
              <span className={s.isCurrentUser ? "text-emerald-600 dark:text-emerald-400 font-bold" : ""}>
                {s.name}
              </span>
              {s.isCurrentUser && (
                <span className="rounded bg-emerald-100 dark:bg-emerald-900/70 px-1.5 py-0.2 text-[9px] font-bold text-emerald-700 dark:text-emerald-300">
                  You
                </span>
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

