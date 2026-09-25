"use client";

import { useClerk } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2, Lock, Mail, User, AlertCircle, CheckCircle2, KeyRound } from "lucide-react";

export default function CustomSignUpForm() {
  const clerk = useClerk();
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clerk.loaded || !clerk.client) return;

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }
    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await clerk.client.signUp.create({
        emailAddress: email.trim(),
        password: password,
        firstName: firstName.trim() || undefined,
      });

      await clerk.client.signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerifying(true);
    } catch (err: unknown) {
      const clerkErr = err as { errors?: Array<{ message?: string; longMessage?: string }> };
      setError(
        clerkErr?.errors?.[0]?.longMessage ||
        clerkErr?.errors?.[0]?.message ||
        "Could not create account. Please try another email or sign in."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clerk.loaded || !clerk.client) return;

    if (!code.trim()) {
      setError("Please enter the 6-digit verification code sent to your email");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const completeSignUp = await clerk.client.signUp.attemptEmailAddressVerification({
        code: code.trim(),
      });

      if (completeSignUp.status === "complete" && completeSignUp.createdSessionId) {
        await clerk.setActive({ session: completeSignUp.createdSessionId });
        router.push("/dashboard");
      } else {
        setError(`Status: ${completeSignUp.status}`);
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: Array<{ message?: string; longMessage?: string }> };
      setError(
        clerkErr?.errors?.[0]?.longMessage ||
        clerkErr?.errors?.[0]?.message ||
        "Invalid verification code. Please check your inbox or spam folder."
      );
    } finally {
      setLoading(false);
    }
  };

  // Continue with Google: opens the Google account chooser in the browser and
  // returns to the app automatically once an account is picked.
  const handleGoogleSignUp = async () => {
    if (!clerk.loaded || !clerk.client) return;
    setGoogleLoading(true);
    setError("");

    try {
      await clerk.client.signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err: unknown) {
      const clerkErr = err as { errors?: Array<{ message?: string }>; message?: string };
      setError(clerkErr?.errors?.[0]?.message || clerkErr?.message || "Failed to connect with Google");
      setGoogleLoading(false);
    }
  };

  // 1. Email OTP Verification Step
  if (verifying) {
    return (
      <div className="w-full max-w-md mx-auto rounded-3xl border border-slate-200/90 bg-white/95 p-6 sm:p-8 shadow-2xl shadow-slate-950/5 backdrop-blur-xl">
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-3 border border-emerald-200">
            <KeyRound className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-950 tracking-tight">Verify Your Email</h2>
          <p className="text-xs text-slate-500 mt-1">
            We sent a 6-digit verification code to <span className="font-bold text-slate-800">{email}</span>
          </p>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-800 animate-in fade-in duration-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        <form onSubmit={handleVerifyCode} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Verification Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              maxLength={6}
              required
              className="w-full text-center tracking-[0.5em] font-mono text-xl font-black rounded-xl border border-slate-200 bg-slate-50/70 py-3.5 text-slate-900 placeholder:text-slate-300 focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#0f172a] hover:bg-slate-800 text-white font-black py-3.5 text-xs shadow-lg shadow-black/10 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              <>
                <span>Complete Registration</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-slate-500">
          Didn&apos;t receive a code?{" "}
          <button
            type="button"
            onClick={() => clerk.client?.signUp.prepareEmailAddressVerification({ strategy: "email_code" })}
            className="font-bold text-amber-600 hover:underline"
          >
            Resend Code
          </button>
        </div>
      </div>
    );
  }

  // 2. Initial Registration Form
  return (
    <div className="w-full max-w-md mx-auto rounded-3xl border border-slate-200/90 bg-white/95 p-6 sm:p-8 shadow-2xl shadow-slate-950/5 backdrop-blur-xl">
      <div className="text-center sm:text-left mb-6">
        <h2 className="text-2xl font-black text-slate-950 tracking-tight">Create Free Account</h2>
        <p className="text-xs text-slate-500 mt-1">
          Full unlimited access till 30 October 2026 • Zero credit card required
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
        onClick={handleGoogleSignUp}
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
        <span>Sign up with Google</span>
      </button>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase">
          <span className="bg-white px-3 font-bold tracking-wider text-slate-400">
            or sign up with email
          </span>
        </div>
      </div>

      {/* Email / Password / Name Form */}
      <form onSubmit={handleSignUp} className="space-y-3.5">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Your Full Name
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all"
            />
          </div>
        </div>

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
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Create Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              minLength={8}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#0f172a] hover:bg-slate-800 text-white font-black py-3.5 text-xs shadow-lg shadow-black/10 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 mt-2 cursor-pointer"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-white" />
          ) : (
            <>
              <span>Create Account & Start Drills</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Footer link */}
      <div className="mt-6 text-center text-xs text-slate-500">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-bold text-amber-600 hover:text-amber-700 hover:underline transition-colors"
        >
          Sign in here
        </Link>
      </div>
    </div>
  );
}
