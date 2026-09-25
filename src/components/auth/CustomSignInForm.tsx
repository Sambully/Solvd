"use client";

import { useClerk } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2, Lock, Mail, AlertCircle } from "lucide-react";

export default function CustomSignInForm() {
  const clerk = useClerk();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clerk.loaded || !clerk.client) return;

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }
    if (!password) {
      setError("Please enter your password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await clerk.client.signIn.create({
        identifier: email.trim(),
        password: password,
      });

      if (result.status === "complete" && result.createdSessionId) {
        await clerk.setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else {
        setError(`Additional verification required: ${result.status}`);
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: Array<{ message?: string; longMessage?: string }> };
      setError(
        clerkErr?.errors?.[0]?.longMessage ||
        clerkErr?.errors?.[0]?.message ||
        "Invalid email or password. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!clerk.loaded || !clerk.client) return;
    setGoogleLoading(true);
    setError("");

    try {
      const {
        isNativePlatform,
        nativeGoogleSignIn,
        NativeAuthCanceledError,
      } = await import("@/lib/nativeGoogleAuth");

      // NATIVE PATH: OS account chooser, no browser hand-off.
      if (await isNativePlatform()) {
        try {
          const result = await nativeGoogleSignIn();

          const res = await fetch("/api/auth/google-native", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken: result.idToken }),
          });

          const data = await res.json();
          if (!res.ok || !data.token) {
            throw new Error(data.error || "Failed to authenticate with Google");
          }

          const signInRes = await clerk.client.signIn.create({
            strategy: "ticket",
            ticket: data.token,
          });

          if (signInRes.status === "complete" && signInRes.createdSessionId) {
            await clerk.setActive({ session: signInRes.createdSessionId });
            router.push("/dashboard");
            return;
          }
          throw new Error("Could not activate your session. Please try again.");
        } catch (nativeErr: unknown) {
          if (nativeErr instanceof NativeAuthCanceledError) {
            setGoogleLoading(false);
            return;
          }
          // Native failed or timed out (e.g. Google Cloud config not matching
          // yet). Fall through to the web redirect so the user can still sign
          // in instead of being stuck on an endless spinner.
          console.error("Native Google Sign-In failed, falling back to web:", nativeErr);
        }
      }

      // WEB PATH: standard OAuth redirect (browser, or native fallback).
      await clerk.client.signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err: unknown) {
      const clerkErr = err as { errors?: Array<{ message?: string }>; message?: string };
      setError(
        clerkErr?.errors?.[0]?.message ||
        clerkErr?.message ||
        "Could not connect to Google sign in"
      );
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto rounded-3xl border border-slate-200/90 bg-white/95 p-6 sm:p-8 shadow-2xl shadow-slate-950/5 backdrop-blur-xl">
      <div className="text-center sm:text-left mb-6">
        <h2 className="text-2xl font-black text-slate-950 tracking-tight">Sign In to Solvd</h2>
        <p className="text-xs text-slate-500 mt-1">
          Access your NEET CBT mock tests, diagnostic ledger & study lobbies
        </p>
      </div>

      {error && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-800 animate-in fade-in duration-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
          <span className="leading-snug">{error}</span>
        </div>
      )}

      {/* Google OAuth Button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={googleLoading || loading}
        className="w-full flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 py-3 px-4 text-xs font-bold text-slate-800 shadow-2xs transition-all hover:border-slate-300 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
      >
        {googleLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-slate-600" />
        ) : (
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        )}
        <span>Continue with Google</span>
      </button>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase">
          <span className="bg-white px-3 font-bold tracking-wider text-slate-400">
            or sign in with email
          </span>
        </div>
      </div>

      {/* Email / Password Form */}
      <form onSubmit={handleEmailSignIn} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@gmail.com"
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-3.5 py-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-3.5 py-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#0f172a] hover:bg-slate-800 text-white font-black py-3.5 text-xs shadow-lg shadow-black/10 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-white" />
          ) : (
            <>
              <span>Sign In to Dashboard</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Footer link */}
      <div className="mt-6 text-center text-xs text-slate-500">
        Don&apos;t have an account?{" "}
        <Link
          href="/sign-up"
          className="font-bold text-amber-600 hover:text-amber-700 hover:underline transition-colors"
        >
          Create free account
        </Link>
      </div>
    </div>
  );
}
