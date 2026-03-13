"use client";

import { useState, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { AppSettings, DEFAULT_SETTINGS } from "@/types";
import { useSettings } from "@/hooks/useSettings";
import { useLocalStorage, getStorageUsage } from "@/hooks/useLocalStorage";
import { PlacementResult } from "./PlacementTest";
import AccountPanel from "./AccountPanel";
import { getAllDavarData, STORAGE_PREFIX, SK_PLACEMENT } from "@/lib/storage-keys";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/* ── Section wrapper ─────────────────────────────────────────── */

function Section({
  title,
  description,
  children,
  first,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  first?: boolean;
}) {
  return (
    <div className={cn(!first && "border-t border-border pt-6", "pb-2")}>
      <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
      {description && (
        <p className="text-xs text-text-muted mt-1 mb-4">{description}</p>
      )}
      {!description && <div className="mb-4" />}
      <div className="space-y-4">{children}</div>
    </div>
  );
}

/* ── Radio option ────────────────────────────────────────────── */

function RadioOption<T extends string>({
  name,
  value,
  selected,
  onChange,
  label,
  description,
}: {
  name: string;
  value: T;
  selected: T;
  onChange: (value: T) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <span className="relative mt-0.5 flex-shrink-0">
        <input
          type="radio"
          name={name}
          value={value}
          checked={selected === value}
          onChange={() => onChange(value)}
          className="sr-only"
        />
        <span
          className={cn(
            "block w-4 h-4 rounded-full border-2 transition-colors",
            selected === value
              ? "border-accent bg-accent"
              : "border-text-muted/40 bg-transparent group-hover:border-text-secondary"
          )}
        >
          {selected === value && (
            <span className="block w-1.5 h-1.5 rounded-full bg-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          )}
        </span>
      </span>
      <span>
        <span className="text-sm text-text-primary">{label}</span>
        {description && (
          <span className="block text-xs text-text-muted mt-0.5">
            {description}
          </span>
        )}
      </span>
    </label>
  );
}

/* ── Password input with show/hide toggle ────────────────────── */

function ApiKeyInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Enter API key..."}
        className="w-full bg-bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 pr-10 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50"
        autoComplete="off"
        spellCheck={false}
      />
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-secondary transition-colors"
        aria-label={visible ? "Hide API key" : "Show API key"}
      >
        {visible ? (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
          </svg>
        ) : (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}

/* ── Main SettingsPanel ──────────────────────────────────────── */

export default function SettingsPanel() {
  const { settings, updateSetting, hydrated } = useSettings();
  const [testVoiceState, setTestVoiceState] = useState<
    "idle" | "playing" | "error"
  >("idle");
  const [dataMessage, setDataMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [placementResult, setPlacementResult] =
    useLocalStorage<PlacementResult | null>(SK_PLACEMENT, null);

  const storageInfo = useMemo(() => {
    if (typeof window === "undefined") return { used: 0, keys: 0 };
    return getStorageUsage();
  }, []);

  if (!hydrated) return null;

  const levelLabels: Record<string, string> = {
    "complete-beginner": "Complete Beginner",
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
  };

  /* ── TTS test ──────────────────────────────────────────────── */

  const handleTestVoice = () => {
    if (typeof window === "undefined") return;
    setTestVoiceState("playing");

    const text = "\u05E9\u05DC\u05D5\u05DD"; // שלום

    if (settings.ttsProvider === "browser") {
      if (!window.speechSynthesis) {
        setTestVoiceState("error");
        setTimeout(() => setTestVoiceState("idle"), 2000);
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "he-IL";
      utterance.rate = 0.85;
      const voices = window.speechSynthesis.getVoices();
      const hebrewVoice =
        voices.find((v) => v.lang === "he-IL") ??
        voices.find((v) => v.lang.startsWith("he"));
      if (hebrewVoice) utterance.voice = hebrewVoice;
      utterance.onend = () => setTestVoiceState("idle");
      utterance.onerror = () => {
        setTestVoiceState("error");
        setTimeout(() => setTestVoiceState("idle"), 2000);
      };
      window.speechSynthesis.speak(utterance);
    } else {
      // For cloud providers, attempt browser fallback for now (actual cloud
      // integration would call respective APIs with the stored key)
      if (!settings.ttsApiKey) {
        setTestVoiceState("error");
        setTimeout(() => setTestVoiceState("idle"), 2000);
        return;
      }
      // Placeholder: cloud TTS would be called here
      // For now, use browser as demo
      if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "he-IL";
        utterance.rate = 0.85;
        utterance.onend = () => setTestVoiceState("idle");
        utterance.onerror = () => {
          setTestVoiceState("error");
          setTimeout(() => setTestVoiceState("idle"), 2000);
        };
        window.speechSynthesis.speak(utterance);
      } else {
        setTestVoiceState("error");
        setTimeout(() => setTestVoiceState("idle"), 2000);
      }
    }
  };

  /* ── Data management ───────────────────────────────────────── */

  const handleExport = () => {
    const data = getAllDavarData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const date = new Date().toISOString().split("T")[0];
    const a = document.createElement("a");
    a.href = url;
    a.download = `davar-backup-${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDataMessage({ type: "success", text: "Backup downloaded successfully." });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (typeof data !== "object" || data === null) {
          setDataMessage({
            type: "error",
            text: "Invalid backup file format.",
          });
          return;
        }

        const keys = Object.keys(data);
        const davarKeys = keys.filter((k) => k.startsWith(STORAGE_PREFIX));
        if (davarKeys.length === 0) {
          setDataMessage({
            type: "error",
            text: "No Davar data found in this file.",
          });
          return;
        }

        if (
          !window.confirm(
            `This will import ${davarKeys.length} data entries and replace your current progress. Continue?`
          )
        ) {
          return;
        }

        for (const key of davarKeys) {
          try {
            localStorage.setItem(key, JSON.stringify(data[key]));
          } catch {}
        }

        setDataMessage({
          type: "success",
          text: `Imported ${davarKeys.length} entries. Reload the page to see changes.`,
        });
      } catch {
        setDataMessage({
          type: "error",
          text: "Could not parse the backup file.",
        });
      }
    };
    reader.readAsText(file);

    if (fileRef.current) fileRef.current.value = "";
  };

  const handleReset = () => {
    if (
      !window.confirm(
        "Are you sure you want to delete ALL your Davar progress? This action cannot be undone."
      )
    ) {
      return;
    }

    // Second confirmation for safety
    if (
      !window.confirm(
        "This is your last chance. ALL vocabulary, streak, XP, and settings data will be permanently deleted. Proceed?"
      )
    ) {
      return;
    }

    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(STORAGE_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      for (const key of keysToRemove) {
        localStorage.removeItem(key);
      }
      setDataMessage({
        type: "success",
        text: `Cleared ${keysToRemove.length} entries. Reload the page to start fresh.`,
      });
    } catch {
      setDataMessage({ type: "error", text: "Failed to clear data." });
    }
  };

  /* ── Render ────────────────────────────────────────────────── */

  return (
    <div className="space-y-6">
      {/* ── Account & Cloud Sync ──────────────────────────────── */}
      <AccountPanel />

      <div className="bg-bg-card rounded-2xl border border-border p-6 space-y-6">
        {/* ── A. Text-to-Speech ─────────────────────────────────── */}
        <Section
          first
          title="Text-to-Speech"
          description="Browser default uses your system's Hebrew voice. API providers offer more natural pronunciation."
        >
          <div className="space-y-3">
            <RadioOption
              name="tts-provider"
              value="browser"
              selected={settings.ttsProvider}
              onChange={(v) => updateSetting("ttsProvider", v)}
              label="Browser Default (free)"
              description="Uses your operating system's built-in Hebrew voice"
            />
            <RadioOption
              name="tts-provider"
              value="google-cloud"
              selected={settings.ttsProvider}
              onChange={(v) => updateSetting("ttsProvider", v)}
              label="Google Cloud TTS"
              description="High-quality neural voices via Google Cloud"
            />
            <RadioOption
              name="tts-provider"
              value="elevenlabs"
              selected={settings.ttsProvider}
              onChange={(v) => updateSetting("ttsProvider", v)}
              label="ElevenLabs"
              description="Ultra-realistic AI voices"
            />
          </div>

          {/* API key input — shown for cloud providers */}
          {settings.ttsProvider !== "browser" && (
            <div className="mt-4 ml-7">
              <label className="block text-sm text-text-secondary mb-1.5">
                {settings.ttsProvider === "google-cloud"
                  ? "Google Cloud API Key"
                  : "ElevenLabs API Key"}
              </label>
              <ApiKeyInput
                value={settings.ttsApiKey}
                onChange={(v) => updateSetting("ttsApiKey", v)}
                placeholder={
                  settings.ttsProvider === "google-cloud"
                    ? "AIza..."
                    : "sk_..."
                }
              />
              <p className="text-xs text-text-muted mt-1.5">
                Stored locally in your browser. Never sent to our servers — only
                to{" "}
                {settings.ttsProvider === "google-cloud"
                  ? "Google Cloud"
                  : "ElevenLabs"}{" "}
                directly.
              </p>
            </div>
          )}

          {/* Test button */}
          <div className="mt-4">
            <button
              onClick={handleTestVoice}
              disabled={
                testVoiceState === "playing" ||
                (settings.ttsProvider !== "browser" && !settings.ttsApiKey)
              }
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                testVoiceState === "error"
                  ? "bg-red-500/10 text-red-400 border border-red-500/30"
                  : "bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20",
                (testVoiceState === "playing" ||
                  (settings.ttsProvider !== "browser" &&
                    !settings.ttsApiKey)) &&
                  "opacity-50 cursor-not-allowed"
              )}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
              {testVoiceState === "playing"
                ? "Playing..."
                : testVoiceState === "error"
                  ? "Voice unavailable"
                  : "Test Voice"}
              {testVoiceState === "idle" && (
                <span className="hebrew-text text-base leading-none">
                  {"\u05E9\u05DC\u05D5\u05DD"}
                </span>
              )}
            </button>
          </div>
        </Section>

        {/* ── B. AI Features ───────────────────────────────────── */}
        <Section
          title="AI Features"
          description="AI powers conversation practice and contextual sentence generation. API keys are stored locally and never sent to our servers."
        >
          <div className="space-y-3">
            <RadioOption
              name="ai-provider"
              value="none"
              selected={settings.aiProvider}
              onChange={(v) => updateSetting("aiProvider", v)}
              label="Disabled"
              description="AI-powered features will be hidden"
            />
            <RadioOption
              name="ai-provider"
              value="openai"
              selected={settings.aiProvider}
              onChange={(v) => updateSetting("aiProvider", v)}
              label="OpenAI (GPT-4o-mini)"
            />
            <RadioOption
              name="ai-provider"
              value="anthropic"
              selected={settings.aiProvider}
              onChange={(v) => updateSetting("aiProvider", v)}
              label="Anthropic (Claude)"
            />
            <RadioOption
              name="ai-provider"
              value="gemini"
              selected={settings.aiProvider}
              onChange={(v) => updateSetting("aiProvider", v)}
              label="Google (Gemini)"
            />
          </div>

          {/* API key + model — shown when AI is enabled */}
          {settings.aiProvider !== "none" && (
            <div className="mt-4 ml-7 space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">
                  API Key
                </label>
                <ApiKeyInput
                  value={settings.aiApiKey}
                  onChange={(v) => updateSetting("aiApiKey", v)}
                  placeholder={
                    settings.aiProvider === "openai"
                      ? "sk-..."
                      : settings.aiProvider === "anthropic"
                        ? "sk-ant-..."
                        : "AIza..."
                  }
                />
                <p className="text-xs text-text-muted mt-1.5">
                  Stored locally in your browser. Only sent directly to{" "}
                  {settings.aiProvider === "openai"
                    ? "OpenAI"
                    : settings.aiProvider === "anthropic"
                      ? "Anthropic"
                      : "Google"}{" "}
                  when you use AI features.
                </p>
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-1.5">
                  Model Name
                </label>
                <input
                  type="text"
                  value={settings.aiModel}
                  onChange={(e) => updateSetting("aiModel", e.target.value)}
                  placeholder={
                    settings.aiProvider === "openai"
                      ? "gpt-4o-mini"
                      : settings.aiProvider === "anthropic"
                        ? "claude-sonnet-4-20250514"
                        : "gemini-2.0-flash"
                  }
                  className="w-full bg-bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50"
                />
                <p className="text-xs text-text-muted mt-1.5">
                  Leave blank to use the default model for this provider.
                </p>
              </div>
            </div>
          )}
        </Section>

        {/* ── C. Study Preferences ─────────────────────────────── */}
        <Section title="Study Preferences">
          <div className="space-y-4">
            {/* Daily new cards */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm text-text-secondary">
                  Daily new cards
                </label>
                <p className="text-xs text-text-muted">
                  Number of new vocabulary cards introduced each day
                </p>
              </div>
              <input
                type="number"
                min={5}
                max={50}
                value={settings.dailyNewCards}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (!isNaN(v)) {
                    updateSetting(
                      "dailyNewCards",
                      Math.max(5, Math.min(50, v))
                    );
                  }
                }}
                className="w-20 bg-bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-text-primary text-center focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50"
              />
            </div>

            {/* Auto-play audio */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm text-text-secondary">
                  Auto-play audio
                </label>
                <p className="text-xs text-text-muted">
                  Automatically play pronunciation when revealing a card
                </p>
              </div>
              <button
                onClick={() =>
                  updateSetting("autoPlayAudio", !settings.autoPlayAudio)
                }
                className={cn(
                  "relative w-11 h-6 rounded-full transition-colors flex-shrink-0",
                  settings.autoPlayAudio
                    ? "bg-accent"
                    : "bg-text-muted/30"
                )}
                role="switch"
                aria-checked={settings.autoPlayAudio}
                aria-label="Toggle auto-play audio"
              >
                <span
                  className={cn(
                    "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform",
                    settings.autoPlayAudio && "translate-x-5"
                  )}
                />
              </button>
            </div>
          </div>
        </Section>

        {/* ── D. Placement Level ─────────────────────────────── */}
        <Section
          title="Placement Level"
          description="Your starting level was set by the placement assessment."
        >
          {placementResult ? (
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-text-primary font-medium">
                  {levelLabels[placementResult.level] ?? placementResult.level}
                </span>
                <span className="text-xs text-text-muted ml-2">
                  ({placementResult.score}/{placementResult.totalQuestions} correct)
                </span>
              </div>
              <button
                onClick={() => {
                  if (window.confirm("Retake the placement test? This will reset your placement level and may mark additional words as known.")) {
                    setPlacementResult(null);
                    window.location.reload();
                  }
                }}
                className="px-4 py-2 rounded-xl bg-accent/10 border border-accent/30 text-accent text-sm font-medium hover:bg-accent/20 transition-colors"
              >
                Retake Test
              </button>
            </div>
          ) : (
            <p className="text-sm text-text-muted">
              No placement test taken yet. Reload the page to start one.
            </p>
          )}
        </Section>

        {/* ── E. Data Management ───────────────────────────────── */}
        <Section title="Data Management">
          {/* Storage usage */}
          <div className="bg-bg-secondary rounded-lg px-4 py-3 border border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">
                localStorage usage
              </span>
              <span className="text-sm font-medium text-text-primary">
                {formatBytes(storageInfo.used * 2)} across{" "}
                {storageInfo.keys} keys
              </span>
            </div>
            {/* Visual bar */}
            <div className="mt-2 h-1.5 bg-bg-primary rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all"
                style={{
                  width: `${Math.min(100, ((storageInfo.used * 2) / (5 * 1024 * 1024)) * 100)}%`,
                }}
              />
            </div>
            <p className="text-xs text-text-muted mt-1">
              ~5 MB available in localStorage
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            {/* Export */}
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-blue/15 border border-accent-blue/30 text-accent-blue text-sm font-medium hover:bg-accent-blue/25 transition-colors"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export All Data
            </button>

            {/* Import */}
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-green/15 border border-accent-green/30 text-accent-green text-sm font-medium hover:bg-accent-green/25 transition-colors"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Import Data
            </button>

            {/* Reset */}
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Reset All Progress
            </button>
          </div>

          {/* Status message */}
          {dataMessage && (
            <div
              className={cn(
                "text-sm px-3 py-2 rounded-lg",
                dataMessage.type === "success"
                  ? "bg-accent-green/10 text-accent-green"
                  : "bg-red-500/10 text-red-400"
              )}
            >
              {dataMessage.text}
            </div>
          )}
        </Section>
      </div>

      {/* Privacy footer */}
      <div className="bg-bg-card rounded-2xl border border-border p-4">
        <div className="flex items-start gap-3">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-accent-green mt-0.5 flex-shrink-0"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <div>
            <p className="text-sm font-medium text-text-primary">
              Your data stays on your device
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              All settings and API keys are stored in your browser&apos;s
              localStorage. They are never transmitted to any server except the
              respective API providers (OpenAI, Anthropic, Google, ElevenLabs)
              when you actively use those features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
