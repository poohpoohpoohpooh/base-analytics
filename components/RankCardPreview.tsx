"use client";

import type { RefObject } from "react";
import { Copy, Download, Sparkles } from "lucide-react";
import { DownloadableRankCard } from "@/components/DownloadableRankCard";
import type { RankName } from "@/lib/rank";
import type { AnalyzeResponse } from "@/lib/types";

type RankCardPreviewProps = {
  result: AnalyzeResponse;
  rank: RankName;
  cardRef: RefObject<HTMLDivElement | null>;
  downloading: boolean;
  onDownload: () => void;
  onCopyTweet: () => void;
};

export function RankCardPreview({
  result,
  rank,
  cardRef,
  downloading,
  onDownload,
  onCopyTweet
}: RankCardPreviewProps) {
  return (
    <section className="relative min-w-0 overflow-hidden rounded-3xl border border-blue-300/40 bg-[rgba(5,15,35,0.78)] p-6 shadow-[0_0_84px_rgba(37,99,235,0.32)] backdrop-blur-xl sm:p-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-cyan-100/80 shadow-[0_0_28px_rgba(125,211,252,0.82)]" />
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100/30 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold text-cyan-100">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Download Card Preview
          </div>
          <h2 className="mt-3 text-xl font-semibold text-white">
            Activity Score Card
          </h2>
          <p className="mt-1 text-sm text-blue-100/60">
            This exact card will be saved as PNG.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end" data-no-capture="true">
          <button
            type="button"
            onClick={onDownload}
            disabled={downloading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-cyan-100/40 bg-blue-500 px-4 text-sm font-semibold text-white shadow-[0_0_34px_rgba(59,130,246,0.48)] transition hover:-translate-y-0.5 hover:bg-cyan-400 hover:shadow-[0_0_44px_rgba(34,211,238,0.6)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download className="size-4" aria-hidden="true" />
            {downloading ? "Saving" : "Download Card"}
          </button>
          <button
            type="button"
            onClick={onCopyTweet}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-blue-200/30 bg-white/[0.06] px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-cyan-100/55 hover:bg-cyan-300/10"
          >
            <Copy className="size-4" aria-hidden="true" />
            Copy Tweet
          </button>
        </div>
      </div>

      <div className="flex min-w-0 justify-center overflow-hidden">
        <DownloadableRankCard ref={cardRef} result={result} rank={rank} />
      </div>
    </section>
  );
}
