"use client";

import { Bot, Cpu, Radio } from "lucide-react";
import { ASSETS } from "@/lib/assets";
import { displayMetric } from "@/lib/format";
import type { AnalyzeResponse } from "@/lib/types";

export function Sidebar({
  result,
  className = ""
}: {
  result: AnalyzeResponse | null;
  className?: string;
}) {
  return (
    <aside className={`grid gap-4 sm:grid-cols-3 xl:block xl:space-y-4 ${className}`}>
      <section className="overflow-hidden rounded-3xl border border-blue-300/35 bg-[rgba(5,15,35,0.72)] p-4 shadow-[0_0_42px_rgba(37,99,235,0.18)] backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl border border-cyan-200/30 bg-cyan-300/10 text-cyan-100 shadow-[0_0_22px_rgba(34,211,238,0.24)]">
            <Bot className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-semibold text-white">BASEちゃん console</p>
            <p className="mt-1 text-sm text-blue-100/60">
              {result ? "Wallet signal locked" : "Enter a Base address to start"}
            </p>
          </div>
        </div>
        <img
          src={ASSETS.robot}
          alt=""
          width={96}
          height={96}
          className="mx-auto mt-3 h-24 w-24 object-contain drop-shadow-[0_0_30px_rgba(34,211,238,0.38)]"
          style={{ width: "96px", height: "96px", objectFit: "contain" }}
        />
      </section>

      <section className="rounded-3xl border border-blue-300/35 bg-[rgba(5,15,35,0.72)] p-4 shadow-[0_0_42px_rgba(37,99,235,0.16)] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <p className="font-semibold text-white">Network Pulse</p>
          <Radio className="size-5 text-cyan-100" aria-hidden="true" />
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-3">
          <SidebarStat label="Active Days" value={displayMetric(result?.metrics.activeDays ?? null)} />
          <SidebarStat label="Contracts" value={displayMetric(result?.metrics.uniqueContracts ?? null)} />
          <SidebarStat label="Total Txs" value={displayMetric(result?.metrics.totalTransactions ?? null)} />
          <SidebarStat label="Streak" value={displayMetric(result?.metrics.longestStreak ?? null)} />
        </dl>
      </section>

      <section className="relative overflow-hidden rounded-3xl border border-blue-300/35 bg-[rgba(5,15,35,0.72)] p-4 shadow-[0_0_42px_rgba(37,99,235,0.16)] backdrop-blur-xl">
        <Cpu className="size-5 text-blue-100" aria-hidden="true" />
        <p className="mt-3 text-sm leading-6 text-blue-100/70">
          BASEちゃん is checking your wallet across Base Mainnet.
        </p>
        <img
          src={ASSETS.full}
          alt=""
          width={1086}
          height={1448}
          className="pointer-events-none absolute -bottom-10 -right-8 h-32 opacity-20"
          style={{ width: "96px", height: "auto" }}
        />
      </section>
    </aside>
  );
}

function SidebarStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <dt className="text-xs font-medium text-blue-100/50">{label}</dt>
      <dd className="mt-2 text-lg font-semibold text-white">{value}</dd>
    </div>
  );
}
