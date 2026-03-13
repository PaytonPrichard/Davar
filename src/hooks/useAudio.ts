"use client";

import { useCallback, useRef, useState } from "react";
import { AppSettings } from "@/types";

export type AudioState = "idle" | "loading" | "playing" | "error";

/**
 * Speak Hebrew text using the configured TTS provider.
 *
 * Priority chain (based on settings):
 *  1. Google Cloud TTS (neural voices, free tier: 1M WaveNet chars/mo)
 *  2. ElevenLabs (ultra-realistic, paid)
 *  3. Google Translate TTS (free, no key needed)
 *  4. Browser Web Speech API (free fallback)
 */
export function useAudio(settings?: AppSettings) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastPlayRef = useRef(0);
  const [audioState, setAudioState] = useState<AudioState>("idle");

  const DEBOUNCE_MS = 500;

  const speak = useCallback(
    (text: string) => {
      if (typeof window === "undefined") return;

      // Debounce: prevent rapid-fire audio requests
      const now = Date.now();
      if (now - lastPlayRef.current < DEBOUNCE_MS) return;
      lastPlayRef.current = now;

      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }

      setAudioState("loading");

      const provider = settings?.ttsProvider ?? "browser";
      const apiKey = settings?.ttsApiKey ?? "";

      if (provider === "google-cloud" && apiKey) {
        speakGoogleCloud(text, apiKey);
      } else if (provider === "elevenlabs" && apiKey) {
        speakElevenLabs(text, apiKey);
      } else {
        speakGoogleTranslate(text);
      }
    },
    [settings?.ttsProvider, settings?.ttsApiKey]
  );

  /* ── Google Cloud TTS (proxied via /api/tts) ─────────────── */
  function speakGoogleCloud(text: string, apiKey: string) {
    fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider: "google-cloud",
        apiKey,
        text,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Google Cloud TTS: ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        playBlob(blob);
      })
      .catch(() => {
        // Fallback to Google Translate
        speakGoogleTranslate(text);
      });
  }

  /* ── ElevenLabs TTS (proxied via /api/tts) ─────────────── */
  function speakElevenLabs(text: string, apiKey: string) {
    fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider: "elevenlabs",
        apiKey,
        text,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`ElevenLabs: ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        playBlob(blob);
      })
      .catch(() => {
        // Fallback to Google Translate
        speakGoogleTranslate(text);
      });
  }

  /* ── Google Translate TTS (free, no key) ─────────────────── */
  function speakGoogleTranslate(text: string) {
    const encoded = encodeURIComponent(text);
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=he&q=${encoded}`;
    const audio = new Audio(url);
    audioRef.current = audio;

    audio.onplay = () => setAudioState("playing");
    audio.onended = () => setAudioState("idle");
    audio.onerror = () => {
      // Last resort: browser Web Speech API
      speakBrowser(text);
    };

    audio.play().catch(() => {
      speakBrowser(text);
    });
  }

  /* ── Browser Web Speech API (last fallback) ──────────────── */
  function speakBrowser(text: string) {
    if (!window.speechSynthesis) {
      setAudioState("error");
      setTimeout(() => setAudioState("idle"), 2000);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "he-IL";
    utterance.rate = 0.85;
    const voices = window.speechSynthesis.getVoices();
    const hebrewVoice =
      voices.find((v) => v.lang === "he-IL") ??
      voices.find((v) => v.lang.startsWith("he"));
    if (hebrewVoice) utterance.voice = hebrewVoice;
    utterance.onstart = () => setAudioState("playing");
    utterance.onend = () => setAudioState("idle");
    utterance.onerror = () => {
      setAudioState("error");
      setTimeout(() => setAudioState("idle"), 2000);
    };
    window.speechSynthesis.speak(utterance);
  }

  /* ── Play an audio blob ──────────────────────────────────── */
  function playBlob(blob: Blob) {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audioRef.current = audio;

    audio.onplay = () => setAudioState("playing");
    audio.onended = () => {
      setAudioState("idle");
      URL.revokeObjectURL(url);
    };
    audio.onerror = () => {
      setAudioState("error");
      URL.revokeObjectURL(url);
      setTimeout(() => setAudioState("idle"), 2000);
    };

    audio.play().catch(() => {
      setAudioState("error");
      URL.revokeObjectURL(url);
      setTimeout(() => setAudioState("idle"), 2000);
    });
  }

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setAudioState("idle");
  }, []);

  return { speak, stop, audioState };
}
