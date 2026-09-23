"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  FileText,
  Clock,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  ArrowUpRight,
  Sliders,
  UploadCloud,
  CheckCircle2,
  Lock,
  Zap,
  BookOpen,
  Loader2,
  Users,
} from "lucide-react";
import GenerateExamCard from "@/components/GenerateExamCard";
import type { DashboardFullData } from "@/lib/dashboardData";
import { startInstantBankExam } from "@/lib/questionBankActions";

interface DashboardClientProps {
  userName: string;
  data: DashboardFullData;
}

function generateSparkline(values: number[], width = 60, height = 20): string {
  if (!values || values.length === 0) {
    return `M 0 ${height / 2} L ${width} ${height / 2}`;
  }
  if (values.length === 1) {
    return `M 0 ${height / 2} L ${width} ${height / 2}`;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min === 0 ? 1 : max - min;
  const paddingY = 3;
  const usableH = height - paddingY * 2;

  const points = values.map((val, i) => {
    const x = Math.round((i / (values.length - 1)) * width);
    const y = Math.round(height - paddingY - ((val - min) / range) * usableH);
    return { x, y };
  });

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const cpX = (current.x + next.x) / 2;
    path += ` C ${cpX} ${current.y}, ${cpX} ${next.y}, ${next.x} ${next.y}`;
  }
  return path;
}

