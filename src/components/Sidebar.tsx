"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { Home, FileText, BarChart2, User, HelpCircle } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/tests", label: "Tests", icon: FileText },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/help", label: "Help", icon: HelpCircle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-black/[.08] bg-zinc-50 dark:border-white/[.1] dark:bg-zinc-950">
      <div className="border-b border-black/[.08] px-6 py-5 dark:border-white/[.1]">
        <p className="text-lg font-semibold tracking-tight text-black dark:text-zinc-50">
          Solvd
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          CBT Generator
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
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
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "text-zinc-600 hover:bg-black/[.05] dark:text-zinc-400 dark:hover:bg-white/[.08]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>


      <div className="flex flex-col gap-3 border-t border-black/[.08] px-3 py-4 dark:border-white/[.1]">
        <button className="w-full rounded-lg bg-black px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
          Upgrade Now
        </button>

        <div className="flex items-center gap-2 rounded-lg px-2 py-2">
          <UserButton />
          <span className="truncate text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {user?.fullName ?? "Student"}
          </span>
        </div>
      </div>
    </aside>
  );
}
