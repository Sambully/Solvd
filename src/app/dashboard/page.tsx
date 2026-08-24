import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, TrendingUp, FilePlus2 } from "lucide-react";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { getDashboardData, type RecentExam } from "@/lib/dashboardData";
import GenerateExamCard from "@/components/GenerateExamCard";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function formatActivityDate(date: Date) {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const time = date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });

  if (isToday) return `Today, ${time}`;

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${time}`;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function performanceNote(percent: number) {
  if (percent >= 80) return "Excellent";
  if (percent >= 60) return "High Performance";
  return "Needs Review";
}

function ActivityRow({ exam }: { exam: RecentExam }) {
  const maxScore = exam.questionCount * 4;
  const attempted = exam.score !== null && maxScore > 0;
  const percent = attempted
    ? Math.max(0, Math.min(100, Math.round((exam.score! / maxScore) * 100)))
    : 0;

  return (
    <li className="flex items-center justify-between border-b border-black/[.05] px-5 py-4 last:border-b-0 dark:border-white/[.05]">
      <div className="min-w-0 flex-1 pr-4">
        <Link
          href={`/dashboard/exam/${exam.id}`}
          className="truncate text-sm font-medium text-black hover:underline dark:text-zinc-50"
        >
          {exam.title}
        </Link>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {formatActivityDate(exam.createdAt)} · {exam.questionCount} Questions ({maxScore} Marks)
        </p>
      </div>
      <div className="ml-4 shrink-0 text-right">
        {attempted ? (
          <>
            <p className="text-sm font-bold text-black dark:text-zinc-50">
              <span className={exam.score! >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}>
                {exam.score! > 0 ? `+${exam.score}` : exam.score}
              </span>
              <span className="text-xs font-normal text-zinc-400"> / {maxScore}</span>
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {percent}% · {performanceNote(percent)}
            </p>
          </>
        ) : (
          <Link
            href={`/dashboard/exam/${exam.id}`}
            className="inline-flex items-center rounded-md bg-zinc-900 px-3 py-1 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200"
          >
            Start Test
          </Link>
        )}
      </div>
    </li>
  );
}

function EmptyActivity() {
  return (
    <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900">
        <FilePlus2 className="h-4 w-4 text-zinc-400" />
      </div>
      <p className="text-sm font-medium text-black dark:text-zinc-50">
        No papers yet
      </p>
      <p className="max-w-xs text-sm text-zinc-500 dark:text-zinc-400">
        Generate your first mock exam from your study material and start
        practicing.
      </p>
    </div>
  );
}

export default async function DashboardPage() {
  const user = await getOrCreateUser();
  if (!user) redirect("/sign-in");

  const firstName = user.name.split(" ")[0] || "Student";
  const { totalExamsTaken, avgScorePercent, recentExams } =
    await getDashboardData(user.id);

  return (
    <main className="flex flex-col gap-6 p-8">
      <div>
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
          {getGreeting()}, {firstName}.
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Ready for your next study session?
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GenerateExamCard />

        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-black/[.08] p-5 dark:border-white/[.1]">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                Total Exams Taken
              </span>
              <FileText className="h-4 w-4 text-zinc-400" />
            </div>
            <p className="mt-1 text-3xl font-semibold text-black dark:text-zinc-50">
              {totalExamsTaken}
            </p>
          </div>

          <div className="rounded-xl border border-black/[.08] p-5 dark:border-white/[.1]">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                Avg. Score
              </span>
              <TrendingUp className="h-4 w-4 text-zinc-400" />
            </div>
            <p className="mt-1 text-3xl font-semibold text-black dark:text-zinc-50">
              {avgScorePercent === null ? (
                "—"
              ) : (
                <>
                  {Math.round(avgScorePercent)}
                  <span className="text-lg text-zinc-400">%</span>
                </>
              )}
            </p>
            <div className="mt-2 h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className="h-1.5 rounded-full bg-green-600"
                style={{ width: `${avgScorePercent ?? 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-black/[.08] dark:border-white/[.1]">
        <div className="flex items-center justify-between border-b border-black/[.08] px-5 py-4 dark:border-white/[.1]">
          <h3 className="text-sm font-semibold text-black dark:text-zinc-50">
            Recent Activity
          </h3>
          {recentExams.length > 0 && (
            <Link
              href="/dashboard/tests"
              className="text-xs font-medium text-zinc-500 hover:text-black dark:hover:text-zinc-50"
            >
              View All
            </Link>
          )}
        </div>
        {recentExams.length === 0 ? (
          <EmptyActivity />
        ) : (
          <ul>
            {recentExams.map((exam) => (
              <ActivityRow key={exam.id} exam={exam} />
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
