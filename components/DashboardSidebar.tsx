"use client";

import {
  BarChart3,
  Box,
  Boxes,
  CheckCircle2,
  Coins,
  FileCode2,
  Home,
  Image as ImageIcon,
  ListChecks,
  SlidersHorizontal
} from "lucide-react";
import { ASSETS } from "@/lib/assets";
import type { AnalyzeResponse } from "@/lib/types";

const menuItems = [
  { label: "Overview", icon: Home, active: true },
  { label: "Transactions", icon: SlidersHorizontal },
  { label: "Tokens", icon: Box },
  { label: "DeFi", icon: ListChecks },
  { label: "NFTs", icon: Boxes },
  { label: "Contracts", icon: FileCode2 },
  { label: "Analytics", icon: BarChart3 }
];

export function DashboardSidebar({ result }: { result: AnalyzeResponse | null }) {
  return (
    <aside className="sticky top-5 hidden h-[calc(100vh-40px)] w-[250px] shrink-0 overflow-hidden rounded-[28px] border border-blue-400/30 bg-[rgba(3,10,28,0.86)] p-4 shadow-[0_0_64px_rgba(37,99,235,0.24)] backdrop-blur-xl lg:flex lg:flex-col">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(125,211,252,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.05)_1px,transparent_1px)] bg-[size:28px_28px]" />
      <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-cyan-200/80 shadow-[0_0_26px_rgba(125,211,252,0.8)]" />

      <div className="relative flex items-center gap-3 px-1 py-2">
        <span className="flex size-9 items-center justify-center rounded-full border border-blue-200/50 bg-white text-blue-700 shadow-[0_0_24px_rgba(96,165,250,0.5)]">
          <Coins className="size-5" aria-hidden="true" />
        </span>
        <p className="text-2xl font-semibold tracking-wide text-white">BASE</p>
      </div>

      <nav className="relative mt-8 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              type="button"
              className={`flex h-12 w-full items-center gap-3 rounded-xl border px-3 text-sm font-semibold transition ${
                item.active
                  ? "border-cyan-200/50 bg-blue-500/20 text-white shadow-[0_0_28px_rgba(59,130,246,0.44)]"
                  : "border-transparent text-blue-100/70 hover:border-blue-300/30 hover:bg-blue-300/10 hover:text-white"
              }`}
            >
              <Icon className="size-5 shrink-0" aria-hidden="true" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="relative mt-auto space-y-4">
        <section className="relative overflow-hidden rounded-2xl border border-blue-300/35 bg-blue-400/10 p-4 shadow-[0_0_34px_rgba(37,99,235,0.2)]">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-full border border-cyan-200/35 bg-cyan-300/10 text-cyan-100">
              <Coins className="size-4" aria-hidden="true" />
            </span>
            <p className="font-semibold text-cyan-100">BASEちゃん</p>
          </div>
          <p className="mt-3 text-sm leading-6 text-blue-100/70">
            Build on Base. Build the future.
          </p>
          <img
            src={ASSETS.full}
            alt=""
            width={1086}
            height={1448}
            className="pointer-events-none absolute -bottom-10 -right-8 h-32 w-auto object-contain opacity-55 drop-shadow-[0_0_28px_rgba(34,211,238,0.48)]"
            style={{ width: "auto", height: "128px", objectFit: "contain" }}
          />
        </section>

        <section className="rounded-2xl border border-blue-300/25 bg-white/[0.04] p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-100/80">
            <CheckCircle2 className="size-4 text-emerald-300" aria-hidden="true" />
            {result ? "Connected" : "Ready"}
          </div>
          <div className="mt-3 h-px bg-blue-200/10" />
          <div className="mt-3 flex items-center gap-2 text-sm text-blue-100/70">
            <span className="flex size-6 items-center justify-center rounded-full border border-blue-200/40 bg-blue-300/10">
              <ImageIcon className="size-3.5" aria-hidden="true" />
            </span>
            Base Mainnet
          </div>
        </section>
      </div>
    </aside>
  );
}
