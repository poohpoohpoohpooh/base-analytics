export type ReactionKind = "gm" | "gn" | "checkin";

export const REACTION_ASSETS: Record<ReactionKind, string[]> = {
  gm: [
    "/assets/reactions/gm/gm-01.png",
    "/assets/reactions/gm/gm-02.png",
    "/assets/reactions/gm/gm-03.png",
    "/assets/reactions/gm/gm-04.png",
    "/assets/reactions/gm/gm-05.png"
  ],
  gn: [
    "/assets/reactions/gn/gn-01.png",
    "/assets/reactions/gn/gn-02.png",
    "/assets/reactions/gn/gn-03.png",
    "/assets/reactions/gn/gn-04.png",
    "/assets/reactions/gn/gn-05.png"
  ],
  checkin: [
    "/assets/reactions/checkin/checkin-01.png",
    "/assets/reactions/checkin/checkin-02.png",
    "/assets/reactions/checkin/checkin-03.png",
    "/assets/reactions/checkin/checkin-04.png",
    "/assets/reactions/checkin/checkin-05.png"
  ]
};

export function getReactionAssets(kind: ReactionKind): string[] {
  return REACTION_ASSETS[kind];
}
