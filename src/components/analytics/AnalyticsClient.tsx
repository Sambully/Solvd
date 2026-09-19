"use client";

import Link from "next/link";
import {
  FileText,
  Target,
  TrendingUp,
  Award,
  Plus,
  BarChart3,
} from "lucide-react";
import type { AnalyticsSummary } from "@/lib/analyticsData";
import ScoreTrendChart from "@/components/analytics/ScoreTrendChart";
import MarksBreakdownDonut from "@/components/analytics/MarksBreakdownDonut";
import DifficultyMasteryCards from "@/components/analytics/DifficultyMasteryCards";
import PacingGaugeCard from "@/components/analytics/PacingGaugeCard";
import SmartInsightsCard from "@/components/analytics/SmartInsightsCard";
import TestHistoryTable from "@/components/analytics/TestHistoryTable";

interface Props {
  data: AnalyticsSummary;
}

export default function AnalyticsClient({ data }: Props) {
  if (data.totalAttempts === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black dark:text-zinc-50">
            Performance & Accuracy Analytics
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Track your score trajectories, negative marking penalties, and subject mastery.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-black/[.08] bg-white p-12 text-center shadow-sm dark:border-white/[.1] dark:bg-zinc-950">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900">
            <BarChart3 className="h-7 w-7 text-zinc-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-black dark:text-zinc-50">
              No Test Data Yet
            </h3>
            <p className="mt-1 max-w-sm text-xs text-zinc-500 dark:text-zinc-400">
              Generate and submit your first NEET CBT mock exam to unlock detailed accuracy graphs, speed metrics, and strategic performance recommendations.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            <Plus className="h-4 w-4" />
            Generate Your First Exam
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black dark:text-zinc-50">
            Performance Analytics
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Diagnostic breakdown of accuracy, score growth, and negative marking.
          </p>
        </div>

        <Link
          href="/tests"
          className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 w-fit"
        >
          View All Tests
        </Link>
      </div>

      {/* 4 KPI Top Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Tests */}
        <div className="rounded-2xl border border-black/[.08] bg-white p-5 shadow-sm dark:border-white/[.1] dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Tests Attempted
            </span>
            <FileText className="h-4 w-4 text-zinc-400" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-black dark:text-zinc-50">
            {data.totalAttempts}
          </p>
          <span className="text-[11px] text-zinc-400 mt-1 block">
            {data.totalQuestionsAttempted} MCQs Answered
          </span>
        </div>

        {/* Overall Accuracy */}
        <div className="rounded-2xl border border-black/[.08] bg-white p-5 shadow-sm dark:border-white/[.1] dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Overall Accuracy
            </span>
            <Target className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {data.overallAccuracy}%
          </p>
          <span className="text-[11px] text-zinc-400 mt-1 block">
            Correct attempts ratio
          </span>
        </div>

        {/* Average Score */}
        <div className="rounded-2xl border border-black/[.08] bg-white p-5 shadow-sm dark:border-white/[.1] dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Average Score
            </span>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-black dark:text-zinc-50">
            {data.avgScorePercentage}%
          </p>
          <span className="text-[11px] text-zinc-400 mt-1 block">
            Across all mock papers
          </span>
        </div>

        {/* Best Score */}
        <div className="rounded-2xl border border-black/[.08] bg-white p-5 shadow-sm dark:border-white/[.1] dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Peak Performance
            </span>
            <Award className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">
            {data.bestScorePercentage}%
          </p>
          <span className="text-[11px] text-zinc-400 mt-1 block">
            Highest scored test
          </span>
        </div>
      </div>

      {/* Row 2: Score Trajectory & Marks Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ScoreTrendChart trends={data.trends} />
        </div>
        <div>
          <MarksBreakdownDonut
            totalMarksGained={data.totalMarksGained}
            totalMarksLost={data.totalMarksLost}
            overallAccuracy={data.overallAccuracy}
          />
        </div>
      </div>

      {/* Row 3: Difficulty Mastery */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-3">
          Difficulty Mastery Breakdown
        </h3>
        <DifficultyMasteryCards breakdown={data.difficultyBreakdown} />
      </div>

      {/* Row 4: Speed & Tactical Performance Advice */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div>
          <PacingGaugeCard avgTimeSeconds={data.avgTimePerQuestionSeconds} />
        </div>
        <div className="lg:col-span-2">
          <SmartInsightsCard
            insights={data.insights}
            projectedPercentile={data.projectedPercentile}
          />
        </div>
      </div>

      {/* Row 5: Detailed Test History Table */}
      <TestHistoryTable trends={data.trends} />
    </div>
  );
}
