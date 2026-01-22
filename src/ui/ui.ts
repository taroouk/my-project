// src/ui/ui.ts
export const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export function uiTokens(isDark: boolean) {
  if (isDark) {
    return {
      page: "min-h-screen bg-[#0B1220] text-slate-100",
      header: "bg-slate-950/40 border-b border-slate-900/60 backdrop-blur supports-[backdrop-filter]:bg-slate-950/30",
      container: "max-w-6xl mx-auto px-4 sm:px-6",
      card: "bg-slate-950/40 border border-slate-900/60 rounded-3xl shadow-[0_10px_30px_-20px_rgba(0,0,0,0.65)]",
      cardSoft: "bg-slate-950/25 border border-slate-900/50 rounded-3xl",
      muted: "text-slate-400",
      title: "text-slate-50",
      chip: "bg-slate-900/40 text-slate-200 border border-slate-800/80",
      divider: "border-slate-900/60",
      item: "bg-slate-950/35 border border-slate-900/60 rounded-2xl",
      btnBase:
        "inline-flex items-center justify-center gap-2 rounded-2xl font-black text-[11px] uppercase tracking-[0.22em] px-4 py-3 transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed",
      btnGhost: "bg-slate-900/30 border border-slate-800 text-slate-200 hover:bg-slate-900/55",
      btnPrimary: "bg-white text-slate-900 hover:bg-slate-100",
      btnDanger: "bg-rose-500/15 border border-rose-500/25 text-rose-200 hover:bg-rose-500/20",
      codeBox: "text-rose-200 bg-rose-950/30 border border-rose-900/40",
    };
  }

  // ✅ Light mode: تباين أعلى + نصوص أوضح
  return {
    page: "min-h-screen bg-[#F6F8FC] text-slate-900",
    header: "bg-white/85 border-b border-slate-200/70 backdrop-blur supports-[backdrop-filter]:bg-white/70",
    container: "max-w-6xl mx-auto px-4 sm:px-6",
    card: "bg-white border border-slate-200/70 rounded-3xl shadow-[0_12px_30px_-20px_rgba(15,23,42,0.25)]",
    cardSoft: "bg-white border border-slate-200/70 rounded-3xl shadow-sm",
    muted: "text-slate-600",
    title: "text-slate-950",
    chip: "bg-slate-100 text-slate-800 border border-slate-200",
    divider: "border-slate-200/70",
    item: "bg-white border border-slate-200/70 rounded-2xl",
    btnBase:
      "inline-flex items-center justify-center gap-2 rounded-2xl font-black text-[11px] uppercase tracking-[0.22em] px-4 py-3 transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed",
    btnGhost: "bg-white border border-slate-300 text-slate-900 hover:bg-slate-50",
    btnPrimary: "bg-slate-950 text-white hover:bg-slate-800",
    btnDanger: "bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100",
    codeBox: "text-rose-800 bg-rose-50 border border-rose-200",
  };
}
