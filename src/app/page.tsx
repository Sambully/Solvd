"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import {
  Sparkles,
  Play,
  CheckCircle2,
  Users,
  Eye,
  Target,
  AlertTriangle,
  ArrowRight,
  Clock,
  Zap,
  Activity,
  Award,
  ChevronRight,
  Layers,
  FileCheck2,
  Video,
  Volume2,
  Download,
} from "lucide-react";
import SolvdLogo from "@/components/SolvdLogo";

export default function Home() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const [selectedOption, setSelectedOption] = useState<string>("B");
  const [emailInput, setEmailInput] = useState<string>("");

  // If already logged in, redirect directly to dashboard home screen
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans antialiased selection:bg-amber-200 selection:text-black">
      {/* 1. Top Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-black/[.05] bg-white/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 shadow-2xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3.5 py-2.5 sm:px-6 sm:py-3.5 lg:px-8">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <SolvdLogo size="sm" />
          </Link>

          {/* Desktop Nav Links */}
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
            <Link href="/pricing" className="transition-colors hover:text-black font-bold text-slate-900">
              Pricing <span className="rounded-full bg-amber-300 px-1.5 py-0.2 text-[10px] font-black text-black ml-1">FREE</span>
            </Link>
          </nav>

          {/* Auth CTA */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            <Link
              href="/sign-in"
              className="text-xs sm:text-sm font-semibold text-zinc-700 hover:text-black px-2 py-1 sm:px-3 sm:py-1.5"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-black px-3.5 py-1.5 sm:px-5 sm:py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-zinc-800 active:scale-98"
            >
              <span>Try Free</span>
              <div className="hidden sm:flex h-4 w-4 items-center justify-center rounded-full bg-zinc-800 text-[9px]">
                →
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 sm:pt-16 sm:pb-24 lg:pt-20">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          {/* NTA NEET Engine Badge */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-amber-300/80 bg-amber-50/80 px-3 py-1 sm:px-4 sm:py-1.5 text-[10.5px] sm:text-xs font-bold text-amber-900 shadow-2xs backdrop-blur-xs mb-4 sm:mb-6">
            <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-600 animate-pulse" />
            <span className="hidden sm:inline">NTA NEET ENGINE | High-Yield Assessment Engine Active</span>
            <span className="sm:hidden">NTA NEET ENGINE | Assessment Live</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-2xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-950 leading-tight sm:leading-[1.15]">
            Stop guessing in NEET.{" "}
            <span className="relative inline-block px-2 py-0.5 rounded-lg bg-amber-300/75 text-zinc-950 font-black">
              simulate the
            </span>{" "}
            real exam.
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-4 sm:mt-6 max-w-2xl text-xs sm:text-base lg:text-lg leading-relaxed text-zinc-600">
            Solvd turns your handwritten coaching notes, NCERT PDFs, and diagrams into
            high-yield NTA computer-based mock tests. Practice with persistent Study
            Circles and conquer negative marking.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
            <Link
              href="/dashboard"
              className="flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-black px-7 text-sm font-bold text-white shadow-lg shadow-black/10 transition-all hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98] sm:w-auto"
            >
              <Zap className="h-4 w-4 text-amber-400" />
              <span>Launch Free CBT Mock</span>
            </Link>

            <a
              href="#cbt-simulator"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-6 text-sm font-bold text-zinc-800 shadow-2xs transition-all hover:bg-zinc-50 sm:w-auto"
            >
              <Play className="h-3.5 w-3.5 fill-zinc-800 text-zinc-800" />
              <span>Watch 2-Min Demo</span>
            </a>
          </div>

          {/* Micro Bullet Trust Points */}
          <div className="mt-5 text-xs font-semibold text-zinc-500">
            <span>NTA +4/-1 Marking Scheme</span>
            <span className="mx-2 text-zinc-300">•</span>
            <span>Multimodal Note OCR</span>
            <span className="mx-2 text-zinc-300">•</span>
            <span className="text-amber-700 font-bold">AI Video Micro-Lectures</span>
            <span className="mx-2 text-zinc-300">•</span>
            <span>Synchronized Room Timers</span>
          </div>

          {/* CTA */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-black/[.06] bg-white px-4 py-2 shadow-2xs">
            <p className="text-xs font-bold text-zinc-800">
              Built for NEET aspirants.{" "}
              <Link href="/sign-up" className="text-blue-600 hover:underline">
                Start practicing free →
              </Link>
            </p>
          </div>
        </div>

        {/* 3. Hero CBT Mockup Component (The Actual Simulator Preview) */}
        <div id="cbt-simulator" className="mx-auto mt-14 max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-2xl ring-1 ring-black/5">
            {/* Window Top Bar */}
            <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-100/90 px-4 py-2.5 text-xs font-medium text-zinc-600">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-rose-400" />
                  <span className="h-3 w-3 rounded-full bg-amber-400" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400" />
                </div>
                <span className="font-mono text-[11px] text-zinc-500 ml-2">
                  nta-cbt-engine-v4.1.app
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 rounded bg-zinc-200/70 px-2 py-0.5 font-mono text-[11px] font-bold text-zinc-800">
                  <Clock className="h-3 w-3 text-amber-600" />
                  <span>02:44:10 Remaining</span>
                </div>
                <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  +4 / -1 Marking
                </span>
              </div>
            </div>

            {/* Split Screen CBT Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Left Column: Question, Diagram, Options (8 cols) */}
              <div className="p-5 sm:p-7 lg:col-span-8 border-b lg:border-b-0 lg:border-r border-zinc-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                      PHYSICS • Section A • Question 14 of 45
                    </span>
                    <span className="rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-600">
                      Single Correct
                    </span>
                  </div>

                  {/* Question Stem */}
                  <p className="text-sm font-semibold leading-relaxed text-zinc-900 sm:text-base">
                    A capacitor of capacitance 10 μF is charged to 50V and then connected
                    across an uncharged 40 μF capacitor. What is the total electrostatic
                    energy lost in the steady state during the charge distribution process?
                  </p>

                  {/* Rendered Circuit Diagram Box */}
                  <div className="my-5 rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 text-center">
                    <svg
                      viewBox="0 0 340 100"
                      className="mx-auto h-24 w-auto text-zinc-800"
                    >
                      {/* Left Capacitor */}
                      <line x1="40" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="2" />
                      <line x1="100" y1="30" x2="100" y2="70" stroke="currentColor" strokeWidth="3" />
                      <line x1="110" y1="30" x2="110" y2="70" stroke="currentColor" strokeWidth="3" />
                      <line x1="110" y1="50" x2="150" y2="50" stroke="currentColor" strokeWidth="2" />
                      <text x="105" y="22" textAnchor="middle" fontSize="10" fontWeight="bold" fill="currentColor">
                        C₁ = 10 μF
                      </text>

                      {/* Switch */}
                      <circle cx="150" cy="50" r="3" fill="currentColor" />
                      <line x1="150" y1="50" x2="175" y2="38" stroke="currentColor" strokeWidth="2" />
                      <circle cx="180" cy="50" r="3" fill="currentColor" />
                      <text x="165" y="24" textAnchor="middle" fontSize="10" fontWeight="bold" fill="currentColor">
                        Switch S
                      </text>

                      {/* Right Capacitor */}
                      <line x1="180" y1="50" x2="220" y2="50" stroke="currentColor" strokeWidth="2" />
                      <line x1="220" y1="30" x2="220" y2="70" stroke="currentColor" strokeWidth="3" />
                      <line x1="230" y1="30" x2="230" y2="70" stroke="currentColor" strokeWidth="3" />
                      <line x1="230" y1="50" x2="300" y2="50" stroke="currentColor" strokeWidth="2" />
                      <text x="225" y="22" textAnchor="middle" fontSize="10" fontWeight="bold" fill="currentColor">
                        C₂ = 40 μF
                      </text>

                      {/* Return loop */}
                      <line x1="40" y1="50" x2="40" y2="85" stroke="currentColor" strokeWidth="2" />
                      <line x1="40" y1="85" x2="300" y2="85" stroke="currentColor" strokeWidth="2" />
                      <line x1="300" y1="50" x2="300" y2="85" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    <p className="text-[10px] font-mono font-medium text-zinc-400 mt-1">
                      Fig: NTA-Standard Real-Time Rendered High-Yield NCERT Diagram #PHY-EM-802
                    </p>
                  </div>

                  {/* 4 Selectable Options */}
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {[
                      { id: "A", text: "2.5 × 10⁻² J" },
                      { id: "B", text: "1.0 × 10⁻² J" },
                      { id: "C", "text": "0.5 × 10⁻² J" },
                      { id: "D", text: "1.25 × 10⁻² J" },
                    ].map((opt) => {
                      const isSelected = selectedOption === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSelectedOption(opt.id)}
                          className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                            isSelected
                              ? "border-black bg-zinc-900 text-white shadow-sm"
                              : "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300 hover:bg-zinc-50"
                          }`}
                        >
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                              isSelected
                                ? "bg-amber-400 text-black"
                                : "bg-zinc-100 text-zinc-700"
                            }`}
                          >
                            {opt.id}
                          </span>
                          <span className="font-mono text-xs font-bold">
                            {opt.text}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Question Actions */}
                <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-4">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedOption("")}
                      className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-50"
                    >
                      Clear Response
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-50"
                    >
                      Mark for Review
                    </button>
                  </div>

                  <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-lg bg-amber-400 px-5 py-2 text-xs font-black text-black shadow-xs hover:bg-amber-300 transition-transform active:scale-95"
                  >
                    <span>Save & Next</span>
                    <span>→</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Palette & Study Circle (4 cols) */}
              <div className="bg-zinc-50/70 p-5 lg:col-span-4 flex flex-col justify-between gap-5">
                <div>
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-2 mb-3">
                    <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                      Question Palette
                    </h4>
                    <span className="text-[10px] font-bold text-zinc-500 font-mono">
                      PHY-SEC-A
                    </span>
                  </div>

                  {/* Legend */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-zinc-600 mb-4">
                    <div className="flex items-center gap-1.5">
                      <span className="h-3 w-3 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px]" />
                      <span>12 Answered</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-3 w-3 rounded-full bg-amber-400 text-black flex items-center justify-center text-[8px]" />
                      <span>1 Active</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-3 w-3 rounded-full bg-zinc-200 text-zinc-700 flex items-center justify-center text-[8px]" />
                      <span>29 Unvisited</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-3 w-3 rounded-full bg-purple-500 text-white flex items-center justify-center text-[8px]" />
                      <span>3 Marked</span>
                    </div>
                  </div>

                  {/* 15 Question Matrix */}
                  <div className="grid grid-cols-5 gap-1.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((num) => {
                      const isAnswered = [1, 2, 3, 6, 7, 8, 11, 12, 13].includes(num);
                      const isActive = num === 14;
                      return (
                        <div
                          key={num}
                          className={`flex h-7 items-center justify-center rounded-lg text-[11px] font-bold ${
                            isActive
                              ? "bg-amber-400 text-black ring-2 ring-black font-black"
                              : isAnswered
                              ? "bg-black text-white"
                              : "bg-white border border-zinc-200 text-zinc-700"
                          }`}
                        >
                          {num}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Peer Study Circle Live Status */}
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/80 p-3.5 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-950 mb-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>STUDY CIRCLE: AIIMS 720</span>
                  </div>
                  <p className="text-[11px] text-indigo-800">
                    4 peers currently taking this simulation simultaneously.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Section: Intent, Not Manual Tagging */}
      <section className="border-t border-black/[.06] bg-white py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
              INTENT, NOT MANUAL TAGGING
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl">
              You uploaded your handwritten notes. It built an NTA standard mock in 8 seconds.
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 sm:text-base">
              No manual tagging. No outdated 10-year-old static question banks. Real NEET
              difficulty calibrated with high-precision NTA assessment intelligence.
            </p>

          {/* Stepper */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs font-bold text-zinc-600">
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-black">
                1. Snap Notes
              </span>
              <span>→</span>
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-black">
                2. Multimodal OCR
              </span>
              <span>→</span>
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-black">
                3. Auto NTA Calibration
              </span>
              <span>→</span>
              <span className="rounded-full bg-amber-300 px-3 py-1 text-black font-black">
                4. Live Exam Mock & Video Studio
              </span>
            </div>
          </div>

          {/* Dark Transform Card */}
          <div className="mt-12 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl text-white sm:p-8">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-xs font-bold text-zinc-300">
                  Extracting handwritten diagrams & formula derivations...
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-1 bg-amber-400 rounded-full animate-pulse" />
                <div className="h-5 w-1 bg-amber-400 rounded-full animate-pulse delay-75" />
                <div className="h-2 w-1 bg-amber-400 rounded-full animate-pulse delay-150" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Left: Handwritten Note */}
              <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/90 p-5 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    HANDWRITTEN COACHING PAGE (ALLEN KOTA)
                  </span>
                  <div className="mt-3 font-mono text-xs text-zinc-300 space-y-2 leading-relaxed">
                    <p className="italic text-zinc-400">
                      “Loss in energy when capacitors connect: ΔU = 1/2 * (C1*C2)/(C1+C2) * (V1 - V2)²”
                    </p>
                    <p className="text-amber-300">
                      “Note: Important for NEET assertion-reason section! Common trap with polarity reversed!”
                    </p>
                  </div>
                </div>

                <div className="mt-6 border-t border-zinc-800 pt-3 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                  <span>High-Precision Multi-turn Extraction</span>
                  <span className="text-emerald-400 font-bold">99.4% confidence</span>
                </div>
              </div>

              {/* Right: Synthesized MCQ */}
              <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                      SYNTHESIZED MCQ
                    </span>
                    <span className="rounded bg-indigo-900/60 px-1.5 py-0.5 text-[9px] font-bold text-indigo-300">
                      Section B (Opt: 10/15)
                    </span>
                  </div>

                  <div className="mt-3 text-xs leading-relaxed space-y-2 text-zinc-200">
                    <p>
                      <strong>Assertion (A):</strong> Electrostatic energy is conserved during
                      redistribution of charge between two isolated capacitors.
                    </p>
                    <p>
                      <strong>Reason (R):</strong> Energy is dissipated as heat and
                      electromagnetic radiation through connecting wires.
                    </p>
                  </div>
                </div>

                <div className="mt-4 border-t border-indigo-900/50 pt-2 text-[11px] font-mono font-bold text-emerald-400">
                  Key: Both (A) is false, but (R) is true.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4.5 Section: AI Notes-to-Video Studio (Animated Visual Micro-Lectures) */}
      <section id="notes-to-video" className="border-t border-black/[.08] bg-[#090d16] py-20 text-white relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-3.5 py-1 text-xs font-bold text-amber-300 shadow-2xs mb-4 backdrop-blur-xs">
              <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
              <span>NEW FEATURE • AI VISUAL PEDAGOGY STUDIO</span>
            </div>

            <h2 className="text-3xl font-black tracking-tight sm:text-5xl sm:leading-tight">
              Turn dense coaching notes into{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-emerald-400">
                animated video micro-lectures.
              </span>
            </h2>

            <p className="mt-4 text-xs sm:text-base leading-relaxed text-zinc-400">
              Upload camera snaps of complex reactions, Krebs cycles, or physics derivations.
              Solvd synthesizes animated 16:9 vector video lessons with clear tutor voiceover,
              phrase-synced subtitles, and instant 1080p MP4 export.
            </p>
          </div>

          {/* Interactive Micro-Lecture Video Showcase */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: 16:9 Cinema Mockup Player */}
            <div className="lg:col-span-7 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:p-5 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  </div>
                  <span className="font-mono text-[11px] text-zinc-400 ml-1.5">
                    micro-lecture-player-1080p.mp4
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold font-mono">
                    HD 1080p
                  </span>
                  <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-300 font-mono">
                    1.25x Speed
                  </span>
                </div>
              </div>

              {/* 16:9 SVG Visual Canvas Mockup */}
              <div className="relative aspect-video w-full rounded-xl bg-gradient-to-b from-slate-900 to-[#0a0f1d] border border-zinc-800/80 p-4 flex flex-col justify-between overflow-hidden shadow-inner">
                {/* Scene Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-amber-400 text-black px-2 py-0.5 text-[10px] font-black uppercase">
                      Scene 2 of 4
                    </span>
                    <span className="text-xs font-bold text-zinc-200">
                      Capacitor Energy Redistribution & Heat Loss
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">01:14 / 02:30</span>
                </div>

                {/* Animated Pedagogical Diagram in Canvas */}
                <div className="my-auto py-2 flex flex-col items-center justify-center">
                  <svg viewBox="0 0 380 90" className="w-full max-h-24 text-zinc-200">
                    {/* Left Cap */}
                    <rect x="25" y="15" width="70" height="50" rx="8" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.5" />
                    <text x="60" y="38" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#f8fafc">C₁ = 20μF</text>
                    <text x="60" y="52" textAnchor="middle" fontSize="8" fill="#cbd5e1">V₁ = 100V</text>

                    {/* Arrow / Switch Flow */}
                    <line x1="100" y1="40" x2="160" y2="40" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 2" />
                    <polygon points="160,37 167,40 160,43" fill="#38bdf8" />
                    <text x="130" y="32" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#38bdf8">Switch Closed</text>

                    {/* Middle Delta U formula */}
                    <rect x="175" y="15" width="100" height="50" rx="8" fill="#0f172a" stroke="#10b981" strokeWidth="1.5" />
                    <text x="225" y="35" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#34d399">ΔU = ½ (C₁C₂/C₁+C₂)</text>
                    <text x="225" y="50" textAnchor="middle" fontSize="8" fill="#94a3b8">× (V₁ - V₂)²</text>

                    {/* Right Cap */}
                    <rect x="285" y="15" width="70" height="50" rx="8" fill="#1e293b" stroke="#818cf8" strokeWidth="1.5" />
                    <text x="320" y="38" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#f8fafc">C₂ = 40μF</text>
                    <text x="320" y="52" textAnchor="middle" fontSize="8" fill="#cbd5e1">V₂ = 0V</text>
                  </svg>
                </div>

                {/* Phrase-Synced Subtitles Bar */}
                <div className="w-full rounded-lg bg-black/80 backdrop-blur-md border border-white/10 px-3 py-2 text-center shadow-lg">
                  <p className="text-xs font-semibold text-zinc-100">
                    <span className="text-amber-300 font-bold">“When the switch closes,”</span> charges flow until common potential is reached, dissipating exactly <span className="text-emerald-400 font-bold">50% energy as heat.</span>
                  </p>
                </div>
              </div>

              {/* Player Bottom Controls */}
              <div className="mt-3 flex items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-amber-400 text-black flex items-center justify-center font-bold shadow-sm">
                    <Play className="h-4 w-4 fill-black ml-0.5" />
                  </div>
                  <div className="hidden sm:flex flex-col">
                    <span className="text-[11px] font-bold text-zinc-200">Studio Tutor Voiceover</span>
                    <span className="text-[9px] text-zinc-400">Synchronized Audio</span>
                  </div>
                </div>

                {/* Time Progress Bar */}
                <div className="flex-1 mx-2">
                  <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                    <div className="h-full w-1/2 bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full" />
                  </div>
                </div>

                {/* Interactive Mode Badge */}
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800/80 border border-zinc-700/80 px-2.5 py-1 text-[10.5px] font-semibold text-zinc-300 font-mono">
                  <Sparkles className="h-3 w-3 text-amber-400" />
                  <span>Interactive Preview</span>
                </div>
              </div>
            </div>

            {/* Right: Key Value Points & Studio CTA */}
            <div className="lg:col-span-5 space-y-5">
              <div className="space-y-3.5">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20">
                    <Video className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-100">16:9 Clean Vector Pedagogy</h4>
                    <p className="mt-0.5 text-xs text-zinc-400 leading-relaxed">
                      Converts handwritten notes and reaction mechanisms into structured visual slides with zero clutter.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                    <Volume2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-100">Natural Audio Narration & Multiplier</h4>
                    <p className="mt-0.5 text-xs text-zinc-400 leading-relaxed">
                      Clear educator voiceover with instant 1x, 1.25x, 1.5x, and 2x speed playback controls.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-400/10 text-blue-400 border border-blue-400/20">
                    <Download className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-100">1-Click 1080p MP4 Video Export</h4>
                    <p className="mt-0.5 text-xs text-zinc-400 leading-relaxed">
                      Download full audio-visual MP4 files directly to your phone or laptop for offline bus & hostel revision.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/dashboard/notes-to-video"
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 py-3 text-xs font-black text-black shadow-md hover:bg-amber-300 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Video className="h-4 w-4 text-black" />
                  <span>Try Notes to Video Studio Free</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Section: Bento Grid (Engineered for Top 1% Ranks) */}
      <section id="features" className="border-t border-black/[.06] bg-[#fafafa] py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
              ENGINEERED FOR TOP 1% RANKS
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl">
              Engineered for high-stakes medical entrance mastery.
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 sm:text-base">
              NEET demands rapid pattern recognition, negative marking discipline, and high-yield conceptual clarity.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Card 1: High-Yield Multimodal OCR */}
            <div className="rounded-2xl border border-black/[.08] bg-white p-7 shadow-xs transition-all hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <Eye className="h-5 w-5" />
              </div>
              <span className="mt-4 block text-[10px] font-black uppercase tracking-wider text-amber-600">
                VISION ENGINE
              </span>
              <h3 className="mt-1 text-lg font-bold text-zinc-950">
                High-Yield Multimodal OCR
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600">
                Feed Solvd your unorganized coaching binders, handwritten margin notes, or
                blurry textbook camera snaps. The vision pipeline reconstructs high-fidelity
                vector diagrams, complex metabolic cycles, and exact NTA-format numerical stems
                instantly.
              </p>

              <div className="mt-5 flex flex-wrap gap-1.5 text-[10px] font-bold text-zinc-600">
                <span className="rounded-md bg-zinc-100 px-2 py-1">Ray Optics Diagrams</span>
                <span className="rounded-md bg-zinc-100 px-2 py-1">Organic Reaction Mechanisms</span>
                <span className="rounded-md bg-zinc-100 px-2 py-1">Morphology Tables</span>
                <span className="rounded-md bg-zinc-100 px-2 py-1">Genetics Pedigrees</span>
              </div>
            </div>

            {/* Card 2: AI Video Micro-Lecture Studio (NEW) */}
            <div className="rounded-2xl border border-amber-300/80 bg-gradient-to-br from-amber-50/50 to-white p-7 shadow-xs transition-all hover:shadow-md relative overflow-hidden">
              <div className="absolute top-4 right-4 rounded-full bg-amber-300 px-2 py-0.5 text-[9px] font-black text-black">
                NEW
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-black shadow-xs">
                <Video className="h-5 w-5" />
              </div>
              <span className="mt-4 block text-[10px] font-black uppercase tracking-wider text-amber-700">
                AI VISUAL STUDIO
              </span>
              <h3 className="mt-1 text-lg font-bold text-zinc-950">
                Notes to Video Micro-Lectures
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600">
                Turn dense handwritten notes or textbook pages into dynamic 16:9 animated video lessons.
                Complete with natural audio narration, phrase-by-phrase subtitles, speed multipliers, and
                instant 1080p MP4 download for offline revision.
              </p>

              <div className="mt-5 flex flex-wrap gap-1.5 text-[10px] font-bold text-zinc-700">
                <span className="rounded-md bg-white border border-amber-200 px-2 py-1">16:9 Vector Canvas</span>
                <span className="rounded-md bg-white border border-amber-200 px-2 py-1">Voiceover Narration</span>
                <span className="rounded-md bg-white border border-amber-200 px-2 py-1">Dynamic Subtitles</span>
                <span className="rounded-md bg-amber-400 text-black px-2 py-1">1080p MP4 Export</span>
              </div>
            </div>

            {/* Card 3: True NTA CBT Simulator */}
            <div className="rounded-2xl border border-black/[.08] bg-white p-7 shadow-xs transition-all hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                <Target className="h-5 w-5" />
              </div>
              <span className="mt-4 block text-[10px] font-black uppercase tracking-wider text-rose-600">
                EXACT FIDELITY
              </span>
              <h3 className="mt-1 text-lg font-bold text-zinc-950">
                True NTA CBT Simulator
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600">
                Eliminate exam-hall disorientation. Solvd uses the 1:1 identical color palette,
                keyboard shortcuts, question status matrix, and Section A/Section B mechanics
                mandated by the National Testing Agency.
              </p>

              <div className="mt-5 flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs font-bold text-zinc-800">
                <span>Official Layout Parity</span>
                <span className="text-emerald-600 font-extrabold">100% Certified</span>
              </div>
            </div>

            {/* Card 4: Study Circles & Trajectory */}
            <div id="study-circles" className="rounded-2xl border border-black/[.08] bg-white p-7 shadow-xs transition-all hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                <Users className="h-5 w-5" />
              </div>
              <span className="mt-4 block text-[10px] font-black uppercase tracking-wider text-indigo-600">
                SOCIAL ACCOUNTABILITY
              </span>
              <h3 className="mt-1 text-lg font-bold text-zinc-950">
                Study Circles & Trajectory
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600">
                Never test in lonely isolation. Form locked Study Circles with your batchmates,
                start synchronous 2:00 PM mocks, and compare your 720 score trajectory across
                weekly chapter sprints.
              </p>

              <div className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-amber-400 px-1.5 py-0.5 text-[9px] font-black text-black">
                    #1
                  </span>
                  <span className="font-bold text-zinc-900">Circle &quot;Kota Batch A1&quot;</span>
                </div>
                <span className="font-mono text-[11px] text-zinc-500">
                  Avg: 672 / 720 • 8 Aspirants
                </span>
              </div>
            </div>

            {/* Card 5: Negative Marking Diagnostic */}
            <div id="analytics" className="md:col-span-2 rounded-2xl border border-black/[.08] bg-white p-7 shadow-xs transition-all hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <span className="mt-4 block text-[10px] font-black uppercase tracking-wider text-amber-600">
                POST-MORTEM DIAGNOSTICS
              </span>
              <h3 className="mt-1 text-lg font-bold text-zinc-950">
                Negative Marking Diagnostic & Mistake Ledger
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600">
                A minus one is worse than zero. Solvd breaks down every mistake into 3
                distinct categories: Calculation Slips, Misread Negative Words (e.g.
                &quot;INCORRECT&quot;), or Genuine Conceptual Voids.
              </p>

              <div className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                <div className="flex justify-between text-[10px] font-bold text-zinc-500 mb-1.5">
                  <span>Error Classification Index</span>
                  <span>Sample Mock #14</span>
                </div>
                <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                  <span className="text-rose-600">• 45% Trapped in &apos;Except/Not&apos;</span>
                  <span className="text-amber-600">• 35% Math Slippage</span>
                  <span className="text-blue-600">• 20% Concept Void</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Section: Call to Action (Free Early Access) */}
      <section className="border-t border-black/[.06] bg-white py-20 text-center">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 shadow-inner mb-6">
            <Target className="h-7 w-7" />
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-1.5 text-xs font-bold text-amber-900 shadow-2xs mb-4">
            <Sparkles className="h-3.5 w-3.5 text-amber-600 animate-pulse" />
            <span>SPECIAL EARLY ACCESS PROMOTION</span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl">
            Ready to test your true NEET rank?
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-zinc-600 sm:text-base">
            Practice under genuine NTA conditions and see your true NEET rank.
            Solvd is <strong>100% free till 30 October</strong> with zero credit card needed.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-black px-8 text-sm font-bold text-white shadow-md hover:bg-zinc-800 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Use Solvd for free</span>
              <ArrowRight className="h-4 w-4 text-amber-400" />
            </Link>

            <Link
              href="/pricing"
              className="flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-6 text-sm font-bold text-zinc-800 shadow-2xs hover:bg-zinc-50 transition-all"
            >
              <span>View Pricing Plan</span>
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-zinc-500">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Free till 30 October
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Updated NTA Syllabi
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Zero card required
            </span>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
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
