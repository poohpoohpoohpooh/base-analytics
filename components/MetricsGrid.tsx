"use client";

import { MetricCard, type MetricItem } from "@/components/MetricCard";

type MetricsGridProps = {
  metrics: MetricItem[];
};

export function MetricsGrid({ metrics }: MetricsGridProps) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100/70">
            On-chain metrics
          </p>
          <h2 className="mt-1 text-2xl font-black tracking-normal text-white drop-shadow-[0_0_18px_rgba(125,211,252,0.45)]">
            Wallet activity
          </h2>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>
    </section>
  );
}
