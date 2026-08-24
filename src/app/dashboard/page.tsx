import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, TrendingUp, FilePlus2 } from "lucide-react";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { getDashboardData } from "@/lib/dashboardData";
import GenerateExamCard from "@/components/GenerateExamCard";
import ExamCardItem from "@/components/ExamCardItem";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function EmptyActivity() {
  return (
    <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900">
        <FilePlus2 className="h-4 w-4 text-zinc-400" />
      </div>
      <p className="text-sm font-medium text-black dark:text-zinc-50">
        No mock tests yet
      </p>
      <p className="max-w-xs text-sm text-zinc-500 dark:text-zinc-400">
        Generate your first NEET mock exam from notes or PDFs and start practicing.
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

      <div className="rounded-xl border border-black/[.08] dark:border-white/[.1] bg-white dark:bg-zinc-950 overflow-hidden">
        <div className="flex items-center justify-between border-b border-black/[.08] px-5 py-4 dark:border-white/[.1]">
          <h3 className="text-sm font-semibold text-black dark:text-zinc-50">
            Recent Activity
          </h3>
          {recentExams.length > 0 && (
            <Link
              href="/tests"
              className="text-xs font-semibold text-zinc-500 hover:text-black dark:hover:text-zinc-50 transition-colors"
            >
              View All ({recentExams.length}) →
            </Link>
          )}
        </div>
        {recentExams.length === 0 ? (
          <EmptyActivity />
        ) : (
          <ul className="divide-y divide-black/[.05] dark:divide-white/[.05]">
            {recentExams.map((exam) => (
              <ExamCardItem key={exam.id} exam={exam} />
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

