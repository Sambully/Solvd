"use client";

import { useState, useEffect } from "react";
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
  Sparkles,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";
import SolvdLogo from "@/components/SolvdLogo";

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

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

  // Reusable Premium Free Currently Box
  const PremiumVipCard = () => (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-[#0f172a] p-3 text-white shadow-md">
      {/* Subtle Glow Accent */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-emerald-400/10 blur-xl" />

      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1 rounded bg-amber-400/15 border border-amber-400/30 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-300">
          <Sparkles className="h-2.5 w-2.5 fill-amber-300 text-amber-300" />
          PREMIUM VIP
        </span>
        <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-extrabold text-emerald-400">
          FREE CURRENTLY
        </span>
      </div>

      <div className="mt-2">
        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
          <span>All Pro Features Unlocked</span>
        </h4>
        <p className="mt-0.5 text-[10px] leading-relaxed text-slate-300">
          Unlimited NTA CBT drills, OCR note extraction & live Study Circles.
        </p>
      </div>

      <div className="mt-2.5 flex items-center justify-between rounded-xl bg-slate-900/90 border border-slate-800 px-2.5 py-1.5">
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
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
        onClick={() => setIsOpen(false)}
        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/10 py-1.5 text-center text-[10.5px] font-bold text-slate-200 backdrop-blur-xs transition-all hover:bg-white/15 hover:text-white active:scale-98"
      >
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
        <span>View All Plan Perks</span>
      </Link>
    </div>
  );

  // Reusable User Profile Box
  const UserProfileCard = () => (
    <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/70 p-2 hover:bg-slate-100 transition-colors">
      <div className="flex items-center gap-2 min-w-0">
        <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-[11px] font-black text-white shadow-xs">
          <span>{initials}</span>
          <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
        </div>

        <div className="flex flex-col min-w-0">
          <span className="truncate text-xs font-bold text-slate-900">
            {user?.fullName ?? user?.firstName ?? "Samarth Pal"}
          </span>
          <span className="truncate text-[9.5px] text-slate-500 font-mono">
            {user?.primaryEmailAddress?.emailAddress ?? "samarthpal1912005@gmail.com"}
          </span>
        </div>
      </div>

      <div className="shrink-0 flex items-center">
        <UserButton />
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Mobile Top Header Bar (md:hidden) - Centered Solvd text only */}
      <header className="sticky top-0 z-40 relative flex md:hidden items-center justify-between border-b border-slate-200/90 bg-white/95 px-3.5 py-2.5 backdrop-blur-md shadow-2xs">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open Navigation Menu"
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-slate-800 shadow-2xs hover:bg-slate-100 active:scale-95 transition-all"
        >
          <Menu className="h-4 w-4 text-slate-700" />
          <span className="text-xs font-black uppercase tracking-wider text-slate-800">Menu</span>
        </button>

        {/* Centered Solvd Text Only */}
        <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none">
          <span className="text-base font-black tracking-tight text-slate-900">
            Solvd<span className="text-emerald-500">.</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex rounded-md bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[9px] font-black text-emerald-700">
            FREE VIP
          </span>
          <UserButton />
        </div>
      </header>

      {/* 2. Mobile Drawer Backdrop Overlay (md:hidden) */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity md:hidden animate-in fade-in duration-200"
        />
      )}

      {/* 3. Mobile Slide-Over Overlay Drawer (md:hidden) - Logo ONLY here */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-72 max-w-[85vw] flex-col justify-between border-r border-slate-200 bg-white p-4 shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col">
          {/* Drawer Header with Logo linking to /dashboard */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 group"
            >
              <SolvdLogo size="sm" />
            </Link>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close navigation menu"
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="mt-3.5 flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-280px)]">
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
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                    isActive
                      ? "bg-[#0f172a] text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${
                      isActive ? "text-emerald-400" : "text-slate-500"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom VIP + Profile in Drawer */}
        <div className="flex flex-col gap-2.5 pt-3 border-t border-slate-100">
          <PremiumVipCard />
          <UserProfileCard />
        </div>
      </aside>

      {/* 4. Desktop Persistent Sidebar (hidden on mobile, flex on md+) - Logo links to /dashboard */}
      <aside className="sticky top-0 hidden md:flex h-screen w-64 flex-col justify-between border-r border-slate-200/90 bg-white p-4 shrink-0 z-30 font-sans shadow-xs">
        {/* Brand Logo Header linking to /dashboard */}
        <div>
          <div className="flex items-center gap-2.5 px-2 py-3 border-b border-slate-100">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <SolvdLogo size="md" />
            </Link>
          </div>

          {/* Navigation Items */}
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
                      isActive ? "text-emerald-400" : "text-slate-500"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Pinned VIP Card & Profile Row */}
        <div className="flex flex-col gap-3 pt-3 border-t border-slate-100">
          <PremiumVipCard />
          <UserProfileCard />
        </div>
      </aside>
    </>
  );
}
