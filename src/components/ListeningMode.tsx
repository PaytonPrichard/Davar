"use client";

import { useState, useMemo, useEffect } from "react";
import { VOCABULARY } from "@/data/vocabulary";
import { PASSAGES } from "@/data/passages";
import { useAudio } from "@/hooks/useAudio";
import { useSettings } from "@/hooks/useSettings";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { cn, shuffle } from "@/lib/utils";
import { CATEGORIES } from "@/types";

type ListeningTab = "words" | "sentences";

export default function ListeningMode() {
  const [tab, setTab] = useState<ListeningTab>("words");

  return (
    <div className="flex flex-col gap-6">
      {/* Tab bar */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("words")}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-medium transition-colors border",
            tab === "words"
              ? "bg-accent text-white border-accent"
              : "bg-bg-card text-text-secondary border-border hover:border-accent/50"
          )}
        >
          Word Dictation
        </button>
        <button
          onClick={() => setTab("sentences")}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-medium transition-colors border",
            tab === "sentences"
              ? "bg-accent text-white border-accent"
              : "bg-bg-card text-text-secondary border-border hover:border-accent/50"
          )}
        >
          Sentence Listening
        </button>
      </div>

      {tab === "words" && <WordDictation />}
      {tab === "sentences" && <SentenceListening />}
    </div>
  );
}

/* ── Word Dictation ──────────────────────────────────────────── */

