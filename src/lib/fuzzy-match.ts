import { FuzzyMatchResult } from "@/types";

function normalize(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // strip diacritics
}

function canonicalize(s: string): string {
  let result = normalize(s);

  // Hebrew transliteration equivalences
  result = result
    .replace(/kh/g, "x")
    .replace(/ch/g, "x") // ch/kh → x (placeholder)
    .replace(/tz/g, "ts") // tz → ts
    .replace(/sh/g, "$") // sh → $ (placeholder)
    .replace(/'/g, "") // remove apostrophes
    .replace(/[''`]/g, "") // remove various quote marks
    .replace(/-/g, " ") // hyphens to spaces
    .replace(/\s+/g, " ") // collapse whitespace
    .replace(/(.)\1+/g, "$1"); // double letters → single

  return result;
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0)
  );

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }

  return dp[m][n];
}

export function fuzzyMatch(
  input: string,
  expected: string
): FuzzyMatchResult {
  const canonInput = canonicalize(input);
  const canonExpected = canonicalize(expected);

  // Exact match after canonicalization
  if (canonInput === canonExpected) {
    return { status: "correct", message: "Correct!" };
  }

  const distance = levenshtein(canonInput, canonExpected);
  const isLongWord = canonExpected.length >= 6;

  if (distance <= 1) {
    return { status: "close", message: "Almost! Close enough." };
  }

  if (isLongWord && distance <= 2) {
    return { status: "close", message: "Almost! Very close." };
  }

  return { status: "incorrect", message: "Not quite. Try again!" };
}
