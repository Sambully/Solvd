"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Sparkles,
  BookOpen,
  Search,
  FileText,
  Zap,
  Users,
  Mail,
  Clock,
  Target,
  BarChart3,
  Monitor,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";

type Category = "ALL" | "GENERATOR" | "CIRCLES" | "ANALYTICS" | "EXAM_UI";

interface WalkthroughStep {
  stepNumber: number;
  title: string;
  description: string;
  icon: typeof FileText;
  tip?: string;
}

interface FeatureGuide {
  id: string;
  category: Category;
  badge: string;
  badgeColor: string;
  title: string;
  summary: string;
  actionLabel: string;
  actionHref: string;
  steps: WalkthroughStep[];
  proTip: string;
  tags: string[];
}

const FEATURE_GUIDES: FeatureGuide[] = [
  {
    id: "ai-generator",
    category: "GENERATOR",
    badge: "Instant Mock Generator",
    badgeColor: "bg-indigo-50 border-indigo-200 text-indigo-700",
    title: "How to Synthesize Custom NEET Exams from Notes",
    summary:
      "Transform any handwritten coaching notes, coaching modules, or NCERT chapter PDFs into an authentic NTA NEET practice test using the Solvd CBT Engine.",
    actionLabel: "Generate a Mock Test",
    actionHref: "/dashboard#instant-mock-section",
    tags: ["ocr", "generator", "upload", "handwritten notes", "pdf", "mcq", "custom test", "questions"],
    steps: [
      {
        stepNumber: 1,
        title: "Upload Handwritten Notes or PDFs",
        description:
          "Drag and drop or click to upload your study files (PDF, JPG, PNG up to 25MB). You can upload multi-page lecture notes, NCERT textbook pages, or coaching test papers.",
        icon: FileText,
        tip: "Ensure clear lighting and legible formulas for highest OCR extraction accuracy.",
      },
      {
        stepNumber: 2,
        title: "Calibrate Test Scope & Difficulty",
        description:
          "Click 'Exam Settings' to choose your target question count (10, 15, 20, 30, or 45 questions), specify the subject (Physics, Chemistry, Biology), and choose difficulty (Foundation, NEET Standard, or Rank Booster).",
        icon: Zap,
        tip: "Select 'Rank Booster' for challenging multi-step numericals and tricky edge cases.",
      },
      {
        stepNumber: 3,
        title: "Instant Synthesis with NTA Marking",
        description:
          "Click 'Generate NEET Exam'. In under 20 seconds, the engine extracts key concepts, formulates single-choice MCQs with plausible distractors, formats clean scientific formulas and equations, and launches your timed exam.",
        icon: Sparkles,
        tip: "Every generated question includes full step-by-step verified explanations in the review phase.",
      },
    ],
    proTip:
      "Pro Tip: You can upload multiple chapters at once to synthesize full unit revision tests with balanced subject weighting.",
  },
  {
    id: "study-circles",
    category: "CIRCLES",
    badge: "Study Circles & Multiplayer",
    badgeColor: "bg-amber-50 border-amber-200 text-amber-900",
    title: "How to Host & Join Synchronized Group Mocks",
    summary:
      "Compete in live, simultaneous CBT tests with your coaching peer group. All circle members receive automated Gmail reminders 15 minutes before test time.",
    actionLabel: "Explore Study Circles",
    actionHref: "/dashboard/room",
    tags: ["study circles", "rooms", "room code", "multiplayer", "scheduled test", "gmail reminders", "alerts", "live lobby"],
    steps: [
      {
        stepNumber: 1,
        title: "Create or Join a Study Room",
        description:
          "Navigate to Study Circles. Click 'Create Study Room' to start a dedicated circle for your study group, or enter a 6-digit room code shared by your friend.",
        icon: Users,
        tip: "Study circles are permanent spaces where you can schedule recurring weekly mocks.",
      },
      {
        stepNumber: 2,
        title: "Schedule Tests with Automated 15-Min Gmail Alerts",
        description:
          "The room host schedules an upcoming mock test. Solvd automatically dispatches an email alert to all circle members exactly 15 minutes before the test begins so everyone joins on time.",
        icon: Mail,
        tip: "Make sure all group members have signed in with their active Gmail account.",
      },
      {
        stepNumber: 3,
        title: "Enter the Waiting Lobby & Compete Live",
        description:
          "Circle members enter the live waiting lobby where section timers are synchronized. Once the countdown hits zero, everyone begins simultaneously, and final scores are ranked on the group trend board.",
        icon: Clock,
        tip: "View group variation graphs to see where your peer cohort excelled or dropped negative marks.",
      },
    ],
    proTip:
      "Pro Tip: Group rooms allow tracking multi-test percentile progression over time, simulating real NEET competitive pressure.",
  },
  {
    id: "mistake-analytics",
    category: "ANALYTICS",
    badge: "Performance & Analytics",
    badgeColor: "bg-emerald-50 border-emerald-200 text-emerald-800",
    title: "Understanding Your Precision Radar & Negative Marks Ledger",
    summary:
      "Diagnose your accuracy trajectories, identify weak chapter subtopics, and monitor your estimated All India Rank (AIR) trajectory after every mock exam.",
    actionLabel: "View Your Analytics",
    actionHref: "/analytics",
    tags: ["analytics", "mistakes", "negative marks", "air rank", "accuracy", "ledger", "weak topics", "pacing"],
    steps: [
      {
        stepNumber: 1,
        title: "Automatic NTA Marking Breakdown",
        description:
          "Every submitted test is evaluated with official NTA marking (+4 marks for correct, -1 mark for wrong). Solvd calculates your net positive marks, total penalty marks, and overall accuracy percentage.",
        icon: Target,
        tip: "A single -1 penalty can drop your national rank by hundreds; focus on eliminating guesswork.",
      },
      {
        stepNumber: 2,
        title: "Subject Precision & Difficulty Breakdown",
        description:
          "View your accuracy across Physics, Chemistry, and Biology. Identify whether you lose marks on Easy (NCERT recall), Medium (application), or Hard (multi-concept numericals) questions.",
        icon: BarChart3,
        tip: "Aim for 95%+ accuracy in Easy biology recall before attempting complex physics derivations.",
      },
      {
        stepNumber: 3,
        title: "Target Pacing & Speedometer Benchmark",
        description:
          "Solvd records your average seconds per question against the recommended 50–55s NEET pacing guideline. Learn to allocate more time to calculation-intensive physics sections.",
        icon: Clock,
        tip: "Use option elimination on Section B optional questions to maintain optimal test velocity.",
      },
    ],
    proTip:
      "Pro Tip: Check your Mistake Ledger regularly to categorize errors into Misread Negative words ('EXCEPT/NOT'), math slippage, or conceptual voids.",
  },
  {
    id: "cbt-exam-ui",
    category: "EXAM_UI",
    badge: "NTA Examination Rules",
    badgeColor: "bg-purple-50 border-purple-200 text-purple-700",
    title: "Mastering the 1:1 NTA CBT Examination Interface",
    summary:
      "Learn the official question palette status codes, Section A and Section B rules, keyboard shortcuts, and review mechanisms mandated by the National Testing Agency.",
    actionLabel: "Launch CBT Simulator",
    actionHref: "/cbt-simulator",
    tags: ["cbt interface", "palette", "marked for review", "section a", "section b", "rules", "shortcuts", "timer"],
    steps: [
      {
        stepNumber: 1,
        title: "Question Status Palette Color Codes",
        description:
          "Green = Answered; Red = Not Answered; Purple = Marked for Review; Purple with Green Dot = Answered & Marked for Review (evaluated for scoring); Gray = Not Visited.",
        icon: Monitor,
        tip: "Use 'Mark for Review' on doubtful numericals to revisit after completing your first reading pass.",
      },
      {
        stepNumber: 2,
        title: "Section A vs. Section B Mechanics",
        description:
          "Section A contains 35 mandatory questions. Section B contains 15 questions where you must attempt any 10. The CBT interface automatically enforces the 10-question ceiling.",
        icon: CheckCircle2,
        tip: "Scan all 15 questions in Section B first and pick the 10 highest-confidence conceptual questions.",
      },
      {
        stepNumber: 3,
        title: "Timed Section Lock & Auto-Submission",
        description:
          "The top bar displays your real-time countdown timer. When the countdown expires, your exam automatically submits and generates your comprehensive scorecard instantly.",
        icon: ShieldCheck,
        tip: "Use the 'Question Paper' modal to view the full question set at a glance during your initial reading pass.",
      },
    ],
    proTip:
      "Pro Tip: Practice with full 180-question 3-hour 20-minute simulations to build authentic physical and mental exam endurance.",
  },
];

