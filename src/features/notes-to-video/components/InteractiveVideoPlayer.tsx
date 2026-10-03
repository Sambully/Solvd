"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import type { VideoLesson } from "../types";
import SVGSceneRenderer from "./SVGSceneRenderer";
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Download,
  BookOpen,
  CheckCircle2,
} from "lucide-react";

interface InteractiveVideoPlayerProps {
  lesson: VideoLesson;
  onExportMP4?: () => void;
}

const SPEED_OPTIONS = [1.0, 1.25, 1.5, 2.0];

export default function InteractiveVideoPlayer({
  lesson,
  onExportMP4,
}: InteractiveVideoPlayerProps) {
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(10);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);

  const currentScene = lesson.scenes[currentSceneIdx] || lesson.scenes[0];

  // Sync audio source and playback state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentScene?.audioUrl) {
      audio.src = currentScene.audioUrl;
      audio.playbackRate = playbackSpeed;
      audio.muted = isMuted;
      audio.load();

      if (isPlaying) {
        audio.play().catch((err) => {
          console.warn("Audio play blocked:", err);
          setIsPlaying(false);
        });
      }
    } else {
      audio.removeAttribute("src");
      audio.load();
    }
  }, [currentSceneIdx, currentScene?.audioUrl, isPlaying, playbackSpeed, isMuted]);

  // Handle Play / Pause Toggle
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      // If at the end, restart
      if (currentSceneIdx === lesson.scenes.length - 1 && currentTime >= duration - 0.5) {
        setCurrentSceneIdx(0);
        setCurrentTime(0);
      }
      setIsPlaying(true);
      audio.play().catch((err) => {
        console.warn("Play error:", err);
      });
    }
  };

  // Audio event listeners
  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio) {
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    }
  };

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (audio && audio.duration && !isNaN(audio.duration)) {
      setDuration(audio.duration);
    } else if (currentScene?.durationSeconds) {
      setDuration(currentScene.durationSeconds);
    }
  };

  const handleEnded = () => {
    // Auto advance to next scene
    if (currentSceneIdx < lesson.scenes.length - 1) {
      setCurrentSceneIdx((prev) => prev + 1);
      setCurrentTime(0);
    } else {
      setIsPlaying(false);
    }
  };

  // Change Playback Speed
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  // Toggle Mute
  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    if (audioRef.current) {
      audioRef.current.muted = next;
    }
  };

  // Jump to specific scene
  const handleJumpToScene = (index: number) => {
    setCurrentSceneIdx(index);
    setCurrentTime(0);
  };

  // Prev / Next
  const handlePrevScene = () => {
    if (currentSceneIdx > 0) {
      handleJumpToScene(currentSceneIdx - 1);
    }
  };

  const handleNextScene = () => {
    if (currentSceneIdx < lesson.scenes.length - 1) {
      handleJumpToScene(currentSceneIdx + 1);
    }
  };

  const handleRestart = () => {
    handleJumpToScene(0);
    setIsPlaying(true);
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div className="w-full space-y-4">
      {/* Hidden Native Audio Element (Single Source of Truth) */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="auto"
      />

      {/* 1. Clean 16:9 Cinema Video Stage */}
      <div
        ref={playerContainerRef}
        className={`relative w-full rounded-2xl border border-slate-800 bg-[#0f172a] shadow-xl overflow-hidden flex flex-col justify-between transition-all select-none ${
          isFullscreen ? "h-screen rounded-none" : "aspect-video min-h-[440px]"
        }`}
      >
        {/* Top Header Tag */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-[#0f172a]/90 to-transparent pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-bold text-emerald-400">
              Part {currentScene.sceneNumber} of {lesson.scenes.length}
            </span>
            <span className="text-xs font-bold text-white tracking-tight">
              {currentScene.title}
            </span>
          </div>
          {currentScene.highlightKeyword && (
            <span className="rounded-md bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 text-[11px] font-bold text-amber-300">
              {currentScene.highlightKeyword}
            </span>
          )}
        </div>

        {/* Central Vector Motion Stage */}
        <div className="flex-1 w-full h-full min-h-0 flex items-center justify-center">
          <SVGSceneRenderer scene={currentScene} isPlaying={isPlaying} />
        </div>

        {/* Bottom Subtitles Bar */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 w-[90%] max-w-2xl pointer-events-none">
          <div className="rounded-xl bg-black/75 backdrop-blur-md border border-white/10 px-4 py-2 text-center shadow-lg">
            <p className="text-xs sm:text-sm font-medium text-white leading-relaxed truncate">
              {currentScene.narration}
            </p>
          </div>
        </div>

        {/* Bottom Control Bar */}
        <div className="relative z-20 px-4 py-2.5 bg-[#0b1329] border-t border-slate-800/80 flex flex-col gap-2">
          {/* Scrubber Progress Bar */}
          <div className="w-full flex items-center gap-1">
            {lesson.scenes.map((sc, idx) => {
              const isPast = idx < currentSceneIdx;
              const isCurrent = idx === currentSceneIdx;

              return (
                <div
                  key={idx}
                  onClick={() => handleJumpToScene(idx)}
                  className="flex-1 h-1.5 rounded-full bg-slate-700/60 overflow-hidden cursor-pointer hover:h-2 transition-all"
                  title={`Part ${idx + 1}: ${sc.title}`}
                >
                  <div
                    className="h-full bg-emerald-500 transition-all duration-150"
                    style={{
                      width: isPast ? "100%" : isCurrent ? `${progressPercent}%` : "0%",
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between gap-3 text-slate-300 text-xs">
            {/* Left Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={togglePlay}
                className="flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-md transition-all active:scale-95 cursor-pointer"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
              </button>

              <button
                type="button"
                onClick={handlePrevScene}
                disabled={currentSceneIdx === 0}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors cursor-pointer"
                title="Previous Scene"
              >
                <SkipBack className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={handleNextScene}
                disabled={currentSceneIdx === lesson.scenes.length - 1}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors cursor-pointer"
                title="Next Scene"
              >
                <SkipForward className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={handleRestart}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Restart"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={toggleMute}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4" />}
              </button>

              <span className="font-mono text-[11px] text-slate-400 ml-1">
                {Math.floor(currentTime)}s / {Math.round(duration)}s
              </span>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              {/* Playback Speed */}
              <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5">
                {SPEED_OPTIONS.map((speed) => (
                  <button
                    key={speed}
                    type="button"
                    onClick={() => handleSpeedChange(speed)}
                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded transition-all cursor-pointer ${
                      playbackSpeed === speed
                        ? "bg-emerald-500 text-slate-950"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>

              {onExportMP4 && (
                <button
                  type="button"
                  onClick={onExportMP4}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>MP4</span>
                </button>
              )}

              <button
                type="button"
                onClick={toggleFullscreen}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Clean Chapter Tabs Below Player */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {lesson.scenes.map((scene, idx) => {
          const isActive = idx === currentSceneIdx;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleJumpToScene(idx)}
              className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                  isActive ? "bg-emerald-500 text-slate-950" : "bg-slate-100 text-slate-500"
                }`}
              >
                {idx + 1}
              </span>
              <span>{scene.title}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Key High-Yield Notes Below */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-emerald-600" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              High-Yield Key Points ({currentScene.title})
            </h4>
          </div>
          {currentScene.formula && (
            <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">
              {currentScene.formula}
            </span>
          )}
        </div>

        <ul className="space-y-1.5">
          {currentScene.bulletPoints?.map((bullet, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>

        {currentScene.mnemonic && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-900 font-medium">
            💡 <strong>Mnemonic / Exam Tip:</strong> {currentScene.mnemonic}
          </div>
        )}
      </div>
    </div>
  );
}
