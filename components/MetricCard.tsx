"use client";

import type { LucideIcon } from "lucide-react";

export type MetricTone = "blue" | "cyan" | "green" | "amber" | "rose" | "violet";

export type MetricItem = {
  label: string;
  value: string;
  subtext?: string;
  icon: LucideIcon;
  tone: MetricTone;
};

const toneClasses: Record<MetricTone, string> = {
  blue: "border-blue-200/45 bg-blue-400/16 text-blue-50 shadow-[0_0_32px_rgba(59,130,246,0.34)]",
  cyan: "border-cyan-100/50 bg-cyan-300/14 text-cyan-50 shadow-[0_0_34px_rgba(34,211,238,0.34)]",
  green:
    "border-emerald-200/35 bg-emerald-300/12 text-emerald-100 shadow-[0_0_28px_rgba(52,211,153,0.22)]",
  amber:
    "border-amber-200/35 bg-amber-300/12 text-amber-100 shadow-[0_0_28px_rgba(245,158,11,0.22)]",
  rose: "border-rose-200/35 bg-rose-300/12 text-rose-100 shadow-[0_0_28px_rgba(244,63,94,0.22)]",
  violet:
    "border-violet-200/35 bg-violet-300/12 text-violet-100 shadow-[0_0_28px_rgba(167,139,250,0.22)]"
};

export function MetricCard({ metric }: { metric: MetricItem }) {
  const Icon = metric.icon;

  return (
    <article className="group relative min-h-[146px] overflow-hidden rounded-2xl border border-blue-300/50 bg-[rgba(3,12,34,0.82)] p-4 shadow-[0_0_52px_rgba(37,99,235,0.24)] backdrop-blur-xl transition duration-200 hover:-translate-y-1 hover:border-cyan-100/70 hover:shadow-[0_0_70px_rgba(34,211,238,0.32)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-cyan-100/65 shadow-[0_0_22px_rgba(125,211,252,0.8)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(59,130,246,0.16),transparent_34%)] opacity-80" />
      <div className="relative flex h-full items-start gap-4">
        <span
          className={`flex size-12 shrink-0 items-center justify-center rounded-2xl border transition group-hover:scale-105 ${toneClasses[metric.tone]}`}
        >
          <Icon className="size-6 drop-shadow-[0_0_10px_currentColor]" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-blue-100/72">{metric.label}</p>
          <p className="mt-3 break-words text-3xl font-black leading-none text-white drop-shadow-[0_0_16px_rgba(125,211,252,0.55)]">
            {metric.value}
          </p>
          {metric.subtext ? (
            <p className="mt-3 text-sm leading-5 text-blue-100/58">{metric.subtext}</p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
