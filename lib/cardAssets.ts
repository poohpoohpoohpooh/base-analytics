import type { RankName } from "@/lib/rank";

export const CARD_TEMPLATE_VERSION = "v1";

export const CARD_TEMPLATE_IMAGES = {
  Beginner: `/assets/cards/card-template-beginner.png?${CARD_TEMPLATE_VERSION}`,
  Explorer: `/assets/cards/card-template-explorer.png?${CARD_TEMPLATE_VERSION}`,
  Builder: `/assets/cards/card-template-builder.png?${CARD_TEMPLATE_VERSION}`,
  Native: `/assets/cards/card-template-native.png?${CARD_TEMPLATE_VERSION}`,
  "Base God": `/assets/cards/card-template-base-god.png?${CARD_TEMPLATE_VERSION}`
} satisfies Record<RankName, string>;

export function getCardTemplateImage(rank: RankName): string {
  return CARD_TEMPLATE_IMAGES[rank] ?? CARD_TEMPLATE_IMAGES.Beginner;
}
