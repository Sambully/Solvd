"use client";

import { useState, useEffect, useRef, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Award,
  RotateCcw,
  AlertTriangle,
  Sparkles,
  Building2,
  CheckCircle2,
  Cloud,
  CloudOff,
} from "lucide-react";
import type { AnswerMap } from "@/lib/examTypes";
import type { ExamInterfaceMode, QuestionStatus, QuestionStatusMap } from "@/lib/ntaTypes";
import type { HydratedAttempt, AnswerUpsertInput } from "@/lib/attemptService";
import NTAHeader from "@/components/exam/NTAHeader";
import NTAPalette from "@/components/exam/NTAPalette";
import NTAQuestionPane from "@/components/exam/NTAQuestionPane";
import NTASubmitModal from "@/components/exam/NTASubmitModal";
import { cleanScientificText } from "@/lib/formatMath";

export type RunnerQuestion = {
  id: string;
  questionText: string;
  options: string[];
};

type Props = {
  examId: string;
  roomId?: string;
  roomExamId?: string;
  title: string;
  candidateName?: string;
  durationMinutes: number;
  questions: RunnerQuestion[];
  initialAttempt?: HydratedAttempt | null;
  attemptInfo?: {
    currentAttemptNumber: number;
    maxAttempts: number;
  };
  onSubmit: (examId: string, answers: AnswerMap, attemptId?: string) => Promise<void>;
};

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function ExamRunner({
  examId,
  roomId,
  roomExamId,
  title,
  candidateName = "Student",
  durationMinutes,
  questions,
  initialAttempt = null,
  attemptInfo,
  onSubmit,
}: Props) {
  const router = useRouter();

  const [attemptId, setAttemptId] = useState<string | null>(
    initialAttempt?.attemptId ?? null
  );
  const [started, setStarted] = useState<boolean>(Boolean(initialAttempt));
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const [current, setCurrent] = useState<number>(
    initialAttempt?.currentQuestionIndex ?? 0
  );
  const [answers, setAnswers] = useState<AnswerMap>(
    () => initialAttempt?.answers ?? {}
  );
  const [timeLeft, setTimeLeft] = useState<number>(
    initialAttempt ? initialAttempt.remainingSeconds : durationMinutes * 60
  );
  const [mode, setMode] = useState<ExamInterfaceMode>("NTA_OFFICIAL");
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg">("base");
  const [showModernConfirm, setShowModernConfirm] = useState(false);
  const [showNTAConfirm, setShowNTAConfirm] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">(
    initialAttempt ? "saved" : "idle"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Initialize and track 5-state map for NTA (hydrated from DB if resuming)
  const [statusMap, setStatusMap] = useState<QuestionStatusMap>(() => {
    if (initialAttempt?.statusMap) {
      return initialAttempt.statusMap;
    }
    const initial: QuestionStatusMap = {};
    questions.forEach((q, idx) => {
      initial[q.id] = idx === 0 ? "NOT_ANSWERED" : "NOT_VISITED";
    });
    return initial;
  });

  // Mutable refs for concurrency safety, timer accuracy, and coalesced DB writes
  const submittedRef = useRef(false);
  const attemptIdRef = useRef<string | null>(initialAttempt?.attemptId ?? null);
  const answersRef = useRef<AnswerMap>(initialAttempt?.answers ?? {});
  const deadlineMsRef = useRef<number | null>(
    initialAttempt ? Date.now() + initialAttempt.remainingSeconds * 1000 : null
  );

  const pendingAnswersRef = useRef<Map<string, AnswerUpsertInput>>(new Map());
  const pendingIndexRef = useRef<number | null>(null);
  const inFlightRef = useRef<Promise<void> | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    attemptIdRef.current = attemptId;
  }, [attemptId]);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // Load mode preference from localStorage
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem("solvd_exam_interface_mode");
      if (savedMode === "NTA_OFFICIAL" || savedMode === "MODERN") {
        setMode(savedMode);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // If not hydrated by SSR on initial mount, probe for an existing active attempt to auto-resume
  useEffect(() => {
    if (started || initialAttempt) return;

    let isMounted = true;
    async function checkActiveAttempt() {
      try {
        const query = new URLSearchParams({ examId });
        if (roomId) query.set("roomId", roomId);
        if (roomExamId) query.set("roomExamId", roomExamId);

        const res = await fetch(`/api/attempts?${query.toString()}`);
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data.reason === "RESUME" && data.activeAttempt) {
          const hydrated = data.activeAttempt as HydratedAttempt;
          attemptIdRef.current = hydrated.attemptId;
          answersRef.current = hydrated.answers;
          deadlineMsRef.current = Date.now() + hydrated.remainingSeconds * 1000;

          setAttemptId(hydrated.attemptId);
          setAnswers(hydrated.answers);
          setStatusMap(hydrated.statusMap);
          setCurrent(hydrated.currentQuestionIndex);
          setTimeLeft(hydrated.remainingSeconds);
          setSaveState("saved");
          setStarted(true);
        }
      } catch {
        // Silently proceed; user can still click Start Exam
      }
    }

    void checkActiveAttempt();
    return () => {
      isMounted = false;
    };
  }, [started, initialAttempt, examId, roomId, roomExamId]);

  const toggleMode = (newMode?: ExamInterfaceMode) => {
    const target = newMode ?? (mode === "NTA_OFFICIAL" ? "MODERN" : "NTA_OFFICIAL");
    setMode(target);
    try {
      localStorage.setItem("solvd_exam_interface_mode", target);
    } catch {
      // Ignore
    }
  };

  const totalQuestions = questions.length;
  const maxMarks = totalQuestions * 4;
  const questionIds = questions.map((q) => q.id);

  // Coalesced sequential DB persistence queue (guarantees FIFO ordering & zero duplicate rows)
  const flushPendingSaves = useCallback(async (force = false): Promise<void> => {
    if (inFlightRef.current) {
      await inFlightRef.current;
      if (!force) return;
    }

    const activeAttemptId = attemptIdRef.current;
    if (!activeAttemptId) return;

    if (
      pendingAnswersRef.current.size === 0 &&
      pendingIndexRef.current === null
    ) {
      return;
    }

    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }

    const runLoop = async () => {
      while (
        attemptIdRef.current &&
        (!submittedRef.current || force) &&
        (pendingAnswersRef.current.size > 0 || pendingIndexRef.current !== null)
      ) {
        const batchEntries = Array.from(pendingAnswersRef.current.entries());
        pendingAnswersRef.current.clear();

        const indexToSave = pendingIndexRef.current;
        pendingIndexRef.current = null;

        setSaveState("saving");

        try {
          const res = await fetch(
            `/api/attempts/${attemptIdRef.current}/answers`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                answers: batchEntries.map(([, val]) => val),
                ...(indexToSave !== null
                  ? { currentQuestionIndex: indexToSave }
                  : {}),
              }),
            }
          );

          if (res.status === 410 || res.status === 409) {
            // Attempt expired or already finalized server-side
            submitRef.current();
            return;
          }

          if (!res.ok) {
            throw new Error(`Save failed with HTTP ${res.status}`);
          }

          const data = (await res.json().catch(() => null)) as {
            remainingSeconds?: number;
          } | null;

          // Gently re-sync client deadline if server remaining time drifted > 3s
          if (typeof data?.remainingSeconds === "number" && deadlineMsRef.current !== null) {
            const clientRemaining = Math.max(
              0,
              Math.ceil((deadlineMsRef.current - Date.now()) / 1000)
            );
            if (Math.abs(clientRemaining - data.remainingSeconds) > 3) {
              deadlineMsRef.current = Date.now() + data.remainingSeconds * 1000;
              setTimeLeft(data.remainingSeconds);
            }
          }

          setSaveState("saved");
        } catch {
          // Restore failed entries ONLY if not overwritten by a newer edit while in-flight
          for (const [qId, payload] of batchEntries) {
            if (!pendingAnswersRef.current.has(qId)) {
              pendingAnswersRef.current.set(qId, payload);
            }
          }
          if (indexToSave !== null && pendingIndexRef.current === null) {
            pendingIndexRef.current = indexToSave;
          }

          setSaveState("error");
          retryTimerRef.current = setTimeout(() => {
            void flushPendingSaves();
          }, 2000);
          return;
        }
      }
    };

    const promise = runLoop().finally(() => {
      inFlightRef.current = null;
    });
    inFlightRef.current = promise;
    return promise;
  }, []);

  const enqueuePersist = useCallback(
    (updates: AnswerUpsertInput[], nextQuestionIndex?: number) => {
      if (!attemptIdRef.current || submittedRef.current) return;

      for (const item of updates) {
        pendingAnswersRef.current.set(item.questionId, item);
      }
      if (typeof nextQuestionIndex === "number") {
        pendingIndexRef.current = nextQuestionIndex;
      }

      void flushPendingSaves();
    },
    [flushPendingSaves]
  );

  // Flush any dirty state with sendBeacon if the user closes/reloads the tab mid-save
  useEffect(() => {
    if (!started) return;

    const beaconFlush = () => {
      const id = attemptIdRef.current;
      if (!id || submittedRef.current) return;
      if (
        pendingAnswersRef.current.size === 0 &&
        pendingIndexRef.current === null
      ) {
        return;
      }

      const payload = {
        answers: Array.from(pendingAnswersRef.current.values()),
        ...(pendingIndexRef.current !== null
          ? { currentQuestionIndex: pendingIndexRef.current }
          : {}),
      };

      try {
        const blob = new Blob([JSON.stringify(payload)], {
          type: "application/json",
        });
        navigator.sendBeacon(`/api/attempts/${id}/answers`, blob);
      } catch {
        // Ignore beacon errors
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        beaconFlush();
      } else if (
        document.visibilityState === "visible" &&
        deadlineMsRef.current !== null
      ) {
        const remaining = Math.max(
          0,
          Math.ceil((deadlineMsRef.current - Date.now()) / 1000)
        );
        setTimeLeft(remaining);
        if (remaining <= 0) {
          submitRef.current();
        }
      }
    };

    window.addEventListener("pagehide", beaconFlush);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pagehide", beaconFlush);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
      }
    };
  }, [started]);

  const submit = () => {
    if (submittedRef.current || isSubmitting) return;
    submittedRef.current = true;
    setIsSubmitting(true);
    startTransition(async () => {
      try {
        // Wait for any in-flight or queued persistence flush before finalizing
        await flushPendingSaves(true).catch(() => {});
        await onSubmit(examId, answersRef.current, attemptIdRef.current ?? undefined);
      } catch (err) {
        setIsSubmitting(false);
        submittedRef.current = false;
        throw err;
      }
    });
  };

  const submitRef = useRef(submit);
  useEffect(() => {
    submitRef.current = submit;
  });

  // Wall-clock accurate countdown timer anchored to server remainingSeconds
  useEffect(() => {
    if (!started) return;
    if (deadlineMsRef.current === null) {
      deadlineMsRef.current = Date.now() + timeLeft * 1000;
    }

    const id = setInterval(() => {
      if (deadlineMsRef.current === null) return;
      const remaining = Math.max(
        0,
        Math.ceil((deadlineMsRef.current - Date.now()) / 1000)
      );
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(id);
        submitRef.current();
      }
    }, 1000);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started]);

  // Create or resume a persistent exam_attempts row before entering the exam
  const handleStartExam = async () => {
    if (isStarting) return;
    setIsStarting(true);
    setStartError(null);

    try {
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId,
          ...(roomId ? { roomId } : {}),
          ...(roomExamId ? { roomExamId } : {}),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Unable to initialize exam session.");
      }

      if (data.status === "EXPIRED" || data.status === "ALREADY_SUBMITTED") {
        if (!roomId && data.finalizedAttemptId) {
          router.push(`/dashboard/attempt/${data.finalizedAttemptId}`);
        } else {
          router.refresh();
        }
        return;
      }

      const hydrated = data.attempt as HydratedAttempt;
      attemptIdRef.current = hydrated.attemptId;
      answersRef.current = hydrated.answers;
      deadlineMsRef.current = Date.now() + hydrated.remainingSeconds * 1000;

      setAttemptId(hydrated.attemptId);
      setAnswers(hydrated.answers);
      setStatusMap(hydrated.statusMap);
      setCurrent(hydrated.currentQuestionIndex);
      setTimeLeft(hydrated.remainingSeconds);
      setSaveState("saved");
      setStarted(true);
    } catch (err) {
      setStartError(
        err instanceof Error ? err.message : "Failed to start exam. Please try again."
      );
    } finally {
      setIsStarting(false);
    }
  };

  // Handlers for NTA Action Bar & Modern UI (optimistic UI + persistent DB upsert)
  const handleSelectOption = (optIdx: number) => {
    const q = questions[current];
    if (!q) return;

    const nextAnswers = { ...answersRef.current, [q.id]: optIdx };
    answersRef.current = nextAnswers;
    setAnswers(nextAnswers);

    const existingStatus = statusMap[q.id] ?? "NOT_ANSWERED";
    const persistedStatus: QuestionStatus =
      existingStatus === "MARKED_FOR_REVIEW" ||
      existingStatus === "ANSWERED_AND_MARKED_FOR_REVIEW"
        ? "ANSWERED_AND_MARKED_FOR_REVIEW"
        : mode === "MODERN"
        ? "ANSWERED"
        : existingStatus;

    if (persistedStatus !== existingStatus) {
      setStatusMap((prev) => ({ ...prev, [q.id]: persistedStatus }));
    }

    enqueuePersist([
      {
        questionId: q.id,
        selectedOptionIndex: optIdx,
        status: persistedStatus,
      },
    ]);
  };

  const handleClearResponse = () => {
    const q = questions[current];
    if (!q) return;

    const nextAnswers = { ...answersRef.current };
    delete nextAnswers[q.id];
    answersRef.current = nextAnswers;
    setAnswers(nextAnswers);

    setStatusMap((prev) => ({
      ...prev,
      [q.id]: "NOT_ANSWERED",
    }));

    enqueuePersist([
      {
        questionId: q.id,
        selectedOptionIndex: null,
        status: "NOT_ANSWERED",
      },
    ]);
  };

  const handleSaveAndNext = () => {
    const q = questions[current];
    if (!q) return;

    const selected = answersRef.current[q.id];
    const hasAnswer = selected !== undefined;
    const nextStatus: QuestionStatus = hasAnswer ? "ANSWERED" : "NOT_ANSWERED";
    const nextIdx = current < totalQuestions - 1 ? current + 1 : current;
    const updates: AnswerUpsertInput[] = [
      {
        questionId: q.id,
        selectedOptionIndex: hasAnswer ? selected : null,
        status: nextStatus,
      },
    ];

    setStatusMap((prev) => {
      const next: QuestionStatusMap = {
        ...prev,
        [q.id]: nextStatus,
      };
      if (nextIdx !== current) {
        const nextQ = questions[nextIdx];
        if (next[nextQ.id] === "NOT_VISITED") {
          next[nextQ.id] = "NOT_ANSWERED";
        }
      }
      return next;
    });

    if (nextIdx !== current) {
      const nextQ = questions[nextIdx];
      if (statusMap[nextQ.id] === "NOT_VISITED") {
        updates.push({
          questionId: nextQ.id,
          selectedOptionIndex: answersRef.current[nextQ.id] ?? null,
          status: "NOT_ANSWERED",
        });
      }
      setCurrent(nextIdx);
    }

    enqueuePersist(updates, nextIdx);
  };

  const handleSaveAndMarkReview = () => {
    const q = questions[current];
    if (!q) return;

    const selected = answersRef.current[q.id];
    const nextIdx = current < totalQuestions - 1 ? current + 1 : current;
    const updates: AnswerUpsertInput[] = [
      {
        questionId: q.id,
        selectedOptionIndex: selected !== undefined ? selected : null,
        status: "ANSWERED_AND_MARKED_FOR_REVIEW",
      },
    ];

    setStatusMap((prev) => {
      const next: QuestionStatusMap = {
        ...prev,
        [q.id]: "ANSWERED_AND_MARKED_FOR_REVIEW",
      };
      if (nextIdx !== current) {
        const nextQ = questions[nextIdx];
        if (next[nextQ.id] === "NOT_VISITED") {
          next[nextQ.id] = "NOT_ANSWERED";
        }
      }
      return next;
    });

    if (nextIdx !== current) {
      const nextQ = questions[nextIdx];
      if (statusMap[nextQ.id] === "NOT_VISITED") {
        updates.push({
          questionId: nextQ.id,
          selectedOptionIndex: answersRef.current[nextQ.id] ?? null,
          status: "NOT_ANSWERED",
        });
      }
      setCurrent(nextIdx);
    }

    enqueuePersist(updates, nextIdx);
  };

  const handleMarkReviewAndNext = () => {
    const q = questions[current];
    if (!q) return;

    const selected = answersRef.current[q.id];
    const nextIdx = current < totalQuestions - 1 ? current + 1 : current;
    const updates: AnswerUpsertInput[] = [
      {
        questionId: q.id,
        selectedOptionIndex: selected !== undefined ? selected : null,
        status: "MARKED_FOR_REVIEW",
      },
    ];

    setStatusMap((prev) => {
      const next: QuestionStatusMap = {
        ...prev,
        [q.id]: "MARKED_FOR_REVIEW",
      };
      if (nextIdx !== current) {
        const nextQ = questions[nextIdx];
        if (next[nextQ.id] === "NOT_VISITED") {
          next[nextQ.id] = "NOT_ANSWERED";
        }
      }
      return next;
    });

    if (nextIdx !== current) {
      const nextQ = questions[nextIdx];
      if (statusMap[nextQ.id] === "NOT_VISITED") {
        updates.push({
          questionId: nextQ.id,
          selectedOptionIndex: answersRef.current[nextQ.id] ?? null,
          status: "NOT_ANSWERED",
        });
      }
      setCurrent(nextIdx);
    }

    enqueuePersist(updates, nextIdx);
  };

  const handleNavigateQuestion = (index: number) => {
    const targetQ = questions[index];
    if (!targetQ) return;

    const updates: AnswerUpsertInput[] = [];
    if (statusMap[targetQ.id] === "NOT_VISITED") {
      setStatusMap((prev) => ({ ...prev, [targetQ.id]: "NOT_ANSWERED" }));
      updates.push({
        questionId: targetQ.id,
        selectedOptionIndex: answersRef.current[targetQ.id] ?? null,
        status: "NOT_ANSWERED",
      });
    }

    setCurrent(index);
    enqueuePersist(updates, index);
  };

  const answeredCount = Object.keys(answers).length;
  const unattemptedCount = totalQuestions - answeredCount;

  // ==========================================
  // 1. START SCREEN
  // ==========================================
  if (!started) {
    return (
      <div className="flex flex-1 items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-xl rounded-2xl border border-black/[.08] bg-white p-6 shadow-xl dark:border-white/[.1] dark:bg-zinc-950 sm:p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900">
            <Award className="h-6 w-6 text-black dark:text-zinc-50" />
          </div>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-black dark:text-zinc-50">
            {title}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            NEET (UG) Computer-Based Test Simulation
          </p>

          {attemptInfo && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-[11px] font-bold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 shadow-2xs">
              <Award className="h-3.5 w-3.5 text-amber-500" />
              <span>
                Attempt {attemptInfo.currentAttemptNumber} of {attemptInfo.maxAttempts}
              </span>
            </div>
          )}

          <div className="mt-5 grid grid-cols-3 gap-3 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900/50">
            <div>
              <p className="text-2xl font-bold text-black dark:text-zinc-50">
                {totalQuestions}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Questions</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-black dark:text-zinc-50">
                {maxMarks}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Total Marks</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-black dark:text-zinc-50">
                {durationMinutes}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Minutes</p>
            </div>
          </div>

          {/* Interface Mode Selector */}
          <div className="mt-6 text-left">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-2">
              Select Exam Interface Skin:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => toggleMode("NTA_OFFICIAL")}
                className={`flex flex-col p-3.5 rounded-xl border text-left transition-all ${
                  mode === "NTA_OFFICIAL"
                    ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-500 dark:border-blue-500 dark:bg-blue-950/40"
                    : "border-black/[.08] hover:bg-zinc-50 dark:border-white/[.1] dark:hover:bg-zinc-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-200">
                    <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    NTA Official CBT
                  </span>
                  {mode === "NTA_OFFICIAL" && (
                    <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                  Authentic National Testing Agency interface & 5-state palette.
                </p>
              </button>

              <button
                type="button"
                onClick={() => toggleMode("MODERN")}
                className={`flex flex-col p-3.5 rounded-xl border text-left transition-all ${
                  mode === "MODERN"
                    ? "border-black bg-zinc-100/80 ring-2 ring-black dark:border-white dark:bg-zinc-900 dark:ring-white"
                    : "border-black/[.08] hover:bg-zinc-50 dark:border-white/[.1] dark:hover:bg-zinc-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-black dark:text-zinc-50">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    Modern Solvd UI
                  </span>
                  {mode === "MODERN" && (
                    <CheckCircle2 className="h-4 w-4 text-black dark:text-white" />
                  )}
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                  Sleek minimalist dark/light design with smooth typography.
                </p>
              </button>
            </div>
          </div>

          {/* NEET Marking Scheme Reminder */}
          <div className="mt-5 rounded-xl border border-black/[.08] p-3.5 text-left dark:border-white/[.1]">
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              NEET Marking Scheme
            </p>
            <div className="mt-1.5 flex items-center justify-between text-xs font-medium">
              <span className="text-emerald-700 dark:text-emerald-400">+4 Correct</span>
              <span className="text-red-600 dark:text-red-400">-1 Incorrect</span>
              <span className="text-zinc-400">0 Unattempted</span>
            </div>
          </div>

          {startError && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300">
              {startError}
            </div>
          )}

          <button
            onClick={handleStartExam}
            disabled={isStarting}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-black py-3 text-sm font-bold text-white transition-colors hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200 shadow-md"
          >
            {isStarting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Initializing Exam Session…
              </>
            ) : (
              "Start Exam Now"
            )}
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. SUBMITTING OVERLAY
  // ==========================================
  if (isPending || isSubmitting) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 select-none">
        <Loader2 className="h-8 w-8 animate-spin text-black dark:text-white" />
        <p className="text-base font-medium text-black dark:text-zinc-50">
          Calculating NEET Score & Recording Attempt…
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Applying +4 / -1 marking scheme
        </p>
      </div>
    );
  }

  const q = questions[current];
  const lowTime = timeLeft <= 60;

  // ==========================================
  // 3. NTA OFFICIAL CBT INTERFACE MODE
  // ==========================================
  if (mode === "NTA_OFFICIAL") {
    return (
      <div className="flex flex-1 flex-col bg-[#f1f5f9] dark:bg-zinc-950 text-black dark:text-white min-h-screen">
        {/* NTA Official Header */}
        <NTAHeader
          examTitle={title}
          timeLeft={timeLeft}
          mode={mode}
          onToggleMode={() => toggleMode("MODERN")}
          fontSize={fontSize}
          onChangeFontSize={(size) => setFontSize(size)}
          saveState={saveState}
        />

        {/* NTA Main Workspace */}
        <main className="flex flex-1 flex-col lg:flex-row gap-4 p-3 sm:p-4">
          <NTAQuestionPane
            question={q}
            questionIndex={current}
            totalQuestions={totalQuestions}
            selectedOption={answers[q.id]}
            fontSize={fontSize}
            onSelectOption={handleSelectOption}
            onSaveAndNext={handleSaveAndNext}
            onSaveAndMarkReview={handleSaveAndMarkReview}
            onMarkReviewAndNext={handleMarkReviewAndNext}
            onClearResponse={handleClearResponse}
            onPrevious={() => current > 0 && handleNavigateQuestion(current - 1)}
            onNext={() => current < totalQuestions - 1 && handleNavigateQuestion(current + 1)}
            onSubmitExam={() => setShowNTAConfirm(true)}
          />

          <NTAPalette
            candidateName={candidateName}
            totalQuestions={totalQuestions}
            currentQuestionIndex={current}
            questionIds={questionIds}
            statusMap={statusMap}
            onSelectQuestion={handleNavigateQuestion}
          />
        </main>

        {/* NTA Exam Summary Modal */}
        <NTASubmitModal
          isOpen={showNTAConfirm}
          examTitle={title}
          totalQuestions={totalQuestions}
          questionIds={questionIds}
          statusMap={statusMap}
          isSubmitting={isSubmitting}
          onConfirmSubmit={() => {
            submit();
          }}
          onCancel={() => setShowNTAConfirm(false)}
        />
      </div>
    );
  }

  // ==========================================
  // 4. MODERN SOLVD INTERFACE MODE
  // ==========================================
  return (
    <div className="flex flex-1 flex-col">
      {/* Modern Header: title + progress + sync + timer + switch to NTA */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-black/[.08] bg-white/95 px-6 py-4 backdrop-blur-md dark:border-white/[.1] dark:bg-black/95 select-none">
        <div className="min-w-0 pr-4">
          <div className="flex items-center gap-3">
            <p className="truncate text-base font-bold text-black dark:text-zinc-50">
              {title}
            </p>
            <button
              onClick={() => toggleMode("NTA_OFFICIAL")}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-blue-600/30 bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 dark:border-blue-500/40 dark:bg-blue-950/60 dark:text-blue-300 transition-colors"
              title="Switch to National Testing Agency Exam Software Mode"
            >
              <Building2 className="h-3 w-3" />
              Switch to NTA CBT
            </button>
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            <span>
              Attempted: <strong className="text-black dark:text-zinc-100">{answeredCount}</strong> / {totalQuestions}
            </span>
            <span>·</span>
            <span>
              Left: <strong className="text-zinc-600 dark:text-zinc-300">{unattemptedCount}</strong>
            </span>
            {saveState !== "idle" && (
              <>
                <span>·</span>
                <span className="inline-flex items-center gap-1 font-medium">
                  {saveState === "saving" ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                      <span>Saving…</span>
                    </>
                  ) : saveState === "error" ? (
                    <>
                      <CloudOff className="h-3 w-3 text-amber-500" />
                      <span className="text-amber-600 dark:text-amber-400">Retrying…</span>
                    </>
                  ) : (
                    <>
                      <Cloud className="h-3 w-3 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">Saved</span>
                    </>
                  )}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold tabular-nums transition-colors ${
              lowTime
                ? "animate-pulse bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                : "bg-zinc-100 text-black dark:bg-zinc-900 dark:text-zinc-50"
            }`}
          >
            <Clock className="h-4 w-4" />
            {formatTime(timeLeft)}
          </div>

          <button
            onClick={() => setShowModernConfirm(true)}
            className="rounded-xl bg-black px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 sm:text-sm"
          >
            Submit Exam
          </button>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6 lg:flex-row">
        {/* Question Area */}
        <div className="flex flex-1 flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                Question {current + 1} of {totalQuestions}
              </span>
              {answers[q.id] !== undefined && (
                <button
                  onClick={handleClearResponse}
                  className="flex items-center gap-1 text-xs text-zinc-400 hover:text-red-500 transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  Clear Choice
                </button>
              )}
            </div>

            <h2 className="mt-4 text-lg font-semibold leading-relaxed text-black dark:text-zinc-50">
              {cleanScientificText(q.questionText)}
            </h2>

            {/* Options */}
            <div className="mt-6 flex flex-col gap-3">
              {q.options.map((opt, i) => {
                const selected = answers[q.id] === i;
                return (
                  <button
                    key={i}
                    onClick={() => handleSelectOption(i)}
                    className={`flex items-center gap-4 rounded-xl border p-4 text-left text-sm transition-all ${
                      selected
                        ? "border-black bg-zinc-100/80 shadow-xs dark:border-white dark:bg-zinc-900"
                        : "border-black/[.08] hover:border-black/[.2] hover:bg-zinc-50 dark:border-white/[.1] dark:hover:border-white/[.3] dark:hover:bg-zinc-900/40"
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-colors ${
                        selected
                          ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                          : "border-black/[.2] text-zinc-500 dark:border-white/[.25]"
                      }`}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-base font-normal text-black dark:text-zinc-100">
                      {cleanScientificText(opt)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="mt-8 flex items-center justify-between border-t border-black/[.08] pt-6 dark:border-white/[.1]">
            <button
              onClick={() => current > 0 && handleNavigateQuestion(current - 1)}
              disabled={current === 0}
              className="flex items-center gap-1.5 rounded-xl border border-black/[.1] px-4 py-2.5 text-sm font-medium text-black transition-colors hover:bg-zinc-50 disabled:opacity-30 dark:border-white/[.15] dark:text-zinc-50 dark:hover:bg-zinc-900"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            {current === totalQuestions - 1 ? (
              <button
                onClick={() => setShowModernConfirm(true)}
                className="rounded-xl bg-black px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                Submit Exam
              </button>
            ) : (
              <button
                onClick={() => current < totalQuestions - 1 && handleNavigateQuestion(current + 1)}
                className="flex items-center gap-1.5 rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Question Palette Sidebar */}
        <aside className="w-full lg:w-64">
          <div className="rounded-2xl border border-black/[.08] bg-white p-5 shadow-xs dark:border-white/[.1] dark:bg-zinc-950">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Question Palette
            </p>
            <div className="mt-4 grid grid-cols-6 gap-2 sm:grid-cols-8 lg:grid-cols-5">
              {questions.map((question, i) => {
                const isAnswered = answers[question.id] !== undefined;
                const isCurrent = i === current;
                return (
                  <button
                    key={question.id}
                    onClick={() => handleNavigateQuestion(i)}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                      isCurrent
                        ? "bg-black text-white ring-2 ring-black/40 ring-offset-1 dark:bg-white dark:text-black dark:ring-white/40"
                        : isAnswered
                        ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-black"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-5 border-t border-black/[.08] pt-4 text-xs text-zinc-500 dark:border-white/[.1] flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-600" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                <span>Unattempted ({unattemptedCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-black dark:bg-white" />
                <span>Current Question</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Modern Submit Confirmation Modal */}
      {showModernConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-950">
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="text-lg font-bold text-black dark:text-zinc-50">
                Submit your NEET CBT?
              </h3>
            </div>

            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              You have answered <strong className="text-black dark:text-zinc-100">{answeredCount}</strong> out of{" "}
              <strong className="text-black dark:text-zinc-100">{totalQuestions}</strong> questions.
            </p>

            {unattemptedCount > 0 && (
              <p className="mt-1 text-xs text-zinc-400">
                {unattemptedCount} unanswered questions will be marked 0 (no negative marks).
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModernConfirm(false)}
                disabled={isSubmitting}
                className="rounded-xl border border-black/[.1] px-4 py-2.5 text-sm font-medium text-black hover:bg-zinc-50 disabled:opacity-50 dark:border-white/[.15] dark:text-zinc-50 dark:hover:bg-zinc-900"
              >
                Keep Reviewing
              </button>
              <button
                onClick={submit}
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting Exam…
                  </>
                ) : (
                  "Confirm & Submit"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
