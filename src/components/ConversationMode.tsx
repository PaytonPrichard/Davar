"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSettings } from "@/hooks/useSettings";
import { useAudio } from "@/hooks/useAudio";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useXP } from "@/hooks/useXP";
import { useStreak } from "@/hooks/useStreak";
import { chat, ChatMessage, HEBREW_TUTOR_SYSTEM, PROMPTS, hasAIConsent } from "@/lib/ai";
import AIConsentDialog from "./AIConsentDialog";
import { cn } from "@/lib/utils";

/* ── Scenarios ────────────────────────────────────────────── */

interface Scenario {
  id: string;
  title: string;
  titleHebrew: string;
  description: string;
  level: "beginner" | "intermediate" | "advanced";
  icon: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: "cafe",
    title: "At the Cafe",
    titleHebrew: "בַּקָּפֶה",
    description: "Order coffee and food, make small talk",
    level: "beginner",
    icon: "\u2615",
  },
  {
    id: "market",
    title: "At the Market",
    titleHebrew: "בַּשּׁוּק",
    description: "Buy fruits, vegetables, and haggle prices",
    level: "beginner",
    icon: "\uD83C\uDF4E",
  },
  {
    id: "directions",
    title: "Asking Directions",
    titleHebrew: "שׁוֹאֵל כִּוּוּנִים",
    description: "Find your way around the city",
    level: "beginner",
    icon: "\uD83D\uDDFA\uFE0F",
  },
  {
    id: "restaurant",
    title: "Restaurant",
    titleHebrew: "בַּמִּסְעָדָה",
    description: "Read the menu, order, and pay",
    level: "intermediate",
    icon: "\uD83C\uDF7D\uFE0F",
  },
  {
    id: "doctor",
    title: "At the Doctor",
    titleHebrew: "אֵצֶל הָרוֹפֵא",
    description: "Describe symptoms and understand instructions",
    level: "intermediate",
    icon: "\uD83E\uDE7A",
  },
  {
    id: "job",
    title: "Job Interview",
    titleHebrew: "רֵאָיוֹן עֲבוֹדָה",
    description: "Talk about your experience and skills",
    level: "advanced",
    icon: "\uD83D\uDCBC",
  },
  {
    id: "apartment",
    title: "Renting Apartment",
    titleHebrew: "שְׂכִירַת דִּירָה",
    description: "Discuss terms, ask about the apartment",
    level: "advanced",
    icon: "\uD83C\uDFE0",
  },
  {
    id: "free",
    title: "Free Conversation",
    titleHebrew: "שִׂיחָה חוֹפְשִׁית",
    description: "Talk about anything in Hebrew",
    level: "beginner",
    icon: "\uD83D\uDCAC",
  },
];

/* ── Message type ─────────────────────────────────────────── */

interface ConvoMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

/* ── Component ────────────────────────────────────────────── */

