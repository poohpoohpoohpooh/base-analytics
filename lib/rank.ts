import type { WalletMetrics } from "@/lib/types";

export type RankName = "Beginner" | "Explorer" | "Builder" | "Native" | "Base God";

export type RankMetricInput = Pick<
  WalletMetrics,
  | "daysOnBase"
  | "activeDays"
  | "totalTransactions"
  | "contractTransactions"
  | "uniqueContracts"
  | "tokenSwaps"
  | "nftsHeld"
  | "longestStreak"
> & {
  defiInteractions?: number | null;
};

export function getActivityScore(metrics: RankMetricInput): number {
  const score =
    scorePart(metrics.daysOnBase, 1000, 20) +
    scorePart(metrics.activeDays, 700, 20) +
    scorePart(metrics.totalTransactions, 10000, 15) +
    scorePart(metrics.contractTransactions, 5000, 15) +
    scorePart(metrics.uniqueContracts, 800, 10) +
    scorePart(metrics.longestStreak, 365, 10) +
    scorePart(metrics.tokenSwaps, 500, 4) +
    scorePart(metrics.defiInteractions, 300, 4) +
    scorePart(metrics.nftsHeld, 50, 2);

  return Math.round(clamp(score, 0, 100));
}

export function getRankFromScore(
  score: number,
  metrics?: RankMetricInput | null
): RankName {
  if (score >= 88 && metrics && qualifiesForBaseGod(metrics)) {
    return "Base God";
  }
  if (score >= 73) {
    return "Native";
  }
  if (score >= 55) {
    return "Builder";
  }
  if (score >= 35) {
    return "Explorer";
  }
  return "Beginner";
}

export function normalizeRank(rank: string | null | undefined): RankName {
  const normalized = String(rank || "").trim().toLowerCase();

  if (normalized === "base god" || normalized === "base-god" || normalized === "basegod") {
    return "Base God";
  }
  if (normalized === "native") {
    return "Native";
  }
  if (normalized === "builder") {
    return "Builder";
  }
  if (normalized === "explorer") {
    return "Explorer";
  }
  return "Beginner";
}

export function getRankLabel(rank: RankName): string {
  return rank;
}

function qualifiesForBaseGod(metrics: RankMetricInput): boolean {
  return (
    metricValue(metrics.daysOnBase) >= 365 &&
    metricValue(metrics.activeDays) >= 180 &&
    metricValue(metrics.totalTransactions) >= 1000 &&
    metricValue(metrics.contractTransactions) >= 500 &&
    metricValue(metrics.uniqueContracts) >= 100 &&
    metricValue(metrics.longestStreak) >= 30
  );
}

function scorePart(value: number | null | undefined, target: number, points: number): number {
  const normalizedValue = metricValue(value);

  if (normalizedValue <= 0) {
    return 0;
  }

  return (
    clamp(Math.log10(normalizedValue + 1) / Math.log10(target + 1), 0, 1) *
    points
  );
}

function metricValue(value: number | null | undefined): number {
  if (!value || value <= 0) {
    return 0;
  }

  return value;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
