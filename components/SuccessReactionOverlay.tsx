"use client";

import type { ReactionKind } from "@/lib/reactionAssets";

export type SuccessReactionPhase = "enter" | "full" | "mini";

export type SuccessReaction = {
  id: number;
  kind: ReactionKind;
  src: string;
  phase: SuccessReactionPhase;
  visible: boolean;
};

type SuccessReactionOverlayProps = {
  reaction: SuccessReaction | null;
};

const reactionLabel: Record<ReactionKind, string> = {
  gm: "GM success",
  gn: "GN success",
  checkin: "Daily Check-in success"
};

export function SuccessReactionOverlay({ reaction }: SuccessReactionOverlayProps) {
  if (!reaction?.visible) {
    return null;
  }

  const isMini = reaction.phase === "mini";

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[70] overflow-hidden"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 70,
        overflow: "hidden",
        pointerEvents: "none"
      }}
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        className={[
          "absolute transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
          isMini
            ? "bottom-5 right-5 w-[112px] opacity-95 sm:w-[132px]"
            : "bottom-[8vh] right-[max(20px,8vw)] w-[min(72vw,420px)] opacity-100"
        ].join(" ")}
      >
        <div
          className={[
            "relative overflow-hidden rounded-[24px] border border-cyan-100/45 bg-slate-950/30",
            "shadow-[0_0_42px_rgba(59,130,246,0.62),0_0_90px_rgba(34,211,238,0.24)]",
            "backdrop-blur-sm",
            isMini ? "rounded-2xl" : "animate-reaction-full-in"
          ].join(" ")}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(125,211,252,0.28),transparent_42%)]" />
          <img
            key={reaction.id}
            src={reaction.src}
            alt={reactionLabel[reaction.kind]}
            className="relative z-10 aspect-square h-auto w-full object-cover"
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}
