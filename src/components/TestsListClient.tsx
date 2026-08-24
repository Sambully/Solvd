"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Plus, FileText, CheckCircle2, Clock, Filter } from "lucide-react";
import type { RecentExam } from "@/lib/dashboardData";
import ExamCardItem from "@/components/ExamCardItem";

interface Props {
  initialExams: RecentExam[];
}

export default function TestsListClient({ initialExams }: Props) {
  const [exams, setExams] = useState<RecentExam[]>(initialExams);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "completed" | "pending">("all");

  const completedCount = exams.filter((e) => e.latestAttemptId !== null).length;
  const pendingCount = exams.length - completedCount;

  const filteredExams = exams.filter((exam) => {
    const matchesSearch = exam.title.toLowerCase().includes(search.toLowerCase());
    const isCompleted = exam.latestAttemptId !== null;

    if (!matchesSearch) return false;
    if (filter === "completed") return isCompleted;
    if (filter === "pending") return !isCompleted;
    return true;
  });

  function handleDeleted(deletedId: string) {
    setExams((prev) => prev.filter((e) => e.id !== deletedId));
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header & Stats bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black dark:text-zinc-50">
            Mock Tests
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            All your generated NEET computer-based practice exams (latest first).
          </p>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 w-fit"
        >
          <Plus className="h-4 w-4" />
          Generate New Test
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div
          onClick={() => setFilter("all")}
          className={`cursor-pointer rounded-xl border p-4 transition-all ${
            filter === "all"
              ? "border-black bg-zinc-50 dark:border-white dark:bg-zinc-900"
              : "border-black/[.08] bg-white hover:bg-zinc-50/50 dark:border-white/[.1] dark:bg-zinc-950 dark:hover:bg-zinc-900/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Total Tests
            </span>
            <FileText className="h-4 w-4 text-zinc-400" />
          </div>
          <p className="mt-1 text-2xl font-bold text-black dark:text-zinc-50">
            {exams.length}
          </p>
        </div>

        <div
          onClick={() => setFilter("completed")}
          className={`cursor-pointer rounded-xl border p-4 transition-all ${
            filter === "completed"
              ? "border-emerald-600 bg-emerald-50/60 dark:border-emerald-500 dark:bg-emerald-950/40"
              : "border-black/[.08] bg-white hover:bg-zinc-50/50 dark:border-white/[.1] dark:bg-zinc-950 dark:hover:bg-zinc-900/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Completed
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-300">
            {completedCount}
          </p>
        </div>

        <div
          onClick={() => setFilter("pending")}
          className={`cursor-pointer rounded-xl border p-4 transition-all ${
            filter === "pending"
              ? "border-amber-600 bg-amber-50/60 dark:border-amber-500 dark:bg-amber-950/40"
              : "border-black/[.08] bg-white hover:bg-zinc-50/50 dark:border-white/[.1] dark:bg-zinc-950 dark:hover:bg-zinc-900/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
              Unattempted
            </span>
            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="mt-1 text-2xl font-bold text-amber-700 dark:text-amber-300">
            {pendingCount}
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search mock tests by name..."
            className="w-full rounded-xl border border-black/[.1] bg-white py-2.5 pl-10 pr-4 text-sm text-black placeholder:text-zinc-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-white/[.15] dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-white dark:focus:ring-white"
          />
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-black/[.08] bg-zinc-50 p-1 dark:border-white/[.1] dark:bg-zinc-900">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              filter === "all"
                ? "bg-white text-black shadow-xs dark:bg-zinc-800 dark:text-white"
                : "text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white"
            }`}
          >
            All ({exams.length})
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              filter === "completed"
                ? "bg-white text-black shadow-xs dark:bg-zinc-800 dark:text-white"
                : "text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white"
            }`}
          >
            Completed ({completedCount})
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              filter === "pending"
                ? "bg-white text-black shadow-xs dark:bg-zinc-800 dark:text-white"
                : "text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white"
            }`}
          >
            Unattempted ({pendingCount})
          </button>
        </div>
      </div>

      {/* Tests List Card */}
      <div className="rounded-2xl border border-black/[.08] bg-white shadow-sm dark:border-white/[.1] dark:bg-zinc-950 overflow-hidden">
        {filteredExams.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900">
              <Filter className="h-5 w-5 text-zinc-400" />
            </div>
            <div>
              <p className="text-base font-semibold text-black dark:text-zinc-50">
                No mock tests found
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {search
                  ? `No tests match "${search}". Try searching for something else.`
                  : "You haven't generated any tests in this category yet."}
              </p>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-black/[.05] dark:divide-white/[.05]">
            {filteredExams.map((exam) => (
              <ExamCardItem
                key={exam.id}
                exam={exam}
                showReattempt={true}
                showDelete={true}
                onDeleted={handleDeleted}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
