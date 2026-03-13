"use client";

import { useState, useMemo, useCallback, Fragment } from "react";
import { VERB_PATTERNS, GRAMMAR_LESSONS, CONJUGATION_EXERCISES, HEBREW_ADJECTIVES, ConjugationExercise, HebrewAdjective } from "@/data/grammar";
import { useSettings } from "@/hooks/useSettings";
import { useXP } from "@/hooks/useXP";
import { useStreak } from "@/hooks/useStreak";
import { prompt, PROMPTS, hasAIConsent } from "@/lib/ai";
import AIConsentDialog from "./AIConsentDialog";
import AudioButton from "./AudioButton";
import { cn, shuffle } from "@/lib/utils";
import { AppMode } from "@/types";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { SK_GRAMMAR_COMPLETED } from "@/lib/storage-keys";

type GrammarTab = "conjugation" | "practice" | "trainer" | "adjectives" | "lessons";

/* ── Grammar → Story suggestion mapping ──────────────────── */

interface StorySuggestion {
  storyTitle: string;
  chapterTitle: string;
  description: string;
}

/** Map lesson IDs / grammar contexts to a relevant story */
function getStorySuggestion(context: {
  tab: GrammarTab;
  lessonId?: string | null;
  tense?: string;
}): StorySuggestion {
  const { tab, lessonId, tense } = context;

  // Lessons about basic vocabulary / pronouns → "The Market Adventure" (beginner)
  if (
    lessonId === "pronouns" ||
    lessonId === "definite-article" ||
    lessonId === "question-words" ||
    lessonId === "numbers-intro" ||
    lessonId === "prepositions" ||
    lessonId === "gender-nouns" ||
    lessonId === "plurals"
  ) {
    return {
      storyTitle: "The Market Adventure",
      chapterTitle: "A New Morning",
      description: "uses basic vocabulary and greetings in context",
    };
  }

  // Lessons about past tense / conjugation → "University Days" (intermediate)
  if (
    lessonId === "present-tense" ||
    lessonId === "binyanim-overview" ||
    lessonId === "negation" ||
    lessonId === "direct-object-et" ||
    tab === "practice" ||
    (tab === "conjugation" && tense === "past")
  ) {
    return {
      storyTitle: "University Days",
      chapterTitle: "The First Day",
      description: "uses past tense and verb conjugation in context",
    };
  }

  // Lessons about imperatives / commands → "Cafe Conversations" (dialogue)
  if (lessonId === "imperative" || lessonId === "modals") {
    return {
      storyTitle: "Caf\u00E9 Conversations",
      chapterTitle: "The First Order",
      description: "features dialogue with commands and requests",
    };
  }

  // Lessons about relative clauses / conditionals → "The Job Interview" (advanced)
  if (lessonId === "relative-clauses" || lessonId === "conditionals") {
    return {
      storyTitle: "The Job Interview",
      chapterTitle: "Preparing",
      description: "uses complex grammar in realistic scenarios",
    };
  }

  // Trainer / adjectives → University Days (intermediate grammar-heavy)
  if (tab === "trainer" || tab === "adjectives" || lessonId === "adjectives" || lessonId === "possessives" || lessonId === "construct-state") {
    return {
      storyTitle: "University Days",
      chapterTitle: "The First Lecture",
      description: "has rich descriptive language and adjective use",
    };
  }

  // Default → "Lost in Jerusalem" (intermediate)
  return {
    storyTitle: "Lost in Jerusalem",
    chapterTitle: "The Old City",
    description: "uses a mix of grammar patterns in an engaging story",
  };
}

const ADJECTIVE_NOUNS: { label: string; form: "ms" | "fs" | "mp" | "fp" }[] = [
  { label: "The boy (הילד)", form: "ms" },
  { label: "The girl (הילדה)", form: "fs" },
  { label: "The boys (הילדים)", form: "mp" },
  { label: "The girls (הילדות)", form: "fp" },
  { label: "The man (האיש)", form: "ms" },
  { label: "The woman (האישה)", form: "fs" },
  { label: "The men (האנשים)", form: "mp" },
  { label: "The women (הנשים)", form: "fp" },
  { label: "The book (הספר)", form: "ms" },
  { label: "The city (העיר)", form: "fs" },
  { label: "The books (הספרים)", form: "mp" },
  { label: "The cities (הערים)", form: "fp" },
];

