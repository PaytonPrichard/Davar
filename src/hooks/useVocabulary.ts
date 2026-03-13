"use client";

import { useMemo, useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { VOCABULARY } from "@/data/vocabulary";
import { Word } from "@/types";

export function useVocabulary() {
  const [customWords, setCustomWords, hydrated] = useLocalStorage<Word[]>(
    "davar-custom-words",
    []
  );

  const allWords = useMemo(
    () => [...VOCABULARY, ...customWords],
    [customWords]
  );

  const categories = useMemo(() => {
    const cats = new Set(allWords.map((w) => w.category));
    return Array.from(cats).sort();
  }, [allWords]);

  const getByCategory = useCallback(
    (category: string): Word[] => {
      return allWords.filter((w) => w.category === category);
    },
    [allWords]
  );

  const addCustomWord = useCallback(
    (word: Omit<Word, "id">) => {
      const id = `custom:${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setCustomWords((prev) => [...prev, { ...word, id }]);
    },
    [setCustomWords]
  );

  const deleteCustomWord = useCallback(
    (wordId: string) => {
      setCustomWords((prev) => prev.filter((w) => w.id !== wordId));
    },
    [setCustomWords]
  );

  const updateCustomWord = useCallback(
    (wordId: string, updates: Partial<Omit<Word, "id">>) => {
      setCustomWords((prev) =>
        prev.map((w) => (w.id === wordId ? { ...w, ...updates } : w))
      );
    },
    [setCustomWords]
  );

  return {
    allWords,
    builtinWords: VOCABULARY,
    customWords,
    categories,
    getByCategory,
    addCustomWord,
    deleteCustomWord,
    updateCustomWord,
    hydrated,
  };
}
