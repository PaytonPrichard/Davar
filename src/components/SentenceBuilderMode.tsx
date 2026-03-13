"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { AppMode, XP_VALUES } from "@/types";
import { useXP } from "@/hooks/useXP";
import { useStreak } from "@/hooks/useStreak";
import { trackQuest } from "@/hooks/useQuests";
import { cn, shuffle } from "@/lib/utils";

/* ── Sentence data ─────────────────────────────────────────── */

type Difficulty = "A1" | "A2" | "B1";

interface Sentence {
  id: string;
  english: string;
  hebrew: string;
  words: string[];
  transliteration: string;
  level: Difficulty;
}

const SENTENCES: Sentence[] = [
  // ── A1 (10) ──
  {
    id: "a1-01",
    english: "I am learning Hebrew",
    hebrew: "אני לומד עברית",
    words: ["אני", "לומד", "עברית"],
    transliteration: "ani lomed ivrit",
    level: "A1",
  },
  {
    id: "a1-02",
    english: "The water is cold",
    hebrew: "המים קרים",
    words: ["המים", "קרים"],
    transliteration: "hamayim karim",
    level: "A1",
  },
  {
    id: "a1-03",
    english: "She is eating bread",
    hebrew: "היא אוכלת לחם",
    words: ["היא", "אוכלת", "לחם"],
    transliteration: "hi okhelet lechem",
    level: "A1",
  },
  {
    id: "a1-04",
    english: "We live in a house",
    hebrew: "אנחנו גרים בבית",
    words: ["אנחנו", "גרים", "בבית"],
    transliteration: "anachnu garim babayit",
    level: "A1",
  },
  {
    id: "a1-05",
    english: "The book is on the table",
    hebrew: "הספר על השולחן",
    words: ["הספר", "על", "השולחן"],
    transliteration: "hasefer al hashulchan",
    level: "A1",
  },
  {
    id: "a1-06",
    english: "He is a good student",
    hebrew: "הוא תלמיד טוב",
    words: ["הוא", "תלמיד", "טוב"],
    transliteration: "hu talmid tov",
    level: "A1",
  },
  {
    id: "a1-07",
    english: "I want coffee",
    hebrew: "אני רוצה קפה",
    words: ["אני", "רוצה", "קפה"],
    transliteration: "ani rotze kafe",
    level: "A1",
  },
  {
    id: "a1-08",
    english: "The children are playing",
    hebrew: "הילדים משחקים",
    words: ["הילדים", "משחקים"],
    transliteration: "hayeladim mesachkim",
    level: "A1",
  },
  {
    id: "a1-09",
    english: "Good morning, how are you?",
    hebrew: "בוקר טוב, מה שלומך?",
    words: ["בוקר", "טוב,", "מה", "שלומך?"],
    transliteration: "boker tov, ma shlomkha?",
    level: "A1",
  },
  {
    id: "a1-10",
    english: "Thank you very much",
    hebrew: "תודה רבה",
    words: ["תודה", "רבה"],
    transliteration: "toda raba",
    level: "A1",
  },

  // ── A2 (12) ──
  {
    id: "a2-01",
    english: "I went to the market yesterday",
    hebrew: "אני הלכתי לשוק אתמול",
    words: ["אני", "הלכתי", "לשוק", "אתמול"],
    transliteration: "ani halakhti lashuk etmol",
    level: "A2",
  },
  {
    id: "a2-02",
    english: "She speaks Hebrew and English",
    hebrew: "היא מדברת עברית ואנגלית",
    words: ["היא", "מדברת", "עברית", "ואנגלית"],
    transliteration: "hi medaberet ivrit ve'anglit",
    level: "A2",
  },
  {
    id: "a2-03",
    english: "We will travel to Jerusalem tomorrow",
    hebrew: "אנחנו ניסע לירושלים מחר",
    words: ["אנחנו", "ניסע", "לירושלים", "מחר"],
    transliteration: "anachnu nisa lirushalayim machar",
    level: "A2",
  },
  {
    id: "a2-04",
    english: "The teacher gave us homework",
    hebrew: "המורה נתן לנו שיעורי בית",
    words: ["המורה", "נתן", "לנו", "שיעורי", "בית"],
    transliteration: "hamore natan lanu shiurei bayit",
    level: "A2",
  },
  {
    id: "a2-05",
    english: "I like to read books in the evening",
    hebrew: "אני אוהב לקרוא ספרים בערב",
    words: ["אני", "אוהב", "לקרוא", "ספרים", "בערב"],
    transliteration: "ani ohev likro sfarim ba'erev",
    level: "A2",
  },
  {
    id: "a2-06",
    english: "Can you help me please?",
    hebrew: "אתה יכול לעזור לי בבקשה?",
    words: ["אתה", "יכול", "לעזור", "לי", "בבקשה?"],
    transliteration: "ata yakhol la'azor li bevakasha?",
    level: "A2",
  },
  {
    id: "a2-07",
    english: "The weather today is very hot",
    hebrew: "מזג האוויר היום חם מאוד",
    words: ["מזג", "האוויר", "היום", "חם", "מאוד"],
    transliteration: "mezeg ha'avir hayom cham me'od",
    level: "A2",
  },
  {
    id: "a2-08",
    english: "I need to buy food for dinner",
    hebrew: "אני צריך לקנות אוכל לארוחת ערב",
    words: ["אני", "צריך", "לקנות", "אוכל", "לארוחת", "ערב"],
    transliteration: "ani tsarikh liknot okhel la'aruchat erev",
    level: "A2",
  },
  {
    id: "a2-09",
    english: "My family is big and happy",
    hebrew: "המשפחה שלי גדולה ושמחה",
    words: ["המשפחה", "שלי", "גדולה", "ושמחה"],
    transliteration: "hamishpacha sheli gdola usmecha",
    level: "A2",
  },
  {
    id: "a2-10",
    english: "He works in a hospital",
    hebrew: "הוא עובד בבית חולים",
    words: ["הוא", "עובד", "בבית", "חולים"],
    transliteration: "hu oved bebeit cholim",
    level: "A2",
  },
  {
    id: "a2-11",
    english: "I studied Hebrew for two years",
    hebrew: "למדתי עברית שנתיים",
    words: ["למדתי", "עברית", "שנתיים"],
    transliteration: "lamadeti ivrit shnatayim",
    level: "A2",
  },
  {
    id: "a2-12",
    english: "The bus arrives at eight in the morning",
    hebrew: "האוטובוס מגיע בשמונה בבוקר",
    words: ["האוטובוס", "מגיע", "בשמונה", "בבוקר"],
    transliteration: "ha'otobus magia bishmone baboker",
    level: "A2",
  },

  // ── B1 (8) ──
  {
    id: "b1-01",
    english: "If I had time, I would travel to Tel Aviv",
    hebrew: "אם היה לי זמן, הייתי נוסע לתל אביב",
    words: ["אם", "היה", "לי", "זמן,", "הייתי", "נוסע", "לתל", "אביב"],
    transliteration: "im haya li zman, hayiti nosea le'tel aviv",
    level: "B1",
  },
  {
    id: "b1-02",
    english: "She asked me to help her with the project",
    hebrew: "היא ביקשה ממני לעזור לה עם הפרויקט",
    words: ["היא", "ביקשה", "ממני", "לעזור", "לה", "עם", "הפרויקט"],
    transliteration: "hi biksha mimeni la'azor la im haproyekt",
    level: "B1",
  },
  {
    id: "b1-03",
    english: "The restaurant we went to was very expensive",
    hebrew: "המסעדה שהלכנו אליה הייתה יקרה מאוד",
    words: ["המסעדה", "שהלכנו", "אליה", "הייתה", "יקרה", "מאוד"],
    transliteration: "hamis'ada shehalakhnu eleha hayta yekara me'od",
    level: "B1",
  },
  {
    id: "b1-04",
    english: "I have been living in Israel since last year",
    hebrew: "אני גר בישראל מאז השנה שעברה",
    words: ["אני", "גר", "בישראל", "מאז", "השנה", "שעברה"],
    transliteration: "ani gar be'yisrael me'az hashana she'avra",
    level: "B1",
  },
  {
    id: "b1-05",
    english: "They told us that the meeting was canceled",
    hebrew: "הם אמרו לנו שהפגישה בוטלה",
    words: ["הם", "אמרו", "לנו", "שהפגישה", "בוטלה"],
    transliteration: "hem amru lanu shehapgisha butla",
    level: "B1",
  },
  {
    id: "b1-06",
    english: "I don't know if I can come tomorrow",
    hebrew: "אני לא יודע אם אני יכול לבוא מחר",
    words: ["אני", "לא", "יודע", "אם", "אני", "יכול", "לבוא", "מחר"],
    transliteration: "ani lo yodea im ani yakhol lavo machar",
    level: "B1",
  },
  {
    id: "b1-07",
    english: "He suggested that we meet at the cafe",
    hebrew: "הוא הציע שניפגש בבית הקפה",
    words: ["הוא", "הציע", "שניפגש", "בבית", "הקפה"],
    transliteration: "hu hitsia shenipagesh bebeit hakafe",
    level: "B1",
  },
  {
    id: "b1-08",
    english: "The book that I read was very interesting",
    hebrew: "הספר שקראתי היה מאוד מעניין",
    words: ["הספר", "שקראתי", "היה", "מאוד", "מעניין"],
    transliteration: "hasefer shkarati haya me'od me'anyen",
    level: "B1",
  },
];