function WordDictation() {
  const { settings } = useSettings();
  const { speak, audioState } = useAudio(settings);
  const { startListening, stopListening, state: micState, result: micResult, isSupported: micSupported } = useSpeechRecognition();
  const [category, setCategory] = useState<string>("all");
  const [useMultipleChoice, setUseMultipleChoice] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const [mcSelection, setMcSelection] = useState<number | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0, streak: 0 });
  const [wordIdx, setWordIdx] = useState(0);

  const filteredWords = useMemo(() => {
    const list =
      category === "all"
        ? VOCABULARY
        : VOCABULARY.filter((w) => w.category === category);
    return shuffle(list);
  }, [category]);

  const word = filteredWords[wordIdx % filteredWords.length];

  // Multiple choice distractors
  const choices = useMemo(() => {
    if (!word) return [];
    const others = shuffle(
      VOCABULARY.filter((w) => w.id !== word.id)
    ).slice(0, 3);
    const all = shuffle([word, ...others]);
    return all;
  }, [word]);

  // Pick up speech recognition results
  useEffect(() => {
    if (micResult?.isFinal && micResult.transcript && result === null) {
      setAnswer(micResult.transcript);
    }
  }, [micResult, result]);

  // Auto-play audio
  useEffect(() => {
    if (autoPlay && word && result === null) {
      speak(word.hebrew);
    }
  }, [wordIdx, autoPlay]); // eslint-disable-line react-hooks/exhaustive-deps

  const checkAnswer = () => {
    if (!answer.trim()) return;
    const a = answer.trim().toLowerCase();
    const correct =
      a === word.transliteration.toLowerCase() ||
      a === word.hebrew ||
      a === word.translation.toLowerCase();
    recordResult(correct);
  };

  const checkMC = (idx: number) => {
    setMcSelection(idx);
    const correct = choices[idx].id === word.id;
    recordResult(correct);
  };

  const recordResult = (correct: boolean) => {
    setResult(correct ? "correct" : "incorrect");
    setScore((s) => ({
      correct: s.correct + (correct ? 1 : 0),
      total: s.total + 1,
      streak: correct ? s.streak + 1 : 0,
    }));
  };

  const nextWord = () => {
    setWordIdx((i) => i + 1);
    setAnswer("");
    setResult(null);
    setMcSelection(null);
  };

  if (!word) return null;

  return (
    <div className="bg-bg-card rounded-2xl border border-border p-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setWordIdx(0);
            setResult(null);
          }}
          className="px-3 py-1.5 bg-bg-secondary border border-border rounded-lg text-sm text-text-primary"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
          <input
            type="checkbox"
            checked={useMultipleChoice}
            onChange={(e) => setUseMultipleChoice(e.target.checked)}
            className="accent-accent"
          />
          Multiple choice
        </label>
        <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
          <input
            type="checkbox"
            checked={autoPlay}
            onChange={(e) => setAutoPlay(e.target.checked)}
            className="accent-accent"
          />
          Auto-play
        </label>
      </div>

      {/* Score bar */}
      <div className="flex items-center justify-between text-xs text-text-muted mb-6">
        <span>
          Score: {score.correct}/{score.total}
          {score.total > 0 &&
            ` (${Math.round((score.correct / score.total) * 100)}%)`}
        </span>
        {score.streak > 1 && (
          <span className="text-accent-yellow font-medium">
            &#128293; {score.streak} streak
          </span>
        )}
      </div>

      {/* Big play button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={() => speak(word.hebrew)}
          className={cn(
            "w-24 h-24 rounded-full flex items-center justify-center transition-all border-2",
            audioState === "playing"
              ? "bg-accent/20 border-accent text-accent scale-105"
              : "bg-bg-secondary border-border text-text-secondary hover:border-accent hover:text-accent"
          )}
          title="Play audio"
        >
          <svg
            width="40"
            height="40"
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
        </button>
      </div>

      {/* Answer area */}
      {useMultipleChoice ? (
        <div className="grid grid-cols-2 gap-3 mb-4">
          {choices.map((c, i) => (
            <button
              key={c.id}
              onClick={() => result === null && checkMC(i)}
              disabled={result !== null}
              className={cn(
                "p-4 rounded-xl border text-sm font-medium transition-colors text-left",
                result !== null && c.id === word.id
                  ? "border-accent-green bg-accent-green/10 text-accent-green"
                  : result !== null && mcSelection === i
                    ? "border-red-400 bg-red-500/10 text-red-400"
                    : "border-border bg-bg-secondary text-text-secondary hover:border-accent/50"
              )}
            >
              <span className="block text-xs text-text-muted mb-1">
                {c.transliteration}
              </span>
              {c.translation}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 max-w-md mx-auto mb-4">
          {micSupported && result === null && (
            <button
              onClick={micState === "listening" ? stopListening : startListening}
              className={cn(
                "p-3 rounded-xl transition-colors shrink-0",
                micState === "listening"
                  ? "bg-red-500/15 text-red-400 animate-pulse"
                  : "bg-bg-secondary border border-border text-text-muted hover:text-accent hover:border-accent/50"
              )}
              title={micState === "listening" ? "Stop" : "Speak your answer"}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>
          )}
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (result) nextWord();
                else checkAnswer();
              }
            }}
            placeholder={micState === "listening" ? "Listening..." : "Type or speak your answer..."}
            className="flex-1 px-4 py-3 bg-bg-secondary border border-border rounded-xl text-text-primary text-sm text-center"
            disabled={result !== null}
            dir="auto"
          />
          {result === null ? (
            <button
              onClick={checkAnswer}
              className="px-5 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-medium text-sm transition-colors"
            >
              Check
            </button>
          ) : (
            <button
              onClick={nextWord}
              className="px-5 py-3 rounded-xl bg-accent-blue/20 text-accent-blue font-medium text-sm transition-colors"
            >
              Next
            </button>
          )}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="text-center animate-[fadeIn_0.2s_ease-out]">
          {result === "correct" ? (
            <p className="text-accent-green font-medium mb-2">Correct!</p>
          ) : (
            <p className="text-red-400 font-medium mb-2">Incorrect</p>
          )}
          <div className="bg-bg-secondary rounded-xl p-4 inline-block">
            <span className="hebrew-text text-2xl text-text-primary">
              {word.hebrewNikud}
            </span>
            <p className="text-sm text-accent italic mt-1">
              {word.transliteration}
            </p>
            <p className="text-sm text-text-secondary">{word.translation}</p>
          </div>
          {useMultipleChoice && (
            <button
              onClick={nextWord}
              className="block mx-auto mt-4 px-5 py-2 rounded-xl bg-accent-blue/20 text-accent-blue font-medium text-sm transition-colors hover:bg-accent-blue/30"
            >
              Next Word
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Sentence Listening ──────────────────────────────────────── */

function SentenceListening() {
  const { settings } = useSettings();
  const { speak, audioState } = useAudio(settings);
  const [passageIdx, setPassageIdx] = useState(0);
  const [lineIdx, setLineIdx] = useState(0);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const [mcSelection, setMcSelection] = useState<number | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [autoPlay, setAutoPlay] = useState(true);

  const passage = PASSAGES[passageIdx];
  const line = passage?.lines[lineIdx];

  // Build choices — correct translation + 3 random wrong ones
  const choices = useMemo(() => {
    if (!line || !passage) return [];
    const otherLines = passage.lines
      .filter((_, i) => i !== lineIdx)
      .concat(
        PASSAGES.filter((_, i) => i !== passageIdx).flatMap((p) => p.lines)
      );
    const distractors = shuffle(otherLines)
      .slice(0, 3)
      .map((l) => l.translation);
    return shuffle([line.translation, ...distractors]);
  }, [passage, passageIdx, line, lineIdx]);

  // Auto-play
  useEffect(() => {
    if (autoPlay && line && result === null) {
      speak(line.hebrew);
    }
  }, [lineIdx, passageIdx, autoPlay]); // eslint-disable-line react-hooks/exhaustive-deps

  const checkMC = (idx: number) => {
    if (!line) return;
    setMcSelection(idx);
    const correct = choices[idx] === line.translation;
    setResult(correct ? "correct" : "incorrect");
    setScore((s) => ({
      correct: s.correct + (correct ? 1 : 0),
      total: s.total + 1,
    }));
  };

  const nextLine = () => {
    if (!passage) return;
    if (lineIdx < passage.lines.length - 1) {
      setLineIdx((i) => i + 1);
    } else if (passageIdx < PASSAGES.length - 1) {
      setPassageIdx((i) => i + 1);
      setLineIdx(0);
    }
    setResult(null);
    setMcSelection(null);
  };

  if (!line) return <p className="text-text-muted">No passages available.</p>;

  return (
    <div className="bg-bg-card rounded-2xl border border-border p-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select
          value={passageIdx}
          onChange={(e) => {
            setPassageIdx(parseInt(e.target.value));
            setLineIdx(0);
            setResult(null);
          }}
          className="px-3 py-1.5 bg-bg-secondary border border-border rounded-lg text-sm text-text-primary"
        >
          {PASSAGES.map((p, i) => (
            <option key={p.id} value={i}>
              {p.title}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
          <input
            type="checkbox"
            checked={autoPlay}
            onChange={(e) => setAutoPlay(e.target.checked)}
            className="accent-accent"
          />
          Auto-play
        </label>
        <span className="text-xs text-text-muted ml-auto">
          Line {lineIdx + 1}/{passage.lines.length}
        </span>
      </div>

      {/* Score */}
      <div className="text-xs text-text-muted mb-4">
        Score: {score.correct}/{score.total}
        {score.total > 0 &&
          ` (${Math.round((score.correct / score.total) * 100)}%)`}
      </div>

      {/* Big play button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={() => speak(line.hebrew)}
          className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center transition-all border-2",
            audioState === "playing"
              ? "bg-accent/20 border-accent text-accent scale-105"
              : "bg-bg-secondary border-border text-text-secondary hover:border-accent hover:text-accent"
          )}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
        </button>
      </div>

      <p className="text-center text-sm text-text-muted mb-4">
        Listen and choose the correct translation:
      </p>

      {/* MC choices */}
      <div className="flex flex-col gap-2 max-w-lg mx-auto mb-4">
        {choices.map((choice, i) => (
          <button
            key={i}
            onClick={() => result === null && checkMC(i)}
            disabled={result !== null}
            className={cn(
              "p-3 rounded-xl border text-sm text-left transition-colors",
              result !== null && choice === line.translation
                ? "border-accent-green bg-accent-green/10 text-accent-green"
                : result !== null && mcSelection === i
                  ? "border-red-400 bg-red-500/10 text-red-400"
                  : "border-border bg-bg-secondary text-text-secondary hover:border-accent/50"
            )}
          >
            {choice}
          </button>
        ))}
      </div>

      {/* Result */}
      {result && (
        <div className="text-center animate-[fadeIn_0.2s_ease-out]">
          {result === "correct" ? (
            <p className="text-accent-green font-medium mb-2">Correct!</p>
          ) : (
            <p className="text-red-400 font-medium mb-2">
              Incorrect — the answer was: &ldquo;{line.translation}&rdquo;
            </p>
          )}
          <div className="bg-bg-secondary rounded-xl p-3 inline-block mb-3">
            <span className="hebrew-text text-lg text-text-primary">
              {line.hebrew}
            </span>
            <p className="text-xs text-accent italic mt-1">
              {line.transliteration}
            </p>
          </div>
          <br />
          <button
            onClick={nextLine}
            className="px-5 py-2 rounded-xl bg-accent-blue/20 text-accent-blue font-medium text-sm transition-colors hover:bg-accent-blue/30"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