export default function GrammarMode({ onNavigate }: { onNavigate?: (mode: AppMode) => void }) {
  const [tab, setTab] = useState<GrammarTab>("conjugation");
  const [selectedPattern, setSelectedPattern] = useState(0);
  const [selectedTense, setSelectedTense] = useState<"past" | "present" | "future">("past");
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useLocalStorage<string[]>(SK_GRAMMAR_COMPLETED, []);

  // Practice mode state
  const [practiceAnswer, setPracticeAnswer] = useState("");
  const [practiceIdx, setPracticeIdx] = useState(0);
  const [showResult, setShowResult] = useState<"correct" | "incorrect" | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [grammarHint, setGrammarHint] = useState("");
  const [grammarHintLoading, setGrammarHintLoading] = useState(false);

  // Trainer mode state
  const [trainerIdx, setTrainerIdx] = useState(0);
  const [trainerSelected, setTrainerSelected] = useState<string | null>(null);
  const [trainerResult, setTrainerResult] = useState<"correct" | "incorrect" | null>(null);
  const [trainerScore, setTrainerScore] = useState({ correct: 0, total: 0 });

  // Adjective mode state
  const [adjIdx, setAdjIdx] = useState(0);
  const [adjSelected, setAdjSelected] = useState<string | null>(null);
  const [adjResult, setAdjResult] = useState<"correct" | "incorrect" | null>(null);
  const [adjScore, setAdjScore] = useState({ correct: 0, total: 0 });

  // AI consent state
  const [showAIConsent, setShowAIConsent] = useState(false);

  const { settings } = useSettings();
  const { awardXP } = useXP();

  const pattern = VERB_PATTERNS[selectedPattern];
  const conjugations =
    selectedTense === "past"
      ? pattern.pastTense
      : selectedTense === "present"
        ? pattern.presentTense
        : pattern.futureTense ?? [];

  const practiceItems = useMemo(() => {
    const items = VERB_PATTERNS.flatMap((p) => [
      ...p.pastTense.map((c) => ({ ...c, tense: "past" as const, pattern: p.name })),
      ...p.presentTense.map((c) => ({ ...c, tense: "present" as const, pattern: p.name })),
      ...(p.futureTense ?? []).map((c) => ({ ...c, tense: "future" as const, pattern: p.name })),
    ]);
    return shuffle(items);
  }, []);

  const trainerExercises = useMemo(() => shuffle([...CONJUGATION_EXERCISES]), []);
  const currentExercise = trainerExercises[trainerIdx % trainerExercises.length];
  const trainerOptions = useMemo(
    () => shuffle([currentExercise.correctAnswer, ...currentExercise.distractors]),
    [currentExercise]
  );

  const adjExercises = useMemo(() => {
    const items = HEBREW_ADJECTIVES.flatMap((adj) =>
      ADJECTIVE_NOUNS.map((noun) => ({ adj, noun }))
    );
    return shuffle(items);
  }, []);
  const currentAdj = adjExercises[adjIdx % adjExercises.length];
  const adjOptions = useMemo(() => {
    const correct = currentAdj.adj.forms[currentAdj.noun.form];
    const others = (["ms", "fs", "mp", "fp"] as const)
      .filter((f) => f !== currentAdj.noun.form)
      .map((f) => currentAdj.adj.forms[f]);
    return shuffle([correct, ...others]);
  }, [currentAdj]);

  const currentPractice = practiceItems[practiceIdx % practiceItems.length];

  const checkAnswer = () => {
    if (!practiceAnswer.trim()) return;
    const clean = practiceAnswer.trim();
    const correct =
      clean === currentPractice.hebrew ||
      clean === currentPractice.hebrewNikud ||
      clean === currentPractice.transliteration;
    setShowResult(correct ? "correct" : "incorrect");
    setScore((s) => ({
      correct: s.correct + (correct ? 1 : 0),
      total: s.total + 1,
    }));
  };

  const nextPractice = () => {
    setPracticeIdx((i) => i + 1);
    setPracticeAnswer("");
    setShowResult(null);
    setGrammarHint("");
    setGrammarHintLoading(false);
  };

  const doFetchGrammarHint = useCallback(async () => {
    setGrammarHintLoading(true);
    const context = `${currentPractice.pattern} pattern, ${currentPractice.tense} tense, ${currentPractice.person}`;
    const res = await prompt(
      PROMPTS.grammarHint(currentPractice.hebrewNikud, context),
      settings,
      "You are a Hebrew grammar tutor. Explain the verb conjugation pattern briefly."
    );
    setGrammarHint(res.text || res.error || "");
    setGrammarHintLoading(false);
  }, [currentPractice, settings]);

  const fetchGrammarHint = useCallback(() => {
    if (grammarHintLoading) return;
    if (settings.aiProvider === "none" || !settings.aiApiKey) {
      setGrammarHint("Configure an AI provider in Settings for smart hints.");
      return;
    }
    if (!hasAIConsent()) {
      setShowAIConsent(true);
      return;
    }
    doFetchGrammarHint();
  }, [settings, grammarHintLoading, doFetchGrammarHint]);

  return (
    <div className="flex flex-col gap-6">
      {showAIConsent && (
        <AIConsentDialog
          provider={settings.aiProvider}
          onAccept={() => {
            setShowAIConsent(false);
            doFetchGrammarHint();
          }}
          onDecline={() => setShowAIConsent(false)}
        />
      )}

      {/* Tab bar */}
      <div className="flex gap-2 flex-wrap">
        {(
          [
            { key: "conjugation", label: "Tables" },
            { key: "practice", label: "Practice" },
            { key: "trainer", label: "Trainer" },
            { key: "adjectives", label: "Adjectives" },
            { key: "lessons", label: "Lessons" },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium transition-colors border",
              tab === t.key
                ? "bg-accent text-white border-accent"
                : "bg-bg-card text-text-secondary border-border hover:border-accent/50"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Conjugation Tables */}
      {tab === "conjugation" && (
        <div className="flex flex-col gap-4">
          {/* Pattern selector */}
          <div className="flex gap-2 flex-wrap">
            {VERB_PATTERNS.map((p, i) => (
              <button
                key={p.name}
                onClick={() => setSelectedPattern(i)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-colors border",
                  selectedPattern === i
                    ? "bg-accent-blue/20 text-accent-blue border-accent-blue/40"
                    : "bg-bg-card text-text-secondary border-border hover:border-accent-blue/30"
                )}
              >
                <span className="hebrew-text mr-2">{p.hebrewName}</span>
                {p.name}
              </button>
            ))}
          </div>

          {/* Pattern info */}
          <div className="bg-bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-text-primary">
                {pattern.name}
              </h3>
              <span className="hebrew-text text-xl text-accent">
                {pattern.hebrewName}
              </span>
            </div>
            <p className="text-sm text-text-secondary mb-2">
              {pattern.description}
            </p>
            <p className="text-xs text-text-muted">
              Example root:{" "}
              <span className="hebrew-text text-accent-blue">
                {pattern.example.root}
              </span>{" "}
              — {pattern.example.meaning}
            </p>
          </div>

          {/* Tense toggle */}
          <div className="flex gap-2">
            {(["past", "present", "future"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTense(t)}
                disabled={t === "future" && !pattern.futureTense}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  selectedTense === t
                    ? "bg-accent/15 text-accent"
                    : "text-text-muted hover:text-text-secondary",
                  t === "future" && !pattern.futureTense && "opacity-40 cursor-not-allowed"
                )}
              >
                {t === "past" ? "Past" : t === "present" ? "Present" : "Future"}
              </button>
            ))}
          </div>

          {/* Conjugation table */}
          <div className="bg-bg-card rounded-2xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-text-muted font-medium">
                    Person
                  </th>
                  <th className="text-right px-4 py-3 text-text-muted font-medium hebrew-text">
                    Hebrew
                  </th>
                  <th className="text-left px-4 py-3 text-text-muted font-medium">
                    Transliteration
                  </th>
                  <th className="px-4 py-3 w-10" />
                </tr>
              </thead>
              <tbody>
                {conjugations.map((c, i) => (
                  <tr
                    key={i}
                    className="border-b border-border/50 hover:bg-bg-card-hover transition-colors"
                  >
                    <td className="px-4 py-3 text-text-secondary">
                      {c.person}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="hebrew-text text-lg text-text-primary">
                        {c.hebrewNikud}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-accent italic">
                      {c.transliteration}
                    </td>
                    <td className="px-4 py-3">
                      <AudioButton text={c.hebrew} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Practice Mode */}
      {tab === "practice" && (
        <div className="bg-bg-card rounded-2xl border border-border p-6">
          <div className="text-center mb-6">
            <div className="text-xs text-text-muted mb-1">
              Score: {score.correct}/{score.total}
              {score.total > 0 &&
                ` (${Math.round((score.correct / score.total) * 100)}%)`}
            </div>
            <p className="text-sm text-text-secondary mb-4">
              Conjugate the verb in{" "}
              <span className="text-accent font-medium">
                {currentPractice.pattern}
              </span>{" "}
              —{" "}
              <span className="text-accent-blue font-medium">
                {currentPractice.tense} tense
              </span>
            </p>

            <div className="bg-bg-secondary rounded-xl p-6 mb-4">
              <p className="text-text-muted text-sm mb-2">Person:</p>
              <p className="text-2xl font-bold text-text-primary">
                {currentPractice.person}
              </p>
            </div>

            <div className="flex items-center gap-3 max-w-md mx-auto">
              <input
                type="text"
                value={practiceAnswer}
                onChange={(e) => setPracticeAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (showResult) nextPractice();
                    else checkAnswer();
                  }
                }}
                placeholder="Type Hebrew or transliteration"
                dir="rtl"
                className="flex-1 px-4 py-3 bg-bg-secondary border border-border rounded-xl text-text-primary hebrew-text text-lg text-center"
                disabled={showResult !== null}
              />
              {showResult === null ? (
                <button
                  onClick={checkAnswer}
                  className="px-5 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-medium text-sm transition-colors"
                >
                  Check
                </button>
              ) : (
                <button
                  onClick={nextPractice}
                  className="px-5 py-3 rounded-xl bg-accent-blue/20 text-accent-blue font-medium text-sm transition-colors hover:bg-accent-blue/30"
                >
                  Next
                </button>
              )}
            </div>

            {showResult && (
              <div className="mt-4 animate-[fadeIn_0.2s_ease-out]">
                {showResult === "correct" ? (
                  <p className="text-accent-green font-medium">Correct!</p>
                ) : (
                  <div>
                    <p className="text-red-400 font-medium mb-1">Incorrect</p>
                    <p className="text-text-secondary text-sm">
                      Correct answer:{" "}
                      <span className="hebrew-text text-lg text-text-primary">
                        {currentPractice.hebrewNikud}
                      </span>{" "}
                      <span className="text-accent italic">
                        ({currentPractice.transliteration})
                      </span>
                    </p>
                  </div>
                )}
                {showResult === "incorrect" && !grammarHint && (
                  <button
                    onClick={fetchGrammarHint}
                    disabled={grammarHintLoading}
                    className="text-xs text-text-muted hover:text-accent transition-colors mt-2"
                  >
                    {grammarHintLoading ? "Thinking..." : "Explain this conjugation?"}
                  </button>
                )}
                {grammarHint && (
                  <div className="bg-accent-blue/10 border border-accent-blue/20 rounded-xl p-3 text-sm text-text-secondary mt-2 text-left max-w-md mx-auto">
                    {grammarHint}
                  </div>
                )}
                <AudioButton
                  text={currentPractice.hebrew}
                  size="md"
                  className="mt-2 mx-auto"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Conjugation Trainer */}
      {tab === "trainer" && (
        <div className="bg-bg-card rounded-2xl border border-border p-6">
          <div className="text-center mb-6">
            <div className="text-xs text-text-muted mb-1">
              Score: {trainerScore.correct}/{trainerScore.total}
              {trainerScore.total > 0 &&
                ` (${Math.round((trainerScore.correct / trainerScore.total) * 100)}%)`}
            </div>
            <p className="text-sm text-text-muted mb-1">
              Fill in the correct conjugation
            </p>
            <p className="text-xs text-text-muted">
              <span className="hebrew-text text-accent">{currentExercise.verb}</span>
              {" — "}
              {currentExercise.verbMeaning}
              {" — "}
              <span className="text-accent-blue">{currentExercise.targetTense} tense</span>
              {", "}
              {currentExercise.targetPerson}
            </p>
          </div>

          {/* English sentence */}
          <div className="bg-bg-secondary rounded-xl p-4 mb-3 text-center">
            <p className="text-text-secondary text-sm">
              {currentExercise.sentenceTemplate.replace("{verb}", `[${currentExercise.verbMeaning}]`)}
            </p>
          </div>

          {/* Hebrew sentence with blank */}
          <div className="bg-bg-secondary rounded-xl p-4 mb-6 text-center" dir="rtl">
            <p className="hebrew-text text-lg text-text-primary">
              {currentExercise.hebrewTemplate.replace(
                "_____",
                trainerSelected
                  ? trainerSelected
                  : "______"
              )}
            </p>
          </div>

          {/* Multiple choice options */}
          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto mb-4">
            {trainerOptions.map((option, i) => {
              const isCorrect = option === currentExercise.correctAnswer;
              const isSelected = trainerSelected === option;
              return (
                <button
                  key={option}
                  onClick={() => {
                    if (trainerResult) return;
                    setTrainerSelected(option);
                    const correct = option === currentExercise.correctAnswer;
                    setTrainerResult(correct ? "correct" : "incorrect");
                    setTrainerScore((s) => ({
                      correct: s.correct + (correct ? 1 : 0),
                      total: s.total + 1,
                    }));
                    if (correct) awardXP("grammar_practice");
                  }}
                  disabled={trainerResult !== null}
                  className={cn(
                    "px-4 py-3 rounded-xl border text-center transition-colors hebrew-text text-lg",
                    trainerResult === null
                      ? "bg-bg-secondary border-border hover:border-accent/50 text-text-primary"
                      : isSelected && isCorrect
                        ? "bg-accent-green/20 border-accent-green/40 text-accent-green"
                        : isSelected && !isCorrect
                          ? "bg-red-500/20 border-red-500/40 text-red-400"
                          : isCorrect
                            ? "bg-accent-green/10 border-accent-green/30 text-accent-green"
                            : "bg-bg-secondary border-border text-text-muted opacity-50"
                  )}
                >
                  <span className="text-xs text-text-muted mr-2 font-mono">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {option}
                </button>
              );
            })}
          </div>

          {/* Result feedback */}
          {trainerResult && (
            <div className="text-center animate-[fadeIn_0.2s_ease-out]">
              {trainerResult === "correct" ? (
                <p className="text-accent-green font-medium mb-2">Correct!</p>
              ) : (
                <div className="mb-2">
                  <p className="text-red-400 font-medium mb-1">Incorrect</p>
                  <p className="text-text-secondary text-sm">
                    Answer:{" "}
                    <span className="hebrew-text text-lg text-text-primary">
                      {currentExercise.correctNikud}
                    </span>{" "}
                    <span className="text-accent italic">
                      ({currentExercise.correctTranslit})
                    </span>
                  </p>
                </div>
              )}
              <AudioButton
                text={currentExercise.correctAnswer}
                size="md"
                className="mx-auto mb-3"
              />
              <button
                onClick={() => {
                  setTrainerIdx((i) => i + 1);
                  setTrainerSelected(null);
                  setTrainerResult(null);
                }}
                className="px-5 py-2 rounded-xl bg-accent-blue/20 text-accent-blue font-medium text-sm transition-colors hover:bg-accent-blue/30"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Adjective Practice */}
      {tab === "adjectives" && (
        <div className="flex flex-col gap-4">
          {/* Reference table */}
          <div className="bg-bg-card rounded-2xl border border-border p-4">
            <h4 className="text-sm font-medium text-text-primary mb-2">Adjective Agreement Forms</h4>
            <p className="text-xs text-text-muted mb-3">
              Hebrew adjectives change form to match the gender and number of the noun they describe.
            </p>
            <div className="grid grid-cols-5 gap-1 text-xs text-center">
              <div className="text-text-muted font-medium py-1">Adjective</div>
              <div className="text-text-muted font-medium py-1">m.s.</div>
              <div className="text-text-muted font-medium py-1">f.s.</div>
              <div className="text-text-muted font-medium py-1">m.pl.</div>
              <div className="text-text-muted font-medium py-1">f.pl.</div>
              {HEBREW_ADJECTIVES.slice(0, 5).map((adj) => (
                <Fragment key={adj.id}>
                  <div className="text-text-secondary py-1">{adj.translation}</div>
                  <div className="hebrew-text text-text-primary py-1">{adj.forms.ms.hebrew}</div>
                  <div className="hebrew-text text-text-primary py-1">{adj.forms.fs.hebrew}</div>
                  <div className="hebrew-text text-text-primary py-1">{adj.forms.mp.hebrew}</div>
                  <div className="hebrew-text text-text-primary py-1">{adj.forms.fp.hebrew}</div>
                </Fragment>
              ))}
            </div>
          </div>

          {/* Practice exercise */}
          <div className="bg-bg-card rounded-2xl border border-border p-6">
            <div className="text-center mb-6">
              <div className="text-xs text-text-muted mb-1">
                Score: {adjScore.correct}/{adjScore.total}
                {adjScore.total > 0 &&
                  ` (${Math.round((adjScore.correct / adjScore.total) * 100)}%)`}
              </div>
              <p className="text-sm text-text-muted mb-4">
                Choose the correct form of the adjective
              </p>

              {/* Prompt */}
              <div className="bg-bg-secondary rounded-xl p-5 mb-2">
                <p className="text-text-muted text-sm mb-1">{currentAdj.noun.label} is...</p>
                <p className="text-xl font-bold text-text-primary mb-1">
                  {currentAdj.adj.translation}
                </p>
                <p className="text-xs text-text-muted">
                  Select the <span className="text-accent font-medium">
                    {currentAdj.noun.form === "ms" ? "masculine singular" :
                     currentAdj.noun.form === "fs" ? "feminine singular" :
                     currentAdj.noun.form === "mp" ? "masculine plural" :
                     "feminine plural"}
                  </span> form
                </p>
              </div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto mb-4">
              {adjOptions.map((option, i) => {
                const correctForm = currentAdj.adj.forms[currentAdj.noun.form];
                const isCorrect = option.hebrew === correctForm.hebrew;
                const isSelected = adjSelected === option.hebrew;
                return (
                  <button
                    key={option.hebrew}
                    onClick={() => {
                      if (adjResult) return;
                      setAdjSelected(option.hebrew);
                      const correct = option.hebrew === correctForm.hebrew;
                      setAdjResult(correct ? "correct" : "incorrect");
                      setAdjScore((s) => ({
                        correct: s.correct + (correct ? 1 : 0),
                        total: s.total + 1,
                      }));
                      if (correct) awardXP("grammar_practice");
                    }}
                    disabled={adjResult !== null}
                    className={cn(
                      "px-4 py-3 rounded-xl border text-center transition-colors",
                      adjResult === null
                        ? "bg-bg-secondary border-border hover:border-accent/50"
                        : isSelected && isCorrect
                          ? "bg-accent-green/20 border-accent-green/40"
                          : isSelected && !isCorrect
                            ? "bg-red-500/20 border-red-500/40"
                            : isCorrect
                              ? "bg-accent-green/10 border-accent-green/30"
                              : "bg-bg-secondary border-border opacity-50"
                    )}
                  >
                    <span className="hebrew-text text-lg text-text-primary block">
                      {option.hebrewNikud}
                    </span>
                    <span className="text-xs text-accent italic">
                      {option.transliteration}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Result */}
            {adjResult && (
              <div className="text-center animate-[fadeIn_0.2s_ease-out]">
                {adjResult === "correct" ? (
                  <p className="text-accent-green font-medium mb-2">Correct!</p>
                ) : (
                  <div className="mb-2">
                    <p className="text-red-400 font-medium mb-1">Incorrect</p>
                    <p className="text-text-secondary text-sm">
                      Correct form:{" "}
                      <span className="hebrew-text text-lg text-text-primary">
                        {currentAdj.adj.forms[currentAdj.noun.form].hebrewNikud}
                      </span>{" "}
                      <span className="text-accent italic">
                        ({currentAdj.adj.forms[currentAdj.noun.form].transliteration})
                      </span>
                    </p>
                  </div>
                )}
                <AudioButton
                  text={currentAdj.adj.forms[currentAdj.noun.form].hebrew}
                  size="md"
                  className="mx-auto mb-3"
                />
                <button
                  onClick={() => {
                    setAdjIdx((i) => i + 1);
                    setAdjSelected(null);
                    setAdjResult(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-accent-blue/20 text-accent-blue font-medium text-sm transition-colors hover:bg-accent-blue/30"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grammar Lessons */}
      {tab === "lessons" && (
        <div className="flex flex-col gap-3">
          {GRAMMAR_LESSONS.map((lesson) => (
            <div
              key={lesson.id}
              className="bg-bg-card rounded-2xl border border-border overflow-hidden"
            >
              <button
                onClick={() => {
                  const next = expandedLesson === lesson.id ? null : lesson.id;
                  setExpandedLesson(next);
                  if (next && !completedLessons.includes(lesson.id)) {
                    setCompletedLessons([...completedLessons, lesson.id]);
                  }
                }}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-bg-card-hover transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    {completedLessons.includes(lesson.id) && (
                      <span className="text-accent-green text-sm">&#10003;</span>
                    )}
                    <h4 className="text-text-primary font-medium">
                      {lesson.title}
                    </h4>
                    <span className="hebrew-text text-accent text-sm">
                      {lesson.titleHebrew}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">
                    {lesson.description}
                  </p>
                </div>
                <span
                  className={cn(
                    "text-text-muted transition-transform",
                    expandedLesson === lesson.id && "rotate-180"
                  )}
                >
                  &#9660;
                </span>
              </button>
              {expandedLesson === lesson.id && (
                <div className="px-6 pb-4 border-t border-border pt-3 animate-[fadeIn_0.2s_ease-out]">
                  <ul className="flex flex-col gap-2">
                    {lesson.topics.map((topic, i) => (
                      <li
                        key={i}
                        className="text-sm text-text-secondary flex items-start gap-2"
                      >
                        <span className="text-accent mt-0.5">&#8226;</span>
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                  {/* Story suggestion for this lesson */}
                  {onNavigate && (
                    <StorySuggestionCard
                      suggestion={getStorySuggestion({ tab: "lessons", lessonId: lesson.id })}
                      onNavigate={onNavigate}
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Story suggestion card — shown after exercises */}
      {onNavigate && (
        <>
          {tab === "practice" && score.total > 0 && score.total % 5 === 0 && showResult !== null && (
            <StorySuggestionCard
              suggestion={getStorySuggestion({ tab: "practice", tense: currentPractice.tense })}
              onNavigate={onNavigate}
            />
          )}
          {tab === "trainer" && trainerScore.total > 0 && trainerScore.total % 5 === 0 && trainerResult !== null && (
            <StorySuggestionCard
              suggestion={getStorySuggestion({ tab: "trainer" })}
              onNavigate={onNavigate}
            />
          )}
          {tab === "adjectives" && adjScore.total > 0 && adjScore.total % 5 === 0 && adjResult !== null && (
            <StorySuggestionCard
              suggestion={getStorySuggestion({ tab: "adjectives" })}
              onNavigate={onNavigate}
            />
          )}
        </>
      )}
    </div>
  );
}

/* ── Story suggestion card ───────────────────────────────── */

function StorySuggestionCard({
  suggestion,
  onNavigate,
}: {
  suggestion: StorySuggestion;
  onNavigate: (mode: AppMode) => void;
}) {
  return (
    <button
      onClick={() => onNavigate("story")}
      className="mt-4 w-full flex items-start gap-3 p-3 rounded-xl border border-accent/20 bg-accent/5 hover:bg-accent/10 transition-colors text-left group"
    >
      <span className="text-lg shrink-0 mt-0.5">&#128214;</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-accent">
          Practice this in a story
        </p>
        <p className="text-sm text-text-secondary mt-0.5 truncate">
          &ldquo;{suggestion.chapterTitle}&rdquo; {suggestion.description}
        </p>
        <p className="text-xs text-text-muted mt-0.5">
          {suggestion.storyTitle}
        </p>
      </div>
      <span className="text-accent text-sm shrink-0 self-center opacity-60 group-hover:opacity-100 transition-opacity">
        &#8594;
      </span>
    </button>
  );
}
