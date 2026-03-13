"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import type { AppMode } from "@/types";
import { PASSAGES } from "@/data/passages";
import { cn } from "@/lib/utils";

interface SearchItem {
  label: string;
  sublabel?: string;
  mode: AppMode;
  passageId?: string;
  group?: string;
}

const TAB_ITEMS: SearchItem[] = [
  { label: "Dashboard", sublabel: "Stats, goals & progress", mode: "progress", group: "Home" },
  { label: "My Words", sublabel: "Custom vocabulary list", mode: "custom", group: "Home" },
  { label: "Alphabet", sublabel: "Learn the Hebrew letters", mode: "alphabet", group: "Learn" },
  { label: "Writing", sublabel: "Practice writing letters", mode: "writing", group: "Learn" },
  { label: "Grammar", sublabel: "Verb conjugation & lessons", mode: "grammar", group: "Learn" },
  { label: "Flashcards", sublabel: "Spaced-repetition drill", mode: "flashcards", group: "Practice" },
  { label: "Quiz", sublabel: "Test your knowledge", mode: "quiz", group: "Practice" },
  { label: "Listening", sublabel: "Audio comprehension", mode: "listening", group: "Practice" },
  { label: "Passages", sublabel: "Hebrew reading practice", mode: "reading", group: "Read" },
  { label: "Prayers", sublabel: "Common Hebrew prayers", mode: "prayers", group: "Read" },
];

const PASSAGE_ITEMS: SearchItem[] = PASSAGES.map((p) => ({
  label: p.title,
  sublabel: `${p.level}`,
  mode: "reading" as AppMode,
  passageId: p.id,
  group: "Passages",
}));

const ALL_ITEMS: SearchItem[] = [...TAB_ITEMS, ...PASSAGE_ITEMS];

interface SearchBarProps {
  onNavigate: (mode: AppMode, passageId?: string) => void;
}

export default function SearchBar({ onNavigate }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    if (!query.trim()) return TAB_ITEMS; // Show only sections when no query
    const q = query.toLowerCase();
    return ALL_ITEMS.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        (item.sublabel && item.sublabel.toLowerCase().includes(q)) ||
        (item.group && item.group.toLowerCase().includes(q))
    );
  }, [query]);

  const resetHighlight = useCallback(() => setHighlightIndex(0), []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const select = (item: SearchItem) => {
    onNavigate(item.mode, item.passageId);
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[highlightIndex]) {
      e.preventDefault();
      select(results[highlightIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  // Group results by their group label for display
  const groupedResults = useMemo(() => {
    const groups: { name: string; items: { item: SearchItem; globalIdx: number }[] }[] = [];
    let currentGroup = "";
    results.forEach((item, i) => {
      const g = item.group ?? "";
      if (g !== currentGroup) {
        currentGroup = g;
        groups.push({ name: g, items: [] });
      }
      groups[groups.length - 1].items.push({ item, globalIdx: i });
    });
    return groups;
  }, [results]);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); resetHighlight(); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search..."
          className="w-32 sm:w-44 bg-bg-card border border-border rounded-lg pl-3 pr-8 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/60 focus:w-52 sm:focus:w-60 transition-all"
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted text-[10px] pointer-events-none hidden sm:inline">
          Ctrl+K
        </span>
      </div>

      {open && results.length > 0 && (
        <div className="absolute right-0 top-full mt-1.5 w-72 max-h-80 overflow-y-auto rounded-xl border border-border bg-bg-card shadow-lg z-50">
          {groupedResults.map((group) => (
            <div key={group.name}>
              {group.name && (
                <div className="px-4 pt-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted/60">
                  {group.name}
                </div>
              )}
              {group.items.map(({ item, globalIdx }) => (
                <button
                  key={`${item.mode}-${item.passageId ?? item.label}`}
                  onMouseEnter={() => setHighlightIndex(globalIdx)}
                  onClick={() => select(item)}
                  className={cn(
                    "w-full text-left px-4 py-2 flex flex-col gap-0.5 transition-colors",
                    globalIdx === highlightIndex
                      ? "bg-accent/15 text-text-primary"
                      : "text-text-secondary hover:bg-bg-card-hover"
                  )}
                >
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.sublabel && (
                    <span className="text-xs text-text-muted">{item.sublabel}</span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      {open && query.trim() && results.length === 0 && (
        <div className="absolute right-0 top-full mt-1.5 w-72 rounded-xl border border-border bg-bg-card shadow-lg z-50 px-4 py-6 text-center text-sm text-text-muted">
          No results for &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  );
}
