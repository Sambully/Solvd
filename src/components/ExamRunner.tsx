"use client";

import { useState, useEffect, useRef, useTransition } from "react";
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
} from "lucide-react";
import type { AnswerMap } from "@/lib/examTypes";
import type { ExamInterfaceMode, QuestionStatusMap } from "@/lib/ntaTypes";
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
  title: string;
  candidateName?: string;
  durationMinutes: number;
  questions: RunnerQuestion[];
  onSubmit: (examId: string, answers: AnswerMap) => Promise<void>;
};

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function ExamRunner({
  examId,
  title,
  candidateName = "Student",
  durationMinutes,
  questions,
  onSubmit,
}: Props) {
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [mode, setMode] = useState<ExamInterfaceMode>("NTA_OFFICIAL");
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg">("base");
  const [showModernConfirm, setShowModernConfirm] = useState(false);
  const [showNTAConfirm, setShowNTAConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const submittedRef = useRef(false);

  // Initialize and track 5-state map for NTA
  const [statusMap, setStatusMap] = useState<QuestionStatusMap>(() => {
    const initial: QuestionStatusMap = {};
    questions.forEach((q, idx) => {
      initial[q.id] = idx === 0 ? "NOT_ANSWERED" : "NOT_VISITED";
    });
    return initial;
  });

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

  const submit = () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    startTransition(() => {
      onSubmit(examId, answers);
    });
  };

  const submitRef = useRef(submit);
  useEffect(() => {
    submitRef.current = submit;
  });

  // Countdown timer
  useEffect(() => {
    if (!started) return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          submitRef.current();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [started]);

  // Handlers for NTA Action Bar
  const handleSelectOption = (optIdx: number) => {
    const q = questions[current];
    setAnswers((prev) => ({ ...prev, [q.id]: optIdx }));
  };

  const handleClearResponse = () => {
    const q = questions[current];
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[q.id];
      return next;
    });
    setStatusMap((prev) => ({
      ...prev,
      [q.id]: "NOT_ANSWERED",
    }));
  };

  const handleSaveAndNext = () => {
    const q = questions[current];
    const hasAnswer = answers[q.id] !== undefined;

    setStatusMap((prev) => {
      const next: QuestionStatusMap = {
        ...prev,
        [q.id]: hasAnswer ? "ANSWERED" : "NOT_ANSWERED",
      };
      if (current < totalQuestions - 1) {
        const nextQ = questions[current + 1];
        if (next[nextQ.id] === "NOT_VISITED") {
          next[nextQ.id] = "NOT_ANSWERED";
        }
      }
      return next;
    });

    if (current < totalQuestions - 1) {
      setCurrent(current + 1);
    }
  };

  const handleSaveAndMarkReview = () => {
    const q = questions[current];
    setStatusMap((prev) => {
      const next: QuestionStatusMap = {
        ...prev,
        [q.id]: "ANSWERED_AND_MARKED_FOR_REVIEW",
      };
      if (current < totalQuestions - 1) {
        const nextQ = questions[current + 1];
        if (next[nextQ.id] === "NOT_VISITED") {
          next[nextQ.id] = "NOT_ANSWERED";
        }
      }
      return next;
    });

    if (current < totalQuestions - 1) {
      setCurrent(current + 1);
    }
  };

  const handleMarkReviewAndNext = () => {
    const q = questions[current];
    setStatusMap((prev) => {
      const next: QuestionStatusMap = {
        ...prev,
        [q.id]: "MARKED_FOR_REVIEW",
      };
      if (current < totalQuestions - 1) {
        const nextQ = questions[current + 1];
        if (next[nextQ.id] === "NOT_VISITED") {
          next[nextQ.id] = "NOT_ANSWERED";
        }
      }
      return next;
    });

    if (current < totalQuestions - 1) {
      setCurrent(current + 1);
    }
  };

  const handleNavigateQuestion = (index: number) => {
    const targetQ = questions[index];
    if (!targetQ) return;
    setStatusMap((prev) => {
      if (prev[targetQ.id] === "NOT_VISITED") {
        return { ...prev, [targetQ.id]: "NOT_ANSWERED" };
      }
      return prev;
    });
    setCurrent(index);
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

          <button
            onClick={() => setStarted(true)}
            className="mt-6 w-full rounded-xl bg-black py-3 text-sm font-bold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 shadow-md"
          >
            Start Exam Now
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. SUBMITTING OVERLAY
  // ==========================================
  if (isPending) {
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
          onConfirmSubmit={() => {
            setShowNTAConfirm(false);
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
      {/* Modern Header: title + progress + timer + switch to NTA */}
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
                className="rounded-xl border border-black/[.1] px-4 py-2.5 text-sm font-medium text-black hover:bg-zinc-50 dark:border-white/[.15] dark:text-zinc-50 dark:hover:bg-zinc-900"
              >
                Keep Reviewing
              </button>
              <button
                onClick={submit}
                className="rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
