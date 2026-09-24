import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SignInSSOCallbackPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a] text-white p-4">
      <div className="flex flex-col items-center gap-4 bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl max-w-sm w-full text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        <div>
          <h2 className="text-base font-bold text-slate-100">Authenticating with Google...</h2>
          <p className="text-xs text-slate-400 mt-1">Finalizing your secure NEET CBT session</p>
        </div>
      </div>
      <AuthenticateWithRedirectCallback
        signInForceRedirectUrl="/dashboard"
        signUpForceRedirectUrl="/dashboard"
        signInFallbackRedirectUrl="/dashboard"
        signUpFallbackRedirectUrl="/dashboard"
      />
    </div>
  );
}