const CATEGORY_TABS: Array<{ id: Category; label: string; icon: typeof Sparkles }> = [
  { id: "ALL", label: "All Topics", icon: BookOpen },
  { id: "GENERATOR", label: "Instant Mock Generator", icon: Sparkles },
  { id: "CIRCLES", label: "Study Circles & Alerts", icon: Users },
  { id: "ANALYTICS", label: "Mistake Ledger & AIR", icon: BarChart3 },
  { id: "EXAM_UI", label: "CBT Exam Rules", icon: Monitor },
];

export default function PublicHelpPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const filteredGuides = useMemo(() => {
    return FEATURE_GUIDES.filter((guide) => {
      const matchesCategory =
        selectedCategory === "ALL" || guide.category === selectedCategory;

      if (!searchQuery.trim()) return matchesCategory;

      const query = searchQuery.toLowerCase().trim();
      const matchesText =
        guide.title.toLowerCase().includes(query) ||
        guide.summary.toLowerCase().includes(query) ||
        guide.proTip.toLowerCase().includes(query) ||
        guide.tags.some((t) => t.toLowerCase().includes(query)) ||
        guide.steps.some(
          (s) =>
            s.title.toLowerCase().includes(query) ||
            s.description.toLowerCase().includes(query)
        );

      return matchesCategory && matchesText;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans antialiased selection:bg-amber-200 selection:text-black flex flex-col justify-between">
      {/* 1. Translucent Sticky Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-black/[.05] bg-white/60 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 shadow-2xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white shadow-xs transition-transform group-hover:scale-105">
              <div className="relative flex h-5 w-5 items-center justify-center">
                <div className="h-4 w-4 rounded-full border-2 border-amber-400 border-t-transparent" />
                <div className="absolute h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-black">
                solvd<span className="text-amber-500">.</span>
              </span>
              <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-zinc-600">
                NEET CBT
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-zinc-600">
            <Link href="/features" className="transition-colors hover:text-black">
              Features
            </Link>
            <Link href="/cbt-simulator" className="transition-colors hover:text-black">
              CBT Simulator
            </Link>
            <Link href="/help" className="font-bold text-black border-b-2 border-amber-400 pb-0.5">
              Help
            </Link>
            <Link href="/pricing" className="transition-colors hover:text-black font-bold text-slate-900">
              Pricing <span className="rounded-full bg-amber-300 px-1.5 py-0.2 text-[10px] font-black text-black ml-1">FREE</span>
            </Link>
          </nav>

          {/* Right Action */}
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="text-sm font-semibold text-zinc-700 hover:text-black px-3 py-1.5"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Try Solvd Free</span>
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 text-[10px]">
                →
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Main Content */}
      <main className="flex-1 py-14 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header & Live Search Bar */}
          <div className="flex flex-col gap-4 rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 mb-2">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Solvd Documentation & Help Center</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950">
                  Feature Guides & Walkthroughs
                </h1>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                  Learn how to turn handwritten coaching notes into authentic NTA mock tests, set up synchronized study circles with 15-minute Gmail alerts, and master CBT examination rules.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 self-start sm:self-auto shrink-0">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>NTA NEET 2026 Pattern Sync</span>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative mt-3 w-full">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics: handwritten notes OCR, 15m Gmail alerts, room codes, negative marking..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 py-3.5 pl-11 pr-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all shadow-2xs"
              />
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
              {CATEGORY_TABS.map((tab) => {
                const active = selectedCategory === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedCategory(tab.id)}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                      active
                        ? "bg-[#0f172a] text-white shadow-xs"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Guides List */}
          <div className="space-y-6">
            {filteredGuides.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200/90 bg-white p-12 text-center shadow-xs">
                <HelpCircle className="h-10 w-10 text-slate-400" />
                <h3 className="text-base font-bold text-slate-900">No help articles found</h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  We couldn&apos;t find any guides matching &ldquo;{searchQuery}&rdquo;. Try another search term or select &apos;All Topics&apos;.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("ALL");
                  }}
                  className="mt-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              filteredGuides.map((guide) => (
                <div
                  key={guide.id}
                  className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs hover:border-slate-300 transition-all"
                >
                  {/* Top Badge & Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-5">
                    <div>
                      <span className={`inline-block rounded-md border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider mb-2 ${guide.badgeColor}`}>
                        {guide.badge}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950">
                        {guide.title}
                      </h2>
                      <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                        {guide.summary}
                      </p>
                    </div>

                    <Link
                      href={guide.actionHref}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f172a] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-all self-start sm:self-auto shrink-0"
                    >
                      <span>{guide.actionLabel}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-amber-400" />
                    </Link>
                  </div>

                  {/* Numbered Steps */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {guide.steps.map((step) => {
                      const Icon = step.icon;
                      return (
                        <div
                          key={step.stepNumber}
                          className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:p-5"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-400 text-xs font-black text-black">
                                {step.stepNumber}
                              </span>
                              <Icon className="h-4 w-4 text-slate-400" />
                            </div>
                            <h3 className="text-xs font-bold text-slate-900">
                              {step.title}
                            </h3>
                            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                              {step.description}
                            </p>
                          </div>

                          {step.tip && (
                            <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-amber-900 font-medium">
                              💡 {step.tip}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Pro Tip Callout */}
                  <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-xs font-semibold text-amber-950">
                    {guide.proTip}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 3. Bottom Launch Banner */}
          <div className="rounded-3xl bg-[#0f172a] p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-black font-black mb-4">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                Ready to start practicing?
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-300">
                Join thousands of NEET candidates testing under authentic NTA conditions. Free till 30 October.
              </p>
              <Link
                href="/dashboard"
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-8 py-3.5 text-xs font-black text-slate-950 shadow-md hover:bg-amber-300 transition-all hover:scale-105 active:scale-95"
              >
                <span>Use Solvd for free</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* 4. Footer */}
      <footer className="border-t border-black/[.06] bg-white py-8 text-xs text-zinc-500">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 font-bold text-black">
            <span className="text-base font-black">solvd.</span>
            <span className="font-normal text-zinc-400">
              © 2026 Solvd Edtech Labs. All rights reserved.
            </span>
          </div>

          <div className="flex items-center gap-6 font-semibold">
            <Link href="/" className="hover:text-black">Home</Link>
            <Link href="/features" className="hover:text-black">Features</Link>
            <Link href="/cbt-simulator" className="hover:text-black">CBT Simulator</Link>
            <Link href="/help" className="hover:text-black">Help</Link>
            <Link href="/pricing" className="hover:text-black">Pricing</Link>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-emerald-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>NTA CBT 2026 Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
