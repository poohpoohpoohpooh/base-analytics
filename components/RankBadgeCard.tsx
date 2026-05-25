"use client";

import { getCardTheme } from "@/lib/cardTheme";
import type { RankName } from "@/lib/rank";

type RankBadgeCardProps = {
  rank: RankName;
  score: number;
};

export function RankBadgeCard({ rank, score }: RankBadgeCardProps) {
  const theme = getCardTheme(rank);

  return (
    <section
      className={`relative overflow-hidden rounded-3xl border bg-[rgba(5,15,35,0.82)] p-4 backdrop-blur-xl ${theme.frameClass}`}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)` }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(59,130,246,0.12),transparent_46%,rgba(34,211,238,0.08))]" />
      <div className="relative">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
          <img
            src={theme.rankImage}
            alt={`${rank} rank badge`}
            width={512}
            height={512}
            className={`mx-auto w-full max-w-[340px] ${theme.badgeImageClass}`}
            style={{ width: "100%", maxWidth: "340px", height: "auto" }}
          />
        </div>
        <div className="mt-4">
          <div className="h-2 overflow-hidden rounded-full bg-blue-950/80">
            <div
              className={`h-full rounded-full ${theme.scoreBarClass} shadow-[0_0_18px_currentColor]`}
              style={{ width: `${score}%` }}
            />
          </div>
          <p className="mt-3 text-center text-sm font-semibold text-blue-100/75">
            Score {score}/100
          </p>
        </div>
      </div>
    </section>
  );
}
