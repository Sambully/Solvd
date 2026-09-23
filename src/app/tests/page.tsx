import { redirect } from "next/navigation";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { getAllExams } from "@/lib/dashboardData";
import TestsListClient from "@/components/TestsListClient";

export default async function TestsPage() {
  const user = await getOrCreateUser();
  if (!user) redirect("/sign-in");

  const exams = await getAllExams(user.id);

  return (
    <main className="p-3.5 sm:p-8">
      <TestsListClient initialExams={exams} />
    </main>
  );
}
