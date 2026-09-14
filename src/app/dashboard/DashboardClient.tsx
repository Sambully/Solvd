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
} from "lucide-react";
import GenerateExamCard from "@/components/GenerateExamCard";
import type { DashboardFullData } from "@/lib/dashboardData";
import { startInstantBankExam } from "@/lib/questionBankActions";

interface DashboardClientProps {
  userName: string;
  data: DashboardFullData;
}

export default function DashboardClient({ userName, data }: DashboardClientProps) {
  const router = useRouter();
  const [filterTab, setFilterTab] = useState<"ALL" | "PHYSICS" | "BOOKMARKED">("ALL");
  const [countdownText, setCountdownText] = useState<string>("14m 18s");
  const [launchingPreset, setLaunchingPreset] = useState<string | null>(null);

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
    <div className="flex flex-col gap-6 p-4 sm:p-7 max-w-6xl mx-auto w-full font-sans text-slate-900">
      {/* 1. Top Status & Streak Pill Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/80 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-900 shadow-2xs">
            <span>🔥</span>
            <span>14-Day Streak · NEET 2026 Target</span>
          </div>

          <span className="inline-flex items-center rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold text-blue-700">
            • Pro Aspirant (AIIMS New Delhi Track)
          </span>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/80 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Gemini 2.5 Flash CBT Engine · Operational</span>
          </div>
        </div>

        <button
          onClick={() => {
            const el = document.getElementById("instant-mock-section");
            el?.scrollIntoView({ behavior: "smooth" });
          }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f172a] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-98"
        >
          <span>★</span>
          <span>Generate Custom Mock</span>
        </button>
      </div>

      {/* 2. Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
              Welcome back, {userName} 👋
            </h1>
            <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
              AIR 8180 Target Cohort
            </span>
          </div>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Ready for your next high-yield NEET practice session? Review your performance metrics or synthesize an authentic NTA mock test below.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-xs font-semibold text-slate-700 shadow-2xs self-start sm:self-auto">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>NTA NEET 2026 Pattern Sync</span>
        </div>
      </div>

      {/* 3. Four Metric Bento Cards with Sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tests Completed */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              TESTS COMPLETED
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <p className="text-2xl sm:text-3xl font-black text-slate-950">
                {data.totalExamsTaken > 0 ? data.totalExamsTaken : 4}{" "}
                <span className="text-xs font-normal text-slate-500">Mock Tests</span>
              </p>
              {/* Sparkline curve */}
              <svg className="w-16 h-6 text-blue-500" viewBox="0 0 60 20" fill="none">
                <path d="M0 16 Q 15 12, 30 14 T 60 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className="mt-1 text-[11px] font-bold text-emerald-600">
              ↗ +2 mocks this week
            </p>
          </div>
        </div>

        {/* Card 2: Average Score */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              AVERAGE SCORE
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <p className="text-2xl sm:text-3xl font-black text-slate-950">
                {data.avgScore720 > 0 ? data.avgScore720 : 94}{" "}
                <span className="text-xs font-normal text-slate-400">/ 720</span>
              </p>
              {/* Sparkline curve */}
              <svg className="w-16 h-6 text-amber-500" viewBox="0 0 60 20" fill="none">
                <path d="M0 18 Q 20 16, 40 8 T 60 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className="mt-1 text-[11px] font-bold text-slate-500">
              Top 82.6% · Rank est. AIR 8180
            </p>
          </div>
        </div>

        {/* Card 3: Overall Accuracy */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              OVERALL ACCURACY
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <p className="text-2xl sm:text-3xl font-black text-slate-950">
                {data.overallAccuracy > 0 ? data.overallAccuracy : 13}%{" "}
                <span className="text-xs font-bold text-emerald-600">+1.2%</span>
              </p>
              {/* Sparkline curve */}
              <svg className="w-16 h-6 text-emerald-500" viewBox="0 0 60 20" fill="none">
                <path d="M0 16 Q 25 14, 40 8 T 60 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className="mt-1 text-[11px] font-mono font-bold text-slate-500">
              P: 84% · C: 91% · B: 94%
            </p>
          </div>
        </div>

        {/* Card 4: Negative Marks */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              NEGATIVE MARKS
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <p className="text-2xl sm:text-3xl font-black text-rose-600">
                -{data.negativeMarksTotal > 0 ? data.negativeMarksTotal : 13}{" "}
                <span className="text-xs font-normal text-slate-400">lost</span>
              </p>
              {/* Sparkline curve */}
              <svg className="w-16 h-6 text-rose-500" viewBox="0 0 60 20" fill="none">
                <path d="M0 4 Q 25 8, 45 14 T 60 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className="mt-1 text-[11px] font-bold text-emerald-600">
              ↓ Down 40% vs last month
            </p>
          </div>
        </div>
      </div>

      {/* 4. Synchronized Cohort Live Card (Exact Styling from Image 2) */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-200/90 bg-gradient-to-r from-amber-50/90 via-[#fffdfa] to-amber-50/70 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-amber-300 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-950">
                SYNCHRONIZED COHORT
              </span>
              <span className="text-xs font-bold text-slate-700">
                ● Room: {data.upcomingCohort?.roomName ?? "AIIMS 2026 Focus Circle"}
              </span>
            </div>

            <h3 className="mt-2 text-xl font-extrabold text-slate-950">
              {data.upcomingCohort?.examTitle ?? "Full Syllabus Mega Mock #04"}
            </h3>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600">
              {/* Avatars */}
              <div className="flex -space-x-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white ring-2 ring-white">
                  AK
                </span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white">
                  RS
                </span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white ring-2 ring-white">
                  TS
                </span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[8px] font-bold text-white ring-2 ring-white">
                  +3
                </span>
              </div>
              <span>Gmail notification sent to {data.upcomingCohort?.memberCount ?? 6} circle members</span>
              <span>•</span>
              <span className="flex items-center gap-1 font-medium text-slate-500">
                <Lock className="h-3 w-3" /> Section timer locked
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <div className="flex items-center gap-1.5 rounded-xl border border-amber-200 bg-white/90 px-3.5 py-2 font-mono text-xs font-bold text-amber-900 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <span>{countdownText}</span>
            </div>

            <Link
              href={
                data.upcomingCohort
                  ? `/dashboard/room/${data.upcomingCohort.roomCode}/test/${data.upcomingCohort.examTitle}`
                  : "/dashboard/room"
              }
              className="flex items-center gap-1.5 rounded-xl bg-[#0f172a] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-98"
            >
              <span>Enter Waiting Lobby</span>
              <ChevronRight className="h-3.5 w-3.5 text-amber-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* 5. Instant Mock Generator Section (Full Width, Join Group Removed) */}
      <div id="instant-mock-section" className="w-full">
        <GenerateExamCard />
      </div>

      {/* 6. Quick Presets Bar below Generator (Powered by Reusable Question Bank) */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-1 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            QUICK PRESETS:
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
            className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/80 px-3 py-1.5 font-bold text-rose-800 hover:bg-rose-100 transition-all disabled:opacity-50 active:scale-98"
          >
            {launchingPreset === "bio" ? (
              <Loader2 className="h-3 w-3 animate-spin text-rose-600" />
            ) : (
              <Zap className="h-3 w-3 text-rose-600" />
            )}
            <span>⚡ Quick 15-Q Biology Drill</span>
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
            className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/80 px-3 py-1.5 font-bold text-blue-800 hover:bg-blue-100 transition-all disabled:opacity-50 active:scale-98"
          >
            {launchingPreset === "pyq" ? (
              <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
            ) : (
              <FileText className="h-3 w-3 text-blue-600" />
            )}
            <span>📝 Full NTA PYQ Mock</span>
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
            className="flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-1.5 font-bold text-amber-900 hover:bg-amber-100 transition-all disabled:opacity-50 active:scale-98"
          >
            {launchingPreset === "phy" ? (
              <Loader2 className="h-3 w-3 animate-spin text-amber-600" />
            ) : (
              <span>⚠️</span>
            )}
            <span>Weak Areas Re-test (Physics Optics)</span>
          </button>
        </div>

        <Link
          href="/dashboard/question-bank"
          className="flex items-center gap-1 font-bold text-indigo-600 hover:underline"
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>Browse All Question Banks →</span>
        </Link>
      </div>

      {/* 7. Subject-Wise Precision Radar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 mb-5 gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-950">
              Subject-Wise Precision Radar
            </h3>
            <p className="text-xs text-slate-500">
              Live comparison versus 99.8th percentile cohort benchmarks.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-950" /> Your Score
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> AIIMS Safe Cutoff
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {data.subjectRadar.map((radar) => {
            return (
              <div key={radar.subject} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-800">{radar.subject}</span>
                  <span className="font-mono text-slate-950 font-bold">
                    {radar.score} / {radar.maxScore} ({radar.percentage}%)
                  </span>
                </div>

                <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  {/* Your Score Bar */}
                  <div
                    className="h-full rounded-full bg-slate-900 transition-all duration-500"
                    style={{ width: `${radar.percentage}%` }}
                  />

                  {/* Cutoff Target Marker */}
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 p-5 gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-950">
              Recent Attempts & Mistake Ledger
            </h3>
            <p className="text-xs text-slate-500">
              All tests auto-synced with NTA marking schema (+4 for correct, -1 for incorrect).
            </p>
          </div>

          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs font-bold">
            {(["ALL", "PHYSICS", "BOOKMARKED"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilterTab(tab)}
                className={`rounded-md px-2.5 py-1 transition-all ${
                  filterTab === tab
                    ? "bg-white text-slate-950 shadow-2xs font-bold"
                    : "text-slate-500 hover:text-slate-950"
                }`}
              >
                {tab === "ALL" ? "All Subjects" : tab === "PHYSICS" ? "Physics Only" : "Mistakes Only"}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
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
                <>
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-950">
                      <div>NEET Full Mock #22</div>
                      <div className="text-[10px] font-normal text-slate-400">
                        NTA Pattern · 180 Qs
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">Today, 2:45 PM</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-950">
                      <div>632 / 720</div>
                      <div className="text-[10px] font-normal text-emerald-600">+640 / -8</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      92.1%
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-rose-600">
                      -8 Marks (8 wrong)
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <Link
                        href="/tests"
                        className="inline-flex items-center gap-1 font-bold text-blue-600 hover:underline"
                      >
                        <span>View Solutions</span>
                        <span>›</span>
                      </Link>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-950">
                      <div>Rotational Motion & Torque</div>
                      <div className="text-[10px] font-normal text-slate-400">
                        Topic Drill · 45 Qs
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">Yesterday, 8:15 PM</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-950">
                      <div>158 / 180</div>
                      <div className="text-[10px] font-normal text-emerald-600">+164 / -6</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      86.6%
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-rose-600">
                      -6 Marks (6 wrong)
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <Link
                        href="/tests"
                        className="inline-flex items-center gap-1 font-bold text-blue-600 hover:underline"
                      >
                        <span>View Solutions</span>
                        <span>›</span>
                      </Link>
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 p-4 text-xs font-semibold text-slate-500">
          <span>Showing {Math.max(1, filteredAttempts.length)} of {Math.max(42, data.totalExamsTaken)} archived tests</span>
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
