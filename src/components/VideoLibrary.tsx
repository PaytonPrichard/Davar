"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { AppMode } from "@/types";
import { SK_VIDEOS_WATCHED } from "@/lib/storage-keys";

/* ── Types ──────────────────────────────────────────────────── */

interface VideoLesson {
  id: string;
  title: string;
  titleHebrew?: string;
  youtubeId: string;
  duration: string;
  level: "A1" | "A2" | "B1";
  category: string;
  description: string;
}

interface VideoLibraryProps {
  onNavigate?: (mode: AppMode) => void;
}

/* ── Video Data ─────────────────────────────────────────────── */

const VIDEOS: VideoLesson[] = [
  // Alphabet & Basics (A1)
  {
    id: "v-alphabet-10min",
    title: "Hebrew Alphabet in 10 Minutes",
    titleHebrew: "האלפבית העברי",
    youtubeId: "UiGGSuLRMkE",
    duration: "12:00",
    level: "A1",
    category: "Alphabet",
    description: "Learn all 22 Hebrew letters with pronunciation and writing tips.",
  },
  {
    id: "v-nikud-vowels",
    title: "Hebrew Vowels (Nikud) Explained",
    titleHebrew: "ניקוד",
    youtubeId: "GIRZlPIHVPM",
    duration: "15:00",
    level: "A1",
    category: "Alphabet",
    description: "Understand the Hebrew vowel system and how to read nikud.",
  },
  {
    id: "v-100-phrases",
    title: "100 Hebrew Phrases for Beginners",
    titleHebrew: "100 ביטויים",
    youtubeId: "pMHhSUPJLGs",
    duration: "40:00",
    level: "A1",
    category: "Conversation",
    description: "Essential phrases covering greetings, shopping, directions, and more.",
  },
  {
    id: "v-sleep-learning",
    title: "Learn Hebrew While You Sleep",
    titleHebrew: "עברית בשינה",
    youtubeId: "0BPjGOSbWN0",
    duration: "3:00:00",
    level: "A1",
    category: "Background",
    description: "Background listening — absorb Hebrew vocabulary passively.",
  },
  // Basic Conversation (A1-A2)
  {
    id: "v-greetings",
    title: "Hebrew Greetings & Introductions",
    titleHebrew: "ברכות והיכרות",
    youtubeId: "BCM7WOIHhZc",
    duration: "8:00",
    level: "A1",
    category: "Conversation",
    description: "Master essential greetings and how to introduce yourself.",
  },
  {
    id: "v-ordering-food",
    title: "Ordering Food in Hebrew",
    titleHebrew: "להזמין אוכל",
    youtubeId: "lBL9RxWIIaQ",
    duration: "10:00",
    level: "A2",
    category: "Conversation",
    description: "Restaurant vocabulary and phrases for ordering like a local.",
  },
  {
    id: "v-numbers",
    title: "Numbers 1-100 in Hebrew",
    titleHebrew: "מספרים 1-100",
    youtubeId: "qUfx-0MS4VY",
    duration: "12:00",
    level: "A1",
    category: "Conversation",
    description: "Count from one to one hundred in Hebrew with pronunciation.",
  },
  // Grammar (A2)
  {
    id: "v-verb-conjugation",
    title: "Hebrew Verb Conjugation Explained",
    titleHebrew: "הטיית פעלים",
    youtubeId: "UJEGEpRCIck",
    duration: "18:00",
    level: "A2",
    category: "Grammar",
    description: "Understand Hebrew verb patterns (binyanim) and conjugation basics.",
  },
  {
    id: "v-pronouns",
    title: "Hebrew Pronouns Complete Guide",
    titleHebrew: "כינויי גוף",
    youtubeId: "OjfKGhpBe20",
    duration: "14:00",
    level: "A2",
    category: "Grammar",
    description: "All Hebrew personal, possessive, and demonstrative pronouns.",
  },
  {
    id: "v-past-tense",
    title: "Past Tense in Hebrew",
    titleHebrew: "זמן עבר",
    youtubeId: "8bwOvHkmmPE",
    duration: "20:00",
    level: "A2",
    category: "Grammar",
    description: "Learn to conjugate and use the past tense across all verb groups.",
  },
  // Intermediate (B1)
  {
    id: "v-listening-practice",
    title: "Hebrew Listening Practice",
    titleHebrew: "תרגול האזנה",
    youtubeId: "BbUJlr4x-lQ",
    duration: "25:00",
    level: "B1",
    category: "Conversation",
    description: "Improve comprehension with natural-speed Hebrew dialogues.",
  },
  {
    id: "v-street-interviews",
    title: "Easy Hebrew — Street Interviews",
    titleHebrew: "ראיונות רחוב",
    youtubeId: "SvJGPHcN3jM",
    duration: "8:00",
    level: "B1",
    category: "Culture",
    description: "Real conversations with Israelis on the street, with subtitles.",
  },
  {
    id: "v-news-learners",
    title: "Hebrew News for Learners",
    titleHebrew: "חדשות בעברית קלה",
    youtubeId: "0L_GQ1GQFK4",
    duration: "15:00",
    level: "B1",
    category: "Culture",
    description: "Simplified news broadcasts to build reading and listening skills.",
  },
  // Cultural
  {
    id: "v-slang",
    title: "Israeli Slang You Need to Know",
    titleHebrew: "סלנג ישראלי",
    youtubeId: "p0r-cxCRmWs",
    duration: "10:00",
    level: "B1",
    category: "Culture",
    description: "Popular Hebrew slang expressions used in everyday Israeli life.",
  },
  {
    id: "v-songs",
    title: "Hebrew Songs for Learners",
    titleHebrew: "שירים בעברית",
    youtubeId: "Fkro8Zn2A8s",
    duration: "30:00",
    level: "A2",
    category: "Culture",
    description: "Learn Hebrew through popular Israeli songs with lyrics breakdown.",
  },
];

