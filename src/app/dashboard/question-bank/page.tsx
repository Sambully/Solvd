import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { getQuestionBankModules } from "@/lib/questionBankData";
import QuestionBankClient from "@/components/question-bank/QuestionBankClient";

export const metadata: Metadata = {
  title: "Question Bank · Solvd NEET CBT",
  description: "Instant, reusable NEET question bank with curated and community-shared mock modules.",
};

export default async function QuestionBankPage() {
  const user = await getOrCreateUser();
  if (!user) redirect("/sign-in");

  const modules = await getQuestionBankModules();

  return (
    <main className="p-3.5 sm:p-7 max-w-6xl mx-auto w-full font-sans text-slate-900">
      <QuestionBankClient initialModules={modules} />
    </main>
  );
}
