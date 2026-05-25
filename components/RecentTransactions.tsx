"use client";

import { Activity, ArrowUpRight } from "lucide-react";
import { compactHash, formatDate } from "@/lib/format";
import type { AnalyzeResponse } from "@/lib/types";

export function RecentTransactions({
  transactions
}: {
  transactions: AnalyzeResponse["recentTransactions"];
}) {
  return (
    <section className="rounded-3xl border border-blue-300/40 bg-[rgba(5,15,35,0.74)] p-4 shadow-[0_0_46px_rgba(37,99,235,0.18)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-white">Recent 10 Transactions</h3>
        <Activity className="size-5 text-cyan-100 drop-shadow-[0_0_10px_currentColor]" aria-hidden="true" />
      </div>
      <div className="mt-4 overflow-x-auto">
        {transactions.length === 0 ? (
          <p className="text-sm text-blue-100/60">N/A</p>
        ) : (
          <table className="w-full min-w-[720px] border-separate border-spacing-y-2 text-left text-sm">
            <thead className="text-xs text-blue-100/40">
              <tr>
                <th className="px-3 font-medium">Tx</th>
                <th className="px-3 font-medium">Direction</th>
                <th className="px-3 font-medium">Method</th>
                <th className="px-3 font-medium">Value</th>
                <th className="px-3 font-medium">Date</th>
                <th className="px-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.hash} className="bg-white/[0.045]">
                  <td className="rounded-l-2xl border-l border-y border-blue-300/20 px-3 py-3">
                    <a
                      href={tx.explorerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 font-mono text-cyan-100 hover:text-white"
                    >
                      {compactHash(tx.hash)}
                      <ArrowUpRight className="size-3" aria-hidden="true" />
                    </a>
                  </td>
                  <td className="border-y border-blue-300/20 px-3 py-3 text-blue-100">
                    {tx.direction}
                  </td>
                  <td className="max-w-52 truncate border-y border-blue-300/20 px-3 py-3 text-blue-100/70">
                    {tx.method}
                  </td>
                  <td className="border-y border-blue-300/20 px-3 py-3 text-white">
                    {tx.valueEth} ETH
                  </td>
                  <td className="border-y border-blue-300/20 px-3 py-3 text-blue-100/70">
                    {formatDate(tx.timestamp)}
                  </td>
                  <td className="rounded-r-2xl border-r border-y border-blue-300/20 px-3 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        tx.status === "Success"
                          ? "bg-emerald-300/10 text-emerald-100"
                          : tx.status === "Failed"
                            ? "bg-rose-300/10 text-rose-100"
                            : "bg-blue-300/10 text-blue-100"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
