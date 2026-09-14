"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  BookOpen,
  Sparkles,
  Zap,
  Play,
  Loader2,
  CheckCircle2,
  Users,
  Star,
  Layers,
  ArrowRight,
  Sliders,
  Filter,
  Flame,
  Clock,
  HelpCircle,
  X,
} from "lucide-react";
import type { QuestionBankModuleSummary } from "@/lib/questionBankData";
import { startInstantBankExam } from "@/lib/questionBankActions";

interface Props {
  initialModules: QuestionBankModuleSummary[];
}

export default function QuestionBankClient({ initialModules }: Props) {
  const router = useRouter();
  const [modules, setModules] = useState<QuestionBankModuleSummary[]>(initialModules);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("ALL");
  const [sourceTab, setSourceTab] = useState<"ALL" | "CURATED" | "COMMUNITY">("ALL");

  const [launchingId, setLaunchingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Selected module for custom question count launcher modal
  const [customLauncherModule, setCustomLauncherModule] = useState<QuestionBankModuleSummary | null>(null);
  const [selectedQCount, setSelectedQCount] = useState<number>(15);

  const filteredModules = useMemo(() => {
    return modules.filter((m) => {
      // Source Tab
      if (sourceTab === "CURATED" && !m.isOfficial) return false;
      if (sourceTab === "COMMUNITY" && m.isOfficial) return false;

      // Subject
      if (selectedSubject !== "ALL" && m.subject.toLowerCase() !== selectedSubject.toLowerCase()) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = m.title.toLowerCase().includes(q);
        const matchesDesc = m.description.toLowerCase().includes(q);
        const matchesSubject = m.subject.toLowerCase().includes(q);
        const matchesTags = m.tags.some((t) => t.toLowerCase().includes(q));
        const matchesCreator = m.creatorName.toLowerCase().includes(q);
        return matchesTitle || matchesDesc || matchesSubject || matchesTags || matchesCreator;
      }

      return true;
    });
  }, [modules, sourceTab, selectedSubject, searchQuery]);

  async function handleStartInstant(moduleId: string, qCount?: number) {
    setLaunchingId(moduleId);
    setError(null);
    try {
      const res = await startInstantBankExam(moduleId, qCount);
      if (res.success && res.examId) {
        router.push(`/dashboard/exam/${res.examId}`);
      } else {
        setError(res.error || "Failed to start exam.");
        setLaunchingId(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to launch exam.");
      setLaunchingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Header & Hero Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/80 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-900 mb-2">
              <BookOpen className="h-3.5 w-3.5 text-amber-600" />
              <span>Reusable Question Bank & Instant Modules</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
              Instant Practice Question Bank
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Take curated high-yield NEET practice tests instantly with zero wait time and zero AI upload costs. Or explore verified test papers shared by fellow aspirants.
            </p>
          </div>

          <Link
            href="/dashboard#instant-mock-section"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0f172a] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-all self-start sm:self-auto shrink-0"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Generate from Notes</span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative mt-2 w-full">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search question banks by chapter, topic, PYQ year, or subject..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-3 pl-11 pr-10 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filters Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-slate-100">
          {/* Subject Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "ALL", label: "All Subjects" },
              { id: "Biology", label: "🧬 Biology" },
              { id: "Physics", label: "⚛️ Physics" },
              { id: "Chemistry", label: "🧪 Chemistry" },
              { id: "Full Syllabus", label: "🏆 Full Syllabus / PYQ" },
            ].map((sub) => {
              const active = selectedSubject === sub.id;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setSelectedSubject(sub.id)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                    active
                      ? "bg-[#0f172a] text-white shadow-xs"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {sub.label}
                </button>
              );
            })}
          </div>

          {/* Source Tabs */}
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs font-bold shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setSourceTab("ALL")}
              className={`rounded-lg px-3 py-1 transition-all ${
                sourceTab === "ALL" ? "bg-white text-slate-950 shadow-2xs" : "text-slate-500 hover:text-slate-950"
              }`}
            >
              All ({modules.length})
            </button>
            <button
              type="button"
              onClick={() => setSourceTab("CURATED")}
              className={`rounded-lg px-3 py-1 transition-all ${
                sourceTab === "CURATED" ? "bg-white text-slate-950 shadow-2xs" : "text-slate-500 hover:text-slate-950"
              }`}
            >
              Curated ({modules.filter((m) => m.isOfficial).length})
            </button>
            <button
              type="button"
              onClick={() => setSourceTab("COMMUNITY")}
              className={`rounded-lg px-3 py-1 transition-all ${
                sourceTab === "COMMUNITY" ? "bg-white text-slate-950 shadow-2xs" : "text-slate-500 hover:text-slate-950"
              }`}
            >
              Community ({modules.filter((m) => !m.isOfficial).length})
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-red-500/20 bg-red-50 p-4 text-xs font-semibold text-red-700">
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* 2. Question Bank Grid */}
      {filteredModules.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200/90 bg-white p-12 text-center shadow-xs">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Filter className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No question modules found</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            No question banks match your search &ldquo;{searchQuery}&rdquo;. Try clearing your filters or search terms.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedSubject("ALL");
              setSourceTab("ALL");
            }}
            className="mt-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {filteredModules.map((module) => {
            const isLaunching = launchingId === module.id;

            return (
              <div
                key={module.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      {module.isOfficial ? (
                        <span className="inline-flex items-center gap-1 rounded-md border border-amber-300/80 bg-amber-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-900">
                          <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> Solvd Curated
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                          <Users className="h-3 w-3" /> Community Shared
                        </span>
                      )}

                      <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                        {module.subject}
                      </span>
                    </div>

                    <span className="rounded-md bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-bold text-indigo-700 font-mono">
                      {module.questionCount} Questions
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-extrabold text-slate-950 tracking-tight">
                    {module.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {module.description}
                  </p>

                  {/* Tags */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {module.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer & Action */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    By {module.creatorName}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCustomLauncherModule(module);
                        setSelectedQCount(Math.min(15, module.questionCount));
                      }}
                      className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-950 transition-colors"
                      title="Customize question count"
                    >
                      <Sliders className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      disabled={isLaunching}
                      onClick={() => handleStartInstant(module.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f172a] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 disabled:opacity-50 transition-all active:scale-98"
                    >
                      {isLaunching ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Preparing...</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span>Start Practice</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Custom Test Launcher Modal */}
      {customLauncherModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  PRACTICE CONFIGURATION
                </span>
                <h3 className="text-base font-extrabold text-slate-950">
                  {customLauncherModule.title}
                </h3>
              </div>
              <button
                onClick={() => setCustomLauncherModule(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Select how many questions you would like to practice from this curated pool of {customLauncherModule.questionCount} questions:
            </p>

            <div className="grid grid-cols-3 gap-2">
              {[5, 10, 15, 25, 45, customLauncherModule.questionCount]
                .filter((v, i, a) => v <= customLauncherModule.questionCount && a.indexOf(v) === i)
                .map((count) => {
                  const active = selectedQCount === count;
                  return (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setSelectedQCount(count)}
                      className={`rounded-xl border py-2.5 px-2 text-center text-xs font-bold transition-all ${
                        active
                          ? "border-slate-900 bg-slate-900 text-white shadow-xs"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {count} Questions
                    </button>
                  );
                })}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                Est. Duration: {Math.max(10, Math.round(selectedQCount * 1.2))} mins
              </span>

              <button
                type="button"
                onClick={() => {
                  const mod = customLauncherModule;
                  setCustomLauncherModule(null);
                  handleStartInstant(mod.id, selectedQCount);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0f172a] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800"
              >
                <Play className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span>Launch {selectedQCount}-Q Test</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
