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
      className="relative isolate min-h-[420px] overflow-hidden rounded-[28px] border border-cyan-100/55 bg-[#0a367d] shadow-[0_0_96px_rgba(0,82,255,0.56)] lg:min-h-[430px]"
      style={{
        position: "relative",
        minHeight: "420px",
        overflow: "hidden",
        borderRadius: "28px",
        background:
          "linear-gradient(135deg, #0b3277 0%, #0751bd 48%, #0874dd 100%)"
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-90 sm:opacity-95"
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
        className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(90deg,rgba(6,25,64,0.92)_0%,rgba(6,39,99,0.78)_43%,rgba(5,69,157,0.36)_72%,rgba(3,44,112,0.16)_100%)]"
        style={{ position: "absolute", inset: 0, zIndex: 1 }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_82%_36%,rgba(125,211,252,0.44),transparent_38%),linear-gradient(180deg,rgba(30,123,255,0.18),rgba(4,33,93,0.20))]"
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
            className="inline-flex items-center gap-2 rounded-full border border-cyan-100/65 bg-blue-400/25 px-3 py-2 text-sm font-semibold text-white shadow-[0_0_34px_rgba(56,189,248,0.46)]"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              borderRadius: "999px",
              border: "1px solid rgba(165,243,252,0.65)",
              background: "rgba(0,82,255,0.26)",
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
            className="mt-5 max-w-lg text-base leading-7 text-white/90 sm:text-lg"
            style={{
              marginTop: "20px",
              maxWidth: "32rem",
              color: "rgba(255,255,255,0.9)",
              fontSize: "18px",
              lineHeight: 1.65
            }}
          >
            Explore on-chain activity across the Base network.
          </p>

          <form
            className="mt-8 grid gap-3 rounded-2xl border border-cyan-100/55 bg-blue-900/45 p-3 shadow-[0_0_52px_rgba(0,82,255,0.42)] backdrop-blur-xl sm:grid-cols-[1fr_auto]"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
              gap: "12px",
              marginTop: "32px",
              borderRadius: "16px",
              border: "1px solid rgba(165,243,252,0.55)",
              background: "rgba(8,47,120,0.54)",
              padding: "12px",
              boxShadow: "0 0 52px rgba(0,82,255,0.42)",
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
              className="h-[52px] min-w-0 rounded-xl border border-cyan-100/40 bg-white/[0.09] px-4 text-base text-white outline-none shadow-inner shadow-blue-950/35 transition placeholder:text-blue-50/60 focus:border-cyan-100/80 focus:ring-2 focus:ring-cyan-200/35"
              style={{
                height: "52px",
                minWidth: 0,
                borderRadius: "12px",
                border: "1px solid rgba(165,243,252,0.4)",
                background: "rgba(255,255,255,0.09)",
                padding: "0 16px",
                color: "#ffffff",
                fontSize: "16px",
                outline: "none",
                boxShadow: "inset 0 2px 12px rgba(7,27,72,0.42)",
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
              className="inline-flex h-[52px] items-center justify-center gap-2 rounded-xl border border-cyan-100/40 bg-gradient-to-r from-[#0052FF] via-[#1E7BFF] to-[#38BDF8] px-5 text-sm font-semibold text-white shadow-[0_0_34px_rgba(0,82,255,0.55)] transition hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_0_44px_rgba(56,189,248,0.68)] disabled:cursor-not-allowed disabled:bg-blue-900 disabled:shadow-none"
              style={{
                display: "inline-flex",
                height: "52px",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                borderRadius: "12px",
                border: "1px solid rgba(207,250,254,0.3)",
                background:
                  loading || !input.trim()
                    ? "#315985"
                    : "linear-gradient(90deg, #0052FF 0%, #1E7BFF 52%, #38BDF8 100%)",
                padding: "0 20px",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: 700,
                boxShadow:
                  loading || !input.trim()
                    ? "none"
                    : "0 0 34px rgba(0,82,255,0.56)",
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
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100/60 bg-blue-400/22 px-3 py-2 text-sm font-semibold text-white shadow-[0_0_30px_rgba(56,189,248,0.4)]">
              <CheckCircle2 className="size-4" aria-hidden="true" />
              Chain ID 8453
            </div>
          </div>

          {result && rank ? (
            <div className="mt-6 flex flex-wrap items-center gap-2 rounded-2xl border border-cyan-100/48 bg-blue-900/42 p-3 shadow-[0_0_46px_rgba(0,82,255,0.40)] backdrop-blur-xl">
              <span className="inline-flex h-10 items-center rounded-xl border border-cyan-100/35 bg-cyan-300/10 px-3 text-sm font-semibold text-cyan-100">
                {rank}
              </span>
              <span className="inline-flex h-10 items-center rounded-xl border border-blue-200/25 bg-blue-300/10 px-3 text-sm font-semibold text-blue-100">
                Activity Score {result.badge.score}/100
              </span>
              <button
                type="button"
                onClick={onOpenCard}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-cyan-100/40 bg-gradient-to-r from-[#0052FF] via-[#1E7BFF] to-[#38BDF8] px-3 text-sm font-semibold text-white shadow-[0_0_34px_rgba(0,82,255,0.5)] transition hover:-translate-y-0.5 hover:brightness-110"
              >
                <Download className="size-4" aria-hidden="true" />
                Download Identity Card
              </button>
              <button
                type="button"
                onClick={onOpenCard}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-blue-200/40 bg-blue-500/15 px-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-cyan-100/65 hover:bg-blue-400/25"
              >
                <Eye className="size-4" aria-hidden="true" />
                Preview Card
              </button>
              <button
                type="button"
                onClick={onCopyTweet}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-blue-200/40 bg-blue-500/15 px-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-cyan-100/65 hover:bg-blue-400/25"
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
