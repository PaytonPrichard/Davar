"use client";

import { useSyncExternalStore, useCallback } from "react";

type Theme = "dark" | "light";

function getThemeSnapshot(): Theme {
  try {
    const stored = localStorage.getItem("davar-theme");
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
  window.addEventListener("davar-theme-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("davar-theme-change", callback);
  };
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getThemeSnapshot, getServerSnapshot);

  const setTheme = useCallback((newTheme: Theme) => {
    document.documentElement.setAttribute("data-theme", newTheme);
    try {
      localStorage.setItem("davar-theme", newTheme);
    } catch {}
    window.dispatchEvent(new Event("davar-theme-change"));
  }, []);

  const toggleTheme = useCallback(() => {
    const current = getThemeSnapshot();
    const next = current === "dark" ? "light" : "dark";
    setTheme(next);
  }, [setTheme]);

  return { theme, setTheme, toggleTheme, hydrated: true };
}