export default function ConversationMode() {
  const { settings } = useSettings();
  const { speak, audioState } = useAudio(settings);
  const { startListening, stopListening, state: micState, result: micResult, isSupported: micSupported } = useSpeechRecognition();
  const { awardXP } = useXP();
  const { recordStudy } = useStreak();

  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [messages, setMessages] = useState<ConvoMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAIConsent, setShowAIConsent] = useState(false);
  const pendingAction = useRef<(() => void) | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const aiConfigured = settings.aiProvider !== "none" && settings.aiApiKey;

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Pick up speech recognition results
  useEffect(() => {
    if (micResult?.isFinal && micResult.transcript) {
      setInput(micResult.transcript);
    }
  }, [micResult]);

  /* ── Start a scenario ──────────────────────────────────── */
  const doStartScenario = useCallback(
    async (s: Scenario) => {
      setScenario(s);
      setMessages([]);
      setError("");
      setLoading(true);

      const prompt = PROMPTS.conversationStart(
        `${s.title} (${s.titleHebrew}) — ${s.description}`,
        s.level
      );

      const result = await chat(
        [
          { role: "system", content: HEBREW_TUTOR_SYSTEM },
          { role: "user", content: prompt },
        ],
        settings
      );

      setLoading(false);

      if (result.error) {
        setError(result.error);
        return;
      }

      const assistantMsg: ConvoMessage = {
        role: "assistant",
        content: result.text,
        timestamp: Date.now(),
      };
      setMessages([assistantMsg]);
      speak(extractHebrew(result.text));
    },
    [settings, speak]
  );

  const startScenario = useCallback(
    (s: Scenario) => {
      if (!hasAIConsent()) {
        pendingAction.current = () => doStartScenario(s);
        setShowAIConsent(true);
        return;
      }
      doStartScenario(s);
    },
    [doStartScenario]
  );

  /* ── Send a message ────────────────────────────────────── */
  const doSendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading || !scenario) return;

    const userMsg: ConvoMessage = {
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setError("");

    // Build chat history for context
    const chatHistory: ChatMessage[] = [
      { role: "system", content: HEBREW_TUTOR_SYSTEM },
      {
        role: "system",
        content: `Current scenario: ${scenario.title} (${scenario.titleHebrew}). Level: ${scenario.level}. ${scenario.description}.`,
      },
    ];

    // Include recent messages for context (last 10)
    const recent = [...messages, userMsg].slice(-10);
    for (const m of recent) {
      chatHistory.push({ role: m.role, content: m.content });
    }

    const result = await chat(chatHistory, settings);

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    const assistantMsg: ConvoMessage = {
      role: "assistant",
      content: result.text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, assistantMsg]);
    speak(extractHebrew(result.text));
    awardXP("conversation_message");
    recordStudy();
  }, [input, loading, scenario, messages, settings, speak, awardXP, recordStudy]);

  const sendMessage = useCallback(() => {
    if (!hasAIConsent()) {
      pendingAction.current = doSendMessage;
      setShowAIConsent(true);
      return;
    }
    doSendMessage();
  }, [doSendMessage]);

  /* ── Keyboard handler ──────────────────────────────────── */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /* ── Not configured ────────────────────────────────────── */
  if (!aiConfigured) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="bg-bg-card rounded-2xl border border-border p-8 max-w-md text-center">
          <div className="text-4xl mb-4">{"\uD83E\uDD16"}</div>
          <h2 className="text-xl font-bold text-text-primary mb-2">
            AI Conversation
          </h2>
          <p className="text-text-secondary text-sm mb-4">
            Practice speaking Hebrew with an AI tutor. To get started, configure
            an AI provider in Settings.
          </p>
          <p className="text-text-muted text-xs">
            Budget pick: Google Gemini Flash — ~$0.05/month
          </p>
        </div>
      </div>
    );
  }

  /* ── AI Consent Dialog (rendered as overlay) ──────────── */
  const aiConsentDialog = showAIConsent ? (
    <AIConsentDialog
      provider={settings.aiProvider}
      onAccept={() => {
        setShowAIConsent(false);
        const action = pendingAction.current;
        pendingAction.current = null;
        action?.();
      }}
      onDecline={() => {
        setShowAIConsent(false);
        pendingAction.current = null;
      }}
    />
  ) : null;

  /* ── Scenario picker ───────────────────────────────────── */
  if (!scenario) {
    return (
      <div className="flex flex-col gap-6">
        {aiConsentDialog}
        <div className="text-center">
          <h2 className="text-xl font-bold text-text-primary mb-1">
            Hebrew Conversation Practice
          </h2>
          <p className="text-text-secondary text-sm">
            Choose a scenario to start a conversation with your AI tutor
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => startScenario(s)}
              className="p-4 rounded-xl border border-border bg-bg-card hover:bg-bg-card-hover transition-all hover:scale-[1.01] text-left"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{s.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-text-primary text-sm">
                      {s.title}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                        s.level === "beginner" && "bg-accent-green/15 text-accent-green",
                        s.level === "intermediate" && "bg-accent-blue/15 text-accent-blue",
                        s.level === "advanced" && "bg-accent-yellow/15 text-accent-yellow"
                      )}
                    >
                      {s.level}
                    </span>
                  </div>
                  <span className="hebrew-text text-text-muted text-xs">
                    {s.titleHebrew}
                  </span>
                  <p className="text-text-muted text-xs mt-1">
                    {s.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* ── Chat UI ───────────────────────────────────────────── */
  return (
    <div className="flex flex-col h-[calc(100vh-220px)] max-h-[700px]">
      {aiConsentDialog}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setScenario(null)}
            className="text-text-muted hover:text-text-secondary transition-colors"
            title="Back to scenarios"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">
              {scenario.icon} {scenario.title}
            </h3>
            <span className="hebrew-text text-xs text-text-muted">
              {scenario.titleHebrew}
            </span>
          </div>
        </div>
        <span
          className={cn(
            "text-[10px] px-2 py-0.5 rounded-full font-medium",
            scenario.level === "beginner" && "bg-accent-green/15 text-accent-green",
            scenario.level === "intermediate" && "bg-accent-blue/15 text-accent-blue",
            scenario.level === "advanced" && "bg-accent-yellow/15 text-accent-yellow"
          )}
        >
          {scenario.level}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-accent text-white rounded-br-md"
                  : "bg-bg-card border border-border text-text-primary rounded-bl-md"
              )}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
              {msg.role === "assistant" && (
                <button
                  onClick={() => speak(extractHebrew(msg.content))}
                  disabled={audioState === "loading" || audioState === "playing"}
                  className="mt-2 text-xs text-text-muted hover:text-accent transition-colors flex items-center gap-1"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </svg>
                  {audioState === "playing" ? "Playing..." : "Listen"}
                </button>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center">
            <span className="text-xs text-red-400 bg-red-400/10 px-3 py-1 rounded-full">
              {error}
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="flex items-center gap-2 bg-bg-card border border-border rounded-2xl p-2">
        {micSupported && (
          <button
            onClick={micState === "listening" ? stopListening : startListening}
            className={cn(
              "p-2 rounded-xl transition-colors",
              micState === "listening"
                ? "bg-red-500/15 text-red-400 animate-pulse"
                : "text-text-muted hover:text-accent hover:bg-accent/10"
            )}
            title={micState === "listening" ? "Stop recording" : "Speak in Hebrew"}
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
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type in Hebrew or English..."
          disabled={loading}
          className="flex-1 bg-transparent text-text-primary text-sm placeholder:text-text-muted/60 outline-none px-2 py-1"
          dir="auto"
        />

        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          className={cn(
            "p-2 rounded-xl transition-colors",
            input.trim() && !loading
              ? "text-accent hover:bg-accent/10"
              : "text-text-muted/40"
          )}
          title="Send message"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>

      {/* Mic status */}
      {micState === "listening" && (
        <p className="text-center text-xs text-red-400 mt-2 animate-pulse">
          Listening... speak in Hebrew
        </p>
      )}
    </div>
  );
}

/* ── Helper: extract Hebrew text from a mixed response ───── */

function extractHebrew(text: string): string {
  // Match Hebrew character ranges including nikud
  const hebrewRegex = /[\u0590-\u05FF\uFB1D-\uFB4F]+(?:\s+[\u0590-\u05FF\uFB1D-\uFB4F]+)*/g;
  const matches = text.match(hebrewRegex);
  if (!matches) return text;
  return matches.join(" ");
}
