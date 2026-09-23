"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  Home,
  FileText,
  Users,
  BarChart2,
  HelpCircle,
  Zap,
  BookOpen,
  MoreHorizontal,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  const navItems = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/tests", label: "Mock Tests", icon: FileText },
    { href: "/dashboard/question-bank", label: "Question Bank", icon: BookOpen },
    { href: "/dashboard/room", label: "Study Circles", icon: Users },
    { href: "/analytics", label: "Analytics & Ledger", icon: BarChart2 },
    { href: "/dashboard/help", label: "Help & Docs", icon: HelpCircle },
  ];

  const initials = user?.firstName
    ? `${user.firstName[0]}${user.lastName ? user.lastName[0] : ""}`
    : "SP";

  return (
    <aside className="sticky top-0 flex h-screen w-64 flex-col justify-between border-r border-slate-200/90 bg-white p-4 shrink-0 z-30 font-sans shadow-xs">
      {/* 1. Brand Logo Header */}
      <div>
        <div className="flex items-center gap-2.5 px-2 py-3 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0f172a] text-white shadow-xs transition-transform group-hover:scale-105">
              <div className="relative flex h-4 w-4 items-center justify-center">
                <div className="h-3.5 w-3.5 rounded-full border-2 border-amber-400 border-t-transparent" />
                <div className="absolute h-1 w-1 rounded-full bg-emerald-400" />
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight text-slate-900">
                solvd<span className="text-amber-500">.</span>
              </span>
              <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-600">
                NEET CBT
              </span>
            </div>
          </Link>
        </div>

        {/* 2. Navigation Items */}
        <nav className="mt-4 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                  isActive
                    ? "bg-[#0f172a] text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    isActive ? "text-indigo-400" : "text-slate-500"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 3. Bottom Pinned Upgrade Card & Profile Row */}
      <div className="flex flex-col gap-3 pt-3 border-t border-slate-100">
        {/* Premium Account / Free Currently Themed Card */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-[#0f172a] p-3.5 text-white shadow-md">
          {/* Subtle Glow Accent */}
          <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-amber-400/10 blur-xl" />

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 rounded bg-amber-400/15 border border-amber-400/30 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-300">
              <Sparkles className="h-2.5 w-2.5 fill-amber-300 text-amber-300" />
              PREMIUM VIP
            </span>
            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-extrabold text-emerald-400">
              FREE CURRENTLY
            </span>
          </div>

          <div className="mt-2.5">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>All Pro Features Unlocked</span>
            </h4>
            <p className="mt-1 text-[10.5px] leading-relaxed text-slate-300">
              Unlimited NTA CBT drills, OCR note extraction & live Study Circles.
            </p>
          </div>

          <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-900/90 border border-slate-800 px-2.5 py-1.5">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-semibold text-slate-400">
                Current Plan
              </span>
            </div>
            <span className="text-[10px] font-extrabold text-amber-300 font-mono">
              100% Free Access
            </span>
          </div>

          <Link
            href="/pricing"
            className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/10 py-1.5 text-center text-[11px] font-bold text-slate-200 backdrop-blur-xs transition-all hover:bg-white/15 hover:text-white active:scale-98"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
            <span>View All Plan Perks</span>
          </Link>
        </div>

        {/* User Profile Card */}
        <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/70 p-2.5 hover:bg-slate-100 transition-colors">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-xs font-black text-white shadow-xs">
              <span>{initials}</span>
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>

            <div className="flex flex-col min-w-0">
              <span className="truncate text-xs font-bold text-slate-900">
                {user?.fullName ?? user?.firstName ?? "Samarth Pal"}
              </span>
              <span className="truncate text-[10px] text-slate-500 font-mono">
                {user?.primaryEmailAddress?.emailAddress ?? "samarthpal1912005@gmail.com"}
              </span>
            </div>
          </div>

          <div className="shrink-0 flex items-center">
            <UserButton />
          </div>
        </div>
      </div>
    </aside>
  );
}
