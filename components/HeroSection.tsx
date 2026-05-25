"use client";

import type { FormEvent } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Download,
  Eye,
  Loader2,
  Search,
  Sparkles
} from "lucide-react";
import { ASSETS } from "@/lib/assets";
import type { RankName } from "@/lib/rank";
import type { AnalyzeResponse } from "@/lib/types";

type HeroSectionProps = {
  input: string;
  loading: boolean;
  result: AnalyzeResponse | null;
  rank: RankName | null;
  error: string | null;
  onInputChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onOpenCard: () => void;
  onCopyTweet: () => void;
};

export function HeroSection({
  input,
  loading,
  result,
  rank,
  error,
  onInputChange,
  onSubmit,
  onOpenCard,
  onCopyTweet
}: HeroSectionProps) {
  return (
    <section
      className="relative isolate min-h-[420px] overflow-hidden rounded-[28px] border border-blue-300/40 bg-[#03122b] shadow-[0_0_80px_rgba(37,99,235,0.34)] lg:min-h-[430px]"
      style={{
        position: "relative",
        minHeight: "420px",
        overflow: "hidden",
        borderRadius: "28px",
        background:
          "linear-gradient(135deg, #020817 0%, #03122b 44%, #05245a 100%)"
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-70 sm:opacity-80"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          backgroundImage: `url(${ASSETS.hero})`,
          backgroundSize: "cover",
          backgroundPosition: "center right",
          backgroundRepeat: "no-repeat"
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(90deg,rgba(2,6,23,0.98)_0%,rgba(3,12,34,0.94)_43%,rgba(4,18,48,0.58)_72%,rgba(2,6,23,0.38)_100%)]"
        style={{ position: "absolute", inset: 0, zIndex: 1 }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_82%_36%,rgba(59,130,246,0.26),transparent_34%),linear-gradient(180deg,rgba(14,165,233,0.16),rgba(2,6,23,0.35))]"
        style={{ position: "absolute", inset: 0, zIndex: 1 }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(rgba(125,211,252,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.09)_1px,transparent_1px)] bg-[size:34px_34px]"
        style={{ position: "absolute", inset: 0, zIndex: 1 }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-cyan-200/80 shadow-[0_0_28px_rgba(125,211,252,0.9)]"
        style={{ position: "absolute", left: 0, right: 0, top: 0, zIndex: 1 }}
      />
      <div
        className="relative z-20 px-5 py-7 sm:px-8 sm:py-9 lg:px-12 lg:py-10"
        style={{ position: "relative", zIndex: 2 }}
      >
        <div className="max-w-2xl" style={{ maxWidth: "42rem" }}>
          <div
            className="inline-flex items-center gap-2 rounded-full border border-cyan-200/40 bg-cyan-200/10 px-3 py-2 text-sm font-semibold text-cyan-100 shadow-[0_0_28px_rgba(34,211,238,0.22)]"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              borderRadius: "999px",
              border: "1px solid rgba(165,243,252,0.4)",
              background: "rgba(165,243,252,0.10)",
              padding: "8px 12px",
              color: "#cffafe",
              fontSize: "14px",
              fontWeight: 700
            }}
          >
            <Sparkles className="size-4" aria-hidden="true" />
            Base Mainnet Analytics
          </div>

          <h1
            className="mt-6 max-w-xl text-4xl font-black tracking-normal text-white drop-shadow-[0_0_28px_rgba(125,211,252,0.72)] sm:text-5xl lg:text-6xl"
            style={{
              marginTop: "24px",
              maxWidth: "36rem",
              color: "#ffffff",
              fontSize: "clamp(40px, 6vw, 60px)",
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: "0",
              textShadow: "0 0 28px rgba(125,211,252,0.72)"
            }}
          >
            Base Wallet Activity
          </h1>
          <p
            className="mt-5 max-w-lg text-base leading-7 text-blue-100/80 sm:text-lg"
            style={{
              marginTop: "20px",
              maxWidth: "32rem",
              color: "rgba(219,234,254,0.82)",
              fontSize: "18px",
              lineHeight: 1.65
            }}
          >
            Explore on-chain activity across the Base network.
          </p>

          <form
            className="mt-8 grid gap-3 rounded-2xl border border-blue-300/40 bg-slate-950/60 p-3 shadow-[0_0_42px_rgba(59,130,246,0.24)] backdrop-blur-xl sm:grid-cols-[1fr_auto]"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
              gap: "12px",
              marginTop: "32px",
              borderRadius: "16px",
              border: "1px solid rgba(147,197,253,0.4)",
              background: "rgba(2,6,23,0.6)",
              padding: "12px",
              boxShadow: "0 0 42px rgba(59,130,246,0.24)",
              backdropFilter: "blur(18px)",
              pointerEvents: "auto"
            }}
            onSubmit={onSubmit}
          >
            <label className="sr-only" htmlFor="wallet-input">
              Base address or Basename
            </label>
            <input
              id="wallet-input"
              value={input}
              onChange={(event) => {
                console.log("input changed:", event.target.value);
                onInputChange(event.target.value);
              }}
              className="h-[52px] min-w-0 rounded-xl border border-cyan-200/25 bg-blue-950/40 px-4 text-base text-white outline-none shadow-inner shadow-blue-950/60 transition placeholder:text-blue-200/40 focus:border-cyan-200/70 focus:ring-2 focus:ring-cyan-300/25"
              style={{
                height: "52px",
                minWidth: 0,
                borderRadius: "12px",
                border: "1px solid rgba(165,243,252,0.25)",
                background: "rgba(23,37,84,0.42)",
                padding: "0 16px",
                color: "#ffffff",
                fontSize: "16px",
                outline: "none",
                boxShadow: "inset 0 2px 12px rgba(15,23,42,0.55)",
                pointerEvents: "auto"
              }}
              placeholder="name.base.eth / 0x..."
              spellCheck={false}
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              onClick={() =>
                console.log("analyze clicked:", input, { isAnalyzing: loading })
              }
              className="inline-flex h-[52px] items-center justify-center gap-2 rounded-xl border border-cyan-100/30 bg-blue-500 px-5 text-sm font-semibold text-white shadow-[0_0_32px_rgba(59,130,246,0.55)] transition hover:-translate-y-0.5 hover:bg-cyan-400 hover:shadow-[0_0_42px_rgba(34,211,238,0.66)] disabled:cursor-not-allowed disabled:bg-slate-700 disabled:shadow-none"
              style={{
                display: "inline-flex",
                height: "52px",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                borderRadius: "12px",
                border: "1px solid rgba(207,250,254,0.3)",
                background: loading ? "#334155" : "#3b82f6",
                padding: "0 20px",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: 700,
                boxShadow:
                  loading || !input.trim()
                    ? "none"
                    : "0 0 32px rgba(59,130,246,0.55)",
                pointerEvents: "auto",
                opacity: loading || !input.trim() ? 0.68 : 1
              }}
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Search className="size-4" aria-hidden="true" />
              )}
              {loading ? "Analyzing" : "Analyze"}
            </button>
          </form>

          {error ? (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-rose-300/35 bg-rose-500/12 px-4 py-3 text-sm font-semibold text-rose-100 shadow-[0_0_28px_rgba(244,63,94,0.2)]">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <p>{error}</p>
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/25 bg-emerald-300/10 px-3 py-2 text-sm font-semibold text-emerald-100 shadow-[0_0_24px_rgba(52,211,153,0.18)]">
              <CheckCircle2 className="size-4" aria-hidden="true" />
              Chain ID 8453
            </div>
          </div>

          {result && rank ? (
            <div className="mt-6 flex flex-wrap items-center gap-2 rounded-2xl border border-blue-300/35 bg-slate-950/62 p-3 shadow-[0_0_42px_rgba(59,130,246,0.24)] backdrop-blur-xl">
              <span className="inline-flex h-10 items-center rounded-xl border border-cyan-100/35 bg-cyan-300/10 px-3 text-sm font-semibold text-cyan-100">
                {rank}
              </span>
              <span className="inline-flex h-10 items-center rounded-xl border border-blue-200/25 bg-blue-300/10 px-3 text-sm font-semibold text-blue-100">
                Activity Score {result.badge.score}/100
              </span>
              <button
                type="button"
                onClick={onOpenCard}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-cyan-100/40 bg-blue-500 px-3 text-sm font-semibold text-white shadow-[0_0_32px_rgba(59,130,246,0.48)] transition hover:-translate-y-0.5 hover:bg-cyan-400"
              >
                <Download className="size-4" aria-hidden="true" />
                Download Identity Card
              </button>
              <button
                type="button"
                onClick={onOpenCard}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-blue-200/30 bg-white/[0.06] px-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-cyan-100/55 hover:bg-cyan-300/10"
              >
                <Eye className="size-4" aria-hidden="true" />
                Preview Card
              </button>
              <button
                type="button"
                onClick={onCopyTweet}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-blue-200/30 bg-white/[0.06] px-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-cyan-100/55 hover:bg-cyan-300/10"
              >
                <Copy className="size-4" aria-hidden="true" />
                Copy Tweet
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
