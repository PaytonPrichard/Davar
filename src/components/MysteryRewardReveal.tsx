"use client";

import { useState, useEffect } from "react";
import { MysteryReward } from "@/hooks/useMysteryRewards";
import { cn } from "@/lib/utils";

interface Props {
  reward: MysteryReward;
  onDismiss: () => void;
}

export default function MysteryRewardReveal({ reward, onDismiss }: Props) {
  const [phase, setPhase] = useState<"shaking" | "opening" | "revealed">("shaking");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("opening"), 1200);
    const t2 = setTimeout(() => setPhase("revealed"), 1800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={phase === "revealed" ? onDismiss : undefined}
    >
      <div
        className="flex flex-col items-center gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mystery box */}
        <div
          className={cn(
            "w-32 h-32 rounded-2xl flex items-center justify-center transition-all duration-500",
            phase === "shaking"
              ? "bg-gradient-to-br from-purple-600 to-indigo-700 animate-[wiggle_0.3s_ease-in-out_infinite] shadow-2xl shadow-purple-500/40"
              : phase === "opening"
                ? "bg-gradient-to-br from-yellow-400 to-amber-500 scale-125 shadow-2xl shadow-yellow-500/50"
                : "bg-transparent scale-0"
          )}
        >
          <span className="text-5xl">
            {phase === "shaking"
              ? "\uD83C\uDF81"
              : phase === "opening"
                ? "\u2728"
                : ""}
          </span>
        </div>

        {/* Revealed reward */}
        {phase === "revealed" && (
          <div className="flex flex-col items-center gap-4 animate-[bounceIn_0.5s_ease-out]">
            <div className="text-7xl">{reward.icon}</div>
            <h3 className="text-2xl font-bold text-yellow-400">
              {reward.label}
            </h3>
            <p className="text-text-secondary text-center max-w-xs">
              {reward.description}
            </p>
            <button
              onClick={onDismiss}
              className="px-8 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold transition-all hover:scale-105 mt-2"
            >
              Awesome!
            </button>
          </div>
        )}

        {phase !== "revealed" && (
          <p className="text-text-secondary text-sm animate-pulse">
            {phase === "shaking" ? "Mystery Reward..." : "Opening..."}
          </p>
        )}

        <style jsx>{`
          @keyframes wiggle {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-5deg); }
            75% { transform: rotate(5deg); }
          }
          @keyframes bounceIn {
            0% { opacity: 0; transform: scale(0.3); }
            50% { opacity: 1; transform: scale(1.1); }
            100% { transform: scale(1); }
          }
        `}</style>
      </div>
    </div>
  );
}
