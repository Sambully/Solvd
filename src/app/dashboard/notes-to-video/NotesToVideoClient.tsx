"use client";

import React, { useState } from "react";
import type { VideoLesson } from "@/features/notes-to-video/types";
import { DEMO_LESSON } from "@/features/notes-to-video/demoLesson";
import NotesUploadCard from "@/features/notes-to-video/components/NotesUploadCard";
import InteractiveVideoPlayer from "@/features/notes-to-video/components/InteractiveVideoPlayer";
import VideoExportModal from "@/features/notes-to-video/components/VideoExportModal";
import { Film, ArrowLeft, Download, CheckCircle2, Play, BookOpen, Zap } from "lucide-react";

export default function NotesToVideoClient() {
  const [currentLesson, setCurrentLesson] = useState<VideoLesson | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const handleGenerate = async (data: {
    notesText?: string;
    file?: File;
    voiceName: string;
  }) => {
    setIsGenerating(true);

    try {
      let res: Response;

      if (data.file) {
        const formData = new FormData();
        if (data.notesText) formData.append("notesText", data.notesText);
        formData.append("file", data.file);
        formData.append("voiceName", data.voiceName);

        res = await fetch("/api/notes-to-video/script", {
          method: "POST",
          body: formData,
        });
      } else {
        res = await fetch("/api/notes-to-video/script", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            notesText: data.notesText,
            voiceName: data.voiceName,
          }),
        });
      }

      const json = await res.json();
      if (!res.ok || !json.lesson) {
        throw new Error(json.error || "Failed to generate video lesson.");
      }

      setCurrentLesson(json.lesson);
    } catch (err: unknown) {
      console.error("Notes to video generation failed:", err);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 mb-2">
            <Film className="h-3.5 w-3.5" />
            <span>AI Visual Micro-Lecture Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
            Notes to Animated Video
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Convert handwritten coaching notes or topics into synchronized animated video micro-lectures
          </p>
        </div>

        {currentLesson && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 text-xs font-bold shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Download MP4</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentLesson(null)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-800 shadow-2xs active:scale-95 transition-all cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>New Lesson</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Viewport: Player vs Upload Form */}
      {currentLesson ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          <InteractiveVideoPlayer
            lesson={currentLesson}
            onExportMP4={() => setIsExportModalOpen(true)}
          />

          {/* Export Modal */}
          <VideoExportModal
            lesson={currentLesson}
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Upload / Text Card */}
          <div className="lg:col-span-7">
            <NotesUploadCard onGenerate={handleGenerate} isLoading={isGenerating} />
          </div>

          {/* Right Column: Theme-Matching Demo Preview & Feature Highlights */}
          <div className="lg:col-span-5 space-y-4">
            {/* Clean Light-Themed Preloaded Demo Card */}
            <div className="rounded-3xl border border-slate-200/90 bg-gradient-to-br from-indigo-50/40 via-white to-emerald-50/30 p-6 text-slate-900 shadow-xl shadow-slate-950/5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-700">
                  <Zap className="h-3 w-3 text-emerald-600" />
                  Preloaded Demo
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">
                  5 Scenes • ~65s
                </span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-950">
                  Sample: Krebs Cycle & Energy Ledger
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Experience full 16:9 vector animations, formula derivations, and clear studio tutor narration in real-time.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCurrentLesson(DEMO_LESSON)}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 text-xs shadow-lg shadow-slate-950/10 transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
              >
                <Play className="h-4 w-4 fill-emerald-400 text-emerald-400" />
                <span>Play Sample Micro-Lecture</span>
              </button>
            </div>

            {/* Feature Highlights */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm space-y-3.5">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-indigo-600" />
                <span>Why Aspirants Love Notes-to-Video</span>
              </h4>

              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5 text-xs text-slate-600">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">Handwritten Notes OCR:</strong> Upload photos of coaching notes from Aakash, Allen, or PW.
                  </span>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-slate-600">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">Kinetic Vector Motion:</strong> Full 16:9 animated diagrams with dynamic energy pulses.
                  </span>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-slate-600">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">Instant MP4 Export:</strong> Download full 720p HD video files directly to your device.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
