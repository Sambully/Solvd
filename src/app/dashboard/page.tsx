import { redirect } from "next/navigation";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { getDashboardData } from "@/lib/dashboardData";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const user = await getOrCreateUser();
  if (!user) redirect("/sign-in");

  const data = await getDashboardData(user.id);
  const displayName = user.name || "Aryan Sharma";

  return (
    <main className="min-h-screen text-slate-900">
      <DashboardClient userName={displayName} data={data} />
    </main>
  );
}