/* ── Constants ──────────────────────────────────────────────── */

type LevelFilter = "All" | "A1" | "A2" | "B1";
type CategoryFilter = "All" | "Alphabet" | "Conversation" | "Grammar" | "Culture";

const LEVEL_TABS: { value: LevelFilter; label: string; color: string }[] = [
  { value: "All", label: "All", color: "bg-accent/10 text-accent border-accent/30" },
  { value: "A1", label: "A1 Beginner", color: "bg-accent-green/10 text-accent-green border-accent-green/30" },
  { value: "A2", label: "A2 Elementary", color: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
  { value: "B1", label: "B1 Intermediate", color: "bg-accent-blue/10 text-accent-blue border-accent-blue/30" },
];

const CATEGORY_TABS: { value: CategoryFilter; label: string }[] = [
  { value: "All", label: "All" },
  { value: "Alphabet", label: "Alphabet" },
  { value: "Conversation", label: "Conversation" },
  { value: "Grammar", label: "Grammar" },
  { value: "Culture", label: "Culture" },
];

const LEVEL_BADGE_CLASSES: Record<string, string> = {
  A1: "bg-accent-green/15 text-accent-green",
  A2: "bg-amber-500/15 text-amber-400",
  B1: "bg-accent-blue/15 text-accent-blue",
};

const STORAGE_KEY = SK_VIDEOS_WATCHED;

/* ── Helpers ────────────────────────────────────────────────── */

function getWatchedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch {
    /* ignore */
  }
  return new Set();
}

