"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Zap,
  Target,
  Users,
  BookOpen,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Brain,
  FileCheck2,
  Clock,
  Award,
  Layers,
  Sparkle,
  UploadCloud,
  ChevronRight,
  Eye,
  Play,
  Mail,
  Video,
  Volume2,
  Download,
} from "lucide-react";
import SolvdLogo from "@/components/SolvdLogo";
import WaveParticleCanvas from "@/components/WaveParticleCanvas";

type FeatureCategory = "ALL" | "OCR" | "VIDEO" | "CBT_SIM" | "BANK" | "CIRCLES" | "ANALYTICS";

export default function FeaturesPage() {
  const [activeCategory, setActiveCategory] = useState<FeatureCategory>("ALL");
  const [interactiveStep, setInteractiveStep] = useState<number>(1);
  const [videoSceneStep, setVideoSceneStep] = useState<number>(1);
  const [demoSelectedOption, setDemoSelectedOption] = useState<string>("B");
  const [demoPaletteFilter, setDemoPaletteFilter] = useState<string>("ALL");

  const categories: Array<{ id: FeatureCategory; label: string; icon: typeof Sparkles }> = [
    { id: "ALL", label: "All Features", icon: Sparkles },
    { id: "OCR", label: "Multimodal OCR", icon: Eye },
    { id: "VIDEO", label: "Notes to Video", icon: Video },
    { id: "CBT_SIM", label: "NTA Simulator", icon: Target },
    { id: "BANK", label: "Question Bank", icon: BookOpen },
    { id: "CIRCLES", label: "Study Circles", icon: Users },
    { id: "ANALYTICS", label: "Mistake Ledger", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans antialiased selection:bg-amber-200 selection:text-black flex flex-col justify-between">
      {/* 1. Sticky Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-black/[.05] bg-white/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 shadow-2xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3.5 py-2.5 sm:px-6 sm:py-3.5 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <SolvdLogo size="sm" />
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-semibold text-zinc-600">
            <Link href="/features" className="font-bold text-black border-b-2 border-amber-400 pb-0.5">
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

      {/* 2. Hero Section */}
      <main className="flex-1 py-14 sm:py-20 relative overflow-hidden">
        {/* Dynamic Flowing Purple Particle Wave Background */}
        <WaveParticleCanvas className="opacity-75" strandCount={10} waveHeight={48} centerYRatio={0.22} interactive={false} />

        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-1.5 text-xs font-bold text-amber-900 shadow-2xs mb-4">
              <Sparkles className="h-3.5 w-3.5 text-amber-600 animate-pulse" />
              <span>NTA NEET PLATFORM ARCHITECTURE</span>
            </div>

            <h1 className="text-4xl font-black tracking-tight text-zinc-950 sm:text-6xl sm:leading-[1.1]">
              Engineered specifically for high-stakes NEET medical entrance mastery.
            </h1>

            <p className="mt-5 text-base leading-relaxed text-zinc-600 sm:text-lg">
              Explore the complete ecosystem of Solvd: instant OCR note synthesis, authentic NTA computer-based exam mechanics, collaborative study rooms, and post-mortem mistake diagnostics.
            </p>

            {/* Quick Filter Tabs */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              {categories.map((cat) => {
                const active = activeCategory === cat.id;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                      active
                        ? "bg-[#0f172a] text-white shadow-md scale-105"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${active ? "text-amber-400" : "text-slate-400"}`} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Deep-Dive Feature Modules */}
          <div className="mt-16 space-y-16">
            {/* FEATURE 1: Multimodal OCR & Test Synthesis */}
            {(activeCategory === "ALL" || activeCategory === "OCR") && (
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-sm transition-all hover:border-slate-300">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-6 space-y-4">
                    <div className="inline-flex items-center gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-900">
                      <Eye className="h-3 w-3 text-amber-600" />
                      <span>Vision Extraction Pipeline</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
                      Instant Handwritten Notes & PDF Mock Generator
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      Upload camera snaps of your coaching binder, textbook margins, or Allen/Aakash module PDFs. The Solvd engine parses handwriting, extracts complex formulas, and synthesizes balanced NTA single-choice MCQs in under 20 seconds.
                    </p>

                    <div className="space-y-2.5 pt-2">
                      {[
                        "Multi-file PDF, PNG, and JPG uploads up to 25MB",
                        "Automatic extraction of Ray Optics & Organic chemistry diagrams",
                        "Configurable question counts (10, 15, 20, 30, or 45 MCQs)",
                        "Clear mathematical expressions with fractional stems and roots",
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4">
                      <Link
                        href="/dashboard#instant-mock-section"
                        className="inline-flex items-center gap-2 rounded-xl bg-[#0f172a] px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-all shadow-xs"
                      >
                        <span>Try Mock Generator</span>
                        <ArrowRight className="h-3.5 w-3.5 text-amber-400" />
                      </Link>
                    </div>
                  </div>

                  {/* Interactive OCR Demo Box */}
                  <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-[#090d16] p-5 sm:p-6 text-white shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[11px] font-mono text-slate-300 font-bold">
                          Solvd Multimodal Pipeline (Active)
                        </span>
                      </div>
                      <span className="rounded bg-indigo-900/60 px-2 py-0.5 text-[10px] font-mono font-bold text-indigo-300">
                        99.4% Accuracy
                      </span>
                    </div>

                    {/* Step Selector */}
                    <div className="grid grid-cols-3 gap-1.5 mb-4 text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setInteractiveStep(1)}
                        className={`rounded-lg py-1.5 px-2 text-center transition-all ${
                          interactiveStep === 1 ? "bg-amber-400 text-black font-black" : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        1. Raw Notes
                      </button>
                      <button
                        type="button"
                        onClick={() => setInteractiveStep(2)}
                        className={`rounded-lg py-1.5 px-2 text-center transition-all ${
                          interactiveStep === 2 ? "bg-amber-400 text-black font-black" : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        2. OCR Scan
                      </button>
                      <button
                        type="button"
                        onClick={() => setInteractiveStep(3)}
                        className={`rounded-lg py-1.5 px-2 text-center transition-all ${
                          interactiveStep === 3 ? "bg-amber-400 text-black font-black" : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        3. CBT Question
                      </button>
                    </div>

                    {/* Content Preview */}
                    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 font-mono text-xs text-slate-300 min-h-[140px] flex flex-col justify-center">
                      {interactiveStep === 1 && (
                        <div className="space-y-1 text-slate-400">
                          <p className="text-[10px] text-amber-400 font-bold">INPUT: HANDWRITTEN COACHING PAGE</p>
                          <p className="italic">“Loss in energy: ΔU = ½ * (C₁C₂)/(C₁+C₂) * (V₁ - V₂)²”</p>
                          <p className="text-[11px] text-slate-300">“Caution: Polarity traps frequently tested in NEET Section B!”</p>
                        </div>
                      )}
                      {interactiveStep === 2 && (
                        <div className="space-y-1.5">
                          <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                            PARSING CONCEPTS & FORMULA DERIVATIONS
                          </p>
                          <p className="text-slate-300 text-[11px]">→ Physics: Electrostatics / Capacitance</p>
                          <p className="text-slate-300 text-[11px]">→ Pattern: Assertion-Reasoning & Distractor Calibration</p>
                        </div>
                      )}
                      {interactiveStep === 3 && (
                        <div className="space-y-2">
                          <span className="rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 text-[9px] font-bold">
                            SYNTHESIZED NTA MCQ #01
                          </span>
                          <p className="text-[11px] font-sans font-medium text-slate-100 leading-relaxed">
                            Assertion (A): Electrostatic energy decreases during charge redistribution.<br />
                            Reason (R): Energy is dissipated as heat and radiation.
                          </p>
                          <p className="text-[10px] text-emerald-400 font-bold">Correct Key: Both (A) & (R) true, (R) explains (A).</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FEATURE: AI Notes to Video Studio */}
            {(activeCategory === "ALL" || activeCategory === "VIDEO") && (
              <div className="rounded-3xl border border-amber-300/80 bg-gradient-to-br from-amber-50/20 via-white to-white p-6 sm:p-10 shadow-sm transition-all hover:border-amber-400/80">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-6 space-y-4">
                    <div className="inline-flex items-center gap-1.5 rounded-md border border-amber-400/60 bg-amber-100/70 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-950">
                      <Video className="h-3 w-3 text-amber-700" />
                      <span>AI Visual Pedagogy Studio</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
                      Notes to Animated Video Micro-Lectures
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      Transform dense handwritten notes, complex reaction mechanisms, or textbook camera snaps into dynamic 16:9 vector video lessons. Features synchronized educator voiceover, phrase-by-phrase subtitles, playback speed control (1x to 2x), and 1-click 1080p MP4 export.
                    </p>

                    <div className="space-y-2.5 pt-2">
                      {[
                        "Multi-image and textbook camera snap OCR ingestion",
                        "Automated pedagogical SVG concept breakdown and diagrams",
                        "Natural educator voiceover with clear cadence and zero stutter",
                        "Dynamic phrase subtitles highlighting formulas & key terms",
                        "Instant client-side 1080p MP4 canvas recording for offline study",
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4">
                      <Link
                        href="/dashboard/notes-to-video"
                        className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-black text-black hover:bg-amber-300 transition-all shadow-xs hover:scale-105 active:scale-95"
                      >
                        <Video className="h-3.5 w-3.5 text-black" />
                        <span>Launch Video Studio</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Interactive Video Studio Demo Box */}
                  <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-[#090d16] p-5 sm:p-6 text-white shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[11px] font-mono text-slate-300 font-bold">
                          AI Micro-Lecture Player (Active)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 text-[10px] font-mono font-bold">
                          1080p HD
                        </span>
                        <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-300">
                          1.25x Speed
                        </span>
                      </div>
                    </div>

                    {/* Scene Tab Selector */}
                    <div className="grid grid-cols-3 gap-1.5 mb-4 text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setVideoSceneStep(1)}
                        className={`rounded-lg py-1.5 px-2 text-center transition-all ${
                          videoSceneStep === 1 ? "bg-amber-400 text-black font-black" : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        1. Photosynthesis
                      </button>
                      <button
                        type="button"
                        onClick={() => setVideoSceneStep(2)}
                        className={`rounded-lg py-1.5 px-2 text-center transition-all ${
                          videoSceneStep === 2 ? "bg-amber-400 text-black font-black" : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        2. Electrostatics
                      </button>
                      <button
                        type="button"
                        onClick={() => setVideoSceneStep(3)}
                        className={`rounded-lg py-1.5 px-2 text-center transition-all ${
                          videoSceneStep === 3 ? "bg-amber-400 text-black font-black" : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        3. Aldol Reaction
                      </button>
                    </div>

                    {/* 16:9 Canvas Mockup Content */}
                    <div className="rounded-xl border border-slate-800 bg-gradient-to-b from-slate-900 to-[#0a0f1d] p-4 text-xs min-h-[175px] flex flex-col justify-between">
                      {videoSceneStep === 1 && (
                        <>
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-slate-800 pb-2">
                            <span className="text-amber-400 font-bold">SCENE 1: Calvin Cycle (Dark Reactions)</span>
                            <span>00:45 / 02:15</span>
                          </div>
                          <div className="py-2 flex items-center justify-center">
                            <svg viewBox="0 0 340 70" className="w-full max-h-16 text-slate-200">
                              <circle cx="60" cy="35" r="24" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" />
                              <text x="60" y="38" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#ecfdf5">RuBP (5C)</text>
                              <line x1="88" y1="35" x2="140" y2="35" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3 2" />
                              <polygon points="140,32 146,35 140,38" fill="#f59e0b" />
                              <text x="114" y="27" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#fbbf24">+ CO₂ (RuBisCO)</text>
                              <rect x="150" y="15" width="80" height="40" rx="8" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
                              <text x="190" y="32" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#f8fafc">2 × 3-PGA (3C)</text>
                              <text x="190" y="46" textAnchor="middle" fontSize="7" fill="#94a3b8">First Stable Product</text>
                              <line x1="235" y1="35" x2="280" y2="35" stroke="#10b981" strokeWidth="2" />
                              <polygon points="280,32 286,35 280,38" fill="#10b981" />
                              <circle cx="305" cy="35" r="18" fill="#312e81" stroke="#818cf8" strokeWidth="1.5" />
                              <text x="305" y="38" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#e0e7ff">Triose-P</text>
                            </svg>
                          </div>
                          <div className="rounded-lg bg-black/80 border border-white/10 px-3 py-1.5 text-center">
                            <p className="text-[11px] font-semibold text-slate-100">
                              <span className="text-amber-300 font-bold">“RuBisCO enzyme”</span> fixes atmospheric CO₂ onto RuBP to produce the first stable compound, <span className="text-emerald-400 font-bold">3-phosphoglycerate.</span>
                            </p>
                          </div>
                        </>
                      )}

                      {videoSceneStep === 2 && (
                        <>
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-slate-800 pb-2">
                            <span className="text-amber-400 font-bold">SCENE 2: Capacitor Charge Redistribution</span>
                            <span>01:10 / 02:20</span>
                          </div>
                          <div className="py-2 flex items-center justify-center">
                            <svg viewBox="0 0 340 70" className="w-full max-h-16 text-slate-200">
                              <rect x="20" y="15" width="65" height="40" rx="6" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.5" />
                              <text x="52" y="34" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#fff">C₁ (Charged)</text>
                              <text x="52" y="46" textAnchor="middle" fontSize="7.5" fill="#cbd5e1">V₁ = 50V</text>
                              <line x1="90" y1="35" x2="145" y2="35" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 2" />
                              <polygon points="145,32 151,35 145,38" fill="#38bdf8" />
                              <text x="118" y="27" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#38bdf8">Switch Closed</text>
                              <rect x="155" y="15" width="95" height="40" rx="6" fill="#0f172a" stroke="#10b981" strokeWidth="1.5" />
                              <text x="202" y="32" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#34d399">ΔU = ½(C₁C₂/C₁+C₂)</text>
                              <text x="202" y="45" textAnchor="middle" fontSize="7.5" fill="#94a3b8">(V₁ - V₂)²</text>
                              <rect x="255" y="15" width="65" height="40" rx="6" fill="#1e293b" stroke="#818cf8" strokeWidth="1.5" />
                              <text x="287" y="34" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#fff">C₂ (Uncharged)</text>
                              <text x="287" y="46" textAnchor="middle" fontSize="7.5" fill="#cbd5e1">V₂ = 0V</text>
                            </svg>
                          </div>
                          <div className="rounded-lg bg-black/80 border border-white/10 px-3 py-1.5 text-center">
                            <p className="text-[11px] font-semibold text-slate-100">
                              <span className="text-amber-300 font-bold">“When connected,”</span> charges flow until both reach equal potential, <span className="text-emerald-400 font-bold">dissipating energy as heat.</span>
                            </p>
                          </div>
                        </>
                      )}

                      {videoSceneStep === 3 && (
                        <>
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-slate-800 pb-2">
                            <span className="text-amber-400 font-bold">SCENE 3: Aldol Condensation Mechanism</span>
                            <span>01:40 / 02:00</span>
                          </div>
                          <div className="py-2 flex items-center justify-center">
                            <svg viewBox="0 0 340 70" className="w-full max-h-16 text-slate-200">
                              <rect x="15" y="15" width="80" height="40" rx="6" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.5" />
                              <text x="55" y="32" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#fff">CH₃-CHO</text>
                              <text x="55" y="45" textAnchor="middle" fontSize="7" fill="#cbd5e1">+ Dilute OH⁻</text>
                              <line x1="100" y1="35" x2="145" y2="35" stroke="#ec4899" strokeWidth="2" />
                              <polygon points="145,32 151,35 145,38" fill="#ec4899" />
                              <text x="122" y="27" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#f472b6">- H₂O</text>
                              <rect x="155" y="15" width="85" height="40" rx="6" fill="#0f172a" stroke="#a855f7" strokeWidth="1.5" />
                              <text x="197" y="32" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#c084fc">[:CH₂-CHO]⁻</text>
                              <text x="197" y="45" textAnchor="middle" fontSize="7" fill="#94a3b8">Enolate Ion Nucleophile</text>
                              <line x1="245" y1="35" x2="280" y2="35" stroke="#10b981" strokeWidth="2" />
                              <polygon points="280,32 286,35 280,38" fill="#10b981" />
                              <rect x="285" y="15" width="50" height="40" rx="6" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" />
                              <text x="310" y="34" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#ecfdf5">Aldol</text>
                              <text x="310" y="46" textAnchor="middle" fontSize="6.5" fill="#a7f3d0">β-hydroxy</text>
                            </svg>
                          </div>
                          <div className="rounded-lg bg-black/80 border border-white/10 px-3 py-1.5 text-center">
                            <p className="text-[11px] font-semibold text-slate-100">
                              <span className="text-amber-300 font-bold">“The enolate carbanion”</span> acts as a powerful nucleophile attacking the carbonyl carbon of a second aldehyde molecule.
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Bottom Controls Bar */}
                    <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded bg-amber-400 text-black flex items-center justify-center font-bold">
                          <Play className="h-3 w-3 fill-black ml-0.5" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-300">Studio Voiceover Synced</span>
                      </div>
                      <div className="inline-flex items-center gap-1 rounded bg-slate-800/90 text-slate-300 border border-slate-700 px-2.5 py-1 text-[10px] font-mono font-semibold">
                        <Sparkles className="h-3 w-3 text-amber-400" />
                        <span>Interactive Demo</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FEATURE 2: 1:1 Authentic NTA CBT Simulator */}
            {(activeCategory === "ALL" || activeCategory === "CBT_SIM") && (
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-sm transition-all hover:border-slate-300">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Interactive Question Simulator */}
                  <div className="lg:col-span-6 order-2 lg:order-1 rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-inner">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-indigo-100 text-indigo-900 border border-indigo-200 px-2 py-0.5 text-[10px] font-bold">
                          PHYSICS • SECTION A
                        </span>
                        <span className="text-xs font-black text-slate-900">Q.14 of 45</span>
                      </div>
                      <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-rose-600">
                        <Clock className="h-3 w-3" /> 02:44:12
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-900 leading-relaxed">
                      A parallel plate capacitor of capacitance 20 μF is charged to 100V and disconnected. It is then connected across an uncharged 40 μF capacitor. What is the total electrostatic energy lost?
                    </p>

                    {/* Interactive Options */}
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { id: "A", text: "2.5 × 10⁻² J" },
                        { id: "B", text: "0.67 × 10⁻¹ J" },
                        { id: "C", text: "1.0 × 10⁻² J" },
                        { id: "D", text: "3.33 × 10⁻² J" },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setDemoSelectedOption(opt.id)}
                          className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left text-xs transition-all ${
                            demoSelectedOption === opt.id
                              ? "border-slate-900 bg-slate-900 text-white font-bold shadow-xs"
                              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-bold ${
                            demoSelectedOption === opt.id ? "bg-amber-400 text-black" : "bg-slate-100 text-slate-700"
                          }`}>
                            {opt.id}
                          </span>
                          <span className="font-mono text-[11px]">{opt.text}</span>
                        </button>
                      ))}
                    </div>

                    {/* Question Palette Mini Matrix */}
                    <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold">
                        <span className="h-4 w-4 rounded bg-emerald-600 text-white flex items-center justify-center">14</span>
                        <span className="text-slate-500">Answered</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold">
                        <span className="h-4 w-4 rounded bg-amber-500 text-white flex items-center justify-center">15</span>
                        <span className="text-slate-500">Review</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold">
                        <span className="h-4 w-4 rounded bg-rose-500 text-white flex items-center justify-center">16</span>
                        <span className="text-slate-500">Not Answered</span>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-6 order-1 lg:order-2 space-y-4">
                    <div className="inline-flex items-center gap-1.5 rounded-md border border-rose-300 bg-rose-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-rose-900">
                      <Target className="h-3 w-3 text-rose-600" />
                      <span>Official Fidelity</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
                      Authentic NTA Computer-Based Simulator
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      Eliminate test-day anxiety. Solvd reproduces the exact 1:1 color-coded question palette, section navigation rules, and Section B optional question mechanics mandated by the National Testing Agency.
                    </p>

                    <div className="space-y-2.5 pt-2">
                      {[
                        "Standard +4 for correct, -1 for incorrect, 0 for unattempted",
                        "Section A (35 mandatory) & Section B (10 out of 15 optional) enforcement",
                        "Live countdown timer with automatic test lock upon expiry",
                        "Immediate comprehensive scorecard generation and rank estimation",
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4">
                      <Link
                        href="/dashboard/question-bank"
                        className="inline-flex items-center gap-2 rounded-xl bg-[#0f172a] px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-all shadow-xs"
                      >
                        <span>Launch CBT Practice</span>
                        <ArrowRight className="h-3.5 w-3.5 text-amber-400" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FEATURE 3: Reusable Question Bank & Community Sharing */}
            {(activeCategory === "ALL" || activeCategory === "BANK") && (
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-sm transition-all hover:border-slate-300">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-6 space-y-4">
                    <div className="inline-flex items-center gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-900">
                      <BookOpen className="h-3 w-3 text-amber-600" />
                      <span>Curated Repository</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
                      Reusable Question Bank & Community Pool
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      Practice high-yield questions instantly with zero wait time. Access Solvd Curated modules for Biology, Physics, and Chemistry or explore peer-shared test modules.
                    </p>

                    <div className="space-y-2.5 pt-2">
                      {[
                        "Curated NCERT Line-by-Line drills (Genetics, Organic Mechanisms, Optics)",
                        "Custom test launcher with 5, 10, 15, 25, or full question counts",
                        "1-Click share of your generated tests to the community pool",
                        "Smart search by chapter, subject, or repeated PYQ tags",
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4">
                      <Link
                        href="/dashboard/question-bank"
                        className="inline-flex items-center gap-2 rounded-xl bg-[#0f172a] px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-all shadow-xs"
                      >
                        <span>Browse Question Bank</span>
                        <ArrowRight className="h-3.5 w-3.5 text-amber-400" />
                      </Link>
                    </div>
                  </div>

                  {/* Question Bank Visual Card */}
                  <div className="lg:col-span-6 space-y-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="rounded bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-900">
                          ★ Solvd Curated • Biology
                        </span>
                        <span className="rounded bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-bold text-indigo-700 font-mono">
                          10 Questions
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-slate-900">
                        NCERT Line-by-Line: Genetics & Molecular Inheritance
                      </h4>
                      <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                        High-yield conceptual drill on Mendel&apos;s laws, DNA replication, transcription, translation, and genetic disorders based strictly on NCERT.
                      </p>
                      <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-100">
                        <span className="text-[10px] text-slate-400 font-semibold">By Solvd Academic Team</span>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600">
                          <Play className="h-3 w-3 fill-indigo-600" /> Instant Practice
                        </span>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="rounded bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                          👥 Community Shared • Physics
                        </span>
                        <span className="rounded bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-bold text-indigo-700 font-mono">
                          8 Questions
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-slate-900">
                        Physics Rank Booster: Mechanics & Ray Optics
                      </h4>
                      <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                        Multi-concept numericals on Rotational Motion, Torque, Moment of Inertia, Lens Formula, and Prism Refraction calibrated to NTA NEET difficulty.
                      </p>
                      <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-100">
                        <span className="text-[10px] text-slate-400 font-semibold">By Samarth (AIR Cohort)</span>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600">
                          <Play className="h-3 w-3 fill-indigo-600" /> Instant Practice
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FEATURE 4: Synchronized Study Circles & 15m Gmail Alerts */}
            {(activeCategory === "ALL" || activeCategory === "CIRCLES") && (
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-sm transition-all hover:border-slate-300">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Study Circle Card Demo */}
                  <div className="lg:col-span-6 order-2 lg:order-1 rounded-2xl border border-slate-800 bg-[#0f172a] p-6 text-white shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                          ROOM #819203 • KOTA BATCH A1
                        </span>
                        <h4 className="text-base font-extrabold text-white mt-0.5">
                          Weekly Full Physics Mock #04
                        </h4>
                      </div>
                      <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                        ● 6 Online
                      </span>
                    </div>

                    {/* Email Alert Preview */}
                    <div className="rounded-xl border border-slate-700 bg-slate-900/90 p-4 mb-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-300 mb-1">
                        <Mail className="h-3.5 w-3.5" />
                        <span>Automated 15-Minute Gmail Reminder</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed font-mono">
                        “Your Study Circle test starts in 15 mins (2:00 PM IST). Click here to join the synchronized lobby.”
                      </p>
                    </div>

                    {/* Score Trend Board Mini */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <div className="flex items-center gap-2">
                          <span className="h-5 w-5 rounded-full bg-amber-400 text-black flex items-center justify-center text-[10px] font-black">1</span>
                          <span>Samarth Pal (You)</span>
                        </div>
                        <span className="font-mono text-emerald-400">168 / 180</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-medium text-slate-300">
                        <div className="flex items-center gap-2">
                          <span className="h-5 w-5 rounded-full bg-slate-700 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                          <span>Aman Verma</span>
                        </div>
                        <span className="font-mono text-slate-300">155 / 180</span>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-6 order-1 lg:order-2 space-y-4">
                    <div className="inline-flex items-center gap-1.5 rounded-md border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-indigo-900">
                      <Users className="h-3 w-3 text-indigo-600" />
                      <span>Social Accountability</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
                      Synchronized Study Circles & Multiplayer Rooms
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      Never study alone. Form private study circles with coaching friends using a 6-digit code. Schedule simultaneous 2:00 PM mocks and let Solvd automatically email reminders 15 minutes before launch.
                    </p>

                    <div className="space-y-2.5 pt-2">
                      {[
                        "Permanent study circles with customizable names and goals",
                        "Automated 15-minute Gmail alerts dispatched to all members",
                        "Live waiting room with synchronized countdown start timer",
                        "Multi-user trajectory line chart tracking scores across weekly sprints",
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4">
                      <Link
                        href="/dashboard/room"
                        className="inline-flex items-center gap-2 rounded-xl bg-[#0f172a] px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-all shadow-xs"
                      >
                        <span>Join Study Circles</span>
                        <ArrowRight className="h-3.5 w-3.5 text-amber-400" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FEATURE 5: Negative Marking Post-Mortem Diagnostics */}
            {(activeCategory === "ALL" || activeCategory === "ANALYTICS") && (
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-sm transition-all hover:border-slate-300">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-6 space-y-4">
                    <div className="inline-flex items-center gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-900">
                      <BarChart3 className="h-3 w-3 text-amber-600" />
                      <span>Post-Mortem Analytics</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
                      Negative Marking Diagnostic & Mistake Ledger
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      A minus one is worse than zero. Solvd categorizes every mistake to prevent penalty marks in the official exam hall, while estimating your All-India Standing.
                    </p>

                    <div className="space-y-2.5 pt-2">
                      {[
                        "3-Tier Error Classification: Math slips, Misread negative wording, Concept voids",
                        "Net marks lost calculator and rank recovery projections",
                        "Pacing Speedometer (target: 50–55 seconds per question)",
                        "Dynamic SVG sparklines tracking score trajectories over time",
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4">
                      <Link
                        href="/analytics"
                        className="inline-flex items-center gap-2 rounded-xl bg-[#0f172a] px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-all shadow-xs"
                      >
                        <span>View Analytics Demo</span>
                        <ArrowRight className="h-3.5 w-3.5 text-amber-400" />
                      </Link>
                    </div>
                  </div>

                  {/* Analytics Metric Demo Box */}
                  <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          NEGATIVE MARKS LOST
                        </span>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-2xl font-black text-rose-600">-13</span>
                          <span className="text-[11px] font-bold text-emerald-600">↓ 40% vs last week</span>
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          AVG PACING
                        </span>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-2xl font-black text-slate-900">52s</span>
                          <span className="text-[11px] font-bold text-emerald-600">Target Met</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                        ERROR CLASSIFICATION BREAKDOWN
                      </span>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-xs font-bold mb-1">
                            <span className="text-slate-700">Misread Negative &quot;EXCEPT/NOT&quot;</span>
                            <span className="text-rose-600">45%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full w-[45%] rounded-full bg-rose-500" />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-bold mb-1">
                            <span className="text-slate-700">Calculation / Formula Slippage</span>
                            <span className="text-amber-600">35%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full w-[35%] rounded-full bg-amber-500" />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-bold mb-1">
                            <span className="text-slate-700">Conceptual Void</span>
                            <span className="text-blue-600">20%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full w-[20%] rounded-full bg-blue-500" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 4. Bottom Launch CTA Banner */}
          <div className="mt-20 rounded-3xl bg-[#0f172a] p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-black font-black mb-4">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="text-2xl sm:text-4xl font-black tracking-tight">
                All features unlocked. Free till 30 October.
              </h3>
              <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                Zero credit card needed. Start extracting your handwritten notes and practicing under authentic NTA conditions right now.
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
