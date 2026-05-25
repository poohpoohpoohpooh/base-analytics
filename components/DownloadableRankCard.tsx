"use client";

import { forwardRef, type CSSProperties } from "react";
import { getCardTemplateImage } from "@/lib/cardAssets";
import {
  CARD_CANVAS,
  getCardLayout,
  type CardBox,
  type CardOverlaySlot,
  type CardValueSlot
} from "@/lib/cardLayout";
import { formatDate, formatMetric, shortAddress } from "@/lib/format";
import type { RankName } from "@/lib/rank";
import type { AnalyzeResponse } from "@/lib/types";

type DownloadableRankCardProps = {
  result: AnalyzeResponse;
  rank: RankName;
};

const overlaySlots: CardOverlaySlot[] = [
  "address",
  "score",
  "daysOnBase",
  "activeDays",
  "totalTxs",
  "contractTxs",
  "uniqueContracts",
  "swaps",
  "defi",
  "nftsHeld",
  "longestStreak",
  "firstTx",
  "lastTx"
];

export const DownloadableRankCard = forwardRef<
  HTMLDivElement,
  DownloadableRankCardProps
>(function DownloadableRankCard({ result, rank }, ref) {
  const templateImage = getCardTemplateImage(rank);
  const layout = getCardLayout(rank);
  const overlayValues = buildOverlayValues(result);

  return (
    <article
      ref={ref}
      className="download-card card-canvas relative w-full min-w-0 overflow-hidden rounded-[22px] bg-slate-950 shadow-[0_0_80px_rgba(37,99,235,0.48)]"
      style={{
        position: "relative",
        width: "min(90vw, 720px, calc((100vh - 220px) * 0.8))",
        aspectRatio: `${CARD_CANVAS.width} / ${CARD_CANVAS.height}`,
        minWidth: 0,
        overflow: "hidden",
        borderRadius: "22px",
        containerType: "inline-size",
        backgroundImage: `url(${templateImage})`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "100% 100%"
      }}
    >
      <div
        className="card-overlay pointer-events-none absolute inset-0 z-[5] h-full w-full"
        aria-hidden="true"
      >
        {overlaySlots.map((slot) => (
          <OverlayValue
            key={slot}
            slot={slot}
            position={layout[slot]}
            value={overlayValues[slot]}
          />
        ))}
      </div>
    </article>
  );
});

function OverlayValue({
  slot,
  position,
  value
}: {
  slot: CardOverlaySlot;
  position: CardValueSlot;
  value: string;
}) {
  const isDate = slot === "firstTx" || slot === "lastTx";

  return (
    <span
      className="card-slot pointer-events-none absolute z-[5]"
      style={boxStyle(position.container)}
    >
      <span
        className="card-label-box pointer-events-none absolute"
        style={boxStyle(relativeBox(position.labelBox, position.container))}
        aria-hidden="true"
      />
      <span
        className="card-value-box pointer-events-none absolute flex items-center justify-center overflow-hidden"
        style={{
          ...boxStyle(relativeBox(position.valueBox, position.container)),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          textAlign: "center"
        }}
      >
        <span
          className="card-value block max-w-full overflow-hidden whitespace-nowrap text-center leading-none text-white"
          style={{
            fontSize: `clamp(${position.minFontSize}px, ${(position.fontSize / 720) * 100}cqw, ${position.maxFontSize}px)`,
            fontWeight: slot === "score" ? 800 : slot === "address" ? 700 : 800,
            letterSpacing:
              slot === "score" ? "-0.04em" : slot === "address" ? "0.02em" : "0",
            textTransform: isDate ? "uppercase" : "none",
            textAlign: position.textAlign,
            lineHeight: slot === "score" ? 0.9 : 1,
            ...getValueVisualStyle(slot),
            fontVariantNumeric: "tabular-nums"
          }}
          title={value}
        >
          {value}
        </span>
      </span>
    </span>
  );
}

function getValueVisualStyle(slot: CardOverlaySlot): CSSProperties {
  if (slot === "score") {
    return {
      background: "transparent",
      backgroundImage: "none",
      boxShadow: "none",
      border: "none",
      backdropFilter: "none",
      color: "#ffffff",
      WebkitTextFillColor: "#ffffff",
      WebkitTextStroke: "0",
      filter: "none",
      textShadow:
        "0 0 2px rgba(255,255,255,0.55), 0 0 10px rgba(72,160,255,0.75), 0 0 18px rgba(0,90,255,0.45)"
    };
  }

  return {
    color: "#ffffff",
    textShadow:
      "0 0 8px rgba(59,130,246,0.95), 0 0 18px rgba(37,99,235,0.75)"
  };
}

function boxStyle(box: CardBox): CSSProperties {
  return {
    left: `${box.x}%`,
    top: `${box.y}%`,
    width: `${box.width}%`,
    height: `${box.height}%`
  };
}

function relativeBox(box: CardBox, parent: CardBox): CardBox {
  return {
    x: ((box.x - parent.x) / parent.width) * 100,
    y: ((box.y - parent.y) / parent.height) * 100,
    width: (box.width / parent.width) * 100,
    height: (box.height / parent.height) * 100
  };
}

function buildOverlayValues(result: AnalyzeResponse): Record<CardOverlaySlot, string> {
  const metrics = result.metrics;
  const defiInteractions = metrics.defiInteractions;

  return {
    address: shortAddress(result.address),
    score: formatMetric(result.badge.score),
    daysOnBase: formatMetric(metrics.daysOnBase),
    activeDays: formatMetric(metrics.activeDays),
    totalTxs: formatMetric(metrics.totalTransactions),
    contractTxs: formatMetric(metrics.contractTransactions),
    uniqueContracts: formatMetric(metrics.uniqueContracts),
    swaps: formatMetric(metrics.tokenSwaps),
    defi: formatMetric(defiInteractions),
    nftsHeld: formatMetric(metrics.nftsHeld),
    longestStreak: formatMetric(metrics.longestStreak),
    firstTx: formatCardDate(metrics.firstTransactionAt),
    lastTx: formatCardDate(metrics.lastTransactionAt)
  };
}

function formatCardDate(value: string | null): string {
  return formatDate(value).toUpperCase();
}
