"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Zap,
  Target,
  Clock,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Eye,
  Layers,
  RotateCcw,
  Check,
  Award,
  AlertTriangle,
  Play,
  FileText,
  Sliders,
} from "lucide-react";

export default function CBTSimulatorPage() {
  const [activeStep, setActiveStep] = useState<number>(2);
  const [selectedOption, setSelectedOption] = useState<string>("B");
  const [isMarkedForReview, setIsMarkedForReview] = useState<boolean>(false);
  const [selectedSection, setSelectedSection] = useState<"A" | "B">("A");
  const [activeQuestion, setActiveQuestion] = useState<number>(14);

  // Auto animation loop between steps for rich experience
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev % 4) + 1);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans antialiased selection:bg-amber-200 selection:text-black flex flex-col justify-between">
      {/* 1. Translucent Sticky Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-black/[.05] bg-white/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 shadow-2xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3.5 py-2.5 sm:px-6 sm:py-3.5 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-black text-white shadow-xs transition-transform group-hover:scale-105">
              <div className="relative flex h-3.5 w-3.5 sm:h-5 sm:w-5 items-center justify-center">
                <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-full border-2 border-amber-400 border-t-transparent" />
                <div className="absolute h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-base sm:text-xl font-black tracking-tight text-black">
                solvd<span className="text-amber-500">.</span>
              </span>
              <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[9px] sm:text-[11px] font-extrabold uppercase tracking-wider text-zinc-600">
                NEET CBT
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-semibold text-zinc-600">
            <Link href="/features" className="transition-colors hover:text-black">
              Features
            </Link>
            <Link href="/cbt-simulator" className="font-bold text-black border-b-2 border-amber-400 pb-0.5">
              CBT Simulator
            </Link>
            <Link href="/help" className="transition-colors hover:text-black">
              Help
            </Link>
            <Link href="/pricing" className="transition-colors hover:text-black font-bold text-slate-900">
              Pricing <span className="rounded-full bg-amber-300 px-1.5 py-0.2 text-[10px] font-black text-black ml-1">FREE</span>
            </Link>
          </nav>

          {/* Right Action */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            <Link
              href="/sign-in"
              className="text-xs sm:text-sm font-semibold text-zinc-700 hover:text-black px-2 py-1 sm:px-3 sm:py-1.5"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
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

      {/* 2. Main Content */}
      <main className="flex-1 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-1.5 text-xs font-bold text-amber-900 shadow-2xs mb-4">
              <Target className="h-3.5 w-3.5 text-amber-600" />
              <span>OFFICIAL NTA EXAMINATION SIMULATOR</span>
            </div>

            <h1 className="text-4xl font-black tracking-tight text-zinc-950 sm:text-6xl sm:leading-[1.1]">
              From notes to live NTA CBT in 15 seconds.
            </h1>

            <p className="mt-5 text-base leading-relaxed text-zinc-600 sm:text-lg">
              Experience the complete pipeline: messy handwritten notes scanned, parsed for formulas and circuit diagrams, and launched into an authentic 1:1 NTA exam room environment.
            </p>
          </div>

          {/* 3. Interactive Note-to-CBT Animated Pipeline Showcase */}
          <div className="mt-14 rounded-3xl border border-slate-900 bg-[#0a0f1d] p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />

            {/* Stepper Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-6 mb-8">
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { step: 1, label: "1. Raw Handwritten Note" },
                  { step: 2, label: "2. Multimodal OCR Scan" },
                  { step: 3, label: "3. NTA Distractor Calibration" },
                  { step: 4, label: "4. Live Exam Mock Launch" },
                ].map((s) => (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => setActiveStep(s.step)}
                    className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                      activeStep === s.step
                        ? "bg-amber-400 text-slate-950 font-black shadow-md scale-105"
                        : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-mono text-slate-300 font-bold">
                  Auto Engine Sync: Step {activeStep}/4
                </span>
              </div>
            </div>

            {/* Transform Stage Display */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Left Stage View */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                    STAGE {activeStep} PREVIEW
                  </span>
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">
                    Confidence: 99.8%
                  </span>
                </div>

                {activeStep === 1 && (
                  <div className="space-y-3 font-mono text-xs">
                    <p className="text-slate-400 text-[11px]">Source: Allen Kota Class 12 Physics Notes</p>
                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-2">
                      <p className="text-amber-300 italic font-semibold">
                        “When capacitor C₁ (charged to V₁) is connected to uncharged C₂:
                        Loss in energy ΔU = ½ * [C₁C₂ / (C₁+C₂)] * (V₁ - V₂)²”
                      </p>
                      <p className="text-slate-400 text-[11px]">
                        “High probability assertion-reason concept for NEET Section B.”
                      </p>
                    </div>
                  </div>
                )}

                {activeStep === 2 && (
                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>PARSING SCIENTIFIC FORMULAS & DIAGRAMS</span>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-2">
                      <p className="text-indigo-300 font-bold text-[11px]">Scientific Formula Extracted:</p>
                      <code className="text-xs text-amber-200 block bg-slate-950 p-2 rounded">
                        ΔU = 1/2 × [(C1 × C2) / (C1 + C2)] × (V1 - V2)²
                      </code>
                      <p className="text-slate-400 text-[10px]">Recognized Diagram: Parallel Capacitor Charge Redistribution Circuit</p>
                    </div>
                  </div>
                )}

                {activeStep === 3 && (
                  <div className="space-y-3 font-mono text-xs">
                    <span className="text-xs text-indigo-400 font-bold block">
                      NTA NEET CALIBRATION APPLIED
                    </span>
                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-2 text-[11px]">
                      <p className="text-slate-300">✓ Marking: +4 marks correct, -1 mark incorrect</p>
                      <p className="text-slate-300">✓ Section Assignment: Physics Section A (Mandatory)</p>
                      <p className="text-slate-300">✓ Distractor Generation: Calculated common math errors as options A, C, D</p>
                    </div>
                  </div>
                )}

                {activeStep === 4 && (
                  <div className="space-y-3 font-mono text-xs">
                    <span className="text-xs text-emerald-400 font-bold block">
                      READY FOR LIVE ATTEMPT
                    </span>
                    <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-4 space-y-2">
                      <p className="text-slate-200 font-sans text-xs">
                        Exam is packaged with full countdown timer, review state management, and 1-click submission.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Final Synthesized Output View */}
              <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="rounded bg-indigo-900/60 px-2 py-0.5 text-[10px] font-bold text-indigo-300 uppercase">
                      Live Synthesized Output
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      NTA CBT Compatible
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-100 leading-relaxed">
                    A parallel plate capacitor of capacitance 20 μF is charged to 100V and disconnected. It is then connected across an uncharged 40 μF capacitor. What is the total electrostatic energy lost?
                  </h3>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-2.5 text-slate-300">
                      (A) 2.5 × 10⁻² J
                    </div>
                    <div className="rounded-lg border border-emerald-500/50 bg-emerald-950/40 p-2.5 text-emerald-300 font-bold">
                      (B) 0.67 × 10⁻¹ J (Key)
                    </div>
                    <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-2.5 text-slate-300">
                      (C) 1.0 × 10⁻² J
                    </div>
                    <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-2.5 text-slate-300">
                      (D) 3.33 × 10⁻² J
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">Synthesized in 12.4s</span>
                  <Link
                    href="/dashboard#instant-mock-section"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2 text-xs font-black text-slate-950 hover:bg-amber-300 transition-all"
                  >
                    <span>Generate Yours</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Full-Fidelity NTA CBT Exam Hall Simulator */}
          <div className="mt-20">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-3xl font-black text-slate-950">
                Interactive NTA CBT Exam Interface
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-600">
                Click options, switch sections, and test question palette states in this authentic simulation.
              </p>
            </div>

            {/* Simulated Desktop Window */}
            <div className="rounded-3xl border-2 border-slate-300 bg-white shadow-2xl overflow-hidden">
              {/* Window Title Bar */}
              <div className="bg-[#0f172a] px-5 py-3 text-white flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-rose-500" />
                    <span className="h-3 w-3 rounded-full bg-amber-500" />
                    <span className="h-3 w-3 rounded-full bg-emerald-500" />
                  </div>
                  <span className="font-mono font-bold text-slate-300">
                    nta-cbt-engine-2026.app
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="rounded bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-300">
                    +4 / -1 Marking
                  </span>
                  <div className="flex items-center gap-1.5 font-mono font-black text-amber-300">
                    <Clock className="h-4 w-4" />
                    <span>02:44:12 Remaining</span>
                  </div>
                </div>
              </div>

              {/* Sub-Header / Subject Navigation */}
              <div className="bg-slate-100 border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {["Physics", "Chemistry", "Botany", "Zoology"].map((sub, i) => (
                    <button
                      key={sub}
                      type="button"
                      className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                        i === 0 ? "bg-[#0f172a] text-white" : "bg-white text-slate-600 border border-slate-200"
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setSelectedSection("A")}
                    className={`rounded-lg px-2.5 py-1 ${
                      selectedSection === "A" ? "bg-slate-900 text-white" : "text-slate-600"
                    }`}
                  >
                    Section A (35 Q)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSection("B")}
                    className={`rounded-lg px-2.5 py-1 ${
                      selectedSection === "B" ? "bg-slate-900 text-white" : "text-slate-600"
                    }`}
                  >
                    Section B (10/15 Q)
                  </button>
                </div>
              </div>

              {/* Question Screen & Palette Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 min-h-[440px]">
                {/* Left: Active Question Area */}
                <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                      <span className="text-xs font-black text-slate-900">
                        Question No. {activeQuestion}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400">
                        Single Choice Objective
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                      In the circuit shown below, the charge stored on the 20 μF capacitor when connected to a 100V supply is disconnected and connected across an uncharged 40 μF capacitor. What is the net electrostatic energy lost in the process?
                    </p>

                    {/* Circuit Diagram Preview */}
                    <div className="my-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                      <svg className="mx-auto h-20 w-72 text-slate-800" viewBox="0 0 340 100" fill="none">
                        <line x1="40" y1="50" x2="110" y2="50" stroke="currentColor" strokeWidth="2" />
                        <line x1="110" y1="30" x2="110" y2="70" stroke="currentColor" strokeWidth="3" />
                        <line x1="125" y1="30" x2="125" y2="70" stroke="currentColor" strokeWidth="3" />
                        <line x1="125" y1="50" x2="215" y2="50" stroke="currentColor" strokeWidth="2" />
                        <line x1="215" y1="30" x2="215" y2="70" stroke="currentColor" strokeWidth="3" />
                        <line x1="230" y1="30" x2="230" y2="70" stroke="currentColor" strokeWidth="3" />
                        <line x1="230" y1="50" x2="300" y2="50" stroke="currentColor" strokeWidth="2" />
                        <line x1="40" y1="50" x2="40" y2="85" stroke="currentColor" strokeWidth="2" />
                        <line x1="40" y1="85" x2="300" y2="85" stroke="currentColor" strokeWidth="2" />
                        <line x1="300" y1="50" x2="300" y2="85" stroke="currentColor" strokeWidth="2" />
                      </svg>
                      <p className="text-[10px] font-mono text-slate-400">Fig: High-Yield Electrostatics Capacitor Circuit</p>
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { id: "A", text: "2.5 × 10⁻² J" },
                        { id: "B", text: "0.67 × 10⁻¹ J" },
                        { id: "C", text: "1.0 × 10⁻² J" },
                        { id: "D", text: "3.33 × 10⁻² J" },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSelectedOption(opt.id)}
                          className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                            selectedOption === opt.id
                              ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                              : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                          }`}
                        >
                          <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                            selectedOption === opt.id ? "bg-amber-400 text-black" : "bg-slate-100 text-slate-700"
                          }`}>
                            {opt.id}
                          </span>
                          <span className="font-mono text-xs font-bold">{opt.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-8 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsMarkedForReview(!isMarkedForReview)}
                        className={`rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${
                          isMarkedForReview
                            ? "border-purple-600 bg-purple-50 text-purple-700"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {isMarkedForReview ? "★ Marked for Review" : "Mark for Review & Next"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedOption("")}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        Clear Response
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveQuestion((prev) => (prev < 35 ? prev + 1 : 1))}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#0f172a] px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 shadow-sm"
                    >
                      <span>Save & Next</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Right: Question Palette Matrix */}
                <div className="lg:col-span-4 p-6 bg-slate-50 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-3">
                      QUESTION PALETTE
                    </h3>

                    {/* Status Legends */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-bold mb-5">
                      <div className="flex items-center gap-1.5">
                        <span className="h-4 w-4 rounded bg-emerald-600 text-white flex items-center justify-center">1</span>
                        <span>Answered (14)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-4 w-4 rounded bg-rose-600 text-white flex items-center justify-center">2</span>
                        <span>Not Answered (6)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-4 w-4 rounded bg-purple-600 text-white flex items-center justify-center">3</span>
                        <span>Marked Review (3)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-4 w-4 rounded bg-slate-200 text-slate-700 flex items-center justify-center">4</span>
                        <span>Not Visited (12)</span>
                      </div>
                    </div>

                    {/* Question Button Grid */}
                    <div className="grid grid-cols-7 gap-1.5 max-h-56 overflow-y-auto pr-1">
                      {Array.from({ length: 35 }, (_, i) => i + 1).map((qNum) => {
                        const isCurrent = activeQuestion === qNum;
                        let colorClass = "bg-slate-200 text-slate-700";
                        if (qNum === 14) colorClass = "bg-emerald-600 text-white";
                        else if (qNum < 14) colorClass = qNum % 3 === 0 ? "bg-purple-600 text-white" : "bg-emerald-600 text-white";
                        else if (qNum === 15) colorClass = "bg-rose-600 text-white";

                        return (
                          <button
                            key={qNum}
                            type="button"
                            onClick={() => setActiveQuestion(qNum)}
                            className={`h-7 w-7 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${colorClass} ${
                              isCurrent ? "ring-2 ring-slate-950 ring-offset-2 scale-110" : ""
                            }`}
                          >
                            {qNum}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-200">
                    <Link
                      href="/dashboard"
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-black text-white hover:bg-emerald-700 shadow-sm"
                    >
                      <span>Submit Test Mock</span>
                      <Check className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Bottom Launch CTA */}
          <div className="mt-20 rounded-3xl bg-[#0f172a] p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-black font-black mb-4">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-2xl sm:text-4xl font-black tracking-tight">
                Simulate Your True NEET Rank Today
              </h3>
              <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                Start generating exams from your notes and experience authentic NTA examination conditions. Completely free till 30 October.
              </p>
              <Link
                href="/dashboard"
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-8 py-4 text-xs font-black text-slate-950 shadow-md hover:bg-amber-300 transition-all hover:scale-105 active:scale-95"
              >
                <span>Use Solvd for free</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* 6. Footer */}
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
