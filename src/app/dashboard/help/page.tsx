import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import HelpClient from "./HelpClient";

export const metadata: Metadata = {
  title: "Help & Docs · Solvd NEET CBT",
  description: "Comprehensive guides, feature walkthroughs, and documentation for Solvd NEET CBT.",
};

export default async function HelpPage() {
  const user = await getOrCreateUser();
  if (!user) redirect("/sign-in");

  return (
    <main className="p-4 sm:p-7 max-w-6xl mx-auto w-full font-sans text-slate-900">
      <HelpClient />
    </main>
  );
}
