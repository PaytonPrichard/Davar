/**
 * Unified AI service for Davar.
 *
 * Supports Gemini (budget default), OpenAI, and Anthropic behind a single
 * interface.  Every provider is called via its REST API — no SDK needed.
 */

import { AppSettings } from "@/types";
import { SK_AI_CONSENT } from "@/lib/storage-keys";

/* ── AI consent helpers ───────────────────────────────────── */

const AI_CONSENT_KEY = SK_AI_CONSENT;

export function hasAIConsent(): boolean {
  try {
    return localStorage.getItem(AI_CONSENT_KEY) === "true";
  } catch {
    return false;
  }
}

export function acceptAIConsent(): void {
  try {
    localStorage.setItem(AI_CONSENT_KEY, "true");
  } catch {
    // localStorage unavailable
  }
}

/* ── Types ────────────────────────────────────────────────── */

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIResponse {
  text: string;
  error?: string;
}

export interface AIStreamCallbacks {
  onToken: (token: string) => void;
  onDone: (full: string) => void;
  onError: (error: string) => void;
}

/* ── Default models per provider ─────────────────────────── */

const DEFAULT_MODELS: Record<string, string> = {
  gemini: "gemini-2.0-flash",
  openai: "gpt-4o-mini",
  anthropic: "claude-haiku-4-5-20251001",
};

/* ── Provider endpoints (now proxied via /api/ai) ────────── */

/* ── Hebrew tutor system prompt ──────────────────────────── */

export const HEBREW_TUTOR_SYSTEM = `You are a Hebrew language tutor inside the app Davar. Your job is to help the user learn Modern Hebrew.

Rules:
- Always respond in a mix of Hebrew and English to maximize learning
- When you write Hebrew, include nikud (vowel points) and a transliteration in parentheses
- Keep responses concise — 2-4 sentences unless asked for more
- Correct mistakes gently and explain *why*
- Use the user's current level context when provided
- Never make up vocabulary that doesn't exist in Modern Hebrew
- For grammar explanations, reference the binyan (verb pattern) system
- When giving examples, prefer high-frequency daily-use words`;

/* ── Main chat function ──────────────────────────────────── */

export async function chat(
  messages: ChatMessage[],
  settings: AppSettings
): Promise<AIResponse> {
  const provider = settings.aiProvider;
  const apiKey = settings.aiApiKey;

  if (provider === "none" || !apiKey) {
    return { text: "", error: "AI is not configured. Add an API key in Settings." };
  }

  const model = settings.aiModel || DEFAULT_MODELS[provider] || "";

  // Extract system prompt and user prompt from messages
  const systemParts = messages
    .filter((m) => m.role === "system")
    .map((m) => m.content)
    .join("\n\n");

  const userParts = messages
    .filter((m) => m.role !== "system")
    .map((m) => m.content)
    .join("\n\n");

  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider,
        apiKey,
        model,
        prompt: userParts,
        ...(systemParts ? { systemPrompt: systemParts } : {}),
      }),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      return { text: "", error: data.error || `API error ${res.status}` };
    }

    return { text: data.text };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown AI error";
    return { text: "", error: msg };
  }
}

/* ── Quick single-prompt helper ──────────────────────────── */

export async function prompt(
  text: string,
  settings: AppSettings,
  systemPrompt?: string
): Promise<AIResponse> {
  const messages: ChatMessage[] = [];
  if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
  messages.push({ role: "user", content: text });
  return chat(messages, settings);
}

/* ── Specialized prompts for Davar features ──────────────── */

export const PROMPTS = {
  grammarHint: (word: string, context: string) =>
    `The user got "${word}" wrong in this context: "${context}". Give a brief grammar hint (1-2 sentences) explaining the form, root, or pattern. Include the Hebrew with nikud.`,

  conversationStart: (scenario: string, level: string) =>
    `Start a Hebrew conversation for a ${level}-level learner. Scenario: ${scenario}. Say your opening line in Hebrew (with nikud and transliteration), then provide the English translation. Keep it to 1-2 sentences.`,

  conversationReply: (userMessage: string, scenario: string) =>
    `The user said: "${userMessage}" in the context of: ${scenario}. Reply naturally in Hebrew (with nikud and transliteration), then English. If they made mistakes, gently correct them. Keep to 1-3 sentences.`,

  contextualExample: (word: string, translation: string) =>
    `Give 2 short example sentences using the Hebrew word "${word}" (${translation}). Include nikud, transliteration, and English translation for each.`,

  explainRoot: (root: string) =>
    `Explain the Hebrew root ${root} briefly. List 3-4 common words derived from it with nikud, transliteration, and meaning.`,

  clozeHint: (sentence: string, missingWord: string) =>
    `The user is trying to fill in the blank in: "${sentence}". The answer is "${missingWord}". Give a subtle hint without revealing the answer — reference the root, grammar pattern, or meaning.`,

  quizFeedback: (question: string, userAnswer: string, correctAnswer: string) =>
    `The user answered "${userAnswer}" for the Hebrew word/phrase "${question}". The correct answer is "${correctAnswer}". Explain briefly why the correct answer is what it is — mention root, pattern, or memory tip. 1-2 sentences.`,
};
