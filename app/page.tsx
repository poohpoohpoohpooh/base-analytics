"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  BarChart3,
  Calendar,
  Clock,
  Coins,
  Flame,
  Gauge,
  Hash,
  Image as ImageIcon,
  Layers,
  Repeat2,
  Shield,
  Sparkles,
  Trophy,
  Wallet,
} from "lucide-react";
import { BaseActionButtons } from "@/components/BaseActionButtons";
import { CardPreviewModal } from "@/components/CardPreviewModal";
import { EmptyState } from "@/components/EmptyState";
import { HeroSection } from "@/components/HeroSection";
import { LoadingState } from "@/components/LoadingState";
import { type MetricItem } from "@/components/MetricCard";
import { MetricsGrid } from "@/components/MetricsGrid";
import { RecentTransactions } from "@/components/RecentTransactions";
import { TopContracts } from "@/components/TopContracts";
import { downloadElementAsPng } from "@/lib/downloadCard";
import {
  displayMetric,
  formatDate,
  formatMetric,
  withUnit
} from "@/lib/format";
import { getRankFromScore } from "@/lib/rank";
import type { AnalyzeResponse } from "@/lib/types";

export default function Home() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const metrics = useMemo(() => {
    return result ? buildMetricItems(result) : [];
  }, [result]);
  const rank = result ? getRankFromScore(result.badge.score, result.metrics) : null;

  useEffect(() => {
    console.log("input:", input);
  }, [input]);

  async function handleSubmit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const trimmed = input.trim();

    console.log("submit analyze:", trimmed);

    if (!trimmed) {
      setError("Base address or Basename is required.");
      setNotice(null);
      return;
    }

    if (loading) {
      return;
    }

    setLoading(true);
    setError(null);
    setNotice(null);
    setCardModalOpen(false);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ input: trimmed })
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Analysis failed.");
      }

      setResult(payload as AnalyzeResponse);
      setNotice("Analysis complete.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Analysis failed.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    if (!result || !rank) {
      return;
    }

    if (!cardRef.current) {
      setCardModalOpen(true);
      return;
    }

    setNotice("Preparing image...");
    setDownloading(true);

    try {
      await downloadElementAsPng(cardRef.current, {
        rank,
        generatedAt: result.generatedAt
      });
      setNotice("Card image saved.");
    } catch {
      setError("Unable to save the card image.");
      setNotice(null);
    } finally {
      setDownloading(false);
    }
  }

  async function handleCopyTweet() {
    if (!result) {
      return;
    }

    const text = buildTweetText(result);

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      copyTextFallback(text);
    }

    setNotice("Tweet text copied.");
  }

  return (
    <main
      className="min-h-screen overflow-x-hidden bg-transparent text-slate-50 antialiased"
      style={{
        minHeight: "100vh",
        overflowX: "hidden",
        background: "transparent",
        color: "#f8fbff"
      }}
    >
      <div
        className="mx-auto w-full max-w-[1400px] space-y-6 px-6 py-6 pb-12 sm:px-8"
        style={{
          width: "100%",
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "24px min(32px, 5vw) 48px"
        }}
      >
        <HeroSection
          input={input}
          loading={loading}
          result={result}
          rank={rank}
          error={error}
          onInputChange={setInput}
          onSubmit={handleSubmit}
          onOpenCard={() => setCardModalOpen(true)}
          onCopyTweet={handleCopyTweet}
        />

        {notice ? (
          <div
            className="flex items-center gap-3 rounded-2xl border border-cyan-100/50 bg-blue-400/20 px-4 py-3 text-sm font-semibold text-white shadow-[0_0_38px_rgba(56,189,248,0.34)]"
            data-no-capture="true"
          >
            <Sparkles className="size-4 shrink-0" aria-hidden="true" />
            <p>{notice}</p>
          </div>
        ) : null}

        <BaseActionButtons />

        {loading ? <LoadingState /> : null}

        {!loading && !result && !error ? (
          <EmptyState
            title="Enter a Base address to start"
            message="BASEちゃん is ready to scan balances, transactions, streaks, and contract activity."
          />
        ) : null}

        {result && rank ? (
          <div className="space-y-7">
            <MetricsGrid metrics={metrics} />

            <section className="grid gap-5 xl:grid-cols-[390px_1fr]">
              <TopContracts contracts={result.topContracts} />
              <RecentTransactions transactions={result.recentTransactions} />
            </section>
          </div>
        ) : null}
      </div>

      <CardPreviewModal
        open={cardModalOpen}
        result={result}
        rank={rank}
        cardRef={cardRef}
        downloading={downloading}
        onClose={() => setCardModalOpen(false)}
        onDownload={handleDownload}
        onCopyTweet={handleCopyTweet}
      />
    </main>
  );
}

