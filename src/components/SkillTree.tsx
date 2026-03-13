"use client";

import { useMemo } from "react";
import { AppMode } from "@/types";
import { useVocabulary } from "@/hooks/useVocabulary";
import { useSpacedRepetition } from "@/hooks/useSpacedRepetition";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useXP } from "@/hooks/useXP";
import { isWordMastered } from "@/lib/sm2";
import { PASSAGES } from "@/data/passages";
import { cn } from "@/lib/utils";

/* ── Types ────────────────────────────────────────────────── */

interface Lesson {
  id: string;
  title: string;
  titleHebrew: string;
  mode: AppMode;
  icon: string;
  description: string;
}

interface Unit {
  id: string;
  title: string;
  titleHebrew: string;
  description: string;
  lessons: Lesson[];
  unlockCondition: (ctx: ProgressContext) => boolean;
}

interface ProgressContext {
  wordsReviewed: number;
  wordsMastered: number;
  totalReviews: number;
  linesRead: number;
  passagesComplete: number;
  level: number;
}

/* ── Curriculum ───────────────────────────────────────────── */

const CURRICULUM: Unit[] = [
  {
    id: "foundations",
    title: "Foundations",
    titleHebrew: "יְסוֹדוֹת",
    description: "Learn the Hebrew alphabet and basic writing",
    lessons: [
      { id: "f1", title: "The Aleph-Bet", titleHebrew: "אָלֶף-בֵּית", mode: "alphabet", icon: "\u05D0", description: "Learn all 22 Hebrew letters" },
      { id: "f2", title: "Writing Practice", titleHebrew: "כְּתִיבָה", mode: "writing", icon: "\u270D\uFE0F", description: "Trace and type Hebrew letters" },
      { id: "f3", title: "First Words", titleHebrew: "מִלִּים רִאשׁוֹנוֹת", mode: "flashcards", icon: "\uD83C\uDFB4", description: "Learn greetings and basics" },
    ],
    unlockCondition: () => true,
  },
  {
    id: "basics",
    title: "Building Blocks",
    titleHebrew: "אַבְנֵי בִּנְיָן",
    description: "Core vocabulary and your first quiz",
    lessons: [
      { id: "b1", title: "Vocabulary Drill", titleHebrew: "תַּרְגִּיל אוֹצַר מִלִּים", mode: "flashcards", icon: "\uD83D\uDCDA", description: "Build your word bank" },
      { id: "b2", title: "Test Yourself", titleHebrew: "בְּחִינָה", mode: "quiz", icon: "\u2753", description: "Quiz on what you've learned" },
      { id: "b3", title: "Match It", titleHebrew: "הַתְאָמָה", mode: "matching", icon: "\uD83C\uDFAF", description: "Hebrew-English matching game" },
    ],
    unlockCondition: (ctx) => ctx.wordsReviewed >= 10,
  },
  {
    id: "listening",
    title: "Hear Hebrew",
    titleHebrew: "לִשְׁמוֹעַ עִבְרִית",
    description: "Train your ear with audio exercises",
    lessons: [
      { id: "l1", title: "Word Dictation", titleHebrew: "הַכְתָּבָה", mode: "listening", icon: "\uD83C\uDFA7", description: "Listen and identify words" },
      { id: "l2", title: "Sentence Listening", titleHebrew: "הַאֲזָנָה", mode: "listening", icon: "\uD83D\uDD0A", description: "Understand full sentences" },
    ],
    unlockCondition: (ctx) => ctx.wordsReviewed >= 30,
  },
  {
    id: "reading",
    title: "Start Reading",
    titleHebrew: "לְהַתְחִיל לִקְרוֹא",
    description: "Read your first Hebrew passages",
    lessons: [
      { id: "r1", title: "Beginner Passages", titleHebrew: "קְטָעִים לְמַתְחִילִים", mode: "reading", icon: "\uD83D\uDCD6", description: "Short, simple Hebrew texts" },
      { id: "r2", title: "Fill the Blanks", titleHebrew: "הַשְׁלָמָה", mode: "cloze", icon: "\u270F\uFE0F", description: "Cloze exercises from passages" },
    ],
    unlockCondition: (ctx) => ctx.wordsMastered >= 15,
  },
  {
    id: "grammar",
    title: "Grammar Patterns",
    titleHebrew: "דִּקְדּוּק",
    description: "Verb patterns and conjugation",
    lessons: [
      { id: "g1", title: "Verb Tables", titleHebrew: "טַבְלָאוֹת פְּעָלִים", mode: "grammar", icon: "\uD83D\uDCCB", description: "Learn Pa'al, Pi'el, Hif'il" },
      { id: "g2", title: "Conjugation Drill", titleHebrew: "תַּרְגִּיל הֲטָיָה", mode: "grammar", icon: "\uD83D\uDD04", description: "Practice verb forms" },
    ],
    unlockCondition: (ctx) => ctx.wordsMastered >= 30 && ctx.linesRead >= 10,
  },
  {
    id: "immersion",
    title: "Immersion",
    titleHebrew: "טְבִילָה",
    description: "Advanced reading and real-world skills",
    lessons: [
      { id: "i1", title: "Intermediate Texts", titleHebrew: "קְטָעִים בֵּינוֹנִיִּים", mode: "reading", icon: "\uD83D\uDCF0", description: "Longer, more complex passages" },
      { id: "i2", title: "Prayer Practice", titleHebrew: "תְּפִלָּה", mode: "prayers", icon: "\uD83D\uDD4E", description: "Learn traditional prayers" },
    ],
    unlockCondition: (ctx) => ctx.passagesComplete >= 3 && ctx.wordsMastered >= 50,
  },
  {
    id: "conversation",
    title: "Speak Hebrew",
    titleHebrew: "לְדַבֵּר עִבְרִית",
    description: "Converse with an AI Hebrew tutor",
    lessons: [
      { id: "c1", title: "AI Conversation", titleHebrew: "שִׂיחָה", mode: "conversation", icon: "\uD83D\uDCAC", description: "Practice speaking scenarios" },
      { id: "c2", title: "Advanced Cloze", titleHebrew: "הַשְׁלָמָה מִתְקַדֶּמֶת", mode: "cloze", icon: "\uD83E\uDDE9", description: "Harder fill-in-the-blank" },
    ],
    unlockCondition: (ctx) => ctx.level >= 5 && ctx.wordsMastered >= 60,
  },
  {
    id: "mastery",
    title: "Mastery",
    titleHebrew: "מַיְסְטְרוֹ",
    description: "Advanced texts and full fluency practice",
    lessons: [
      { id: "m1", title: "Advanced Passages", titleHebrew: "קְטָעִים מִתְקַדְּמִים", mode: "reading", icon: "\uD83C\uDFC6", description: "Complex real-world Hebrew" },
      { id: "m2", title: "Free Conversation", titleHebrew: "שִׂיחָה חוֹפְשִׁית", mode: "conversation", icon: "\uD83C\uDF1F", description: "Open-ended Hebrew practice" },
    ],
    unlockCondition: (ctx) => ctx.level >= 10 && ctx.passagesComplete >= 8,
  },
];

