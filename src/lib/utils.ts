export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Get today's date in YYYY-MM-DD using local timezone (not UTC). */
export function getToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Get yesterday's date in YYYY-MM-DD using local timezone (not UTC). */
export function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function daysBetween(dateA: string, dateB: string): number {
  const a = new Date(dateA).getTime();
  const b = new Date(dateB).getTime();
  return Math.round(Math.abs(a - b) / 86400000);
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

/** Strip Hebrew nikud (vowel points / cantillation marks) from a string. */
export function stripNikud(text: string): string {
  return text.replace(/[\u0591-\u05C7]/g, "");
}

/** Hebrew punctuation pattern: maqaf, geresh, gershayim, sof-pasuq, plus common Latin punctuation. */
const HEBREW_PUNCT = /[־׳״׃\u05F3\u05F4.,;:!?"""''()\-]/g;

/** Strip nikud and common Hebrew/Latin punctuation, then trim. */
export function cleanHebrew(raw: string): string {
  return stripNikud(raw).replace(HEBREW_PUNCT, "").trim();
}

/** Strip only punctuation (preserve nikud). Useful for keeping vowel-pointed text clean. */
export function stripPunctuation(raw: string): string {
  return raw.replace(HEBREW_PUNCT, "").trim();
}
