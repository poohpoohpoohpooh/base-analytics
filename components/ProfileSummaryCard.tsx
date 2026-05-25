"use client";

import { Copy, Sparkles } from "lucide-react";
import { ASSETS } from "@/lib/assets";
import { compactAddress, formatDateTime } from "@/lib/format";
import type { AnalyzeResponse } from "@/lib/types";

type ProfileSummaryCardProps = {
  result: AnalyzeResponse;
  onCopyTweet: () => void;
};

export function ProfileSummaryCard({
  result,
  onCopyTweet
}: ProfileSummaryCardProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-blue-300/40 bg-[rgba(5,15,35,0.78)] p-5 shadow-[0_0_58px_rgba(37,99,235,0.24)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-cyan-200/75 shadow-[0_0_28px_rgba(125,211,252,0.78)]" />
      <img
        src={ASSETS.full}
        alt=""
        width={1086}
        height={1448}
        className="pointer-events-none absolute -right-8 bottom-0 hidden h-48 opacity-25 md:block"
        style={{ width: "144px", height: "auto" }}
      />
      <div className="relative grid gap-5 lg:grid-cols-[1fr_auto]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200/30 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold text-cyan-100">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Activity Score {result.badge.score}/100
            </span>
            {result.basename ? (
              <span className="rounded-full border border-blue-200/25 bg-blue-300/10 px-3 py-1.5 text-xs font-semibold text-blue-100">
                {result.basename}
              </span>
            ) : null}
            <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-semibold text-blue-100/70">
              {result.limits.source}
            </span>
          </div>

          <h2 className="mt-4 break-all font-mono text-xl font-semibold text-white sm:text-2xl">
            {result.address}
          </h2>
          <p className="mt-2 text-sm text-blue-100/60">
            Generated {formatDateTime(result.generatedAt)}
          </p>
          <p className="mt-3 text-sm text-blue-100/70">
            {compactAddress(result.address)} is live on the Base activity grid.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3 lg:justify-end" data-no-capture="true">
          <button
            type="button"
            onClick={onCopyTweet}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-blue-200/30 bg-blue-500/20 px-4 text-sm font-semibold text-white shadow-[0_0_30px_rgba(59,130,246,0.22)] transition hover:-translate-y-0.5 hover:border-cyan-100/60 hover:bg-cyan-400/20"
          >
            <Copy className="size-4" aria-hidden="true" />
            Copy Tweet
          </button>
        </div>
      </div>
    </section>
  );
}
