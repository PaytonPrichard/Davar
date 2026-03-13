"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { VOCABULARY } from "@/data/vocabulary";
import { useSpacedRepetition } from "@/hooks/useSpacedRepetition";
import { useVocabulary } from "@/hooks/useVocabulary";
import { AppMode } from "@/types";

/* ── Question types ─────────────────────────────────────────── */

interface MCQuestion {
  type: "mc";
  stage: number;
  prompt: string;
  hebrewPrompt?: string;
  options: string[];
  correctIndex: number;
}

type Question = MCQuestion;

/* ── Placement levels ───────────────────────────────────────── */

export type PlacementLevel = "complete-beginner" | "beginner" | "intermediate" | "advanced";

export interface PlacementAnswerDetail {
  questionIndex: number;
  stage: number;
  prompt: string;
  userAnswer: string;
  correctAnswer: string;
  correct: boolean;
}

export interface PlacementResult {
  level: PlacementLevel;
  score: number;
  totalQuestions: number;
  stageScores: number[];
  completedAt: string;
  answerDetails?: PlacementAnswerDetail[];
}

/* ── Static question bank ───────────────────────────────────── */

const QUESTIONS: Question[] = [
  // ── Stage 1: Alphabet & Letter Recognition (5 questions) ──
  {
    type: "mc", stage: 1,
    prompt: "What sound does the letter שׁ (Shin) make?",
    options: ["s as in sun", "sh as in show", "t as in time", "ch as in Bach"],
    correctIndex: 1,
  },
  {
    type: "mc", stage: 1,
    prompt: "Which of these is the letter Alef?",
    options: ["ב", "א", "ג", "ד"],
    correctIndex: 1,
  },
  {
    type: "mc", stage: 1,
    prompt: "What is the final form of the letter Mem (מ)?",
    options: ["ן", "ם", "ף", "ץ"],
    correctIndex: 1,
  },
  {
    type: "mc", stage: 1,
    prompt: "Which letter makes a 'v' sound?",
    options: ["ב (Vet)", "ד (Dalet)", "ז (Zayin)", "ג (Gimel)"],
    correctIndex: 0,
  },
  {
    type: "mc", stage: 1,
    prompt: "Hebrew is read from...",
    options: ["Left to right", "Right to left", "Top to bottom", "It varies"],
    correctIndex: 1,
  },

  // ── Stage 2: Basic Vocabulary (5 questions) ───────────────
  {
    type: "mc", stage: 2,
    prompt: "What does שָׁלוֹם (shalom) mean?",
    hebrewPrompt: "שָׁלוֹם",
    options: ["Goodbye", "Thank you", "Hello / Peace", "Please"],
    correctIndex: 2,
  },
  {
    type: "mc", stage: 2,
    prompt: "What does תּוֹדָה (todah) mean?",
    hebrewPrompt: "תּוֹדָה",
    options: ["Yes", "No", "Excuse me", "Thank you"],
    correctIndex: 3,
  },
  {
    type: "mc", stage: 2,
    prompt: "How do you say 'three' in Hebrew?",
    options: ["אֶחָד (echad)", "שְׁלוֹשָׁה (shlosha)", "חָמֵשׁ (chamesh)", "עֶשֶׂר (eser)"],
    correctIndex: 1,
  },
  {
    type: "mc", stage: 2,
    prompt: "What color is אָדוֹם (adom)?",
    hebrewPrompt: "אָדוֹם",
    options: ["Blue", "Green", "Red", "Yellow"],
    correctIndex: 2,
  },
  {
    type: "mc", stage: 2,
    prompt: "What does מַיִם (mayim) mean?",
    hebrewPrompt: "מַיִם",
    options: ["Bread", "Water", "Milk", "Coffee"],
    correctIndex: 1,
  },

  // ── Stage 3: Intermediate Vocabulary (5 questions) ────────
  {
    type: "mc", stage: 3,
    prompt: "What does לִכְתּוֹב (likhtov) mean?",
    hebrewPrompt: "לִכְתּוֹב",
    options: ["To read", "To speak", "To write", "To hear"],
    correctIndex: 2,
  },
  {
    type: "mc", stage: 3,
    prompt: "What is מִשְׁפָּחָה (mishpacha)?",
    hebrewPrompt: "מִשְׁפָּחָה",
    options: ["School", "Family", "Hospital", "Restaurant"],
    correctIndex: 1,
  },
  {
    type: "mc", stage: 3,
    prompt: "What does the verb לְדַבֵּר (ledaber) mean?",
    hebrewPrompt: "לְדַבֵּר",
    options: ["To eat", "To walk", "To speak", "To sleep"],
    correctIndex: 2,
  },
  {
    type: "mc", stage: 3,
    prompt: "What does עָיֵף (ayef) mean?",
    hebrewPrompt: "עָיֵף",
    options: ["Happy", "Tired", "Hungry", "Angry"],
    correctIndex: 1,
  },
  {
    type: "mc", stage: 3,
    prompt: "What is חוֹרֶף (choref)?",
    hebrewPrompt: "חוֹרֶף",
    options: ["Summer", "Spring", "Autumn", "Winter"],
    correctIndex: 3,
  },

  // ── Stage 4: Advanced / Sentence Reading (5 questions) ────
  {
    type: "mc", stage: 4,
    prompt: "What does this sentence mean?\nאֲנִי לוֹמֵד עִבְרִית",
    hebrewPrompt: "אֲנִי לוֹמֵד עִבְרִית",
    options: [
      "I speak English",
      "I am learning Hebrew",
      "I like Israeli food",
      "I live in Israel",
    ],
    correctIndex: 1,
  },
  {
    type: "mc", stage: 4,
    prompt: "What is the root system (shoresh) in Hebrew?",
    options: [
      "A way to write vowels",
      "A three-letter root that connects related words",
      "The Hebrew alphabet order",
      "A type of prayer",
    ],
    correctIndex: 1,
  },
  {
    type: "mc", stage: 4,
    prompt: "In the sentence הַיֶּלֶד קוֹרֵא סֵפֶר, what is happening?",
    hebrewPrompt: "הַיֶּלֶד קוֹרֵא סֵפֶר",
    options: [
      "The boy is writing a letter",
      "The boy is reading a book",
      "The girl is eating food",
      "The boy is playing outside",
    ],
    correctIndex: 1,
  },
  {
    type: "mc", stage: 4,
    prompt: "Which binyan (verb pattern) is the basic active form?",
    options: ["Nif'al", "Pi'el", "Pa'al", "Hitpa'el"],
    correctIndex: 2,
  },
  {
    type: "mc", stage: 4,
    prompt: "What does the prefix ה (ha-) indicate before a noun?",
    options: [
      "Plural form",
      "The definite article (the)",
      "Possession (my)",
      "A question",
    ],
    correctIndex: 1,
  },
];