function buildMetricItems(result: AnalyzeResponse): MetricItem[] {
  const { metrics } = result;
  const defiInteractions = metrics.defiInteractions;
  const activeDayRate =
    metrics.daysOnBase && metrics.daysOnBase > 0
      ? `${Math.round((metrics.activeDays / metrics.daysOnBase) * 100)}% of days`
      : undefined;

  return [
    {
      label: "ETH Balance",
      value: withUnit(metrics.ethBalance, "ETH"),
      subtext: "Base Mainnet",
      icon: Wallet,
      iconGradient: "from-[#0052FF] to-[#38BDF8]",
      iconGlow: "shadow-[0_0_28px_rgba(56,189,248,0.50)]"
    },
    {
      label: "Days on Base",
      value: displayMetric(metrics.daysOnBase),
      subtext:
        metrics.firstTransactionAt ? `Since ${formatDate(metrics.firstTransactionAt)}` : "First seen N/A",
      icon: Gauge,
      iconGradient: "from-[#38BDF8] to-[#2DD4BF]",
      iconGlow: "shadow-[0_0_28px_rgba(45,212,191,0.42)]"
    },
    {
      label: "Active Days",
      value: displayMetric(metrics.activeDays),
      subtext: activeDayRate,
      icon: Activity,
      iconGradient: "from-[#1E7BFF] to-[#8B5CF6]",
      iconGlow: "shadow-[0_0_28px_rgba(99,102,241,0.46)]"
    },
    {
      label: "Current Streak",
      value: displayMetric(metrics.currentStreak),
      subtext: "Days",
      icon: Flame,
      iconGradient: "from-[#F97316] to-[#FACC15]",
      iconGlow: "shadow-[0_0_28px_rgba(249,115,22,0.44)]"
    },
    {
      label: "Longest Streak",
      value: displayMetric(metrics.longestStreak),
      subtext: "Days",
      icon: Trophy,
      iconGradient: "from-[#8B5CF6] to-[#EC4899]",
      iconGlow: "shadow-[0_0_28px_rgba(236,72,153,0.40)]"
    },
    {
      label: "Total TXs",
      value: displayMetric(metrics.totalTransactions),
      subtext: "Transactions",
      icon: Hash,
      iconGradient: "from-[#06B6D4] to-[#0052FF]",
      iconGlow: "shadow-[0_0_28px_rgba(6,182,212,0.46)]"
    },
    {
      label: "Swap-like TXs",
      value: displayMetric(metrics.tokenSwaps),
      subtext: "Estimated",
      icon: Repeat2,
      iconGradient: "from-[#22C55E] to-[#10B981]",
      iconGlow: "shadow-[0_0_28px_rgba(16,185,129,0.42)]"
    },
    {
      label: "Unique Tokens",
      value: displayMetric(metrics.uniqueTokens),
      subtext: "Tokens",
      icon: Coins,
      iconGradient: "from-[#FACC15] to-[#FB923C]",
      iconGlow: "shadow-[0_0_28px_rgba(250,204,21,0.40)]"
    },
    {
      label: "DeFi-like TXs",
      value: displayMetric(defiInteractions),
      subtext: "Allowlist",
      icon: BarChart3,
      iconGradient: "from-[#EC4899] to-[#8B5CF6]",
      iconGlow: "shadow-[0_0_28px_rgba(236,72,153,0.42)]"
    },
    {
      label: "NFTs Held",
      value: displayMetric(metrics.nftsHeld),
      subtext: "NFTs",
      icon: ImageIcon,
      iconGradient: "from-[#A855F7] to-[#38BDF8]",
      iconGlow: "shadow-[0_0_28px_rgba(168,85,247,0.42)]"
    },
    {
      label: "Contract TX",
      value: displayMetric(metrics.contractTransactions),
      subtext: "Transactions",
      icon: Layers,
      iconGradient: "from-[#6366F1] to-[#1E7BFF]",
      iconGlow: "shadow-[0_0_28px_rgba(99,102,241,0.44)]"
    },
    {
      label: "Unique Contracts",
      value: displayMetric(metrics.uniqueContracts),
      subtext: "Contracts",
      icon: Shield,
      iconGradient: "from-[#14B8A6] to-[#67E8F9]",
      iconGlow: "shadow-[0_0_28px_rgba(20,184,166,0.42)]"
    },
    {
      label: "Avg TX / Day",
      value: displayMetric(metrics.avgTxPerDay),
      subtext: "Transactions",
      icon: Sparkles,
      iconGradient: "from-[#84CC16] to-[#22C55E]",
      iconGlow: "shadow-[0_0_28px_rgba(132,204,22,0.38)]"
    },
    {
      label: "First Transaction",
      value: formatDate(metrics.firstTransactionAt),
      subtext: "UTC",
      icon: Calendar,
      iconGradient: "from-[#F59E0B] to-[#38BDF8]",
      iconGlow: "shadow-[0_0_28px_rgba(245,158,11,0.38)]"
    },
    {
      label: "Last Transaction",
      value: formatDate(metrics.lastTransactionAt),
      subtext: "UTC",
      icon: Clock,
      iconGradient: "from-[#22D3EE] to-[#8B5CF6]",
      iconGlow: "shadow-[0_0_28px_rgba(34,211,238,0.44)]"
    }
  ];
}

function buildTweetText(result: AnalyzeResponse): string {
  const rank = getRankFromScore(result.badge.score, result.metrics);

  return [
    "My Base Identity 🟦",
    "",
    `Rank: ${rank}`,
    `Activity Score: ${result.badge.score}/100`,
    `Days on Base: ${formatMetric(result.metrics.daysOnBase)}`,
    `Active Days: ${formatMetric(result.metrics.activeDays)}`,
    `Total TXs: ${formatMetric(result.metrics.totalTransactions)}`,
    "",
    "Built on Base. Powered by community.",
    "",
    "#Base #Onchain"
  ].join("\n");
}

function copyTextFallback(text: string) {
  const textarea = document.createElement("textarea");

  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}