/* ── Component ────────────────────────────────────────────── */

interface SkillTreeProps {
  onNavigate: (mode: AppMode) => void;
}

export default function SkillTree({ onNavigate }: SkillTreeProps) {
  const { allWords } = useVocabulary();
  const { cardStates, totalReviews, masteredCount } = useSpacedRepetition(allWords);
  const { level: xpLevel } = useXP();

  const [completedLines] = useLocalStorage<Record<string, number[]>>(
    "davar-completed-lines",
    {}
  );

  const ctx: ProgressContext = useMemo(() => {
    const linesRead = Object.values(completedLines).reduce(
      (sum, lines) => sum + lines.length,
      0
    );
    const passagesComplete = PASSAGES.filter((p) => {
      const done = (completedLines[p.id] ?? []).length;
      return done >= p.lines.length;
    }).length;

    return {
      wordsReviewed: Object.keys(cardStates).length,
      wordsMastered: masteredCount,
      totalReviews,
      linesRead,
      passagesComplete,
      level: xpLevel,
    };
  }, [cardStates, masteredCount, totalReviews, completedLines, xpLevel]);

  const unitStates = useMemo(() => {
    return CURRICULUM.map((unit, i) => {
      const unlocked = unit.unlockCondition(ctx);
      // A unit is "current" if it's unlocked but the next one isn't
      const nextUnit = CURRICULUM[i + 1];
      const isCurrent = unlocked && (!nextUnit || !nextUnit.unlockCondition(ctx));
      return { ...unit, unlocked, isCurrent };
    });
  }, [ctx]);

  return (
    <div className="flex flex-col items-center gap-0 py-4">
      {unitStates.map((unit, unitIdx) => (
        <div key={unit.id} className="flex flex-col items-center w-full max-w-md">
          {/* Connector line from previous */}
          {unitIdx > 0 && (
            <div
              className={cn(
                "w-0.5 h-8",
                unit.unlocked ? "bg-accent" : "bg-border"
              )}
            />
          )}

          {/* Unit header */}
          <div
            className={cn(
              "w-full rounded-2xl border-2 p-5 transition-all",
              unit.isCurrent
                ? "border-accent bg-accent/5 shadow-lg shadow-accent/10"
                : unit.unlocked
                  ? "border-accent/40 bg-bg-card"
                  : "border-border bg-bg-secondary/50 opacity-60"
            )}
          >
            {/* Unit title row */}
            <div className="flex items-center justify-between mb-1">
              <div>
                <h3
                  className={cn(
                    "font-bold",
                    unit.unlocked ? "text-text-primary" : "text-text-muted"
                  )}
                >
                  {unit.title}
                </h3>
                <span className="hebrew-text text-xs text-text-muted">
                  {unit.titleHebrew}
                </span>
              </div>
              {!unit.unlocked && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-text-muted" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              )}
              {unit.isCurrent && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-white font-medium animate-pulse">
                  CURRENT
                </span>
              )}
            </div>
            <p
              className={cn(
                "text-xs mb-4",
                unit.unlocked ? "text-text-secondary" : "text-text-muted"
              )}
            >
              {unit.description}
            </p>

            {/* Lessons */}
            <div className="flex flex-col gap-2">
              {unit.lessons.map((lesson) => (
                <button
                  key={lesson.id}
                  onClick={() => unit.unlocked && onNavigate(lesson.mode)}
                  disabled={!unit.unlocked}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                    unit.unlocked
                      ? "bg-bg-secondary/80 hover:bg-accent/10 hover:scale-[1.01] cursor-pointer"
                      : "bg-bg-secondary/30 cursor-not-allowed"
                  )}
                >
                  <span
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-lg",
                      unit.unlocked
                        ? "bg-accent/15"
                        : "bg-bg-secondary"
                    )}
                  >
                    {unit.unlocked ? lesson.icon : "\uD83D\uDD12"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span
                      className={cn(
                        "text-sm font-medium block",
                        unit.unlocked ? "text-text-primary" : "text-text-muted"
                      )}
                    >
                      {lesson.title}
                    </span>
                    <span className="text-[11px] text-text-muted">
                      {unit.unlocked ? lesson.description : "Complete previous unit to unlock"}
                    </span>
                  </div>
                  {unit.unlocked && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-text-muted shrink-0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* End marker */}
      <div className="w-0.5 h-8 bg-border" />
      <div className="w-12 h-12 rounded-full border-2 border-border flex items-center justify-center">
        <span className="text-xl">{"\uD83C\uDF1F"}</span>
      </div>
      <p className="text-xs text-text-muted mt-2">Hebrew Mastery</p>
    </div>
  );
}
