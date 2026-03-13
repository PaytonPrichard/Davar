"use client";

import { useState, memo } from "react";
import { cn } from "@/lib/utils";

interface LevelBadgeProps {
  level: number;
  xpProgress: { current: number; needed: number };
  totalXP: number;
}

export default memo(function LevelBadge({
  level,
  xpProgress,
  totalXP,
}: LevelBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const progressFraction = xpProgress.needed > 0
    ? xpProgress.current / xpProgress.needed
    : 0;

  // SVG circle parameters
  const size = 32;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressFraction);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <svg width={size} height={size} className="rotate-[-90deg]">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-border"
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-accent transition-all duration-300"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>

      {/* Level number centered */}
      <span className="absolute text-xs font-bold text-accent">
        {level}
      </span>

      {/* Tooltip */}
      {showTooltip && (
        <div
          className={cn(
            "absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap",
            "bg-bg-card text-text-primary text-xs rounded-lg px-3 py-1.5 shadow-lg border border-border",
            "tooltip-animate z-50"
          )}
        >
          Level {level} — {xpProgress.current}/{xpProgress.needed} XP
          <span className="block text-text-muted text-[10px]">
            {totalXP} XP total
          </span>
        </div>
      )}
    </div>
  );
})
