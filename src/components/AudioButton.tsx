"use client";

import { useAudio } from "@/hooks/useAudio";
import { useSettings } from "@/hooks/useSettings";

interface AudioButtonProps {
  text: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function AudioButton({
  text,
  size = "md",
  className = "",
}: AudioButtonProps) {
  const { settings } = useSettings();
  const { speak, audioState } = useAudio(settings);

  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base",
  };

  const iconSize = size === "sm" ? 12 : size === "md" ? 16 : 20;

  const stateStyles = {
    idle: "text-text-secondary hover:text-accent",
    loading: "text-accent-yellow animate-pulse",
    playing: "text-accent",
    error: "text-red-400",
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        speak(text);
      }}
      disabled={audioState === "loading"}
      className={`inline-flex items-center justify-center rounded-full bg-bg-card hover:bg-bg-card-hover transition-colors ${stateStyles[audioState]} ${sizeClasses[size]} ${className}`}
      title={
        audioState === "error"
          ? "Audio unavailable"
          : audioState === "playing"
            ? "Playing..."
            : "Play pronunciation"
      }
      aria-label={`Play pronunciation of ${text}`}
    >
      {audioState === "loading" ? (
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="animate-spin"
        >
          <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
        </svg>
      ) : audioState === "error" ? (
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      ) : (
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          {audioState === "playing" ? (
            <>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" className="animate-pulse" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" className="animate-pulse" />
            </>
          ) : (
            <>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </>
          )}
        </svg>
      )}
    </button>
  );
}
