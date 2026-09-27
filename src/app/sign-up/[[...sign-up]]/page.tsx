import CustomSignUpForm from "@/components/auth/CustomSignUpForm";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShieldCheck, Sparkles, Users, FileText } from "lucide-react";
import SolvdLogo from "@/components/SolvdLogo";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 flex flex-col justify-between selection:bg-amber-200 selection:text-black">
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-50 border-b border-black/[.05] bg-white/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 group">
            <SolvdLogo size="sm" />
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-black transition-colors rounded-xl border border-slate-200 bg-white px-3.5 py-2 shadow-2xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* 2. Split Screen Hero & Sign Up Container */}
      <main className="flex-1 flex items-center justify-center py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Hero Column (Desktop Value Proposition) */}
          <div className="hidden lg:flex lg:col-span-6 flex-col gap-6 pr-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-800 w-fit">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              <span>Early Access: Free Till 30 October</span>
            </div>

            <div>
              <h1 className="text-3xl xl:text-4xl font-black tracking-tight text-slate-950 leading-tight">
                Create your student account & start <span className="text-amber-500">NEET CBT</span> drills.
              </h1>
              <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
                Practice under authentic NTA conditions. Unlimited handwritten notes extraction, live peer lobbies, and detailed scorecards.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-900 font-bold">
                  <FileText className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Handwritten Notes to CBT Test</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Upload photos of coaching class notes or NCERT pages to generate calibrated NEET numericals in 20s.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-900 font-bold">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Official NTA Palette & Marking Scheme</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Familiarize yourself with Marked for Review, Section B rules, and +4 / -1 score impact before real exam day.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-900 font-bold">
                  <Users className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Study Circles with 15-Min Reminders</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Create private study rooms for your batch and receive automated Gmail alerts before every mock test.</p>
                </div>
              </div>
            </div>

            {/* Bottom Promo Note */}
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 pt-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Zero payment or credit card required • Instant 1-click activation</span>
            </div>
          </div>

          {/* Right Column: Custom-Engineered Instant Auth Form */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center w-full">
            <CustomSignUpForm />
          </div>
        </div>
      </main>

      {/* 3. Footer */}
      <footer className="border-t border-black/[.06] bg-white py-6 text-xs text-zinc-500">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 font-bold text-black">
            <SolvdLogo size="sm" showBadge={false} />
            <span className="font-normal text-zinc-400">
              © 2026 Solvd Edtech Labs. All rights reserved.
            </span>
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
