import { redirect } from "next/navigation";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { getAnalyticsData } from "@/lib/analyticsData";
import AnalyticsClient from "@/components/analytics/AnalyticsClient";

export default async function AnalyticsPage() {
  const user = await getOrCreateUser();
  if (!user) redirect("/sign-in");

  const data = await getAnalyticsData(user.id);

  return (
    <main className="p-3.5 sm:p-8 max-w-7xl mx-auto">
      <AnalyticsClient data={data} />
    </main>
  );
}
