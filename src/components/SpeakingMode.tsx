"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { VOCABULARY } from "@/data/vocabulary";
import { PASSAGES } from "@/data/passages";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useAudio } from "@/hooks/useAudio";
import { useSettings } from "@/hooks/useSettings";
import { cn, shuffle } from "@/lib/utils";
import { useXP } from "@/hooks/useXP";
import type { Word, PassageLine, AppMode } from "@/types";

/* ── Types ────────────────────────────────────────────────── */

type SpeakingTab = "word" | "read-aloud" | "repeat";
type PronunciationScore = "perfect" | "close" | "miss";

interface SpeakingModeProps {
  onNavigate?: (mode: AppMode) => void;
}

/* ── Hebrew normalization & scoring ───────────────────────── */

/**
 * Normalize Hebrew text for comparison:
 * - Strip nikud (cantillation marks + vowel points, U+0591..U+05C7)
 * - Keep only Hebrew letters (U+05D0..U+05EA) and whitespace
 * - Collapse whitespace, trim
 */
function normalizeHebrew(text: string): string {
  return text
    .replace(/[\u0591-\u05C7]/g, "")
    .replace(/[^\u05D0-\u05EA\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function scorePronunciation(
  expected: string,
  spoken: string
): PronunciationScore {
  const norm1 = normalizeHebrew(expected);
  const norm2 = normalizeHebrew(spoken);

  if (norm1 === norm2) return "perfect";

  // Check word-level overlap (>= 60% match = close)
  const words1 = norm1.split(/\s+/).filter(Boolean);
  const words2 = norm2.split(/\s+/).filter(Boolean);
  if (words1.length === 0) return "miss";

  const matches = words1.filter((w) => words2.includes(w)).length;
  if (matches / words1.length >= 0.6) return "close";

  return "miss";
}

const SCORE_CONFIG: Record<
  PronunciationScore,
  { label: string; color: string; bg: string; border: string }
> = {
  perfect: {
    label: "Perfect!",
    color: "text-accent-green",
    bg: "bg-accent-green/10",
    border: "border-accent-green/30",
  },
  close: {
    label: "Almost!",
    color: "text-accent-yellow",
    bg: "bg-accent-yellow/10",
    border: "border-accent-yellow/30",
  },
  miss: {
    label: "Try again",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-400/30",
  },
};

const WORDS_PER_SESSION = 10;

/* ── Mic SVG icon ─────────────────────────────────────────── */

function MicIcon({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function SpeakerIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function SkipIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="5 4 15 12 5 20 5 4" />
      <line x1="19" y1="5" x2="19" y2="19" />
    </svg>
  );
}

/* ── Unsupported browser message ──────────────────────────── */

function NotSupported() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-red-500/10 border-2 border-red-400/30 flex items-center justify-center text-red-400">
        <MicIcon size={28} />
      </div>
      <h3 className="text-lg font-semibold text-text-primary">
        Speech Recognition Not Available
      </h3>
      <p className="text-sm text-text-secondary max-w-md">
        Your browser does not support the Web Speech API, which is required for
        pronunciation practice. Please try using a Chromium-based browser
        (Chrome, Edge, Brave) on desktop for the best experience.
      </p>
      <p className="text-xs text-text-muted max-w-md">
        Safari has partial support. Firefox does not currently support the
        SpeechRecognition API.
      </p>
    </div>
  );
}

/* ── Main SpeakingMode component ──────────────────────────── */

export default function SpeakingMode({ onNavigate }: SpeakingModeProps) {
  const [tab, setTab] = useState<SpeakingTab>("word");
  const { isSupported } = useSpeechRecognition();

  const tabs: { id: SpeakingTab; label: string }[] = [
    { id: "word", label: "Word" },
    { id: "read-aloud", label: "Read Aloud" },
    { id: "repeat", label: "Repeat After Me" },
  ];

  if (!isSupported) {
    return (
      <div className="flex flex-col gap-6">
        <h2 className="text-xl font-bold text-text-primary">
          Speaking Practice
        </h2>
        <NotSupported />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <h2 className="text-xl font-bold text-text-primary">
        Speaking Practice
      </h2>

      {/* Tab bar */}
      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium transition-colors border",
              tab === t.id
                ? "bg-accent text-white border-accent"
                : "bg-bg-card text-text-secondary border-border hover:border-accent/50"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "word" && <WordPronunciation />}
      {tab === "read-aloud" && <ReadAloud />}
      {tab === "repeat" && <RepeatAfterMe />}
    </div>
  );
}

/* ── 1. Word Pronunciation ────────────────────────────────── */

function WordPronunciation() {
  const { awardXP } = useXP();
  const {
    startListening,
    stopListening,
    state: micState,
    result: micResult,
  } = useSpeechRecognition();

  const [wordIdx, setWordIdx] = useState(0);
  const [score, setScore] = useState<PronunciationScore | null>(null);
  const [transcript, setTranscript] = useState("");
  const [sessionWords] = useState<Word[]>(() =>
    shuffle([...VOCABULARY]).slice(0, WORDS_PER_SESSION)
  );
  const [results, setResults] = useState<PronunciationScore[]>([]);
  const [sessionDone, setSessionDone] = useState(false);
  const processedRef = useRef(false);

  const word = sessionWords[wordIdx];

  // Pick up final speech recognition result
  useEffect(() => {
    if (micResult?.isFinal && micResult.transcript && score === null) {
      if (processedRef.current) return;
      processedRef.current = true;
      const spoken = micResult.transcript;
      setTranscript(spoken);
      const s = scorePronunciation(word.hebrew, spoken);
      setScore(s);
      setResults((prev) => [...prev, s]);

      // Auto-advance after perfect match
      if (s === "perfect") {
        setTimeout(() => advanceWord(), 1500);
      }
    }
  }, [micResult]); // eslint-disable-line react-hooks/exhaustive-deps

  const advanceWord = useCallback(() => {
    if (wordIdx + 1 >= sessionWords.length) {
      setSessionDone(true);
      return;
    }
    setWordIdx((i) => i + 1);
    setScore(null);
    setTranscript("");
    processedRef.current = false;
  }, [wordIdx, sessionWords.length]);

  const retry = () => {
    setScore(null);
    setTranscript("");
    processedRef.current = false;
  };

  const skip = () => {
    setResults((prev) => [...prev, "miss"]);
    advanceWord();
  };

  const startNewSession = () => {
    setWordIdx(0);
    setScore(null);
    setTranscript("");
    setResults([]);
    setSessionDone(false);
    processedRef.current = false;
  };

  const handleMicClick = () => {
    if (micState === "listening") {
      stopListening();
    } else {
      setScore(null);
      setTranscript("");
      processedRef.current = false;
      startListening();
    }
  };

  // Award XP once when session completes
  const xpAwardedRef = useRef(false);
  useEffect(() => {
    if (sessionDone && !xpAwardedRef.current) {
      xpAwardedRef.current = true;
      const count = results.filter((r) => r === "perfect" || r === "close").length;
      for (let i = 0; i < count; i++) awardXP("speaking_correct");
    }
    if (!sessionDone) xpAwardedRef.current = false;
  }, [sessionDone, results, awardXP]);

  // Session complete screen
  if (sessionDone) {
    const perfect = results.filter((r) => r === "perfect").length;
    const close = results.filter((r) => r === "close").length;
    const missed = results.filter((r) => r === "miss").length;
    const pct = Math.round(
      ((perfect + close * 0.5) / results.length) * 100
    );

    return (
      <SessionCompleteCard
        title="Word Pronunciation"
        perfect={perfect}
        close={close}
        missed={missed}
        total={results.length}
        percentage={pct}
        onRestart={startNewSession}
      />
    );
  }

  if (!word) return null;

  return (
    <div className="bg-bg-card rounded-2xl border border-border p-6">
      {/* Progress bar */}
      <div className="flex items-center justify-between text-xs text-text-muted mb-4">
        <span>
          Word {wordIdx + 1} of {sessionWords.length}
        </span>
        <span>
          {results.filter((r) => r === "perfect").length} perfect
        </span>
      </div>
      <div className="h-1.5 bg-bg-secondary rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-accent rounded-full transition-all duration-300"
          style={{
            width: `${((wordIdx + (score ? 1 : 0)) / sessionWords.length) * 100}%`,
          }}
        />
      </div>

      {/* Hebrew display */}
      <div className="text-center mb-8">
        <p className="hebrew-text text-4xl text-text-primary mb-2 leading-relaxed">
          {word.hebrewNikud}
        </p>
        <p className="text-sm text-accent italic mb-1">
          {word.transliteration}
        </p>
        <p className="text-sm text-text-secondary">{word.translation}</p>
      </div>

      {/* Mic button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={handleMicClick}
          disabled={score !== null}
          className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center transition-all border-2",
            micState === "listening"
              ? "bg-red-500/15 border-red-400 text-red-400 animate-pulse"
              : score !== null
                ? "bg-bg-secondary border-border text-text-muted cursor-not-allowed"
                : "bg-accent/10 border-accent text-accent hover:bg-accent/20"
          )}
          title={micState === "listening" ? "Listening..." : "Tap to speak"}
        >
          <MicIcon size={32} />
        </button>
      </div>

      {micState === "listening" && (
        <p className="text-center text-sm text-red-400 animate-pulse mb-4">
          Listening... speak the word now
        </p>
      )}

      {micState === "processing" && micResult && !micResult.isFinal && (
        <p className="text-center text-sm text-text-muted mb-4" dir="rtl">
          {micResult.transcript}
        </p>
      )}

      {/* Score feedback */}
      {score && (
        <div className="animate-[fadeIn_0.2s_ease-out]">
          <div
            className={cn(
              "text-center p-4 rounded-xl border mb-4",
              SCORE_CONFIG[score].bg,
              SCORE_CONFIG[score].border
            )}
          >
            <p
              className={cn(
                "text-lg font-bold mb-1",
                SCORE_CONFIG[score].color
              )}
            >
              {SCORE_CONFIG[score].label}
            </p>
            {transcript && (
              <p className="text-xs text-text-muted" dir="rtl">
                You said: {transcript}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex justify-center gap-3">
            {score !== "perfect" && (
              <button
                onClick={retry}
                className="px-5 py-2.5 rounded-xl border border-border bg-bg-secondary text-text-secondary text-sm font-medium hover:border-accent/50 transition-colors"
              >
                Retry
              </button>
            )}
            <button
              onClick={advanceWord}
              className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors"
            >
              {wordIdx + 1 >= sessionWords.length ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      )}

      {/* Skip when no score yet */}
      {!score && micState === "idle" && (
        <div className="flex justify-center">
          <button
            onClick={skip}
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors"
          >
            <SkipIcon />
            Skip
          </button>
        </div>
      )}
    </div>
  );
}

/* ── 2. Read Aloud ────────────────────────────────────────── */

function ReadAloud() {
  const { awardXP } = useXP();
  const {
    startListening,
    stopListening,
    state: micState,
    result: micResult,
  } = useSpeechRecognition();

  const [passageIdx, setPassageIdx] = useState(0);
  const [lineIdx, setLineIdx] = useState(0);
  const [score, setScore] = useState<PronunciationScore | null>(null);
  const [transcript, setTranscript] = useState("");
  const [lineScores, setLineScores] = useState<PronunciationScore[]>([]);
  const [passageDone, setPassageDone] = useState(false);
  const processedRef = useRef(false);

  const passage = PASSAGES[passageIdx];
  const line: PassageLine | undefined = passage?.lines[lineIdx];

  // Pick up final recognition result
  useEffect(() => {
    if (micResult?.isFinal && micResult.transcript && score === null && line) {
      if (processedRef.current) return;
      processedRef.current = true;
      const spoken = micResult.transcript;
      setTranscript(spoken);
      const s = scorePronunciation(line.hebrew, spoken);
      setScore(s);
      setLineScores((prev) => [...prev, s]);

      if (s === "perfect") {
        setTimeout(() => advanceLine(), 1200);
      }
    }
  }, [micResult]); // eslint-disable-line react-hooks/exhaustive-deps

  const advanceLine = useCallback(() => {
    if (!passage) return;
    if (lineIdx + 1 >= passage.lines.length) {
      setPassageDone(true);
      return;
    }
    setLineIdx((i) => i + 1);
    setScore(null);
    setTranscript("");
    processedRef.current = false;
  }, [lineIdx, passage]);

  const retry = () => {
    setScore(null);
    setTranscript("");
    processedRef.current = false;
  };

  const handleMicClick = () => {
    if (micState === "listening") {
      stopListening();
    } else {
      setScore(null);
      setTranscript("");
      processedRef.current = false;
      startListening();
    }
  };

  const changePassage = (idx: number) => {
    setPassageIdx(idx);
    setLineIdx(0);
    setScore(null);
    setTranscript("");
    setLineScores([]);
    setPassageDone(false);
    processedRef.current = false;
  };

  const restartPassage = () => {
    setLineIdx(0);
    setScore(null);
    setTranscript("");
    setLineScores([]);
    setPassageDone(false);
    processedRef.current = false;
  };

  // Award XP once when passage completes
  const xpAwardedRef = useRef(false);
  useEffect(() => {
    if (passageDone && !xpAwardedRef.current) {
      xpAwardedRef.current = true;
      const count = lineScores.filter((r) => r === "perfect" || r === "close").length;
      for (let i = 0; i < count; i++) awardXP("speaking_correct");
    }
    if (!passageDone) xpAwardedRef.current = false;
  }, [passageDone, lineScores, awardXP]);

  // Passage complete screen
  if (passageDone && passage) {
    const perfect = lineScores.filter((r) => r === "perfect").length;
    const close = lineScores.filter((r) => r === "close").length;
    const missed = lineScores.filter((r) => r === "miss").length;
    const pct = Math.round(
      ((perfect + close * 0.5) / lineScores.length) * 100
    );

    return (
      <SessionCompleteCard
        title={`"${passage.title}" Complete`}
        perfect={perfect}
        close={close}
        missed={missed}
        total={lineScores.length}
        percentage={pct}
        onRestart={restartPassage}
        restartLabel="Read Again"
      />
    );
  }

  if (!line || !passage) {
    return <p className="text-text-muted">No passages available.</p>;
  }

  return (
    <div className="bg-bg-card rounded-2xl border border-border p-6">
      {/* Passage selector + progress */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select
          value={passageIdx}
          onChange={(e) => changePassage(parseInt(e.target.value))}
          className="px-3 py-1.5 bg-bg-secondary border border-border rounded-lg text-sm text-text-primary"
        >
          {PASSAGES.map((p, i) => (
            <option key={p.id} value={i}>
              {p.title} ({p.level})
            </option>
          ))}
        </select>
        <span className="text-xs text-text-muted ml-auto">
          Line {lineIdx + 1} of {passage.lines.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-bg-secondary rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-accent rounded-full transition-all duration-300"
          style={{
            width: `${((lineIdx + (score ? 1 : 0)) / passage.lines.length) * 100}%`,
          }}
        />
      </div>

      {/* Line display */}
      <div className="text-center mb-8">
        <p
          className="hebrew-text text-2xl text-text-primary mb-2 leading-relaxed"
          dir="rtl"
        >
          {line.hebrew}
        </p>
        <p className="text-sm text-accent italic mb-1">
          {line.transliteration}
        </p>
        <p className="text-sm text-text-secondary">{line.translation}</p>
      </div>

      {/* Line score indicators */}
      <div className="flex justify-center gap-1.5 mb-6">
        {passage.lines.map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-2.5 h-2.5 rounded-full transition-colors",
              i < lineScores.length
                ? lineScores[i] === "perfect"
                  ? "bg-accent-green"
                  : lineScores[i] === "close"
                    ? "bg-accent-yellow"
                    : "bg-red-400"
                : i === lineIdx
                  ? "bg-accent"
                  : "bg-bg-secondary"
            )}
          />
        ))}
      </div>

      {/* Mic button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={handleMicClick}
          disabled={score !== null}
          className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center transition-all border-2",
            micState === "listening"
              ? "bg-red-500/15 border-red-400 text-red-400 animate-pulse"
              : score !== null
                ? "bg-bg-secondary border-border text-text-muted cursor-not-allowed"
                : "bg-accent/10 border-accent text-accent hover:bg-accent/20"
          )}
          title={micState === "listening" ? "Listening..." : "Tap to speak"}
        >
          <MicIcon size={32} />
        </button>
      </div>

      {micState === "listening" && (
        <p className="text-center text-sm text-red-400 animate-pulse mb-4">
          Listening... read the line aloud
        </p>
      )}

      {micState === "processing" && micResult && !micResult.isFinal && (
        <p className="text-center text-sm text-text-muted mb-4" dir="rtl">
          {micResult.transcript}
        </p>
      )}

      {/* Score feedback */}
      {score && (
        <div className="animate-[fadeIn_0.2s_ease-out]">
          <div
            className={cn(
              "text-center p-4 rounded-xl border mb-4",
              SCORE_CONFIG[score].bg,
              SCORE_CONFIG[score].border
            )}
          >
            <p
              className={cn(
                "text-lg font-bold mb-1",
                SCORE_CONFIG[score].color
              )}
            >
              {SCORE_CONFIG[score].label}
            </p>
            {transcript && (
              <p className="text-xs text-text-muted" dir="rtl">
                You said: {transcript}
              </p>
            )}
          </div>

          <div className="flex justify-center gap-3">
            {score !== "perfect" && (
              <button
                onClick={retry}
                className="px-5 py-2.5 rounded-xl border border-border bg-bg-secondary text-text-secondary text-sm font-medium hover:border-accent/50 transition-colors"
              >
                Retry
              </button>
            )}
            <button
              onClick={advanceLine}
              className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors"
            >
              {lineIdx + 1 >= passage.lines.length ? "Finish" : "Next Line"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── 3. Repeat After Me ───────────────────────────────────── */

function RepeatAfterMe() {
  const { awardXP } = useXP();
  const { settings } = useSettings();
  const { speak, audioState } = useAudio(settings);
  const {
    startListening,
    stopListening,
    state: micState,
    result: micResult,
  } = useSpeechRecognition();

  const [itemIdx, setItemIdx] = useState(0);
  const [phase, setPhase] = useState<"listen" | "speak" | "scored">("listen");
  const [score, setScore] = useState<PronunciationScore | null>(null);
  const [transcript, setTranscript] = useState("");
  const [results, setResults] = useState<PronunciationScore[]>([]);
  const [sessionDone, setSessionDone] = useState(false);
  const processedRef = useRef(false);

  // Mix of single words and short phrases for variety
  const sessionItems = useMemo(() => {
    const words: { hebrew: string; transliteration: string; english: string }[] =
      shuffle([...VOCABULARY])
        .slice(0, 6)
        .map((w) => ({
          hebrew: w.hebrewNikud,
          transliteration: w.transliteration,
          english: w.translation,
        }));

    // Add a few passage lines as short phrases
    const lines: { hebrew: string; transliteration: string; english: string }[] =
      shuffle(PASSAGES.flatMap((p) => p.lines))
        .slice(0, 4)
        .map((l) => ({
          hebrew: l.hebrew,
          transliteration: l.transliteration,
          english: l.translation,
        }));

    return shuffle([...words, ...lines]);
  }, []);

  const item = sessionItems[itemIdx];

  // Handle TTS completion to transition to "speak" phase
  useEffect(() => {
    if (phase === "listen" && audioState === "idle" && itemIdx >= 0) {
      // Small delay after audio finishes, then prompt user to speak
      const timer = setTimeout(() => {
        setPhase("speak");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [audioState, phase, itemIdx]);

  // Pick up final recognition result
  useEffect(() => {
    if (
      micResult?.isFinal &&
      micResult.transcript &&
      phase === "speak" &&
      item
    ) {
      if (processedRef.current) return;
      processedRef.current = true;
      const spoken = micResult.transcript;
      setTranscript(spoken);
      const s = scorePronunciation(item.hebrew, spoken);
      setScore(s);
      setPhase("scored");
      setResults((prev) => [...prev, s]);

      if (s === "perfect") {
        setTimeout(() => advanceItem(), 1500);
      }
    }
  }, [micResult]); // eslint-disable-line react-hooks/exhaustive-deps

  const advanceItem = useCallback(() => {
    if (itemIdx + 1 >= sessionItems.length) {
      setSessionDone(true);
      return;
    }
    setItemIdx((i) => i + 1);
    setPhase("listen");
    setScore(null);
    setTranscript("");
    processedRef.current = false;
  }, [itemIdx, sessionItems.length]);

  const playAndListen = () => {
    if (!item) return;
    setPhase("listen");
    setScore(null);
    setTranscript("");
    processedRef.current = false;
    speak(item.hebrew);
  };

  const retry = () => {
    setPhase("listen");
    setScore(null);
    setTranscript("");
    processedRef.current = false;
    if (item) speak(item.hebrew);
  };

  const handleMicClick = () => {
    if (micState === "listening") {
      stopListening();
    } else {
      processedRef.current = false;
      startListening();
    }
  };

  // Auto-play on mount and on item change
  useEffect(() => {
    if (item && phase === "listen") {
      speak(item.hebrew);
    }
  }, [itemIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  const startNewSession = () => {
    setItemIdx(0);
    setPhase("listen");
    setScore(null);
    setTranscript("");
    setResults([]);
    setSessionDone(false);
    processedRef.current = false;
  };

  // Award XP once when session completes
  const xpAwardedRef = useRef(false);
  useEffect(() => {
    if (sessionDone && !xpAwardedRef.current) {
      xpAwardedRef.current = true;
      const count = results.filter((r) => r === "perfect" || r === "close").length;
      for (let i = 0; i < count; i++) awardXP("speaking_correct");
    }
    if (!sessionDone) xpAwardedRef.current = false;
  }, [sessionDone, results, awardXP]);

  // Session complete
  if (sessionDone) {
    const perfect = results.filter((r) => r === "perfect").length;
    const close = results.filter((r) => r === "close").length;
    const missed = results.filter((r) => r === "miss").length;
    const pct = Math.round(
      ((perfect + close * 0.5) / results.length) * 100
    );

    return (
      <SessionCompleteCard
        title="Repeat After Me"
        perfect={perfect}
        close={close}
        missed={missed}
        total={results.length}
        percentage={pct}
        onRestart={startNewSession}
      />
    );
  }

  if (!item) return null;

  return (
    <div className="bg-bg-card rounded-2xl border border-border p-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-xs text-text-muted mb-4">
        <span>
          {itemIdx + 1} of {sessionItems.length}
        </span>
        <span>
          {results.filter((r) => r === "perfect").length} perfect
        </span>
      </div>
      <div className="h-1.5 bg-bg-secondary rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-accent rounded-full transition-all duration-300"
          style={{
            width: `${((itemIdx + (score ? 1 : 0)) / sessionItems.length) * 100}%`,
          }}
        />
      </div>

      {/* Phase indicator */}
      <div className="flex justify-center gap-4 mb-6">
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
            phase === "listen"
              ? "bg-accent/10 text-accent border border-accent/30"
              : "bg-bg-secondary text-text-muted border border-transparent"
          )}
        >
          <SpeakerIcon size={14} />
          Listen
        </div>
        <div className="flex items-center text-text-muted">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
            phase === "speak"
              ? "bg-accent/10 text-accent border border-accent/30"
              : phase === "scored"
                ? "bg-accent-green/10 text-accent-green border border-accent-green/30"
                : "bg-bg-secondary text-text-muted border border-transparent"
          )}
        >
          <MicIcon size={14} />
          Repeat
        </div>
      </div>

      {/* Hebrew display — hidden during "listen" phase for ear training */}
      <div className="text-center mb-8">
        {phase === "listen" ? (
          <>
            <div className="flex justify-center mb-4">
              <button
                onClick={playAndListen}
                className={cn(
                  "w-20 h-20 rounded-full flex items-center justify-center transition-all border-2",
                  audioState === "playing"
                    ? "bg-accent/20 border-accent text-accent scale-105"
                    : "bg-bg-secondary border-border text-text-secondary hover:border-accent hover:text-accent"
                )}
                title="Listen again"
              >
                <SpeakerIcon size={32} />
              </button>
            </div>
            <p className="text-sm text-text-muted">
              {audioState === "playing" ? "Playing..." : "Tap to listen again"}
            </p>
          </>
        ) : (
          <>
            <p
              className="hebrew-text text-3xl text-text-primary mb-2 leading-relaxed"
              dir="rtl"
            >
              {item.hebrew}
            </p>
            <p className="text-sm text-accent italic mb-1">
              {item.transliteration}
            </p>
            <p className="text-sm text-text-secondary">{item.english}</p>
          </>
        )}
      </div>

      {/* Mic button (speak phase) */}
      {phase === "speak" && (
        <>
          <div className="flex justify-center mb-4">
            <button
              onClick={handleMicClick}
              className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center transition-all border-2",
                micState === "listening"
                  ? "bg-red-500/15 border-red-400 text-red-400 animate-pulse"
                  : "bg-accent/10 border-accent text-accent hover:bg-accent/20"
              )}
              title={
                micState === "listening" ? "Listening..." : "Tap to speak"
              }
            >
              <MicIcon size={32} />
            </button>
          </div>
          <p className="text-center text-sm text-text-muted mb-4">
            {micState === "listening"
              ? "Listening... repeat what you heard"
              : "Now repeat what you heard"}
          </p>
          {/* Replay button */}
          <div className="flex justify-center">
            <button
              onClick={() => {
                if (item) speak(item.hebrew);
              }}
              className="flex items-center gap-1.5 text-xs text-text-muted hover:text-accent transition-colors"
            >
              <SpeakerIcon size={14} />
              Play again
            </button>
          </div>
        </>
      )}

      {micState === "processing" && micResult && !micResult.isFinal && (
        <p className="text-center text-sm text-text-muted mb-4" dir="rtl">
          {micResult.transcript}
        </p>
      )}

      {/* Score feedback */}
      {phase === "scored" && score && (
        <div className="animate-[fadeIn_0.2s_ease-out]">
          <div
            className={cn(
              "text-center p-4 rounded-xl border mb-4",
              SCORE_CONFIG[score].bg,
              SCORE_CONFIG[score].border
            )}
          >
            <p
              className={cn(
                "text-lg font-bold mb-1",
                SCORE_CONFIG[score].color
              )}
            >
              {SCORE_CONFIG[score].label}
            </p>
            {transcript && (
              <p className="text-xs text-text-muted" dir="rtl">
                You said: {transcript}
              </p>
            )}
          </div>

          <div className="flex justify-center gap-3">
            {score !== "perfect" && (
              <button
                onClick={retry}
                className="px-5 py-2.5 rounded-xl border border-border bg-bg-secondary text-text-secondary text-sm font-medium hover:border-accent/50 transition-colors"
              >
                Retry
              </button>
            )}
            <button
              onClick={advanceItem}
              className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors"
            >
              {itemIdx + 1 >= sessionItems.length ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Session Complete Card (shared) ───────────────────────── */

function SessionCompleteCard({
  title,
  perfect,
  close,
  missed,
  total,
  percentage,
  onRestart,
  restartLabel = "New Session",
}: {
  title: string;
  perfect: number;
  close: number;
  missed: number;
  total: number;
  percentage: number;
  onRestart: () => void;
  restartLabel?: string;
}) {
  return (
    <div className="bg-bg-card rounded-2xl border border-border p-8">
      <div className="text-center mb-8">
        <p className="text-4xl mb-3">
          {percentage >= 80 ? "\uD83C\uDF1F" : percentage >= 50 ? "\uD83D\uDC4D" : "\uD83D\uDCAA"}
        </p>
        <h3 className="text-xl font-bold text-text-primary mb-1">{title}</h3>
        <p className="text-sm text-text-secondary">Session complete</p>
      </div>

      {/* Overall score circle */}
      <div className="flex justify-center mb-8">
        <div
          className={cn(
            "w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center",
            percentage >= 80
              ? "border-accent-green"
              : percentage >= 50
                ? "border-accent-yellow"
                : "border-red-400"
          )}
        >
          <span
            className={cn(
              "text-3xl font-bold",
              percentage >= 80
                ? "text-accent-green"
                : percentage >= 50
                  ? "text-accent-yellow"
                  : "text-red-400"
            )}
          >
            {percentage}%
          </span>
          <span className="text-[10px] text-text-muted">accuracy</span>
        </div>
      </div>

      {/* Score breakdown */}
      <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto mb-8">
        <div className="bg-accent-green/10 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-accent-green">{perfect}</p>
          <p className="text-[10px] text-text-muted">Perfect</p>
        </div>
        <div className="bg-accent-yellow/10 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-accent-yellow">{close}</p>
          <p className="text-[10px] text-text-muted">Close</p>
        </div>
        <div className="bg-red-500/10 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-red-400">{missed}</p>
          <p className="text-[10px] text-text-muted">Missed</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center">
        <button
          onClick={onRestart}
          className="px-8 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold text-sm transition-all hover:scale-[1.02]"
        >
          {restartLabel}
        </button>
      </div>
    </div>
  );
}
