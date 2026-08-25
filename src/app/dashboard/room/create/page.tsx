"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Copy,
  Check,
  Share2,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import GenerateRoomExamCard from "@/components/room/GenerateRoomExamCard";

export default function CreateRoomPage() {
  const router = useRouter();
  const [createdRoomCode, setCreatedRoomCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const shareUrl =
    typeof window !== "undefined" && createdRoomCode
      ? `${window.location.origin}/dashboard/room/${createdRoomCode}`
      : `https://solvd.app/dashboard/room/${createdRoomCode}`;

  const shareText = `Join my NEET CBT mock test on Solvd! Room Code: ${createdRoomCode}. Join here: ${shareUrl}`;

  function copyCode() {
    if (!createdRoomCode) return;
    navigator.clipboard.writeText(createdRoomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }

  function copyLink() {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  function shareWhatsApp() {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6 sm:p-8">
      {/* Back button */}
      <div>
        <Link
          href="/dashboard/room"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Rooms
        </Link>
      </div>

      {createdRoomCode ? (
        /* Room Creation Success Screen */
        <div className="rounded-2xl border border-black/[.08] bg-white p-6 shadow-xl dark:border-white/[.1] dark:bg-zinc-950 sm:p-8 text-center animate-in fade-in duration-200">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-black dark:text-zinc-50">
            Test Room Created & Scheduled!
          </h1>
          <p className="mt-1 max-w-md mx-auto text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Share this room code with your friends or coaching classmates so they can join the lobby before the scheduled start time.
          </p>

          {/* Prominent Code Card */}
          <div className="mt-6 mx-auto max-w-md rounded-2xl border-2 border-dashed border-blue-500/40 bg-blue-50/50 p-6 dark:border-blue-500/30 dark:bg-blue-950/30">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
              Shareable Room Code
            </span>
            <div className="mt-2 flex items-center justify-center gap-3">
              <span className="font-mono text-3xl font-black tracking-widest text-black dark:text-white">
                {createdRoomCode}
              </span>
              <button
                type="button"
                onClick={copyCode}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-xs border border-black/[.1] text-zinc-700 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-white/[.15] dark:text-zinc-200"
                title="Copy Room Code"
              >
                {copiedCode ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            {copiedCode && (
              <p className="text-[11px] font-semibold text-emerald-600 mt-1">Code copied to clipboard!</p>
            )}
          </div>

          {/* Share Links & WhatsApp */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex items-center gap-2 rounded-xl border border-black/[.12] bg-white px-4 py-2.5 text-xs font-semibold text-zinc-800 shadow-2xs hover:bg-zinc-50 dark:border-white/[.15] dark:bg-zinc-900 dark:text-zinc-200"
            >
              {copiedLink ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              {copiedLink ? "Invite Link Copied" : "Copy Invite Link"}
            </button>

            <button
              type="button"
              onClick={shareWhatsApp}
              className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#20bd5a] transition-colors"
            >
              <Share2 className="h-4 w-4" />
              Share on WhatsApp
            </button>
          </div>

          {/* Enter Lobby Button */}
          <div className="mt-8 border-t border-black/[.06] pt-6 dark:border-white/[.08]">
            <Link
              href={`/dashboard/room/${createdRoomCode}`}
              className="inline-flex items-center gap-2 rounded-xl bg-black px-8 py-3 text-sm font-bold text-white shadow-md hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Enter Room Lobby
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : (
        /* Room Generation Card */
        <GenerateRoomExamCard
          onRoomCreated={(code) => setCreatedRoomCode(code)}
        />
      )}
    </main>
  );
}
