/**
 * Custom Premium Clerk Theme for Solvd NEET CBT
 * Matches the platform's sleek aesthetic (slate-950, amber-400 accents, modern rounded cards).
 */
export const clerkCustomTheme = {
  layout: {
    socialButtonsPlacement: "bottom" as const,
    logoPlacement: "none" as const,
    showOptionalFields: false,
  },
  variables: {
    colorPrimary: "#0f172a",
    colorText: "#0f172a",
    colorTextSecondary: "#64748b",
    colorBackground: "#ffffff",
    colorInputBackground: "#f8fafc",
    colorInputText: "#0f172a",
    borderRadius: "1rem",
    fontFamily: "inherit",
    fontSize: "0.875rem",
  },
  elements: {
    rootBox: "w-full max-w-md mx-auto",
    card: "shadow-2xl shadow-slate-950/5 border border-slate-200/90 rounded-3xl bg-white/95 backdrop-blur-xl p-6 sm:p-8",
    headerTitle: "text-2xl font-black text-slate-950 tracking-tight text-center sm:text-left",
    headerSubtitle: "text-xs text-slate-500 text-center sm:text-left mt-1",
    formButtonPrimary:
      "bg-[#0f172a] hover:bg-slate-800 text-white font-black rounded-2xl py-3.5 text-xs shadow-lg shadow-black/10 transition-all hover:scale-[1.01] active:scale-[0.98]",
    formFieldInput:
      "rounded-xl border border-slate-200 bg-slate-50/70 text-slate-900 py-3 px-3.5 text-xs focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:bg-white transition-all shadow-2xs",
    formFieldLabel: "text-xs font-bold text-slate-700",
    formFieldAction: "text-xs font-semibold text-amber-600 hover:text-amber-700",
    socialButtonsBlockButton:
      "rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 py-2.5 shadow-2xs transition-all hover:border-slate-300",
    socialButtonsBlockButtonText: "font-bold text-xs text-slate-800",
    dividerLine: "bg-slate-100",
    dividerText: "text-slate-400 text-[11px] font-bold uppercase tracking-wider",
    footerActionText: "text-xs text-slate-500",
    footerActionLink: "text-xs font-bold text-amber-600 hover:text-amber-700 hover:underline",
    identityPreviewText: "text-xs font-bold text-slate-900",
    identityPreviewEditButton: "text-xs font-bold text-amber-600 hover:text-amber-700",
    formResendCodeLink: "text-xs font-bold text-amber-600 hover:text-amber-700",
    otpCodeFieldInput: "rounded-xl border-slate-200 bg-slate-50 text-slate-900 text-base font-bold",
  },
};
