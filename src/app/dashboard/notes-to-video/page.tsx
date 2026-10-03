import NotesToVideoClient from "./NotesToVideoClient";

export const metadata = {
  title: "Notes to Video Animator · Solvd NEET CBT",
  description: "Convert handwritten notes and study topics into animated video lectures with AI voice narration.",
};

export default function NotesToVideoPage() {
  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      <NotesToVideoClient />
    </div>
  );
}
