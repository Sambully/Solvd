/**
 * Studio Audio Engine for Notes-to-Video.
 * Guarantees strictly ONE single studio audio stream (zero double-audio/echo),
 * with millisecond time-sync and clean scene transitions.
 */

export class LessonAudioEngine {
  private audio: HTMLAudioElement | null = null;
  private isPlaying: boolean = false;
  private isUsingSpeechSynth: boolean = false;
  private animFrameId?: number;
  private onTimeUpdateCallback?: (currentTimeSec: number, durationSec: number, progressPct: number) => void;
  private onEndedCallback?: () => void;

  constructor() {
    if (typeof window !== "undefined") {
      this.audio = new Audio();
    }
  }

  public playScene({
    audioUrl,
    narrationText,
    durationSeconds = 10,
    playbackSpeed = 1.0,
    isMuted = false,
    onTimeUpdate,
    onEnded,
  }: {
    audioUrl?: string;
    narrationText: string;
    durationSeconds?: number;
    playbackSpeed?: number;
    isMuted?: boolean;
    onTimeUpdate: (currentTimeSec: number, durationSec: number, progressPct: number) => void;
    onEnded: () => void;
  }) {
    // 1. Completely reset and halt all running audio/speech
    this.stop();
    this.isPlaying = true;
    this.onTimeUpdateCallback = onTimeUpdate;
    this.onEndedCallback = onEnded;

    // 2. Primary: Studio Edge-TTS MP3 Audio (100% clean single audio stream)
    if (audioUrl && audioUrl.startsWith("data:audio")) {
      this.isUsingSpeechSynth = false;
      if (this.audio) {
        this.audio.src = audioUrl;
        this.audio.playbackRate = playbackSpeed;
        this.audio.muted = isMuted;

        this.audio.onloadedmetadata = () => {
          if (this.audio && this.audio.duration && !isNaN(this.audio.duration)) {
            durationSeconds = this.audio.duration;
          }
        };

        this.audio.ontimeupdate = () => {
          if (!this.audio || !this.isPlaying) return;
          const cur = this.audio.currentTime;
          const dur = this.audio.duration && !isNaN(this.audio.duration) ? this.audio.duration : durationSeconds;
          const pct = Math.min(100, (cur / Math.max(0.1, dur)) * 100);
          if (this.onTimeUpdateCallback) {
            this.onTimeUpdateCallback(cur, dur, pct);
          }
        };

        this.audio.onended = () => {
          this.isPlaying = false;
          // Smooth 350ms scene transition delay
          setTimeout(() => {
            if (this.onEndedCallback) {
              this.onEndedCallback();
            }
          }, 350);
        };

        this.audio.play().catch((err) => {
          console.warn("Audio play error, falling back to speech synthesis:", err);
          this.playSpeechSynthesisFallback(narrationText, durationSeconds, playbackSpeed, isMuted);
        });
        return;
      }
    }

    // 3. Fallback: Web Speech API ONLY if no audioUrl exists
    this.playSpeechSynthesisFallback(narrationText, durationSeconds, playbackSpeed, isMuted);
  }

  private playSpeechSynthesisFallback(
    narrationText: string,
    fallbackDurationSec: number,
    playbackSpeed: number,
    isMuted: boolean
  ) {
    if (typeof window === "undefined") return;
    this.isUsingSpeechSynth = true;

    if (!isMuted && "speechSynthesis" in window && narrationText.trim()) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(narrationText.trim());
      utterance.rate = Math.min(1.6, Math.max(0.7, 0.95 * playbackSpeed));
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const matchVoice = voices.find(
        (v) => v.lang.includes("en-IN") || v.lang.includes("hi-IN") || v.name.includes("India")
      ) || voices.find((v) => v.lang.startsWith("en-"));
      if (matchVoice) {
        utterance.voice = matchVoice;
      }

      let startTime = 0;
      let estimatedDurationMs = Math.max(6000, (fallbackDurationSec * 1000) / playbackSpeed);

      utterance.onstart = () => {
        startTime = performance.now();
        const loop = () => {
          if (!this.isPlaying || !this.isUsingSpeechSynth) return;
          const elapsedMs = performance.now() - startTime;
          const elapsedSec = elapsedMs / 1000;
          const pct = Math.min(99, (elapsedMs / estimatedDurationMs) * 100);

          if (this.onTimeUpdateCallback) {
            this.onTimeUpdateCallback(elapsedSec, estimatedDurationMs / 1000, pct);
          }

          if (pct < 99) {
            this.animFrameId = requestAnimationFrame(loop);
          }
        };
        this.animFrameId = requestAnimationFrame(loop);
      };

      utterance.onend = () => {
        this.isPlaying = false;
        if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
        if (this.onTimeUpdateCallback) {
          this.onTimeUpdateCallback(estimatedDurationMs / 1000, estimatedDurationMs / 1000, 100);
        }

        setTimeout(() => {
          if (this.onEndedCallback) {
            this.onEndedCallback();
          }
        }, 350);
      };

      utterance.onerror = () => {
        this.runTimer(fallbackDurationSec, playbackSpeed);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      this.runTimer(fallbackDurationSec, playbackSpeed);
    }
  }

  private runTimer(durationSec: number, speed: number) {
    const totalMs = (durationSec * 1000) / speed;
    const startTime = performance.now();

    const loop = () => {
      if (!this.isPlaying) return;
      const elapsed = performance.now() - startTime;
      const curSec = Math.min(durationSec, elapsed / 1000);
      const pct = Math.min(100, (elapsed / totalMs) * 100);

      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(curSec, durationSec, pct);
      }

      if (pct < 100) {
        this.animFrameId = requestAnimationFrame(loop);
      } else {
        this.isPlaying = false;
        setTimeout(() => {
          if (this.onEndedCallback) this.onEndedCallback();
        }, 350);
      }
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  public pause() {
    this.isPlaying = false;
    if (this.audio && !this.audio.paused) {
      this.audio.pause();
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.pause();
    }
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
  }

  public resume() {
    this.isPlaying = true;
    if (this.audio && this.audio.src && !this.isUsingSpeechSynth) {
      this.audio.play().catch(() => {});
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window && this.isUsingSpeechSynth) {
      window.speechSynthesis.resume();
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.audio) {
      this.audio.pause();
      this.audio.removeAttribute("src");
      this.audio.load();
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
  }

  public setSpeed(speed: number) {
    if (this.audio) {
      this.audio.playbackRate = speed;
    }
  }

  public setMuted(muted: boolean) {
    if (this.audio) {
      this.audio.muted = muted;
    }
    if (muted && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }
}
