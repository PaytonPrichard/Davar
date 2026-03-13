"use client";

import { useSyncExternalStore, useCallback } from "react";
import { SK_THEME, SK_THEME_CHANGE } from "@/lib/storage-keys";

type Theme = "dark" | "light";

function getThemeSnapshot(): Theme {
  try {
    const stored = localStorage.getItem(SK_THEME);
    if (stored === "light" || stored === "dark") return stored;
  } catch {}
  return "light";
}

function getServerSnapshot(): Theme {
  return "light";
}

function subscribe(callback: () => void): () => void {
  // Listen for storage changes (cross-tab) and custom event (same-tab)
  window.addEventListener("storage", callback);
  window.addEventListener(SK_THEME_CHANGE, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(SK_THEME_CHANGE, callback);
  };
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getThemeSnapshot, getServerSnapshot);

  const setTheme = useCallback((newTheme: Theme) => {
    document.documentElement.setAttribute("data-theme", newTheme);
    try {
      localStorage.setItem(SK_THEME, newTheme);
    } catch {}
    window.dispatchEvent(new Event(SK_THEME_CHANGE));
  }, []);

  const toggleTheme = useCallback(() => {
    const current = getThemeSnapshot();
    const next = current === "dark" ? "light" : "dark";
    setTheme(next);
  }, [setTheme]);

  return { theme, setTheme, toggleTheme, hydrated: true };
}
