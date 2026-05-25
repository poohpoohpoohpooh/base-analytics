"use client";

import { AlertTriangle, Search, Sparkles } from "lucide-react";
import { ASSETS } from "@/lib/assets";

type EmptyStateProps = {
  title: string;
  message: string;
  variant?: "empty" | "error" | "notice";
};

export function EmptyState({ title, message, variant = "empty" }: EmptyStateProps) {
  const Icon = variant === "error" ? AlertTriangle : variant === "notice" ? Sparkles : Search;

  return (
    <section
      className="relative overflow-hidden rounded-3xl border border-blue-300/30 bg-[rgba(5,15,35,0.72)] p-6 shadow-[0_0_46px_rgba(37,99,235,0.18)] backdrop-blur-xl"
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "24px",
        border: "1px solid rgba(147,197,253,0.3)",
        background: "rgba(5,15,35,0.72)",
        padding: "24px",
        color: "#ffffff",
        boxShadow: "0 0 46px rgba(37,99,235,0.18)"
      }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-cyan-200/70 shadow-[0_0_24px_rgba(125,211,252,0.68)]" />
      <div
        className="relative flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left"
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: "16px"
        }}
      >
        <img
          src={ASSETS.robot}
          alt=""
          width={96}
          height={96}
          className="h-24 w-24 rounded-2xl object-cover drop-shadow-[0_0_30px_rgba(34,211,238,0.36)]"
          style={{
            width: "96px",
            height: "96px",
            maxWidth: "96px",
            maxHeight: "96px",
            objectFit: "cover",
            borderRadius: "16px"
          }}
        />
        <div className="min-w-0">
          <div className="mx-auto flex size-11 items-center justify-center rounded-2xl border border-cyan-200/30 bg-cyan-300/10 text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.22)] sm:mx-0">
            <Icon className="size-5" aria-hidden="true" />
          </div>
          <h2 className="mt-3 text-xl font-semibold text-white" style={{ marginTop: "12px", color: "#ffffff", fontSize: "20px", fontWeight: 700 }}>{title}</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100/60" style={{ marginTop: "8px", maxWidth: "36rem", color: "rgba(219,234,254,0.62)", fontSize: "14px", lineHeight: 1.6 }}>{message}</p>
        </div>
      </div>
    </section>
  );
}
