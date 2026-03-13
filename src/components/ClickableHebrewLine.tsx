"use client";

import { useState, useCallback } from "react";
import { useWordLookup } from "@/hooks/useWordLookup";
import { cn, cleanHebrew } from "@/lib/utils";
import WordSavePopover from "./WordSavePopover";

interface ClickableHebrewLineProps {
  hebrew: string;
  className?: string;
}

interface ClickedWord {
  text: string;
  rect: DOMRect;
}

export default function ClickableHebrewLine({
  hebrew,
  className,
}: ClickableHebrewLineProps) {
  const { lookup, saveWord, savedSet } = useWordLookup();
  const [clicked, setClicked] = useState<ClickedWord | null>(null);

  const handleWordClick = useCallback(
    (word: string, e: React.MouseEvent<HTMLSpanElement>) => {
      e.stopPropagation();
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setClicked({ text: word, rect });
    },
    []
  );

  const words = hebrew.split(/(\s+)/);

  return (
    <div className={cn("hebrew-text", className)}>
      {words.map((token, i) => {
        // Whitespace tokens render as-is
        if (/^\s+$/.test(token)) {
          return <span key={i}>{token}</span>;
        }

        const cleaned = cleanHebrew(token);

        // Skip tokens that have no Hebrew letters after cleaning (pure punctuation)
        if (!cleaned) {
          return <span key={i}>{token}</span>;
        }

        const isSaved = savedSet.has(cleaned);

        return (
          <span
            key={i}
            onClick={(e) => handleWordClick(token, e)}
            className={cn(
              "cursor-pointer rounded px-0.5 transition-colors hover:bg-accent/20",
              isSaved && "underline decoration-accent/40 underline-offset-4"
            )}
          >
            {token}
          </span>
        );
      })}

      {clicked && (
        <WordSavePopover
          hebrew={clicked.text}
          lookupResult={lookup(clicked.text)}
          anchorRect={clicked.rect}
          onSave={saveWord}
          onClose={() => setClicked(null)}
        />
      )}
    </div>
  );
}