const STAGE_NAMES = ["", "Alphabet", "Basic Vocabulary", "Intermediate", "Reading & Grammar"];

/* ── Words to mark known per level ──────────────────────────── */

const BEGINNER_CATEGORIES = new Set(["Greetings & Basics", "Numbers", "Colors"]);
const INTERMEDIATE_CATEGORIES = new Set([
  "Greetings & Basics", "Numbers", "Colors",
  "Food & Drink", "Family & People", "Body",
  "Common Phrases", "Time & Calendar",
]);

function getWordsToMark(level: PlacementLevel): string[] {
  if (level === "complete-beginner" || level === "beginner") return [];

  const targetCategories = level === "intermediate"
    ? BEGINNER_CATEGORIES
    : INTERMEDIATE_CATEGORIES; // advanced marks more

  return VOCABULARY
    .filter((w) => targetCategories.has(w.category))
    .map((w) => w.id);
}

/* ── Component ──────────────────────────────────────────────── */

interface PlacementTestProps {
  onComplete: (result: PlacementResult) => void;
  onSkip: () => void;
}

export default function PlacementTest({ onComplete, onSkip }: PlacementTestProps) {
  const [phase, setPhase] = useState<"welcome" | "mini-lesson" | "intro" | "testing" | "results">("welcome");
  const [miniStep, setMiniStep] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    () => new Array(QUESTIONS.length).fill(null)
  );
  const [selected, setSelected] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [reviewExpanded, setReviewExpanded] = useState(false);
  const [savedToProfile, setSavedToProfile] = useState(false);

  const { allWords } = useVocabulary();
  const { bulkMarkKnown } = useSpacedRepetition(allWords);

  const question = QUESTIONS[currentQ];
  const currentStage = question?.stage ?? 1;
  const progress = ((currentQ) / QUESTIONS.length) * 100;

  // Calculate scores per stage
  const stageScores = useMemo(() => {
    const scores = [0, 0, 0, 0, 0]; // index 0 unused, stages 1-4
    for (let i = 0; i < QUESTIONS.length; i++) {
      if (answers[i] === QUESTIONS[i].correctIndex) {
        scores[QUESTIONS[i].stage]++;
      }
    }
    return scores;
  }, [answers]);

  const totalCorrect = stageScores.reduce((a, b) => a + b, 0);

  const placementLevel = useMemo((): PlacementLevel => {
    const pct = totalCorrect / QUESTIONS.length;
    // Also check stage-specific performance
    const stage1Pct = stageScores[1] / 5;
    const stage2Pct = stageScores[2] / 5;

    if (pct >= 0.75) return "advanced";
    if (pct >= 0.55) return "intermediate";
    if (stage1Pct >= 0.6 || stage2Pct >= 0.4) return "beginner";
    return "complete-beginner";
  }, [totalCorrect, stageScores]);

  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSelect = useCallback((optionIdx: number) => {
    if (showFeedback) return;
    setSelected(optionIdx);
    setShowFeedback(true);

    setAnswers((prev) => {
      const next = [...prev];
      next[currentQ] = optionIdx;
      return next;
    });

    // Auto-advance after brief feedback
    autoAdvanceRef.current = setTimeout(() => {
      setSelected(null);
      setShowFeedback(false);
      if (currentQ + 1 >= QUESTIONS.length) {
        setPhase("results");
      } else {
        setCurrentQ((q) => q + 1);
      }
    }, 1200);
  }, [showFeedback, currentQ]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    };
  }, []);

  const answerDetails = useMemo((): PlacementAnswerDetail[] => {
    return QUESTIONS.map((q, i) => ({
      questionIndex: i,
      stage: q.stage,
      prompt: q.prompt.replace(/\n/g, " "),
      userAnswer: answers[i] !== null ? q.options[answers[i]!] : "(skipped)",
      correctAnswer: q.options[q.correctIndex],
      correct: answers[i] === q.correctIndex,
    }));
  }, [answers]);

  const downloadCSV = useCallback(() => {
    const header = "Question #,Stage,Question,Your Answer,Correct Answer,Result";
    const rows = answerDetails.map((a) => {
      const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
      return [
        a.questionIndex + 1,
        `${STAGE_NAMES[a.stage]}`,
        esc(a.prompt),
        esc(a.userAnswer),
        esc(a.correctAnswer),
        a.correct ? "Correct" : "Wrong",
      ].join(",");
    });
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `davar-placement-results.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [answerDetails]);

  const handleApplyResults = useCallback(() => {
    const result: PlacementResult = {
      level: placementLevel,
      score: totalCorrect,
      totalQuestions: QUESTIONS.length,
      stageScores,
      completedAt: new Date().toISOString(),
      answerDetails,
    };

    // Bulk mark words as known based on level
    const wordsToMark = getWordsToMark(placementLevel);
    if (wordsToMark.length > 0) {
      bulkMarkKnown(wordsToMark);
    }

    onComplete(result);
  }, [placementLevel, totalCorrect, stageScores, answerDetails, bulkMarkKnown, onComplete]);

  /* ── Intro screen ─────────────────────────────────────────── */
  /* ── Welcome screen (value-first) ─────────────────────────── */
  if (phase === "welcome") {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center">
          <div className="text-7xl mb-6">{"\u05D3\u05D1\u05E8"}</div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Welcome to <span className="text-accent">Davar</span>
          </h1>
          <p className="text-text-secondary mb-8 text-lg">
            Learn Hebrew through interactive stories, games, and spaced repetition
          </p>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              { icon: "\uD83C\uDFAF", label: "Daily Challenges" },
              { icon: "\uD83C\uDF31", label: "Vocabulary Garden" },
              { icon: "\uD83D\uDCD6", label: "Interactive Stories" },
              { icon: "\uD83C\uDFC6", label: "Weekly Leagues" },
            ].map((f) => (
              <div key={f.label} className="bg-bg-card border border-border rounded-xl p-3 text-center">
                <div className="text-2xl mb-1">{f.icon}</div>
                <div className="text-xs text-text-secondary">{f.label}</div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setPhase("mini-lesson")}
            className="w-full py-3.5 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold text-lg transition-colors mb-3"
          >
            Try Your First Hebrew Word
          </button>
          <p className="text-xs text-text-muted">No signup needed — jump right in!</p>
        </div>
      </div>
    );
  }

  /* ── Mini-lesson (endowed progress) ─────────────────────────── */
  if (phase === "mini-lesson") {
    const miniSteps = [
      {
        title: "Your first word",
        instruction: "This is how you say 'hello' and 'peace' in Hebrew:",
        hebrew: "\u05E9\u05B8\u05C1\u05DC\u05D5\u05B9\u05DD",
        transliteration: "shalom",
        translation: "hello / peace",
      },
      {
        title: "You already know one!",
        instruction: "Now try this — it means 'thank you':",
        hebrew: "\u05EA\u05BC\u05D5\u05B9\u05D3\u05B8\u05D4",
        transliteration: "todah",
        translation: "thank you",
      },
      {
        title: "One more!",
        instruction: "This one means 'yes':",
        hebrew: "\u05DB\u05BC\u05B5\u05DF",
        transliteration: "ken",
        translation: "yes",
      },
    ];

    const step = miniSteps[miniStep];
    const isLast = miniStep === miniSteps.length - 1;
    const progress = ((miniStep + 1) / miniSteps.length) * 100;

    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          {/* Progress bar — endowed progress: start at 33% */}
          <div className="mb-8">
            <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-text-muted text-center mt-2">
              {miniStep + 1} of {miniSteps.length} words learned!
            </p>
          </div>

          <div className="bg-bg-card border border-border rounded-2xl p-8 text-center">
            <h2 className="text-lg font-semibold text-accent mb-2">{step.title}</h2>
            <p className="text-sm text-text-secondary mb-6">{step.instruction}</p>

            <div className="hebrew-text text-5xl font-bold text-text-primary mb-3">
              {step.hebrew}
            </div>
            <div className="text-lg text-text-secondary mb-1">{step.transliteration}</div>
            <div className="text-base text-accent font-medium">{step.translation}</div>
          </div>

          <div className="mt-6 text-center">
            {!isLast ? (
              <button
                onClick={() => setMiniStep((s) => s + 1)}
                className="w-full py-3.5 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold text-lg transition-colors"
              >
                Next Word
              </button>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="bg-accent-green/10 border border-accent-green/20 rounded-xl p-4 mb-2">
                  <p className="text-accent-green font-semibold">
                    {"\u2728"} You just learned 3 Hebrew words!
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    You&apos;re already making progress. Let&apos;s find the right level for you.
                  </p>
                </div>
                <button
                  onClick={() => setPhase("intro")}
                  className="w-full py-3.5 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold text-lg transition-colors"
                >
                  Take Placement Test
                </button>
                <button
                  onClick={onSkip}
                  className="text-text-muted hover:text-text-secondary text-sm transition-colors"
                >
                  Skip — start from the beginning
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── Placement intro ────────────────────────────────────────── */
  if (phase === "intro") {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center">
          <div className="text-6xl mb-4">{"\uD83C\uDFAF"}</div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Placement Assessment
          </h1>
          <p className="text-text-secondary mb-8">
            20 quick questions to personalize your experience
          </p>

          <div className="bg-bg-card border border-border rounded-2xl p-8 mb-6 text-left">
            <div className="flex flex-col gap-2 text-sm text-text-muted">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-bold">1</span>
                Alphabet recognition
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-bold">2</span>
                Basic vocabulary
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-bold">3</span>
                Intermediate words
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-bold">4</span>
                Reading & grammar
              </div>
            </div>
          </div>

          <button
            onClick={() => setPhase("testing")}
            className="w-full py-3.5 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold text-lg transition-colors mb-3"
          >
            Start Assessment
          </button>
          <button
            onClick={onSkip}
            className="text-text-muted hover:text-text-secondary text-sm transition-colors"
          >
            Skip — I&apos;m a complete beginner
          </button>
        </div>
      </div>
    );
  }

  /* ── Results screen ───────────────────────────────────────── */
  if (phase === "results") {
    const pct = Math.round((totalCorrect / QUESTIONS.length) * 100);

    const levelLabels: Record<PlacementLevel, { label: string; desc: string; emoji: string; color: string; startMode: string }> = {
      "complete-beginner": {
        label: "Complete Beginner",
        desc: "We'll start you from the very basics — the Hebrew alphabet and your first words.",
        emoji: "🌱",
        color: "text-accent-green",
        startMode: "Start with the Alphabet",
      },
      beginner: {
        label: "Beginner",
        desc: "You know some basics! We'll start you with vocabulary building and simple reading.",
        emoji: "🌿",
        color: "text-accent-green",
        startMode: "Start with Flashcards",
      },
      intermediate: {
        label: "Intermediate",
        desc: "Nice foundation! We've marked basic words as known so you can focus on expanding your skills.",
        emoji: "🌳",
        color: "text-accent-blue",
        startMode: "Start with Reading",
      },
      advanced: {
        label: "Advanced",
        desc: "Impressive! We've marked common vocabulary as known. Jump into grammar, reading, and conversation.",
        emoji: "🏔️",
        color: "text-accent-yellow",
        startMode: "Start with Grammar",
      },
    };

    const info = levelLabels[placementLevel];
    const wordsToMark = getWordsToMark(placementLevel);

    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center">
          <div className="text-6xl mb-4">{info.emoji}</div>
          <h2 className="text-2xl font-bold text-text-primary mb-1">
            Your Level: <span className={info.color}>{info.label}</span>
          </h2>
          <p className="text-text-muted text-sm mb-6">
            {totalCorrect}/{QUESTIONS.length} correct ({pct}%)
          </p>

          {/* Stage breakdown */}
          <div className="bg-bg-card border border-border rounded-2xl p-6 mb-6 text-left">
            <div className="flex flex-col gap-3">
              {[1, 2, 3, 4].map((stage) => {
                const stagePct = Math.round((stageScores[stage] / 5) * 100);
                return (
                  <div key={stage}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-text-secondary">{STAGE_NAMES[stage]}</span>
                      <span className="text-text-muted">{stageScores[stage]}/5</span>
                    </div>
                    <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          stagePct >= 80 ? "bg-accent-green" : stagePct >= 40 ? "bg-accent-yellow" : "bg-accent"
                        )}
                        style={{ width: `${stagePct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-bg-card border border-border rounded-2xl p-6 mb-6 text-left">
            <p className="text-text-secondary text-sm">{info.desc}</p>
            {wordsToMark.length > 0 && (
              <p className="text-text-muted text-xs mt-2">
                {wordsToMark.length} words will be marked as known to speed up your start.
              </p>
            )}
          </div>

          {/* Review answers */}
          <div className="mb-6">
            <button
              onClick={() => setReviewExpanded((v) => !v)}
              className="w-full flex items-center justify-between bg-bg-card border border-border rounded-xl px-4 py-3 text-sm font-medium text-text-secondary hover:bg-bg-card-hover transition-colors"
            >
              <span>Review Your Answers</span>
              <span className={cn("transition-transform", reviewExpanded && "rotate-180")}>
                ▼
              </span>
            </button>

            {reviewExpanded && (
              <div className="mt-2 bg-bg-card border border-border rounded-xl overflow-hidden">
                <div className="max-h-80 overflow-y-auto">
                  {answerDetails.map((a, i) => (
                    <div
                      key={i}
                      className={cn(
                        "px-4 py-3 border-b border-border last:border-b-0 text-left text-sm",
                        a.correct ? "bg-accent-green/5" : "bg-red-500/5"
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <span className={cn(
                          "shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5",
                          a.correct ? "bg-accent-green/20 text-accent-green" : "bg-red-500/20 text-red-400"
                        )}>
                          {a.correct ? "✓" : "✗"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-text-primary font-medium leading-snug">{a.prompt}</p>
                          <p className="text-text-muted text-xs mt-1">
                            Your answer: <span className={a.correct ? "text-accent-green" : "text-red-400"}>{a.userAnswer}</span>
                            {!a.correct && (
                              <span className="text-text-secondary"> — Correct: <span className="text-accent-green">{a.correctAnswer}</span></span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Download & save */}
          <div className="flex gap-3 mb-4">
            <button
              onClick={downloadCSV}
              className="flex-1 py-2.5 rounded-xl border border-border bg-bg-card hover:bg-bg-card-hover text-text-secondary text-sm font-medium transition-colors"
            >
              Download CSV
            </button>
            <button
              onClick={() => {
                try {
                  localStorage.setItem("davar-placement-answers", JSON.stringify(answerDetails));
                  setSavedToProfile(true);
                } catch { /* quota */ }
              }}
              disabled={savedToProfile}
              className={cn(
                "flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors",
                savedToProfile
                  ? "border-accent-green/30 bg-accent-green/10 text-accent-green cursor-default"
                  : "border-border bg-bg-card hover:bg-bg-card-hover text-text-secondary"
              )}
            >
              {savedToProfile ? "Saved!" : "Save to Profile"}
            </button>
          </div>

          <button
            onClick={handleApplyResults}
            className="w-full py-3.5 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold text-lg transition-colors"
          >
            {info.startMode}
          </button>
        </div>
      </div>
    );
  }

  /* ── Question screen ──────────────────────────────────────── */
  const isCorrect = selected === question.correctIndex;

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Progress bar */}
      <div className="sticky top-0 z-50 bg-bg-secondary/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={onSkip}
            className="text-text-muted hover:text-text-secondary text-sm transition-colors shrink-0"
          >
            Skip
          </button>
          <div className="flex-1">
            <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <span className="text-xs text-text-muted shrink-0">
            {currentQ + 1}/{QUESTIONS.length}
          </span>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          {/* Stage label */}
          <div className="text-center mb-2">
            <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
              Stage {currentStage} — {STAGE_NAMES[currentStage]}
            </span>
          </div>

          {/* Hebrew prompt */}
          {question.hebrewPrompt && (
            <div className="text-center mb-4">
              <span className="hebrew-text text-4xl text-text-primary">
                {question.hebrewPrompt}
              </span>
            </div>
          )}

          {/* Question text */}
          <h2 className="text-lg font-semibold text-text-primary text-center mb-6 whitespace-pre-line">
            {question.prompt}
          </h2>

          {/* Options */}
          <div className="flex flex-col gap-3">
            {question.options.map((option, idx) => {
              let optionStyle = "border-border bg-bg-card hover:bg-bg-card-hover hover:border-accent/30";

              if (showFeedback) {
                if (idx === question.correctIndex) {
                  optionStyle = "border-accent-green bg-accent-green/10 text-accent-green";
                } else if (idx === selected && !isCorrect) {
                  optionStyle = "border-red-500 bg-red-500/10 text-red-400";
                } else {
                  optionStyle = "border-border bg-bg-card opacity-50";
                }
              } else if (idx === selected) {
                optionStyle = "border-accent bg-accent/10";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={showFeedback}
                  className={cn(
                    "w-full p-4 rounded-xl border text-left transition-all text-sm font-medium",
                    optionStyle,
                    !showFeedback && "cursor-pointer"
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full border border-current/30 flex items-center justify-center text-xs font-bold shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    {option}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Feedback (auto-advances) */}
          {showFeedback && (
            <div className="mt-4 animate-[fadeIn_0.15s_ease-out] text-center">
              <p className={cn(
                "font-medium",
                isCorrect ? "text-accent-green" : "text-red-400"
              )}>
                {isCorrect ? "Correct!" : `Answer: ${question.options[question.correctIndex]}`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