export default function DashboardClient({ userName, data }: DashboardClientProps) {
  const router = useRouter();
  const [filterTab, setFilterTab] = useState<"ALL" | "PHYSICS" | "BOOKMARKED">("ALL");
  const [countdownText, setCountdownText] = useState<string>("14m 18s");
  const [launchingPreset, setLaunchingPreset] = useState<string | null>(null);

  // Chronological attempt trends for dynamic live sparklines
  const chronologicalAttempts = [...data.recentAttempts].reverse();
  const testCountTrend = chronologicalAttempts.map((_, i) => i + 1);
  const scoreTrend = chronologicalAttempts.map((a) => (a.maxScore > 0 ? Math.round((a.score / a.maxScore) * 100) : 0));
  const accuracyTrend = chronologicalAttempts.map((a) => a.accuracy);
  const negativeTrend = chronologicalAttempts.map((a) => a.negativeMarks);

  const testsSparkline = generateSparkline(testCountTrend);
  const scoreSparkline = generateSparkline(scoreTrend);
  const accuracySparkline = generateSparkline(accuracyTrend);
  const negativeSparkline = generateSparkline(negativeTrend);

  async function launchPresetExam(moduleId: string, count: number, presetName: string) {
    setLaunchingPreset(presetName);
    try {
      const res = await startInstantBankExam(moduleId, count);
      if (res.success && res.examId) {
        router.push(`/dashboard/exam/${res.examId}`);
      } else {
        alert(res.error || "Failed to launch preset test.");
        setLaunchingPreset(null);
      }
    } catch {
      setLaunchingPreset(null);
    }
  }

  useEffect(() => {
    if (!data.upcomingCohort) return;
    const updateCountdown = () => {
      const diff = new Date(data.upcomingCohort!.scheduledAt).getTime() - Date.now();
      if (diff <= 0) {
        setCountdownText("Live Now");
        return;
      }
      const totalSec = Math.floor(diff / 1000);
      const mins = Math.floor(totalSec / 60);
      const secs = totalSec % 60;
      setCountdownText(`${mins}m ${secs.toString().padStart(2, "0")}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [data.upcomingCohort]);

  const filteredAttempts = data.recentAttempts.filter((att) => {
    if (filterTab === "PHYSICS")
      return (
        att.title.toLowerCase().includes("physics") ||
        att.title.toLowerCase().includes("mechanics") ||
        att.title.toLowerCase().includes("rotation")
      );
    if (filterTab === "BOOKMARKED") return att.score < att.maxScore * 0.8;
    return true;
  });

  return (
    <div className="flex flex-col gap-4 sm:gap-6 p-3 sm:p-7 max-w-6xl mx-auto w-full font-sans text-slate-900">
      {/* 1. Top Status & Streak Pill Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-200/80 pb-3 sm:pb-4">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 text-[11px] sm:text-xs">
          <div className="inline-flex items-center gap-1 rounded-full border border-amber-300/80 bg-amber-50 px-2.5 py-0.5 sm:px-3 sm:py-1 font-bold text-amber-900 shadow-2xs">
            <span>🔥</span>
            <span>14-Day Streak · NEET 2026</span>
          </div>

          <span className="inline-flex items-center rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 sm:px-3 sm:py-1 font-bold text-blue-700">
            • AIIMS Track
          </span>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/80 bg-emerald-50 px-2.5 py-0.5 sm:px-3 sm:py-1 font-bold text-emerald-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>CBT Engine Live</span>
          </div>
        </div>

        <button
          onClick={() => {
            const el = document.getElementById("instant-mock-section");
            el?.scrollIntoView({ behavior: "smooth" });
          }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f172a] px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-98"
        >
          <span>★</span>
          <span>Generate Custom Mock</span>
        </button>
      </div>

      {/* 2. Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-slate-950">
              Welcome back, {userName} 👋
            </h1>
            <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] sm:text-xs font-bold text-indigo-700">
              AIR 8180 Target Cohort
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Ready for your next high-yield NEET practice session? Review your performance metrics or synthesize an authentic NTA mock test below.
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 sm:p-3 text-[11px] sm:text-xs font-semibold text-slate-700 shadow-2xs self-start sm:self-auto">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>NTA NEET 2026 Sync</span>
        </div>
      </div>

      {/* 3. Four Metric Bento Cards with Sparklines */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Card 1: Tests Completed */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-500">
              TESTS COMPLETED
            </span>
            <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3">
            <div className="flex items-baseline justify-between">
              <p className="text-lg sm:text-3xl font-black text-slate-950">
                {data.totalExamsTaken}{" "}
                <span className="text-[10px] sm:text-xs font-normal text-slate-500">Mocks</span>
              </p>
              <svg className="w-12 sm:w-16 h-5 sm:h-6 text-blue-500 hidden xs:block" viewBox="0 0 60 20" fill="none">
                <path d={testsSparkline} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="mt-0.5 text-[10px] sm:text-[11px] font-bold text-emerald-600 truncate">
              {data.weeklyMocksCount > 0 ? `+${data.weeklyMocksCount} this week` : "Ready for mock"}
            </p>
          </div>
        </div>

        {/* Card 2: Average Score */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-500">
              AVERAGE SCORE
            </span>
            <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3">
            <div className="flex items-baseline justify-between">
              <p className="text-lg sm:text-3xl font-black text-slate-950">
                {data.avgScore720}{" "}
                <span className="text-[10px] sm:text-xs font-normal text-slate-400">/ 720</span>
              </p>
              <svg className="w-12 sm:w-16 h-5 sm:h-6 text-amber-500 hidden xs:block" viewBox="0 0 60 20" fill="none">
                <path d={scoreSparkline} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="mt-0.5 text-[10px] sm:text-[11px] font-bold text-slate-500 truncate">
              {data.totalExamsTaken > 0 ? `Top ${data.percentileRank}%` : "No tests yet"}
            </p>
          </div>
        </div>

        {/* Card 3: Overall Accuracy */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-500">
              OVERALL ACCURACY
            </span>
            <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3">
            <div className="flex items-baseline justify-between">
              <p className="text-lg sm:text-3xl font-black text-slate-950">
                {data.overallAccuracy}%
              </p>
              <svg className="w-12 sm:w-16 h-5 sm:h-6 text-emerald-500 hidden xs:block" viewBox="0 0 60 20" fill="none">
                <path d={accuracySparkline} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="mt-0.5 text-[10px] sm:text-[11px] font-mono font-bold text-slate-500 truncate">
              P:{data.subjectRadar[0]?.percentage ?? 0}% C:{data.subjectRadar[1]?.percentage ?? 0}% B:{data.subjectRadar[2]?.percentage ?? 0}%
            </p>
          </div>
        </div>

        {/* Card 4: Negative Marks */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-500">
              NEGATIVE MARKS
            </span>
            <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3">
            <div className="flex items-baseline justify-between">
              <p className="text-lg sm:text-3xl font-black text-rose-600">
                -{data.negativeMarksTotal}{" "}
                <span className="text-[10px] sm:text-xs font-normal text-slate-400">lost</span>
              </p>
              <svg className="w-12 sm:w-16 h-5 sm:h-6 text-rose-500 hidden xs:block" viewBox="0 0 60 20" fill="none">
                <path d={negativeSparkline} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="mt-0.5 text-[10px] sm:text-[11px] font-bold text-slate-500 truncate">
              {data.totalExamsTaken > 0 ? "Penalty marks total" : "0 penalties"}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Synchronized Cohort Live Card */}
      {data.upcomingCohort && (
        <div className="relative overflow-hidden rounded-2xl border border-amber-200/90 bg-gradient-to-r from-amber-50/90 via-[#fffdfa] to-amber-50/70 p-4 sm:p-6 shadow-xs animate-in fade-in duration-300">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded bg-amber-300 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-950">
                  SYNCHRONIZED COHORT
                </span>
                <span className="text-xs font-bold text-slate-700">
                  ● Room: {data.upcomingCohort.roomName}
                </span>
              </div>

              <h3 className="mt-1.5 text-base sm:text-xl font-extrabold text-slate-950">
                {data.upcomingCohort.examTitle}
              </h3>

              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1 font-semibold text-amber-900">
                  <Users className="h-3.5 w-3.5 text-amber-700" />
                  {data.upcomingCohort.memberCount} member{data.upcomingCohort.memberCount > 1 ? "s" : ""}
                </span>
                <span>•</span>
                <span>Gmail reminder 15m prior</span>
                <span>•</span>
                <span className="flex items-center gap-1 font-medium text-slate-500">
                  <Lock className="h-3 w-3" /> Timer locked
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-center">
              <div className="flex items-center gap-1.5 rounded-xl border border-amber-200 bg-white/90 px-3 py-1.5 font-mono text-xs font-bold text-amber-900 shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span>{countdownText}</span>
              </div>

              <Link
                href={`/dashboard/room/${data.upcomingCohort.roomCode}/test/${data.upcomingCohort.roomExamId}`}
                className="flex items-center gap-1.5 rounded-xl bg-[#0f172a] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-98"
              >
                <span>Waiting Lobby</span>
                <ChevronRight className="h-3.5 w-3.5 text-amber-400" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 5. Instant Mock Generator Section */}
      <div id="instant-mock-section" className="w-full">
        <GenerateExamCard />
      </div>

      {/* 6. Quick Presets Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 px-1 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            PRESETS:
          </span>

          <button
            type="button"
            disabled={launchingPreset !== null}
            onClick={() =>
              launchPresetExam(
                "curated-bio-genetics-ncert",
                10,
                "bio"
              )
            }
            className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/80 px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-bold text-rose-800 hover:bg-rose-100 transition-all disabled:opacity-50 active:scale-98"
          >
            {launchingPreset === "bio" ? (
              <Loader2 className="h-3 w-3 animate-spin text-rose-600" />
            ) : (
              <Zap className="h-3 w-3 text-rose-600" />
            )}
            <span>15-Q Biology Drill</span>
          </button>

          <button
            type="button"
            disabled={launchingPreset !== null}
            onClick={() =>
              launchPresetExam(
                "curated-pyq-full-neet-drill",
                4,
                "pyq"
              )
            }
            className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/80 px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-bold text-blue-800 hover:bg-blue-100 transition-all disabled:opacity-50 active:scale-98"
          >
            {launchingPreset === "pyq" ? (
              <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
            ) : (
              <FileText className="h-3 w-3 text-blue-600" />
            )}
            <span>Full NTA Mock</span>
          </button>

          <button
            type="button"
            disabled={launchingPreset !== null}
            onClick={() =>
              launchPresetExam(
                "curated-phy-mechanics-optics",
                8,
                "phy"
              )
            }
            className="flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50/80 px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100 transition-all disabled:opacity-50 active:scale-98"
          >
            {launchingPreset === "phy" ? (
              <Loader2 className="h-3 w-3 animate-spin text-amber-600" />
            ) : (
              <span>⚠️</span>
            )}
            <span>Physics Weak Areas</span>
          </button>
        </div>

        <Link
          href="/dashboard/question-bank"
          className="flex items-center gap-1 font-bold text-indigo-600 hover:underline text-xs self-start sm:self-auto"
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>Browse Question Banks →</span>
        </Link>
      </div>

      {/* 7. Subject-Wise Precision Radar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 sm:pb-4 mb-4 sm:mb-5 gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-950">
              Subject-Wise Precision Radar
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Live comparison versus 99.8th percentile cohort benchmarks.
            </p>
          </div>

          <div className="flex items-center gap-3 text-[11px] sm:text-xs font-bold text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-slate-950" /> Your Score
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-emerald-500" /> AIIMS Cutoff
            </span>
          </div>
        </div>

        <div className="space-y-3.5 sm:space-y-4">
          {data.subjectRadar.map((radar) => {
            return (
              <div key={radar.subject} className="space-y-1 sm:space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-800">{radar.subject}</span>
                  <span className="font-mono text-slate-950 font-bold">
                    {radar.score} / {radar.maxScore} ({radar.percentage}%)
                  </span>
                </div>

                <div className="relative h-2 sm:h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-slate-900 transition-all duration-500"
                    style={{ width: `${radar.percentage}%` }}
                  />
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-emerald-500"
                    style={{ left: `${radar.aiimsCutoffPercent}%` }}
                    title={`AIIMS Safe Cutoff: ${radar.aiimsCutoffPercent}%`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 8. Recent Attempts & Mistake Ledger */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 p-4 sm:p-5 gap-2.5">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-950">
              Recent Attempts & Mistake Ledger
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500">
              All tests auto-synced with NTA marking (+4 / -1).
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs font-bold self-start sm:self-auto">
            {(["ALL", "PHYSICS", "BOOKMARKED"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilterTab(tab)}
                className={`rounded-md px-2 sm:px-2.5 py-1 transition-all text-[11px] sm:text-xs ${
                  filterTab === tab
                    ? "bg-white text-slate-950 shadow-2xs font-bold"
                    : "text-slate-500 hover:text-slate-950"
                }`}
              >
                {tab === "ALL" ? "All" : tab === "PHYSICS" ? "Physics" : "Mistakes"}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile View: Cards */}
        <div className="block sm:hidden divide-y divide-slate-100">
          {filteredAttempts.length > 0 ? (
            filteredAttempts.map((attempt) => (
              <div key={attempt.id} className="p-3.5 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-950 text-xs line-clamp-1">{attempt.title}</h4>
                    <p className="text-[10px] text-slate-400">
                      {attempt.questionCount} Qs · {new Date(attempt.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <span className="font-mono font-bold text-xs text-slate-950">
                    {attempt.score}/{attempt.maxScore}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-600">Acc: {attempt.accuracy}%</span>
                    <span className="font-mono font-bold text-rose-600">Neg: -{attempt.negativeMarks}</span>
                  </div>

                  <Link
                    href={`/dashboard/attempt/${attempt.id}`}
                    className="font-bold text-blue-600 hover:underline text-xs"
                  >
                    View Solutions ›
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-xs text-slate-400 italic">
              No recent attempts found for this filter.
            </div>
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <th className="py-3 px-5">TEST NAME</th>
                <th className="py-3 px-4">DATE</th>
                <th className="py-3 px-4">SCORE BREAKDOWN</th>
                <th className="py-3 px-4">ACCURACY</th>
                <th className="py-3 px-4">NEGATIVES</th>
                <th className="py-3 px-5 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAttempts.length > 0 ? (
                filteredAttempts.map((attempt) => (
                  <tr key={attempt.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-950">
                      <div>{attempt.title}</div>
                      <div className="text-[10px] font-normal text-slate-400">
                        {attempt.questionCount} Questions · NTA Pattern
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">
                      {new Date(attempt.submittedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-950">
                      <div>
                        {attempt.score} <span className="text-slate-400 font-normal">/ {attempt.maxScore}</span>
                      </div>
                      <div className="text-[10px] font-normal text-emerald-600">
                        +{attempt.positiveMarks} / -{attempt.negativeMarks}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {attempt.accuracy}%
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-rose-600">
                      -{attempt.negativeMarks} Marks
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <Link
                        href={`/dashboard/attempt/${attempt.id}`}
                        className="inline-flex items-center gap-1 font-bold text-blue-600 hover:underline"
                      >
                        <span>View Solutions</span>
                        <span>›</span>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-xs text-slate-400 italic">
                    No tests found for this filter tab.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 p-3 sm:p-4 text-[11px] sm:text-xs font-semibold text-slate-500 gap-2">
          <span>Showing {Math.max(1, filteredAttempts.length)} tests</span>
          <Link
            href="/analytics"
            className="flex items-center gap-1 text-slate-950 hover:underline font-bold"
          >
            <span>Open Complete Mistake Notebook</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
