"use client";

import { ExternalLink, Layers } from "lucide-react";
import { compactAddress } from "@/lib/format";
import type { AnalyzeResponse } from "@/lib/types";

export function TopContracts({
  contracts
}: {
  contracts: AnalyzeResponse["topContracts"];
}) {
  return (
    <section className="rounded-3xl border border-cyan-100/50 bg-[rgba(8,47,120,0.60)] p-4 shadow-[0_0_58px_rgba(0,82,255,0.34)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-white">Top Used Contracts</h3>
        <Layers className="size-5 text-cyan-100 drop-shadow-[0_0_10px_currentColor]" aria-hidden="true" />
      </div>
      <div className="mt-4 space-y-3">
        {contracts.length === 0 ? (
          <p className="text-sm text-blue-100/60">N/A</p>
        ) : (
          contracts.map((contract, index) => (
            <a
              key={contract.address}
              href={`https://basescan.org/address/${contract.address}`}
              target="_blank"
              rel="noreferrer"
              className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-cyan-100/35 bg-blue-400/[0.16] p-3 transition hover:-translate-y-0.5 hover:border-cyan-100/60 hover:bg-cyan-200/[0.16]"
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold text-cyan-100/70">
                  #{index + 1} · {contract.count} tx
                </p>
                <p className="mt-1 truncate font-mono text-sm text-white">
                  {compactAddress(contract.address)}
                </p>
                <p className="mt-1 truncate text-xs text-blue-100/40">
                  {contract.sampleFunction || "Contract call"}
                </p>
              </div>
              <ExternalLink className="size-4 shrink-0 text-cyan-100/70" aria-hidden="true" />
            </a>
          ))
        )}
      </div>
    </section>
  );
}
