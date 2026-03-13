"use client";

import { useEffect, useRef, useLayoutEffect, useState } from "react";
import AudioButton from "./AudioButton";
import { Word } from "@/types";
import { LookupResult } from "@/hooks/useWordLookup";
import { cleanHebrew, stripPunctuation } from "@/lib/utils";
import { findRootForWord } from "@/data/roots";

interface WordSavePopoverProps {
  hebrew: string;
  lookupResult: LookupResult;
  anchorRect: DOMRect;
  onSave: (word: Omit<Word, "id">) => void;
  onClose: () => void;
}

const POPOVER_GAP = 8;
const VIEWPORT_PADDING = 12;

export default function WordSavePopover({
  hebrew,
  lookupResult,
  anchorRect,
  onSave,
  onClose,
}: WordSavePopoverProps) {
  const { match, alreadySaved } = lookupResult;
  const rootInfo = findRootForWord(cleanHebrew(hebrew));

  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number }>({
    top: anchorRect.bottom + POPOVER_GAP,
    left: anchorRect.left + anchorRect.width / 2,
  });

  // Measure popover and compute clamped/flipped position
  useLayoutEffect(() => {
    const el = popoverRef.current;
    if (!el) return;

    const popoverWidth = el.offsetWidth;
    const popoverHeight = el.offsetHeight;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Vertical: prefer below the word, flip above if not enough space
    const spaceBelow = viewportHeight - anchorRect.bottom - POPOVER_GAP;
    const top =
      spaceBelow >= popoverHeight
        ? anchorRect.bottom + POPOVER_GAP
        : anchorRect.top - popoverHeight - POPOVER_GAP;

    // Horizontal: center on word, clamp to viewport
    const halfWidth = popoverWidth / 2;
    const centerX = anchorRect.left + anchorRect.width / 2;
    const minLeft = VIEWPORT_PADDING + halfWidth;
    const maxLeft = viewportWidth - VIEWPORT_PADDING - halfWidth;
    const left = Math.max(minLeft, Math.min(centerX, maxLeft));

    setPosition({ top, left });
  }, [anchorRect]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    const id = setTimeout(() => {
      document.addEventListener("mousedown", handler);
    }, 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener("mousedown", handler);
    };
  }, [onClose]);

  const handleSave = () => {
    if (!match) return;
    onSave({
      hebrew: match.hebrew ?? cleanHebrew(hebrew),
      hebrewNikud: match.hebrewNikud ?? stripPunctuation(hebrew),
      transliteration: match.transliteration,
      translation: match.translation,
      category: match.category ?? "From Reading",
    });
    onClose();
  };

  return (
    <div
      ref={popoverRef}
      className="fixed z-50 bg-bg-card border border-border rounded-2xl shadow-lg p-4 w-72 -translate-x-1/2"
      style={{ top: position.top, left: position.left }}
    >
      {/* Hebrew word + audio */}
      <div className="flex items-center justify-between mb-3">
        <span className="hebrew-text text-2xl text-text-primary">{hebrew}</span>
        <AudioButton text={hebrew} size="sm" />
      </div>

      {match ? (
        <>
          {/* Status badges */}
          {!alreadySaved && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {match.category && (
                <span className="inline-block text-xs bg-bg-secondary text-text-muted px-2 py-0.5 rounded-full border border-border">
                  {match.category}
                </span>
              )}
            </div>
          )}
          {alreadySaved && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              <span className="inline-block text-xs bg-accent-green/10 text-accent-green px-2 py-0.5 rounded-full">
                Already in your word list
              </span>
            </div>
          )}

          {/* Definition display */}
          <div className="flex flex-col gap-2 mb-4">
            <div>
              <span className="text-xs text-text-muted block mb-0.5">Transliteration</span>
              <span className="text-sm text-text-primary font-medium italic">
                {match.transliteration}
              </span>
            </div>
            <div>
              <span className="text-xs text-text-muted block mb-0.5">Translation</span>
              <span className="text-sm text-text-primary font-medium">
                {match.translation}
              </span>
            </div>
          </div>

          {/* Root word connections */}
          {rootInfo && (
            <div className="mb-4 p-3 bg-bg-secondary rounded-xl border border-border">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-text-muted">Root:</span>
                <span className="hebrew-text text-sm font-bold text-accent-blue">
                  {rootInfo.rootDisplay}
                </span>
                <span className="text-xs text-text-secondary">
                  ({rootInfo.meaning})
                </span>
              </div>
              <div className="flex flex-col gap-1">
                {rootInfo.relatedWords
                  .filter(
                    (rw) =>
                      cleanHebrew(rw.hebrew) !== cleanHebrew(hebrew)
                  )
                  .slice(0, 3)
                  .map((rw, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs"
                    >
                      <span className="hebrew-text text-text-primary">
                        {rw.hebrewNikud}
                      </span>
                      <span className="text-text-muted">
                        {rw.transliteration}
                      </span>
                      <span className="text-text-secondary">
                        — {rw.translation}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Save button (only if not already saved) */}
          {!alreadySaved && (
            <button
              onClick={handleSave}
              className="w-full py-2 rounded-xl text-sm font-medium transition-colors bg-accent text-white hover:bg-accent/90"
            >
              Save to My Words
            </button>
          )}
        </>
      ) : (
        /* No definition found */
        <p className="text-sm text-text-muted">
          No definition available for this word.
        </p>
      )}
    </div>
  );
}