function saveWatchedIds(ids: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

/* ── Component ──────────────────────────────────────────────── */

export default function VideoLibrary({ onNavigate }: VideoLibraryProps) {
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("All");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("All");
  const [activeVideo, setActiveVideo] = useState<VideoLesson | null>(null);
  const [watchedIds, setWatchedIds] = useState<Set<string>>(new Set());

  // Hydrate watched state from localStorage
  useEffect(() => {
    setWatchedIds(getWatchedIds());
  }, []);

  const filteredVideos = VIDEOS.filter((v) => {
    if (levelFilter !== "All" && v.level !== levelFilter) return false;
    if (categoryFilter !== "All" && v.category !== categoryFilter) return false;
    return true;
  });

  const toggleWatched = useCallback(
    (videoId: string) => {
      setWatchedIds((prev) => {
        const next = new Set(prev);
        if (next.has(videoId)) {
          next.delete(videoId);
        } else {
          next.add(videoId);
        }
        saveWatchedIds(next);
        return next;
      });
    },
    [],
  );

  /* ── Player View ──────────────────────────────────────────── */

  if (activeVideo) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        {/* Back button */}
        <button
          onClick={() => setActiveVideo(null)}
          className="mb-4 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition hover:bg-bg-card-hover hover:text-text-primary"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path
              fillRule="evenodd"
              d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
              clipRule="evenodd"
            />
          </svg>
          Back to Library
        </button>

        {/* Embedded player */}
        <div className="relative w-full overflow-hidden rounded-xl bg-black" style={{ paddingBottom: "56.25%" }}>
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${activeVideo.youtubeId}?rel=0`}
            title={activeVideo.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Video info */}
        <div className="mt-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-text-primary">{activeVideo.title}</h2>
              {activeVideo.titleHebrew && (
                <p className="hebrew-text mt-0.5 text-base text-text-secondary">
                  {activeVideo.titleHebrew}
                </p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", LEVEL_BADGE_CLASSES[activeVideo.level])}>
                {activeVideo.level}
              </span>
              <span className="rounded-full bg-bg-card px-2.5 py-0.5 text-xs font-medium text-text-muted">
                {activeVideo.duration}
              </span>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-text-secondary">{activeVideo.description}</p>

          {/* Mark as Watched */}
          <button
            onClick={() => toggleWatched(activeVideo.id)}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition",
              watchedIds.has(activeVideo.id)
                ? "border-accent-green/30 bg-accent-green/10 text-accent-green"
                : "border-border bg-bg-card text-text-secondary hover:border-accent-green/30 hover:text-accent-green",
            )}
          >
            {watchedIds.has(activeVideo.id) ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
                Watched
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                  <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                Mark as Watched
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  /* ── Grid View (default) ──────────────────────────────────── */

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Video Library</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Curated Hebrew lessons from top YouTube channels
        </p>
      </div>

      {/* Level filter tabs */}
      <div className="mb-3 flex flex-wrap gap-2">
        {LEVEL_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setLevelFilter(tab.value)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
              levelFilter === tab.value
                ? tab.color
                : "border-border bg-bg-card text-text-muted hover:text-text-secondary",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Category filter tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setCategoryFilter(tab.value)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition",
              categoryFilter === tab.value
                ? "border-accent/30 bg-accent/10 text-accent"
                : "border-border bg-bg-card text-text-muted hover:text-text-secondary",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Watched count */}
      {watchedIds.size > 0 && (
        <p className="mb-4 text-xs text-text-muted">
          {watchedIds.size} of {VIDEOS.length} videos watched
        </p>
      )}

      {/* Video grid */}
      {filteredVideos.length === 0 ? (
        <div className="rounded-xl border border-border bg-bg-card p-8 text-center">
          <p className="text-sm text-text-muted">No videos match the current filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filteredVideos.map((video) => (
            <button
              key={video.id}
              onClick={() => setActiveVideo(video)}
              className="group relative overflow-hidden rounded-xl border border-border bg-bg-card text-left transition hover:border-accent/30 hover:shadow-md"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video w-full overflow-hidden bg-bg-secondary">
                <img
                  src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                  alt={video.title}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                  loading="lazy"
                />
                {/* Duration badge */}
                <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                  {video.duration}
                </span>
                {/* Watched overlay */}
                {watchedIds.has(video.id) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <span className="flex items-center gap-1 rounded-full bg-accent-green/90 px-2.5 py-1 text-xs font-bold text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                      Watched
                    </span>
                  </div>
                )}
              </div>

              {/* Card body */}
              <div className="p-3">
                <div className="mb-1.5 flex items-center gap-2">
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", LEVEL_BADGE_CLASSES[video.level])}>
                    {video.level}
                  </span>
                  <span className="rounded-full bg-bg-secondary px-2 py-0.5 text-[10px] font-medium text-text-muted">
                    {video.category}
                  </span>
                </div>
                <h3 className="text-sm font-semibold leading-snug text-text-primary group-hover:text-accent transition">
                  {video.title}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-text-muted">{video.description}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
