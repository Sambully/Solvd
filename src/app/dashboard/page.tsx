import { UserButton } from "@clerk/nextjs";
import { getOrCreateUser } from "@/lib/getOrCreateUser";

export default async function DashboardPage() {
  const user = await getOrCreateUser();

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <header className="flex items-center justify-between border-b border-black/[.08] px-6 py-4 dark:border-white/[.1]">
        <span className="text-lg font-semibold">Solvd</span>
        <UserButton afterSignOutUrl="/" />
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-semibold">
          Welcome, {user?.name ?? "Student"}
        </h1>
        <p className="max-w-md text-zinc-600 dark:text-zinc-400">
          Your dashboard is live. Upload, exam generation, and history will
          show up here next.
        </p>
      </main>
    </div>
  );
}
