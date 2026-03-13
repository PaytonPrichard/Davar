"use client";

import { useState, useCallback, useEffect } from "react";
import { STORIES, StoryChapter, StorySegment, StorySeries } from "@/data/stories";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useXP } from "@/hooks/useXP";
import { useStreak } from "@/hooks/useStreak";
import { cn } from "@/lib/utils";
import AudioButton from "./AudioButton";

/* ── Types ────────────────────────────────────────────── */

interface StoryProgress {
  completedChapters: string[]; // chapter IDs
  currentSeries?: string;
  currentChapter?: string;
}

/* ── Component ────────────────────────────────────────── */

export default function StoryMode() {
  const { awardXP } = useXP();
  const { recordStudy } = useStreak();
  const [progress, setProgress, hydrated] = useLocalStorage<StoryProgress>(
    "davar-story-progress",
    { completedChapters: [] }
  );

  const [view, setView] = useState<"library" | "chapter" | "segment">("library");
  const [activeSeries, setActiveSeries] = useState<StorySeries | null>(null);
  const [activeChapter, setActiveChapter] = useState<StoryChapter | null>(null);
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [challengeAnswer, setChallengeAnswer] = useState<number | null>(null);
  const [showChallengeResult, setShowChallengeResult] = useState(false);
  const [chapterScore, setChapterScore] = useState({ correct: 0, total: 0 });

  const openSeries = useCallback((series: StorySeries) => {
    setActiveSeries(series);
    setView("chapter");
  }, []);

  const openChapter = useCallback((chapter: StoryChapter) => {
    setActiveChapter(chapter);
    setSegmentIndex(0);
    setChallengeAnswer(null);
    setShowChallengeResult(false);
    setChapterScore({ correct: 0, total: 0 });
    setView("segment");
  }, []);

  const handleChallengeSelect = useCallback((idx: number) => {
    if (showChallengeResult) return;
    setChallengeAnswer(idx);
  }, [showChallengeResult]);

  const handleChallengeConfirm = useCallback(() => {
    if (challengeAnswer === null || !activeChapter) return;
    const seg = activeChapter.segments[segmentIndex];
    if (seg.type !== "challenge" || !seg.options || !seg.correctAnswer) return;

    const isCorrect = seg.options[challengeAnswer] === seg.correctAnswer;
    setShowChallengeResult(true);
    setChapterScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
    if (isCorrect) {
      awardXP("quiz_correct");
    }
    recordStudy();
  }, [challengeAnswer, activeChapter, segmentIndex, awardXP, recordStudy]);

  const handleNext = useCallback(() => {
    if (!activeChapter) return;
    const nextIdx = segmentIndex + 1;
    if (nextIdx >= activeChapter.segments.length) {
      // Chapter complete
      setProgress((prev) => ({
        ...prev,
        completedChapters: prev.completedChapters.includes(activeChapter.id)
          ? prev.completedChapters
          : [...prev.completedChapters, activeChapter.id],
      }));
      awardXP("passage_complete");
      return;
    }
    setSegmentIndex(nextIdx);
    setChallengeAnswer(null);
    setShowChallengeResult(false);
  }, [activeChapter, segmentIndex, awardXP, setProgress]);

  const isChapterComplete =
    activeChapter && segmentIndex >= activeChapter.segments.length - 1 && showChallengeResult;
  const isChapterDone = activeChapter && progress.completedChapters.includes(activeChapter.id);

  if (!hydrated) return null;

  /* ── Library view ──────────────────── */
  if (view === "library") {
    return (
      <div className="flex flex-col gap-8">
        <div>
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            {"\uD83D\uDCD6"} Story Mode
          </h2>
          <p className="text-sm text-text-muted mt-1">
            Learn Hebrew through interactive stories. Each chapter introduces new
            vocabulary and tests your understanding.
          </p>
        </div>

        <div className="grid gap-6">
          {STORIES.map((series) => {
            const completedCount = series.chapters.filter((ch) =>
              progress.completedChapters.includes(ch.id)
            ).length;
            const totalCount = series.chapters.length;

            return (
              <button
                key={series.id}
                onClick={() => openSeries(series)}
                className="w-full text-left bg-bg-card rounded-2xl border border-border p-6 hover:bg-bg-card-hover transition-all hover:scale-[1.01] hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-text-primary">
                      {series.title}
                    </h3>
                    <p className="hebrew-text text-base text-accent mt-0.5">
                      {series.titleHebrew}
                    </p>
                    <p className="text-sm text-text-secondary mt-2">
                      {series.description}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs text-text-muted">
                      {completedCount}/{totalCount} chapters
                    </span>
                    <div className="w-24 h-2 bg-bg-secondary rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full bg-accent-green rounded-full transition-all"
                        style={{
                          width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  /* ── Chapter list view ─────────────── */
  if (view === "chapter" && activeSeries) {
    return (
      <div className="flex flex-col gap-6">
        <button
          onClick={() => setView("library")}
          className="text-sm text-text-muted hover:text-accent transition-colors self-start flex items-center gap-1"
        >
          {"\u2190"} All Stories
        </button>

        <div>
          <h2 className="text-xl font-bold text-text-primary">
            {activeSeries.title}
          </h2>
          <p className="hebrew-text text-base text-accent">
            {activeSeries.titleHebrew}
          </p>
          <p className="text-sm text-text-secondary mt-2">
            {activeSeries.description}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {activeSeries.chapters.map((chapter, i) => {
            const done = progress.completedChapters.includes(chapter.id);
            const prevDone =
              i === 0 || progress.completedChapters.includes(activeSeries.chapters[i - 1].id);
            const locked = !prevDone;
            const challengeCount = chapter.segments.filter(
              (s) => s.type === "challenge"
            ).length;

            return (
              <button
                key={chapter.id}
                onClick={() => !locked && openChapter(chapter)}
                disabled={locked}
                className={cn(
                  "w-full text-left rounded-xl border p-5 transition-all flex items-center gap-4",
                  done
                    ? "border-green-500/30 bg-green-500/5"
                    : locked
                      ? "border-border bg-bg-secondary opacity-60 cursor-not-allowed"
                      : "border-border bg-bg-card hover:bg-bg-card-hover hover:border-accent/30"
                )}
              >
                {/* Chapter number */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                    done
                      ? "bg-green-500 text-white"
                      : locked
                        ? "bg-bg-secondary text-text-muted"
                        : "bg-accent/15 text-accent"
                  )}
                >
                  {done ? "\u2713" : locked ? "\uD83D\uDD12" : i + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-text-primary">
                    {chapter.title}
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    {chapter.description}
                  </p>
                  <div className="flex gap-3 mt-2 text-xs text-text-muted">
                    <span>{chapter.level}</span>
                    <span>{"\u00B7"}</span>
                    <span>{chapter.segments.length} segments</span>
                    <span>{"\u00B7"}</span>
                    <span>{challengeCount} challenges</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  /* ── Reading/challenge view ────────── */
  if (view === "segment" && activeChapter) {
    const segment = activeChapter.segments[segmentIndex];
    const isLastSegment = segmentIndex === activeChapter.segments.length - 1;
    const chapterJustCompleted =
      isLastSegment && (segment.type !== "challenge" || showChallengeResult);

    // Chapter completion screen
    if (chapterJustCompleted && progress.completedChapters.includes(activeChapter.id)) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
          <div className="text-6xl">{"\uD83C\uDF1F"}</div>
          <h2 className="text-2xl font-bold text-text-primary text-center">
            Chapter Complete!
          </h2>
          <p className="text-lg text-text-primary text-center">
            {activeChapter.title}
          </p>
          {chapterScore.total > 0 && (
            <p className="text-text-secondary">
              Challenges: {chapterScore.correct}/{chapterScore.total} correct
            </p>
          )}
          {activeChapter.cliffhanger && (
            <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 max-w-md text-center">
              <p className="text-sm text-text-secondary italic">
                {activeChapter.cliffhanger}
              </p>
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => setView("chapter")}
              className="px-6 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white font-medium transition-colors"
            >
              Next Chapter
            </button>
            <button
              onClick={() => setView("library")}
              className="px-6 py-2.5 rounded-xl bg-bg-secondary text-text-secondary hover:text-text-primary font-medium transition-colors"
            >
              All Stories
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-6 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setView("chapter")}
            className="text-sm text-text-muted hover:text-accent transition-colors flex items-center gap-1"
          >
            {"\u2190"} Chapters
          </button>
          <span className="text-xs text-text-muted">
            {segmentIndex + 1} / {activeChapter.segments.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-300 rounded-full"
            style={{
              width: `${((segmentIndex + 1) / activeChapter.segments.length) * 100}%`,
            }}
          />
        </div>

        {/* Segment content */}
        <div className="bg-bg-card rounded-2xl border border-border p-6 min-h-[200px]">
          {segment.type === "narration" && (
            <div className="flex flex-col gap-4">
              <span className="text-xs text-text-muted uppercase tracking-wider">
                {"\uD83D\uDCD6"} Story
              </span>
              <p className="text-base text-text-primary leading-relaxed">
                {segment.text}
              </p>
            </div>
          )}

          {segment.type === "dialogue" && (
            <div className="flex flex-col gap-4">
              <span className="text-xs text-accent uppercase tracking-wider font-medium">
                {"\uD83D\uDCAC"} {segment.speaker}
              </span>
              <p className="text-base text-text-primary italic">
                &quot;{segment.text}&quot;
              </p>
              {segment.hebrewNikud && (
                <div className="bg-bg-secondary rounded-xl p-4 flex flex-col items-center gap-2">
                  <span className="hebrew-text text-2xl font-bold text-text-primary">
                    {segment.hebrewNikud}
                  </span>
                  {segment.transliteration && (
                    <span className="text-sm text-text-secondary">
                      {segment.transliteration}
                    </span>
                  )}
                  {segment.hebrew && <AudioButton text={segment.hebrew} size="md" />}
                </div>
              )}
            </div>
          )}

          {segment.type === "challenge" && segment.options && (
            <div className="flex flex-col gap-4">
              <span className="text-xs text-accent-yellow uppercase tracking-wider font-medium">
                {"\u2728"} Challenge
              </span>
              <p className="text-base text-text-primary font-medium">
                {segment.prompt}
              </p>
              {segment.hebrewNikud && (
                <div className="flex items-center justify-center gap-2">
                  <span className="hebrew-text text-2xl font-bold text-text-primary">
                    {segment.hebrewNikud}
                  </span>
                  {segment.hebrew && <AudioButton text={segment.hebrew} size="sm" />}
                </div>
              )}
              <div className="flex flex-col gap-2">
                {segment.options.map((option, i) => {
                  const isCorrectOption = option === segment.correctAnswer;
                  const isSelected = challengeAnswer === i;
                  const isHebrew = /[\u0590-\u05FF]/.test(option);

                  let style = "border-border hover:border-accent/50";
                  if (isSelected && !showChallengeResult) {
                    style = "border-accent bg-accent/10 ring-2 ring-accent/30";
                  }
                  if (showChallengeResult) {
                    if (isCorrectOption) {
                      style = "border-green-500 bg-green-500/10";
                    } else if (isSelected) {
                      style = "border-red-500 bg-red-500/10";
                    } else {
                      style = "border-border opacity-50";
                    }
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => handleChallengeSelect(i)}
                      disabled={showChallengeResult}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border text-left transition-all flex items-center gap-3",
                        style
                      )}
                    >
                      <span
                        className={cn(
                          "w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0",
                          isSelected && !showChallengeResult
                            ? "bg-accent text-white"
                            : showChallengeResult && isCorrectOption
                              ? "bg-green-500 text-white"
                              : "bg-bg-secondary text-text-muted"
                        )}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span
                        className={cn(
                          isHebrew ? "hebrew-text text-lg" : "text-sm",
                          "text-text-primary"
                        )}
                      >
                        {option}
                      </span>
                    </button>
                  );
                })}
              </div>

              {!showChallengeResult && (
                <button
                  onClick={handleChallengeConfirm}
                  disabled={challengeAnswer === null}
                  className={cn(
                    "w-full py-3 rounded-xl font-medium transition-all",
                    challengeAnswer !== null
                      ? "bg-accent hover:bg-accent-hover text-white"
                      : "bg-bg-secondary text-text-muted cursor-not-allowed"
                  )}
                >
                  Check Answer
                </button>
              )}

              {showChallengeResult && (
                <div
                  className={cn(
                    "text-center font-semibold",
                    challengeAnswer !== null &&
                      segment.options[challengeAnswer] === segment.correctAnswer
                      ? "text-green-400"
                      : "text-red-400"
                  )}
                >
                  {challengeAnswer !== null &&
                  segment.options[challengeAnswer] === segment.correctAnswer
                    ? "Correct!"
                    : `The answer was: ${segment.correctAnswer}`}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Next button */}
        {(segment.type !== "challenge" || showChallengeResult) && (
          <button
            onClick={handleNext}
            className="w-full py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-medium transition-all"
          >
            {isLastSegment ? "Complete Chapter" : "Continue"}
          </button>
        )}
      </div>
    );
  }

  return null;
}
