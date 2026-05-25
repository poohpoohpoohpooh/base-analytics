import { ASSETS } from "@/lib/assets";
import type { RankName } from "@/lib/rank";

export type RankCardTheme = {
  accent: string;
  accentSoft: string;
  frameClass: string;
  background: string;
  overlayClass: string;
  metricClass: string;
  chipClass: string;
  titleClass: string;
  scoreClass: string;
  scoreBarClass: string;
  badgePanelClass: string;
  badgeImageClass: string;
  baseChanClass: string;
  baseAuraClass: string;
  ornamentClass: string;
  footerClass: string;
  dividerClass: string;
  rankImage: string;
};

export const rankThemeMap: Record<RankName, RankCardTheme> = {
  Beginner: {
    accent: "#60a5fa",
    accentSoft: "rgba(96,165,250,0.22)",
    frameClass:
      "border-blue-300/35 shadow-[0_0_42px_rgba(59,130,246,0.26)]",
    background:
      "radial-gradient(circle at 78% 24%, rgba(59,130,246,0.18), transparent 34%), linear-gradient(145deg, #061126 0%, #041026 54%, #020617 100%)",
    overlayClass:
      "bg-[linear-gradient(rgba(96,165,250,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(96,165,250,0.08)_1px,transparent_1px)] bg-[size:38px_38px] opacity-[0.45]",
    metricClass: "border-blue-300/25 bg-blue-300/[0.075]",
    chipClass: "border-blue-200/30 bg-blue-300/10 text-blue-100",
    titleClass: "text-blue-50",
    scoreClass: "text-blue-100 drop-shadow-[0_0_14px_rgba(96,165,250,0.55)]",
    scoreBarClass: "bg-blue-400",
    badgePanelClass: "border-blue-300/25 bg-blue-950/50",
    badgeImageClass: "drop-shadow-[0_0_16px_rgba(96,165,250,0.38)]",
    baseChanClass:
      "right-[-18px] bottom-[86px] h-[250px] opacity-70 drop-shadow-[0_0_22px_rgba(96,165,250,0.36)]",
    baseAuraClass:
      "right-[24px] bottom-[138px] h-36 w-36 bg-blue-400/20 blur-3xl",
    ornamentClass: "border-blue-300/30 bg-blue-400/10",
    footerClass: "border-blue-300/20 bg-blue-950/40",
    dividerClass: "bg-blue-300/40 shadow-[0_0_18px_rgba(96,165,250,0.55)]",
    rankImage: ASSETS.ranks.Beginner
  },
  Explorer: {
    accent: "#22d3ee",
    accentSoft: "rgba(34,211,238,0.26)",
    frameClass:
      "border-cyan-200/40 shadow-[0_0_54px_rgba(34,211,238,0.30)]",
    background:
      "radial-gradient(circle at 82% 30%, rgba(34,211,238,0.22), transparent 34%), radial-gradient(circle at 16% 86%, rgba(37,99,235,0.24), transparent 28%), linear-gradient(145deg, #041224 0%, #062045 55%, #020617 100%)",
    overlayClass:
      "bg-[linear-gradient(115deg,rgba(34,211,238,0.18)_0_1px,transparent_1px_26px)] bg-[size:28px_28px] opacity-[0.55]",
    metricClass: "border-cyan-200/30 bg-cyan-300/[0.085]",
    chipClass: "border-cyan-100/35 bg-cyan-300/10 text-cyan-100",
    titleClass: "text-cyan-50",
    scoreClass: "text-cyan-100 drop-shadow-[0_0_18px_rgba(34,211,238,0.62)]",
    scoreBarClass: "bg-cyan-300",
    badgePanelClass: "border-cyan-200/40 bg-cyan-950/40",
    badgeImageClass: "drop-shadow-[0_0_22px_rgba(34,211,238,0.5)]",
    baseChanClass:
      "right-[-22px] bottom-[76px] h-[270px] opacity-80 drop-shadow-[0_0_30px_rgba(34,211,238,0.48)]",
    baseAuraClass:
      "right-[28px] bottom-[132px] h-44 w-44 bg-cyan-300/25 blur-3xl",
    ornamentClass: "border-cyan-200/40 bg-cyan-300/10",
    footerClass: "border-cyan-200/25 bg-cyan-950/40",
    dividerClass: "bg-cyan-200/60 shadow-[0_0_22px_rgba(34,211,238,0.7)]",
    rankImage: ASSETS.ranks.Explorer
  },
  Builder: {
    accent: "#38bdf8",
    accentSoft: "rgba(56,189,248,0.28)",
    frameClass:
      "border-sky-200/50 shadow-[0_0_64px_rgba(56,189,248,0.34),inset_0_0_30px_rgba(59,130,246,0.10)]",
    background:
      "radial-gradient(circle at 82% 24%, rgba(56,189,248,0.26), transparent 33%), linear-gradient(135deg, rgba(30,64,175,0.45) 0%, rgba(7,89,133,0.34) 44%, rgba(2,6,23,1) 100%)",
    overlayClass:
      "bg-[linear-gradient(rgba(125,211,252,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.10)_1px,transparent_1px)] bg-[size:28px_28px] opacity-60",
    metricClass: "border-sky-200/35 bg-sky-300/[0.095]",
    chipClass: "border-sky-100/40 bg-sky-300/10 text-sky-100",
    titleClass: "text-sky-50",
    scoreClass: "text-sky-100 drop-shadow-[0_0_22px_rgba(56,189,248,0.68)]",
    scoreBarClass: "bg-sky-300",
    badgePanelClass: "border-sky-200/40 bg-sky-950/40",
    badgeImageClass: "drop-shadow-[0_0_26px_rgba(125,211,252,0.58)]",
    baseChanClass:
      "right-[-28px] bottom-[70px] h-[292px] opacity-90 drop-shadow-[0_0_34px_rgba(56,189,248,0.56)]",
    baseAuraClass:
      "right-[24px] bottom-[132px] h-52 w-52 bg-sky-300/25 blur-3xl",
    ornamentClass: "border-sky-200/40 bg-sky-300/10",
    footerClass: "border-sky-200/30 bg-sky-950/40",
    dividerClass: "bg-sky-200/60 shadow-[0_0_24px_rgba(56,189,248,0.76)]",
    rankImage: ASSETS.ranks.Builder
  },
  Native: {
    accent: "#a78bfa",
    accentSoft: "rgba(167,139,250,0.30)",
    frameClass:
      "border-violet-100/50 shadow-[0_0_74px_rgba(96,165,250,0.40),0_0_42px_rgba(167,139,250,0.24)]",
    background:
      "radial-gradient(circle at 80% 23%, rgba(167,139,250,0.28), transparent 33%), radial-gradient(circle at 34% 78%, rgba(34,211,238,0.18), transparent 35%), linear-gradient(145deg, #07112c 0%, #10154a 50%, #020617 100%)",
    overlayClass:
      "bg-[radial-gradient(circle_at_center,rgba(191,219,254,0.16)_1px,transparent_1px)] bg-[size:22px_22px] opacity-[0.58]",
    metricClass: "border-violet-100/30 bg-violet-300/[0.095]",
    chipClass: "border-violet-100/40 bg-violet-300/10 text-violet-100",
    titleClass: "text-violet-50",
    scoreClass: "text-violet-100 drop-shadow-[0_0_24px_rgba(167,139,250,0.72)]",
    scoreBarClass: "bg-violet-300",
    badgePanelClass: "border-violet-100/40 bg-violet-950/40",
    badgeImageClass: "drop-shadow-[0_0_30px_rgba(196,181,253,0.72)]",
    baseChanClass:
      "right-[-34px] bottom-[58px] h-[314px] opacity-95 drop-shadow-[0_0_42px_rgba(167,139,250,0.72)]",
    baseAuraClass:
      "right-[22px] bottom-[122px] h-60 w-60 bg-violet-300/30 blur-3xl",
    ornamentClass: "border-violet-100/40 bg-violet-300/10",
    footerClass: "border-violet-100/30 bg-violet-950/35",
    dividerClass: "bg-violet-100/70 shadow-[0_0_28px_rgba(167,139,250,0.82)]",
    rankImage: ASSETS.ranks.Native
  },
  "Base God": {
    accent: "#eff6ff",
    accentSoft: "rgba(239,246,255,0.38)",
    frameClass:
      "border-white/80 shadow-[0_0_96px_rgba(219,234,254,0.62),0_0_80px_rgba(34,211,238,0.38),inset_0_0_48px_rgba(255,255,255,0.16)]",
    background:
      "radial-gradient(circle at 80% 22%, rgba(255,255,255,0.34), transparent 29%), radial-gradient(circle at 18% 88%, rgba(34,211,238,0.28), transparent 35%), linear-gradient(135deg, rgba(8,47,73,1) 0%, rgba(30,64,175,0.82) 37%, rgba(76,29,149,0.62) 70%, rgba(2,6,23,1) 100%)",
    overlayClass:
      "bg-[linear-gradient(120deg,rgba(255,255,255,0.22)_0_1px,transparent_1px_22px),linear-gradient(rgba(125,211,252,0.12)_1px,transparent_1px)] bg-[size:34px_34px,26px_26px] opacity-70",
    metricClass: "border-white/35 bg-white/[0.105]",
    chipClass: "border-white/50 bg-white/15 text-white",
    titleClass: "text-white drop-shadow-[0_0_18px_rgba(255,255,255,0.72)]",
    scoreClass: "text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.9)]",
    scoreBarClass: "bg-white",
    badgePanelClass: "border-white/60 bg-white/12",
    badgeImageClass: "drop-shadow-[0_0_38px_rgba(255,255,255,0.92)]",
    baseChanClass:
      "right-[-46px] bottom-[44px] h-[350px] opacity-100 drop-shadow-[0_0_58px_rgba(255,255,255,0.92)]",
    baseAuraClass:
      "right-[12px] bottom-[100px] h-72 w-72 bg-white/32 blur-3xl",
    ornamentClass: "border-white/60 bg-white/15",
    footerClass: "border-white/30 bg-white/10",
    dividerClass: "bg-white shadow-[0_0_34px_rgba(255,255,255,0.95)]",
    rankImage: ASSETS.ranks["Base God"]
  }
};

export function getCardTheme(rank: RankName): RankCardTheme {
  return rankThemeMap[rank];
}
