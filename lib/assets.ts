import type { RankName } from "@/lib/rank";

export const ASSETS = {
  hero: "/assets/base-chan-hero-bg.png",
  neonDashboard: "/assets/generated/neon-dashboard-bg.png",
  full: "/assets/base-chan-full.png",
  robot: "/assets/characters/base-chan-robot.png",
  ranks: {
    Beginner: "/assets/rank-beginner.png",
    Explorer: "/assets/rank-explorer.png",
    Builder: "/assets/rank-builder.png",
    Native: "/assets/rank-native.png",
    "Base God": "/assets/rank-base-god.png"
  } satisfies Record<RankName, string>
} as const;
