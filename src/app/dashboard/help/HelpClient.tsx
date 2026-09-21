"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Sparkles,
  Users,
  BarChart3,
  Monitor,
  CheckCircle2,
  ArrowRight,
  Zap,
  BookOpen,
  FileText,
  Clock,
  Mail,
  ShieldCheck,
  Flame,
  Target,
  ChevronRight,
  AlertCircle,
  HelpCircle,
  X,
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
        title: "Subject-Wise Precision Radar",
        description:
          "Compare your Physics, Chemistry, and Biology scores in real-time against 99.8th percentile AIIMS safe cutoffs (typically 85%+ in Bio and 75%+ in Physics).",
        icon: BarChart3,
        tip: "The green benchmark line indicates the historical cutoff threshold for top government medical colleges.",
      },
      {
        stepNumber: 3,
        title: "Targeted Weak-Area Re-tests",
        description:
          "Review your archived tests in the Mistake Ledger. Filter by 'Mistakes Only' to inspect full solution rationales and generate quick 15-question re-tests focusing exclusively on missed topics.",
        icon: Flame,
        tip: "Re-testing mistakes within 48 hours boosts long-term NEET conceptual retention by over 70%.",
      },
    ],
    proTip:
      "Pro Tip: Monitor your average seconds per question in the Pacing Gauge to ensure you leave at least 20 minutes for Section B verification.",
  },
  {
    id: "cbt-environment",
    category: "EXAM_UI",
    badge: "CBT Environment",
    badgeColor: "bg-blue-50 border-blue-200 text-blue-700",
    title: "Mastering the NTA Computer-Based Test (CBT) Interface",
    summary:
      "Get completely comfortable with the standard NTA exam screen layout, question palette color codes, and navigation shortcuts before the real exam day.",
    actionLabel: "Start a Practice Test",
    actionHref: "/tests",
    tags: ["cbt", "palette", "exam interface", "nta pattern", "shortcuts", "timer", "marking scheme"],
    steps: [
      {
        stepNumber: 1,
        title: "Question Status Palette Guide",
        description:
          "Monitor your progress using standard color-coded palette buttons: Green indicates Answered (+4/-1 evaluation), Red indicates Viewed but Not Answered, Purple indicates Marked for Review, and Gray indicates Not Visited.",
        icon: Monitor,
        tip: "Purple questions with a green checkmark are evaluated in your final score by NTA rules.",
      },
      {
        stepNumber: 2,
        title: "Clear Response & Option Selection",
        description:
          "Select any option (A, B, C, D) by clicking. If you change your mind, click 'Clear Response' to unselect without penalty, or click 'Mark for Review & Next' to revisit the question later.",
        icon: CheckCircle2,
        tip: "You can jump directly to any question by clicking its number in the right-side question palette grid.",
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

export default function HelpClient() {
  const [selectedCategory, setSelectedCategory] = useState<Category>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

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
    <div className="flex flex-col gap-6">
      {/* 1. Header & Live Search Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 mb-2">
              <BookOpen className="h-3.5 w-3.5" />
              <span>Solvd Documentation & Help Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
              Feature Guides & Walkthroughs
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Step-by-step guides on creating high-yield NEET mock tests from notes, setting up synchronized group study rooms with 15-minute Gmail alerts, and mastering NTA CBT exam rules.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 self-start sm:self-auto">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>NTA NEET 2026 Pattern Sync</span>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative mt-2 w-full">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topics: handwritten notes OCR, 15m Gmail alerts, room codes, negative marking..."
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

        {/* Category Pill Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono mr-1">
            CATEGORIES:
          </span>
          {CATEGORY_TABS.map((tab) => {
            const active = selectedCategory === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                  active
                    ? "bg-[#0f172a] text-white shadow-xs"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${active ? "text-amber-400" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Step-by-Step Feature Walkthrough Cards */}
      {filteredGuides.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200/90 bg-white p-12 text-center shadow-xs">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <HelpCircle className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No matching guides found</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            We couldn't find any documentation matching &ldquo;{searchQuery}&rdquo;. Try searching for &ldquo;OCR&rdquo;, &ldquo;Gmail&rdquo;, &ldquo;Room&rdquo;, or &ldquo;Negative Marks&rdquo;.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("ALL");
            }}
            className="mt-1 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
          >
            Clear Search & Filters
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {filteredGuides.map((guide) => (
            <div
              key={guide.id}
              className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs flex flex-col gap-5"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${guide.badgeColor} mb-2`}
                  >
                    {guide.badge}
                  </span>
                  <h2 className="text-xl font-black text-slate-950 tracking-tight">
                    {guide.title}
                  </h2>
                  <p className="mt-1 text-xs text-slate-600 max-w-3xl leading-relaxed">
                    {guide.summary}
                  </p>
                </div>

                <Link
                  href={guide.actionHref}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f172a] px-4 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-slate-800 self-start sm:self-auto shrink-0 active:scale-98"
                >
                  <span>{guide.actionLabel}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-amber-400" />
                </Link>
              </div>

              {/* 3 Step-by-Step Columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {guide.steps.map((step) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={step.stepNumber}
                      className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 relative"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-950 text-xs font-black text-white">
                            {step.stepNumber}
                          </span>
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-700 shadow-2xs">
                            <Icon className="h-4 w-4 text-indigo-600" />
                          </div>
                        </div>

                        <h3 className="text-sm font-bold text-slate-950">
                          {step.title}
                        </h3>
                        <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                          {step.description}
                        </p>
                      </div>

                      {step.tip && (
                        <div className="mt-3 pt-2.5 border-t border-slate-200/70 text-[11px] font-medium text-slate-500">
                          💡 {step.tip}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Pro Tip Banner */}
              <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-950 font-medium">
                <Flame className="h-4 w-4 shrink-0 text-amber-600" />
                <span>{guide.proTip}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
