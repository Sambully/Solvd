"use client";

import React, { useState } from "react";
import type { VideoLesson } from "../types";
import { exportLessonToVideoFile } from "../utils/videoExporter";
import { Download, X, CheckCircle2, Loader2, Sparkles, Film, Video, AlertCircle } from "lucide-react";

interface VideoExportModalProps {
  lesson: VideoLesson;
  isOpen: boolean;
  onClose: () => void;
}

export default function VideoExportModal({
  lesson,
  isOpen,
  onClose,
}: VideoExportModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [downloadReady, setDownloadReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartExport = async () => {
    setIsExporting(true);
    setExportProgress(5);
    setError(null);

    try {
      await exportLessonToVideoFile(lesson, (percent) => {
        setExportProgress(percent);
      });
      setDownloadReady(true);
    } catch (err: unknown) {
      console.error("Video export error:", err);
      const e = err as { message?: string };
      setError(e.message || "Failed to render video file. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl text-slate-900 space-y-5 animate-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isExporting}
          className="absolute right-4 top-4 p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 shadow-xs">
            <Film className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-950 tracking-tight">
              Export Animated Video Lesson
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {lesson.scenes.length} Scenes • ~{Math.round(lesson.totalDurationSeconds)}s Micro-Lecture
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Video Specs Card */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 space-y-2.5 text-xs text-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Output Format</span>
            <span className="font-mono font-bold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
              MP4 Video (.mp4)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Resolution</span>
            <span className="font-mono font-bold text-slate-900">1280 × 720 HD @ 30 FPS</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Narration Subtitles</span>
            <span className="font-bold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              Synchronized Lower-Third
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Animations Engine</span>
            <span className="font-bold text-indigo-700 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />
              Dynamic Vector SVG
            </span>
          </div>
        </div>

        {isExporting ? (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" />
                Rendering frames & encoding MP4 video...
              </span>
              <span className="font-mono font-bold text-indigo-600">{exportProgress}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
              <div
                className="h-full bg-indigo-600 transition-all duration-200 rounded-full"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 text-center">
              Please keep this tab open while your video file is rendered locally.
            </p>
          </div>
        ) : downloadReady ? (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-900">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <strong className="block font-bold">Video Export Complete!</strong>
                <span className="text-emerald-700">
                  Your MP4 video file has started downloading to your device.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStartExport}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 text-xs shadow-lg transition-all active:scale-98 cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Download Again</span>
            </button>
          </div>
        ) : (
          <div className="pt-2">
            <button
              type="button"
              onClick={handleStartExport}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black py-3.5 text-xs shadow-xl shadow-slate-950/10 active:scale-98 transition-all cursor-pointer"
            >
              <Video className="h-4 w-4 text-emerald-400" />
              <span>Start HD MP4 Video Download</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
