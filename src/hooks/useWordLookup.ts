"use client";

import { useMemo, useCallback } from "react";
import { useVocabulary } from "./useVocabulary";
import { VOCABULARY } from "@/data/vocabulary";
import { PASSAGE_WORDS } from "@/data/passage-words";
import { cleanHebrew } from "@/lib/utils";
import { Word } from "@/types";

export interface LookupResult {
  match: Word | null;
  alreadySaved: boolean;
}

export function useWordLookup() {
  const { customWords, addCustomWord } = useVocabulary();

  // O(1) lookup map keyed on stripped hebrew
  const vocabMap = useMemo(() => {
    const map = new Map<string, Word>();
    for (const w of VOCABULARY) {
      map.set(cleanHebrew(w.hebrew), w);
    }
    return map;
  }, []);

  // Set of stripped hebrew strings already saved as custom words
  const savedSet = useMemo(() => {
    const set = new Set<string>();
    for (const w of customWords) {
      set.add(cleanHebrew(w.hebrew));
    }
    return set;
  }, [customWords]);

  const lookup = useCallback(
    (hebrewWord: string): LookupResult => {
      const cleaned = cleanHebrew(hebrewWord);
      if (!cleaned) return { match: null, alreadySaved: false };

      // 1. Check main vocabulary
      const vocabMatch = vocabMap.get(cleaned);
      if (vocabMatch) {
        return { match: vocabMatch, alreadySaved: savedSet.has(cleaned) };
      }

      // 2. Check passage word dictionary
      const passageMatch = PASSAGE_WORDS[cleaned];
      if (passageMatch) {
        return {
          match: {
            id: `passage:${cleaned}`,
            hebrew: cleaned,
            hebrewNikud: cleaned,
            transliteration: passageMatch.transliteration,
            translation: passageMatch.translation,
            category: "From Reading",
          },
          alreadySaved: savedSet.has(cleaned),
        };
      }

      return { match: null, alreadySaved: false };
    },
    [vocabMap, savedSet]
  );

  const saveWord = useCallback(
    (word: Omit<Word, "id">) => {
      addCustomWord(word);
    },
    [addCustomWord]
  );

  return { lookup, saveWord, savedSet };
}
