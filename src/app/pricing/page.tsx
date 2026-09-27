"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  Zap,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  Users,
  BookOpen,
  Target,
  Clock,
  Award,
} from "lucide-react";
import SolvdLogo from "@/components/SolvdLogo";

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "Is Solvd really 100% free till 30 October?",
      a: "Yes! As part of our Early Access Launch for NEET aspirants, all premium features—including unlimited handwritten note OCR mocks, complete question banks, multiplayer study circles, and negative marking analytics—are completely free with no payment required.",
    },
    {
      q: "Do I need to enter a credit card or debit card?",
      a: "No. You will never be asked for credit card details, UPI, or billing information to use Solvd during the free access period. Simply sign up with your email and start practicing immediately.",
    },
    {
      q: "What happens after 30 October?",
      a: "After October 30, you can continue using Solvd with flexible subscription plans tailored for students. Any tests, mistake ledgers, notes, and study circle data you create will remain completely safe and accessible in your account.",
    },
    {
      q: "Is the question pattern compliant with NEET / NTA rules?",
      a: "Yes. Solvd strictly follows the latest National Testing Agency (NTA) format, including the +4/-1 marking scheme, Section A and Section B optional question mechanics, high-yield NCERT citations, and timer discipline.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans antialiased selection:bg-amber-200 selection:text-black flex flex-col justify-between">
      {/* 1. Top Navbar */}
      <header className="sticky top-0 z-50 border-b border-black/[.05] bg-white/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 shadow-2xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3.5 py-2.5 sm:px-6 sm:py-3.5 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <SolvdLogo size="sm" />
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-semibold text-zinc-600">
            <Link href="/features" className="transition-colors hover:text-black">
              Features
            </Link>
            <Link href="/cbt-simulator" className="transition-colors hover:text-black">
              CBT Simulator
            </Link>
            <Link href="/help" className="transition-colors hover:text-black">
              Help
            </Link>
            <Link href="/pricing" className="font-bold text-black border-b-2 border-amber-400 pb-0.5">
              Pricing <span className="rounded-full bg-amber-300 px-1.5 py-0.2 text-[10px] font-black text-black ml-1">FREE</span>
            </Link>
          </nav>

          {/* Right Action */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-black px-3.5 py-1.5 sm:px-5 sm:py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-zinc-800 active:scale-98"
            >
              <span>Use Free</span>
              <div className="hidden sm:flex h-4 w-4 items-center justify-center rounded-full bg-zinc-800 text-[9px]">
                →
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Main Pricing Hero & Content */}
      <main className="flex-1 py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Top Banner & Header */}
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-1.5 text-xs font-bold text-amber-900 shadow-2xs mb-4">
              <Sparkles className="h-3.5 w-3.5 text-amber-600 animate-pulse" />
              <span>SPECIAL EARLY ACCESS PROMOTION</span>
            </div>

            <h1 className="text-4xl font-black tracking-tight text-zinc-950 sm:text-6xl">
              Free till 30 October
            </h1>

            <p className="mt-4 text-base leading-relaxed text-zinc-600 sm:text-lg">
              Experience the complete Solvd NEET CBT assessment platform with zero paywalls. Everything is 100% free for all NEET aspirants until October 30.
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {/* Card 1: Main Pro Early Access Card (Featured) */}
            <div className="lg:col-span-2 rounded-3xl border-2 border-slate-950 bg-white p-8 sm:p-10 shadow-xl relative overflow-hidden flex flex-col justify-between">
              {/* Badge */}
              <div className="absolute top-0 right-0 bg-[#0f172a] text-amber-300 text-[11px] font-black uppercase tracking-wider py-1.5 px-6 rounded-bl-2xl shadow-xs">
                Active Promotion
              </div>

              <div>
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 border-b border-slate-100 pb-6">
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                      All-Access Pro Plan
                    </span>
                    <h2 className="text-2xl font-black text-slate-950 mt-0.5">
                      Early Access Aspirant Pass
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-5xl font-black tracking-tight text-slate-950">
                      ₹0
                    </span>
                    <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-bold text-emerald-700">
                      100% Free Access
                    </span>
                  </div>
                </div>

                {/* Free Till Oct 30 Highlight Box */}
                <div className="mt-6 rounded-2xl bg-amber-50 border border-amber-200 p-4 flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-slate-950 font-black">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div className="text-xs text-amber-950">
                    <span className="font-black text-sm block">Free till 30 October 2026</span>
                    <span className="text-amber-800">
                      Zero payment information required. Full unrestricted access to all NTA CBT practice features.
                    </span>
                  </div>
                </div>

                {/* Features Included List */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {[
                    "Unlimited Handwritten Notes OCR Extraction",
                    "Instant High-Yield NCERT Practice Tests",
                    "Official NTA CBT Interface (+4 / -1 Marking)",
                    "Synchronized Study Circles & Live Lobbies",
                    "Automated 15-Min Gmail Test Reminders",
                    "Negative Marking Mistake Ledger & AIR",
                    "Step-by-step Scientific Explanations",
                    "Zero Credit Card or Payment Method Needed",
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Action Row */}
              <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500 font-medium text-center sm:text-left">
                  <span>⚡ Instant 1-click activation • </span>
                  <span className="text-slate-900 font-bold">No card required</span>
                </div>

                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-[#0f172a] px-8 py-4 text-sm font-black text-white shadow-lg shadow-black/10 transition-all hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Use Solvd for free</span>
                  <ArrowRight className="h-4 w-4 text-amber-400" />
                </Link>
              </div>
            </div>

            {/* Card 2: Coaching Institutes & Batches */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Institutes & Mentors
                </span>
                <h3 className="text-xl font-black text-slate-950 mt-1">
                  Coaching Cohorts
                </h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  For coaching academies, faculty, and batch coordinators running weekly test series.
                </p>

                <div className="mt-6 space-y-3 pt-6 border-t border-slate-100">
                  {[
                    "Custom batch study circles",
                    "Dedicated room leaderboard URLs",
                    "Customized syllabus scheduling",
                    "Faculty analytics portal",
                    "White-label institution branding",
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                      <CheckCircle2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <Link
                  href="/dashboard/room"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  <span>Host a Study Circle</span>
                  <Users className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* 3. Frequently Asked Questions */}
          <div className="mt-20 max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-slate-950">
                Frequently Asked Questions
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Everything you need to know about the Solvd early access promotion.
              </p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-200/90 bg-white p-5 transition-all shadow-xs"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="flex w-full items-center justify-between text-left"
                    >
                      <span className="text-sm font-bold text-slate-900">
                        {faq.q}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 text-slate-400 transition-transform ${
                          isOpen ? "rotate-180 text-slate-900" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <p className="mt-3 text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
                        {faq.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Bottom Launch Banner */}
          <div className="mt-16 rounded-3xl bg-[#0f172a] p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-black font-black mb-4">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                Ready to simulate the real NEET CBT?
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-300">
                Take timed NCERT drills and full syllabus mocks today. Free till 30 October.
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

      {/* 5. Footer */}
      <footer className="border-t border-black/[.06] bg-white py-8 text-xs text-zinc-500">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 font-bold text-black">
            <SolvdLogo size="sm" showBadge={false} />
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
            <span>NTA CBT Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
