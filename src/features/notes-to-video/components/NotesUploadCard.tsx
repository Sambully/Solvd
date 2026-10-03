"use client";

import React, { useState, useRef } from "react";
import { AVAILABLE_VOICES, type VoiceOption } from "../types";
import {
  FileText,
  Camera,
  Upload,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  Volume2,
  HelpCircle,
} from "lucide-react";

interface NotesUploadCardProps {
  onGenerate: (data: {
    notesText?: string;
    file?: File;
    voiceName: string;
  }) => Promise<void>;
  isLoading: boolean;
}

const SAMPLE_TOPICS = [
  { label: "Krebs Cycle & ATP Yield", subject: "Biology" },
  { label: "Photoelectric Effect & Work Function", subject: "Physics" },
  { label: "SN1 vs SN2 Reaction Mechanisms", subject: "Chemistry" },
  { label: "Mendelian Genetics & Dihybrid Cross", subject: "Biology" },
  { label: "Carnot Engine & Efficiency Formula", subject: "Physics" },
];

export default function NotesUploadCard({
  onGenerate,
  isLoading,
}: NotesUploadCardProps) {
  const [activeTab, setActiveTab] = useState<"text" | "upload">("text");
  const [notesText, setNotesText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string>(AVAILABLE_VOICES[0].voiceName);
  const [error, setError] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setError("File size exceeds 15MB limit. Please upload a smaller photo.");
      return;
    }

    setSelectedFile(file);
    setError("");

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePickSample = (topic: string) => {
    setNotesText(topic);
    setActiveTab("text");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (activeTab === "text" && !notesText.trim()) {
      setError("Please write or paste study notes/topic to generate video.");
      return;
    }

    if (activeTab === "upload" && !selectedFile) {
      setError("Please upload a photo of your notes or study material.");
      return;
    }

    try {
      await onGenerate({
        notesText: activeTab === "text" ? notesText.trim() : undefined,
        file: activeTab === "upload" && selectedFile ? selectedFile : undefined,
        voiceName: selectedVoice,
      });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || "Failed to generate video lesson.");
    }
  };

  return (
    <div className="w-full rounded-3xl border border-slate-200/90 bg-white/95 p-5 sm:p-7 shadow-xl shadow-slate-950/5 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-950 tracking-tight flex items-center gap-2">
            <span>AI Notes-to-Video Animator</span>
            <span className="inline-flex rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[9.5px] font-black text-emerald-700">
              FREE VIP
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Turn handwritten notes or topics into high-yield visual micro-lectures
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 animate-in fade-in">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex rounded-2xl bg-slate-100 p-1 mb-5">
        <button
          type="button"
          onClick={() => setActiveTab("text")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === "text"
              ? "bg-white text-slate-950 shadow-xs"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Type / Paste Notes</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("upload")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === "upload"
              ? "bg-white text-slate-950 shadow-xs"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Camera className="h-3.5 w-3.5" />
          <span>Upload Notes Photo</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tab 1: Text Notes */}
        {activeTab === "text" && (
          <div className="space-y-2.5">
            <textarea
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="Paste your coaching notes, NCERT paragraph, or enter a NEET topic (e.g. 'Explain Non-Cyclic Photophosphorylation and Z-Scheme in detail with ATP/NADPH yield')..."
              rows={5}
              disabled={isLoading}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all resize-none leading-relaxed"
            />

            {/* Quick Sample Prompts */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Quick NEET High-Yield Topics:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_TOPICS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePickSample(item.label)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-2 py-1 text-[10.5px] font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
                  >
                    <span className="text-[9px] font-bold text-emerald-600">[{item.subject}]</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Upload Photo */}
        {activeTab === "upload" && (
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="hidden"
              id="notes-file-input"
            />

            {!selectedFile ? (
              <label
                htmlFor="notes-file-input"
                className="flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl border-2 border-dashed border-slate-300 hover:border-slate-900 bg-slate-50/60 hover:bg-slate-50 text-center transition-all cursor-pointer group"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xs border border-slate-200 group-hover:scale-105 transition-transform mb-2.5">
                  <Upload className="h-5 w-5 text-slate-700" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">
                  Tap to take photo or upload notes
                </h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Supports Camera photos of handwritten coaching notes, textbook diagrams, or PDFs
                </p>
              </label>
            ) : (
              <div className="flex items-center justify-between p-3 rounded-2xl border border-emerald-200 bg-emerald-50/60">
                <div className="flex items-center gap-3 min-w-0">
                  {filePreview ? (
                    <img
                      src={filePreview}
                      alt="Notes preview"
                      className="h-12 w-12 rounded-xl object-cover border border-emerald-200"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs">
                      PDF
                    </div>
                  )}
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-slate-900 truncate">
                      {selectedFile.name}
                    </h5>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready for visual extraction
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClearFile}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-white transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Voice Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Volume2 className="h-3 w-3 text-slate-500" />
              <span>AI Tutor Voice</span>
            </label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs font-bold text-slate-800 focus:border-slate-900 focus:outline-none cursor-pointer shadow-2xs"
            >
              {AVAILABLE_VOICES.map((v) => (
                <option key={v.id} value={v.voiceName}>
                  {v.name} ({v.tag} - {v.accent})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col justify-end">
            <span className="text-[10px] text-slate-500 flex items-center gap-1 mb-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              <span>Full vector animated diagrams included</span>
            </span>
            <span className="text-[10px] text-slate-500 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              <span>Instant browser playback (0 wait time)</span>
            </span>
          </div>
        </div>

        {/* Submit Generate Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#0f172a] hover:bg-slate-800 text-white font-black py-3.5 text-xs shadow-xl shadow-slate-950/15 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <span>Creating AI Scenes & Voice (Takes ~5-8s)...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span>Generate Animated Micro-Lecture</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
