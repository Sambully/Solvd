"use client";

import Image from "next/image";

interface SolvdLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  showBadge?: boolean;
  className?: string;
  isDark?: boolean;
}

export default function SolvdLogo({
  size = "md",
  showText = true,
  showBadge = true,
  className = "",
  isDark = false,
}: SolvdLogoProps) {
  const iconDimensions = {
    sm: { box: "h-7 w-7", img: 24, font: "text-base", badge: "text-[8.5px]" },
    md: { box: "h-8 w-8", img: 28, font: "text-lg", badge: "text-[9.5px]" },
    lg: { box: "h-10 w-10", img: 36, font: "text-xl", badge: "text-[11px]" },
  }[size];

  return (
    <div className={`flex items-center gap-2 group ${className}`}>
      <div
        className={`relative flex ${iconDimensions.box} items-center justify-center rounded-xl bg-[#0f172a] p-1 shadow-xs transition-transform group-hover:scale-105 border border-slate-800 shrink-0`}
      >
        <Image
          src="/app-icon-square.png"
          alt="Solvd NEET CBT Logo"
          width={iconDimensions.img}
          height={iconDimensions.img}
          className="rounded-lg object-contain"
          priority
        />
      </div>

      {showText && (
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={`font-black tracking-tight ${iconDimensions.font} ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            solvd<span className="text-emerald-500">.</span>
          </span>

          {showBadge && (
            <span
              className={`rounded-md px-1.5 py-0.5 font-extrabold uppercase tracking-wider ${iconDimensions.badge} ${
                isDark
                  ? "bg-slate-800 text-slate-300"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              NEET CBT
            </span>
          )}
        </div>
      )}
    </div>
  );
}
