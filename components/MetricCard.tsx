"use client";

import type { LucideIcon } from "lucide-react";

export type MetricItem = {
  label: string;
  value: string;
  subtext?: string;
  icon: LucideIcon;
  iconGradient: string;
  iconGlow: string;
};

export function MetricCard({ metric }: { metric: MetricItem }) {
  const Icon = metric.icon;

  return (
    <article className="group relative min-h-[146px] overflow-hidden rounded-2xl border border-cyan-100/52 bg-[rgba(8,47,120,0.62)] p-4 shadow-[0_0_62px_rgba(0,82,255,0.36)] backdrop-blur-xl transition duration-200 hover:-translate-y-1 hover:border-cyan-50/80 hover:shadow-[0_0_76px_rgba(56,189,248,0.48)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-cyan-100/65 shadow-[0_0_22px_rgba(125,211,252,0.8)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(56,189,248,0.21),transparent_36%)] opacity-80" />
      <div className="relative flex h-full items-start gap-4">
        <span
          className={`flex size-12 shrink-0 items-center justify-center rounded-2xl border border-white/25 bg-gradient-to-br text-white shadow-lg transition group-hover:scale-105 group-hover:brightness-110 ${metric.iconGradient} ${metric.iconGlow}`}
        >
          <Icon className="size-6 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.55)]" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-cyan-50/88">{metric.label}</p>
          <p className="mt-3 break-words text-3xl font-black leading-none text-white drop-shadow-[0_0_16px_rgba(125,211,252,0.55)]">
            {metric.value}
          </p>
          {metric.subtext ? (
            <p className="mt-3 text-sm leading-5 text-blue-50/70">{metric.subtext}</p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
