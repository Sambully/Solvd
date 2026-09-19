"use client";

import { useState } from "react";
import Link from "next/link";
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
} from "lucide-react";

export default function Home() {
  const [selectedOption, setSelectedOption] = useState<string>("B");
  const [emailInput, setEmailInput] = useState<string>("");

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans antialiased selection:bg-amber-200 selection:text-black">
      {/* 1. Top Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-black/[.05] bg-white/60 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 shadow-2xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white shadow-xs transition-transform group-hover:scale-105">
              <div className="relative flex h-5 w-5 items-center justify-center">
                <div className="h-4 w-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin-slow" />
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

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-zinc-600">
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
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="text-sm font-semibold text-zinc-700 hover:text-black px-3 py-1.5"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-zinc-800 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Try Solvd Free</span>
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 text-[10px]">
                →
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-24 lg:pt-20">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          {/* NTA NEET 2026 Engine Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/80 bg-amber-50/80 px-4 py-1.5 text-xs font-bold text-amber-900 shadow-2xs backdrop-blur-xs mb-6">
            <Sparkles className="h-3.5 w-3.5 text-amber-600 animate-pulse" />
            <span>NTA NEET 2026 ENGINE | High-Yield Assessment Engine Active</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-950 sm:text-6xl sm:leading-[1.15]">
            Stop guessing in NEET.{" "}
            <span className="relative inline-block px-2.5 py-0.5 rounded-lg bg-amber-300/75 text-zinc-950 font-black">
              simulate the
            </span>{" "}
            real exam.
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-600 sm:text-lg">
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
            <span>High-Yield Multimodal OCR</span>
            <span className="mx-2 text-zinc-300">•</span>
            <span>Synchronized Room Timers</span>
          </div>

          {/* Social Proof / Aspirants count */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-black/[.06] bg-white px-4 py-2 shadow-2xs">
            <div className="flex -space-x-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-[10px] font-black text-black ring-2 ring-white">
                AK
              </span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-black text-white ring-2 ring-white">
                SR
              </span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-black text-white ring-2 ring-white">
                PT
              </span>
            </div>
            <p className="text-xs font-bold text-zinc-800">
              12,400+ NEET aspirants and counting.{" "}
              <Link href="/sign-up" className="text-blue-600 hover:underline">
                Join them →
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
                  nta-cbt-engine-2026-v4.1.app
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
                4. Live Exam Mock
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
                      “Note: Important for NEET 2026 assertion-reason section! Common trap with polarity reversed!”
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

      {/* 5. Section: Bento Grid (Engineered for Top 1% Ranks) */}
      <section id="features" className="border-t border-black/[.06] bg-[#fafafa] py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
              ENGINEERED FOR TOP 1% RANKS
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl">
              Built specifically for the cruelest exam in the world.
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 sm:text-base">
              NEET isn&apos;t a test of knowledge. It&apos;s a test of rapid pattern recognition,
              negative marking discipline, and raw psychological stamina.
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

            {/* Card 2: True NTA CBT Simulator */}
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

            {/* Card 3: Study Circles & Trajectory */}
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

            {/* Card 4: Negative Marking Diagnostic */}
            <div id="analytics" className="rounded-2xl border border-black/[.08] bg-white p-7 shadow-xs transition-all hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <span className="mt-4 block text-[10px] font-black uppercase tracking-wider text-amber-600">
                POST-MORTEM DIAGNOSTICS
              </span>
              <h3 className="mt-1 text-lg font-bold text-zinc-950">
                Negative Marking Diagnostic
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
            Join over 12,000 medical candidates practicing in genuine NTA conditions.
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
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Updated 2026 NTA Syllabi
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
