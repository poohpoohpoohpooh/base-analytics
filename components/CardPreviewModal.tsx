"use client";

import { useEffect, type RefObject } from "react";
import { Copy, Download, Sparkles, X } from "lucide-react";
import { DownloadableRankCard } from "@/components/DownloadableRankCard";
import type { RankName } from "@/lib/rank";
import type { AnalyzeResponse } from "@/lib/types";

type CardPreviewModalProps = {
  open: boolean;
  result: AnalyzeResponse | null;
  rank: RankName | null;
  cardRef: RefObject<HTMLDivElement | null>;
  downloading: boolean;
  onClose: () => void;
  onDownload: () => void;
  onCopyTweet: () => void;
};

export function CardPreviewModal({
  open,
  result,
  rank,
  cardRef,
  downloading,
  onClose,
  onDownload,
  onCopyTweet
}: CardPreviewModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open || !result || !rank) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-[rgba(5,24,62,0.76)] p-6 backdrop-blur-xl"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflowX: "hidden",
        overflowY: "auto",
        padding: "24px",
        background: "rgba(5,24,62,0.76)",
        backdropFilter: "blur(12px)"
      }}
      role="dialog"
      aria-modal="true"
      aria-label="My Base Identity Card preview"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="relative my-auto max-h-[94vh] w-[min(96vw,860px)] overflow-y-auto overflow-x-hidden rounded-[24px] border border-cyan-100/52 bg-[rgba(8,38,94,0.92)] p-5 shadow-[0_0_104px_rgba(0,82,255,0.62)]"
        style={{
          position: "relative",
          width: "min(96vw, 860px)",
          maxHeight: "94vh",
          overflowX: "hidden",
          overflowY: "auto",
          borderRadius: "24px",
          padding: "20px",
          background: "rgba(8,38,94,0.92)"
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(125,211,252,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.045)_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-cyan-100/85 shadow-[0_0_30px_rgba(125,211,252,0.9)]" />

        <div className="sticky top-0 z-20 -mx-1 mb-4 flex flex-col gap-4 rounded-2xl border border-cyan-100/35 bg-[rgba(8,47,120,0.82)] p-3 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100/30 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold text-cyan-100">
              <Sparkles className="size-3.5" aria-hidden="true" />
              {rank} / Score {result.badge.score}/100
            </div>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              My Base Identity Card
            </h2>
          </div>

          <div className="flex flex-wrap gap-2" data-no-capture="true">
            <button
              type="button"
              onClick={onDownload}
              disabled={downloading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-cyan-100/45 bg-gradient-to-r from-[#0052FF] via-[#1E7BFF] to-[#38BDF8] px-4 text-sm font-semibold text-white shadow-[0_0_36px_rgba(0,82,255,0.56)] transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download className="size-4" aria-hidden="true" />
              {downloading ? "Saving" : "Download PNG"}
            </button>
            <button
              type="button"
              onClick={onCopyTweet}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-blue-200/40 bg-blue-500/15 px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-cyan-100/60 hover:bg-blue-400/25"
            >
              <Copy className="size-4" aria-hidden="true" />
              Copy Tweet
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-blue-100 transition hover:-translate-y-0.5 hover:border-cyan-100/50 hover:bg-cyan-300/10"
              aria-label="Close card preview"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="relative flex min-w-0 justify-center overflow-hidden">
          <DownloadableRankCard ref={cardRef} result={result} rank={rank} />
        </div>
      </section>
    </div>
  );
}
