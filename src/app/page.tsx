import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center gap-8 py-32 px-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50 sm:text-5xl">
          Solvd
        </h1>
        <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Upload any study material and get a full-length, timed NEET-style
          mock exam generated instantly. Practice tied to what you&apos;re
          actually studying today.
        </p>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <Link
            href="/sign-up"
            className="flex h-12 w-full items-center justify-center rounded-full bg-black px-8 text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 sm:w-auto"
          >
            Sign Up
          </Link>
          <Link
            href="/sign-in"
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.15] px-8 transition-colors hover:bg-black/[.04] dark:border-white/[.2] dark:hover:bg-white/[.06] sm:w-auto"
          >
            Log In
          </Link>
        </div>
      </main>
    </div>
  );
}
