"use client";

import { useEffect, useState } from "react";
import { X, Download, Smartphone } from "lucide-react";

// Where the APK download points. Set NEXT_PUBLIC_APK_DOWNLOAD_URL to the direct
// GitHub Release asset URL (e.g. .../releases/latest/download/solvd.apk) once the
// release exists. Falls back to the releases page.
const APK_URL =
  process.env.NEXT_PUBLIC_APK_DOWNLOAD_URL ||
  "https://github.com/Sambully/Solvd/releases/latest";

export default function AppDownloadBanner() {
  // Dismissal is in-memory only: closing hides it for the current visit, but it
  // returns on the next page load — so it "always shows" without being sticky-annoying.
  const [dismissed, setDismissed] = useState(false);
  const [isNative, setIsNative] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        setIsNative(Capacitor.isNativePlatform());
      } catch {
        // Not in a Capacitor shell — treat as web.
      }
      setReady(true);
    })();
  }, []);

  // Don't render inside the installed app, or before we know the platform.
  if (!ready || isNative || dismissed) return null;

  return (
    <div className="sticky top-0 z-[60] flex items-center gap-2 sm:gap-3 bg-[#0f172a] px-3 sm:px-4 py-2.5 text-white shadow-md">
      <Smartphone className="h-4 w-4 shrink-0 text-amber-400" />
      <p className="flex-1 text-[11px] sm:text-sm font-medium leading-snug">
        Get the <span className="font-bold">Solvd</span> Android app for the full NEET CBT experience.
      </p>
      <a
        href={APK_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-[11px] sm:text-xs font-bold text-slate-950 transition-colors hover:bg-amber-400"
      >
        <Download className="h-3.5 w-3.5" />
        <span>Download</span>
      </a>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss download banner"
        className="rounded-md p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
