import type { RankName } from "@/lib/rank";

export const CARD_CANVAS = {
  width: 1122,
  height: 1402
} as const;

export type CardOverlaySlot =
  | "address"
  | "score"
  | "daysOnBase"
  | "activeDays"
  | "totalTxs"
  | "contractTxs"
  | "uniqueContracts"
  | "swaps"
  | "defi"
  | "nftsHeld"
  | "longestStreak"
  | "firstTx"
  | "lastTx";

export type CardBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CardValueSlot = {
  container: CardBox;
  labelBox: CardBox;
  valueBox: CardBox;
  fontSize: number;
  minFontSize: number;
  maxFontSize: number;
  textAlign: "center";
};

export type CardLayout = Record<CardOverlaySlot, CardValueSlot>;

export const CARD_LAYOUT: CardLayout = {
  address: slot({
    container: box(10.6, 21.0, 28.1, 3.1),
    labelBox: box(10.6, 21.0, 28.1, 0),
    valueBox: box(11.0, 21.35, 26.4, 2.65),
    maxFontSize: 18
  }),
  score: slot({
    container: box(9.4, 38.0, 20.0, 8.1),
    labelBox: box(9.4, 38.0, 20.0, 2.3),
    valueBox: box(9.7, 40.42, 17.6, 6.1),
    maxFontSize: 64,
    minFontSize: 36
  }),
  daysOnBase: metricSlot(9.7, 57.05, 2.9),
  activeDays: metricSlot(38.0, 57.05, 2.9),
  totalTxs: metricSlot(66.4, 57.05, 2.9),
  contractTxs: metricSlot(9.7, 66.75, 2.54),
  uniqueContracts: metricSlot(38.0, 66.75, 2.54),
  swaps: metricSlot(66.4, 66.75, 2.54),
  defi: metricSlot(9.7, 76.45, 1.66),
  nftsHeld: metricSlot(38.0, 76.45, 1.66),
  longestStreak: metricSlot(66.4, 76.45, 1.66),
  firstTx: dateSlot(14.7, 86.45),
  lastTx: dateSlot(52.7, 86.45)
};

export function getCardLayout(rank: RankName): CardLayout {
  void rank;
  return CARD_LAYOUT;
}

function metricSlot(x: number, y: number, valueOffsetY = 2.78): CardValueSlot {
  return slot({
    container: box(x, y, 27.4, 8.55),
    labelBox: box(x, y, 27.4, 3.2),
    valueBox: box(x + 3.4, y + valueOffsetY, 20.6, 3.75),
    maxFontSize: 22,
    minFontSize: 14
  });
}

function dateSlot(x: number, y: number): CardValueSlot {
  return slot({
    container: box(x, y, 36.0, 7.9),
    labelBox: box(x, y, 36.0, 3.0),
    valueBox: box(x + 4.5, y + 0.74, 26.9, 3.2),
    maxFontSize: 17,
    minFontSize: 12
  });
}

function slot({
  container,
  labelBox,
  valueBox,
  maxFontSize,
  minFontSize = Math.max(10, Math.round(maxFontSize * 0.58))
}: {
  container: CardBox;
  labelBox: CardBox;
  valueBox: CardBox;
  maxFontSize: number;
  minFontSize?: number;
}): CardValueSlot {
  return {
    container,
    labelBox,
    valueBox,
    fontSize: maxFontSize,
    minFontSize,
    maxFontSize,
    textAlign: "center"
  };
}

function box(x: number, y: number, width: number, height: number): CardBox {
  return { x, y, width, height };
}
