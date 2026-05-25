"use client";

import { Loader2 } from "lucide-react";
import { ASSETS } from "@/lib/assets";

export function LoadingState() {
  return (
    <section
      className="relative overflow-hidden rounded-3xl border border-cyan-100/58 bg-[rgba(8,47,120,0.62)] p-6 shadow-[0_0_68px_rgba(56,189,248,0.38)] backdrop-blur-xl"
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "24px",
        border: "1px solid rgba(165,243,252,0.58)",
        background: "rgba(8,47,120,0.62)",
        padding: "24px",
        color: "#ffffff",
        boxShadow: "0 0 68px rgba(56,189,248,0.38)"
      }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-cyan-100/80 shadow-[0_0_28px_rgba(125,211,252,0.8)]" />
      <div
        className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px"
        }}
      >
        <div className="relative">
          <img
            src={ASSETS.robot}
            alt=""
            width={104}
            height={104}
            className="h-24 w-24 rounded-2xl object-cover drop-shadow-[0_0_34px_rgba(34,211,238,0.42)]"
            style={{
              width: "104px",
              height: "104px",
              maxWidth: "104px",
              maxHeight: "104px",
              objectFit: "cover",
              borderRadius: "16px"
            }}
          />
          <span className="absolute bottom-2 right-2 flex size-11 items-center justify-center rounded-2xl border border-cyan-200/40 bg-blue-950/80 text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.34)]">
            <Loader2 className="size-5 animate-spin" aria-hidden="true" />
          </span>
        </div>
        <div>
          <p className="text-xl font-semibold text-white" style={{ color: "#ffffff", fontSize: "20px", fontWeight: 700 }}>Analyzing on-chain activity...</p>
          <p className="mt-2 text-sm text-blue-50/76" style={{ marginTop: "8px", color: "rgba(239,246,255,0.78)", fontSize: "14px" }}>
            BASEちゃん is checking your wallet.
          </p>
        </div>
      </div>
    </section>
  );
}
