"use client";

import { useState, useCallback, useRef, useEffect } from "react";

/* ── Types ────────────────────────────────────────────────── */

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

type RecState = "idle" | "listening" | "processing" | "error";

interface SpeechRecognitionHook {
  /** Start listening for Hebrew speech */
  startListening: () => void;
  /** Stop listening */
  stopListening: () => void;
  /** Current state of the recognizer */
  state: RecState;
  /** Latest transcript result */
  result: SpeechRecognitionResult | null;
  /** Whether the browser supports Web Speech API */
  isSupported: boolean;
  /** Error message if state === 'error' */
  errorMessage: string;
}

/* ── Web Speech API type shims ────────────────────────────── */

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

/* ── Hook ─────────────────────────────────────────────────── */

export function useSpeechRecognition(): SpeechRecognitionHook {
  const [state, setState] = useState<RecState>("idle");
  const [result, setResult] = useState<SpeechRecognitionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const recognizerRef = useRef<SpeechRecognitionInstance | null>(null);

  const isSupported = typeof window !== "undefined" && getSpeechRecognition() !== null;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognizerRef.current) {
        recognizerRef.current.abort();
        recognizerRef.current = null;
      }
    };
  }, []);

  const startListening = useCallback(() => {
    const SRConstructor = getSpeechRecognition();
    if (!SRConstructor) {
      setState("error");
      setErrorMessage("Speech recognition not supported in this browser.");
      return;
    }

    // Stop any existing session
    if (recognizerRef.current) {
      recognizerRef.current.abort();
    }

    const recognition = new SRConstructor();
    recognition.lang = "he-IL";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setState("listening");
      setErrorMessage("");
      setResult(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const last = event.results[event.results.length - 1];
      const transcript = last[0].transcript;
      const confidence = last[0].confidence;
      const isFinal = last.isFinal;

      setResult({ transcript, confidence, isFinal });

      if (isFinal) {
        setState("idle");
      } else {
        setState("processing");
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // "no-speech" and "aborted" are user-driven, not real errors
      if (event.error === "no-speech" || event.error === "aborted") {
        setState("idle");
        return;
      }
      setState("error");
      setErrorMessage(
        event.error === "not-allowed"
          ? "Microphone access denied. Allow microphone in browser settings."
          : `Speech recognition error: ${event.error}`
      );
    };

    recognition.onend = () => {
      if (state === "listening" || state === "processing") {
        setState("idle");
      }
      recognizerRef.current = null;
    };

    recognizerRef.current = recognition;

    try {
      recognition.start();
    } catch {
      setState("error");
      setErrorMessage("Failed to start speech recognition.");
    }
  }, [state]);

  const stopListening = useCallback(() => {
    if (recognizerRef.current) {
      recognizerRef.current.stop();
    }
    setState("idle");
  }, []);

  return {
    startListening,
    stopListening,
    state,
    result,
    isSupported,
    errorMessage,
  };
}