const SENTENCES_PER_SESSION = 10;

/* ── Helpers ───────────────────────────────────────────────── */

/** Shuffle words, avoiding the correct order when there are 3+ words. */
function scrambleWords(words: string[]): string[] {
  if (words.length <= 1) return [...words];
  let attempt = shuffle(words);
  let tries = 0;
  while (tries < 10 && attempt.every((w, i) => w === words[i])) {
    attempt = shuffle(words);
    tries++;
  }
  return attempt;
}

/* ── Component ─────────────────────────────────────────────── */

interface SentenceBuilderModeProps {
  onNavigate?: (mode: AppMode) => void;
}

export default function SentenceBuilderMode({ onNavigate }: SentenceBuilderModeProps) {
  const { awardXP } = useXP();
  const { recordStudy } = useStreak();

  /* ── Config & session state ──────────────────────────────── */
  const [difficulty, setDifficulty] = useState<Difficulty>("A1");
  const [phase, setPhase] = useState<"playing" | "complete">("playing");
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [totalXPEarned, setTotalXPEarned] = useState(0);

  /* ── Per-sentence state ─────────────────────────────────── */
  const [placedIndices, setPlacedIndices] = useState<number[]>([]); // indices into scrambledWords
  const [scrambledWords, setScrambledWords] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const awardedRef = useRef(false);

  /* ── Start / restart session ────────────────────────────── */
  const startSession = useCallback(
    (level: Difficulty) => {
      const pool = SENTENCES.filter((s) => s.level === level);
      const picked = shuffle(pool).slice(0, SENTENCES_PER_SESSION);
      setSentences(picked);
      setCurrentIdx(0);
      setScore(0);
      setTotalXPEarned(0);
      setPhase("playing");
      setChecked(false);
      setCorrect(null);
      setShowCorrectAnswer(false);
      awardedRef.current = false;

      // Scramble first sentence
      if (picked.length > 0) {
        setScrambledWords(scrambleWords(picked[0].words));
        setPlacedIndices([]);
      }
    },
    []
  );

  // Start on mount and when difficulty changes
  useEffect(() => {
    startSession(difficulty);
  }, [difficulty, startSession]);

  // When moving to a new sentence, scramble its words
  useEffect(() => {
    if (sentences.length > 0 && currentIdx < sentences.length) {
      setScrambledWords(scrambleWords(sentences[currentIdx].words));
      setPlacedIndices([]);
      setChecked(false);
      setCorrect(null);
      setShowCorrectAnswer(false);
    }
  }, [currentIdx, sentences]);

  /* ── Cleanup timer on unmount ───────────────────────────── */
  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  /* ── Current sentence ───────────────────────────────────── */
  const currentSentence = sentences[currentIdx] ?? null;

  /* ── Derived: placed words & remaining pool ─────────────── */
  const placedWords = useMemo(
    () => placedIndices.map((i) => scrambledWords[i]),
    [placedIndices, scrambledWords]
  );

  const remainingIndices = useMemo(() => {
    const usedSet = new Set(placedIndices);
    return scrambledWords.map((_, i) => i).filter((i) => !usedSet.has(i));
  }, [scrambledWords, placedIndices]);

  /* ── Tap to place a word ────────────────────────────────── */
  const handlePlaceWord = useCallback(
    (scrambledIdx: number) => {
      if (checked) return;
      setPlacedIndices((prev) => [...prev, scrambledIdx]);
    },
    [checked]
  );

  /* ── Tap to remove a placed word ────────────────────────── */
  const handleRemoveWord = useCallback(
    (positionIdx: number) => {
      if (checked) return;
      setPlacedIndices((prev) => prev.filter((_, i) => i !== positionIdx));
    },
    [checked]
  );

  /* ── Clear all placed words ─────────────────────────────── */
  const handleClear = useCallback(() => {
    if (checked) return;
    setPlacedIndices([]);
  }, [checked]);

  /* ── Advance to next sentence or complete ───────────────── */
  const advanceToNext = useCallback(() => {
    setCurrentIdx((prev) => {
      const next = prev + 1;
      if (next >= sentences.length) {
        setPhase("complete");
        return prev;
      }
      return next;
    });
  }, [sentences.length]);

  /* ── Check answer ───────────────────────────────────────── */
  const handleCheck = useCallback(() => {
    if (!currentSentence || checked) return;

    const isCorrect = placedWords.every(
      (word, i) => word === currentSentence.words[i]
    );

    setChecked(true);
    setCorrect(isCorrect);

    if (isCorrect) {
      setScore((s) => s + 1);
      awardXP("sentence_correct");
      setTotalXPEarned((prev) => prev + XP_VALUES.sentence_correct);
      recordStudy();
      trackQuest("master-word");

      // Increment sentences_built counter for achievements
      try {
        const prev = parseInt(localStorage.getItem("davar-sentences-built") ?? "0", 10);
        localStorage.setItem("davar-sentences-built", String(prev + 1));
      } catch {
        // localStorage unavailable
      }

      // Auto-advance after a short delay
      feedbackTimerRef.current = setTimeout(() => {
        advanceToNext();
      }, 1200);
    } else {
      // Show correct answer
      setShowCorrectAnswer(true);
      feedbackTimerRef.current = setTimeout(() => {
        setShowCorrectAnswer(false);
        advanceToNext();
      }, 2500);
    }
  }, [currentSentence, checked, placedWords, awardXP, recordStudy, advanceToNext]);

  /* ── All words placed? ──────────────────────────────────── */
  const allPlaced =
    currentSentence !== null &&
    placedIndices.length === currentSentence.words.length;

  /* ── Progress fraction ──────────────────────────────────── */
  const progressPct =
    sentences.length > 0
      ? ((currentIdx + (checked && correct ? 1 : 0)) / sentences.length) * 100
      : 0;

  /* ── Session complete screen ────────────────────────────── */
  if (phase === "complete") {
    const accuracy =
      sentences.length > 0
        ? Math.round((score / sentences.length) * 100)
        : 0;

    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 animate-[fadeIn_0.3s_ease-out]">
        <div className="bg-bg-card rounded-2xl border border-border p-8 max-w-sm w-full text-center">
          <div className="text-4xl mb-4">{accuracy >= 80 ? "\uD83C\uDF89" : "\uD83D\uDCAA"}</div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            Session Complete!
          </h2>
          <p className="text-text-secondary text-sm mb-6">
            {accuracy === 100
              ? "Perfect score! Amazing work!"
              : accuracy >= 80
                ? "Great job building Hebrew sentences!"
                : "Keep practicing, you're getting better!"}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-bg-secondary rounded-xl p-3">
              <div className="text-xs text-text-muted mb-1">Score</div>
              <div className="text-lg font-bold text-text-primary">
                {score}/{sentences.length}
              </div>
            </div>
            <div className="bg-bg-secondary rounded-xl p-3">
              <div className="text-xs text-text-muted mb-1">Accuracy</div>
              <div
                className={cn(
                  "text-lg font-bold",
                  accuracy === 100
                    ? "text-accent-green"
                    : accuracy >= 70
                      ? "text-accent-yellow"
                      : "text-accent"
                )}
              >
                {accuracy}%
              </div>
            </div>
            <div className="bg-bg-secondary rounded-xl p-3">
              <div className="text-xs text-text-muted mb-1">Level</div>
              <div className="text-lg font-bold text-accent-blue">
                {difficulty}
              </div>
            </div>
            <div className="bg-bg-secondary rounded-xl p-3">
              <div className="text-xs text-text-muted mb-1">XP Earned</div>
              <div className="text-lg font-bold text-accent">
                +{totalXPEarned}
              </div>
            </div>
          </div>

          {/* XP highlight */}
          <div className="bg-accent/10 rounded-xl p-3 mb-6">
            <span className="text-accent font-bold text-lg">
              +{totalXPEarned} XP
            </span>
            {accuracy === 100 && (
              <span className="block text-xs text-accent-yellow mt-1">
                Perfect session!
              </span>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => startSession(difficulty)}
              className="w-full px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-medium transition-colors"
            >
              Play Again
            </button>
            {onNavigate && (
              <button
                onClick={() => onNavigate("flashcards")}
                className="w-full px-6 py-3 rounded-xl border border-border bg-bg-card hover:bg-bg-card-hover text-text-secondary font-medium transition-colors"
              >
                Practice Flashcards
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── No sentences available ─────────────────────────────── */
  if (!currentSentence) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
        <p className="text-text-secondary text-sm">
          No sentences available for this difficulty level.
        </p>
      </div>
    );
  }

  /* ── Main game UI ───────────────────────────────────────── */
  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      {/* Difficulty tabs + progress */}
      <div className="flex flex-col gap-4">
        {/* Difficulty selector */}
        <div className="flex items-center gap-2">
          {(["A1", "A2", "B1"] as Difficulty[]).map((level) => (
            <button
              key={level}
              onClick={() => {
                if (level !== difficulty) {
                  setDifficulty(level);
                }
              }}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors border",
                difficulty === level
                  ? "bg-accent text-white border-accent"
                  : "bg-bg-card text-text-secondary border-border hover:border-accent/50"
              )}
            >
              {level}
            </button>
          ))}
          <span className="ml-auto text-xs text-text-muted">
            {currentIdx + 1} / {sentences.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-accent-green transition-all duration-500 rounded-full"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* English sentence prompt */}
      <div className="bg-bg-card rounded-xl border border-border p-6 text-center">
        <p className="text-xs text-text-muted mb-2 uppercase tracking-wider">
          Translate to Hebrew
        </p>
        <p className="text-lg text-text-primary font-medium">
          {currentSentence.english}
        </p>
      </div>

      {/* Answer area — placed tiles */}
      <div
        className={cn(
          "min-h-[64px] rounded-xl border-2 border-dashed p-4 flex flex-wrap gap-2 justify-center transition-colors",
          checked && correct
            ? "border-accent-green bg-accent-green/5"
            : checked && !correct
              ? "border-red-400 bg-red-500/5"
              : "border-border bg-bg-secondary/50"
        )}
        dir="rtl"
      >
        {placedWords.length === 0 && !checked && (
          <span className="text-text-muted text-sm self-center">
            Tap words below to build the sentence
          </span>
        )}
        {placedWords.map((word, i) => (
          <button
            key={`placed-${i}`}
            onClick={() => handleRemoveWord(i)}
            disabled={checked}
            className={cn(
              "hebrew-text px-4 py-2 rounded-xl font-medium text-lg transition-all select-none",
              checked && correct
                ? "bg-accent-green/20 text-accent-green cursor-default animate-pop-in"
                : checked && !correct
                  ? "bg-red-500/15 text-red-400 cursor-default animate-shake"
                  : "bg-accent/15 text-accent hover:bg-accent/25 cursor-pointer"
            )}
          >
            {word}
          </button>
        ))}
      </div>

      {/* Feedback messages */}
      {checked && correct && (
        <div className="text-center animate-[fadeIn_0.3s_ease-out]">
          <p className="text-accent-green font-semibold text-sm">
            Correct! +{XP_VALUES.sentence_correct} XP
          </p>
          <p className="text-text-muted text-xs mt-1 italic">
            {currentSentence.transliteration}
          </p>
        </div>
      )}

      {checked && !correct && showCorrectAnswer && (
        <div className="text-center animate-[fadeIn_0.3s_ease-out]">
          <p className="text-red-400 font-semibold text-sm mb-2">
            Not quite. Correct order:
          </p>
          <p className="hebrew-text text-lg text-text-primary" dir="rtl">
            {currentSentence.hebrew}
          </p>
          <p className="text-text-muted text-xs mt-1 italic">
            {currentSentence.transliteration}
          </p>
        </div>
      )}

      {/* Word bank — scrambled tiles */}
      {!checked && (
        <div className="flex flex-wrap gap-2 justify-center" dir="rtl">
          {remainingIndices.map((scrambledIdx) => (
            <button
              key={`bank-${scrambledIdx}`}
              onClick={() => handlePlaceWord(scrambledIdx)}
              className="hebrew-text px-4 py-2 rounded-xl border font-medium text-lg transition-all cursor-pointer select-none bg-bg-card border-border text-text-primary hover:border-accent/50 hover:bg-bg-card-hover active:scale-95"
            >
              {scrambledWords[scrambledIdx]}
            </button>
          ))}
        </div>
      )}

      {/* Action buttons */}
      {!checked && (
        <div className="flex gap-3 justify-center">
          <button
            onClick={handleClear}
            disabled={placedIndices.length === 0}
            className="px-5 py-2.5 rounded-xl border border-border bg-bg-card text-text-secondary text-sm font-medium hover:bg-bg-card-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Clear
          </button>
          <button
            onClick={handleCheck}
            disabled={!allPlaced}
            className={cn(
              "px-8 py-2.5 rounded-xl text-sm font-semibold transition-all",
              allPlaced
                ? "bg-accent hover:bg-accent-hover text-white cursor-pointer"
                : "bg-bg-secondary text-text-muted cursor-not-allowed"
            )}
          >
            Check
          </button>
        </div>
      )}

      {/* Score display */}
      <div className="flex items-center justify-center gap-6 text-sm text-text-muted">
        <span>
          Score:{" "}
          <span className="text-accent-green font-semibold">{score}</span>
        </span>
        <span>
          XP:{" "}
          <span className="text-accent font-semibold">+{totalXPEarned}</span>
        </span>
      </div>
    </div>
  );
}
