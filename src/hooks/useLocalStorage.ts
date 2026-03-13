"use client";

import { useState, useCallback, useSyncExternalStore } from "react";

/** Estimate localStorage usage for all davar-* keys */
export function getStorageUsage(): { used: number; keys: number } {
  let used = 0;
  let keys = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith("davar-")) {
        used += (localStorage.getItem(k) ?? "").length;
        keys++;
      }
    }
  } catch {}
  return { used, keys };
}

/** Validate parsed data is a non-null object (basic schema check) */
function isValidShape(parsed: unknown, defaultValue: unknown): boolean {
  if (parsed === null || parsed === undefined) return false;
  // Same type check
  if (typeof parsed !== typeof defaultValue) return false;
  // If default is an array, parsed should be an array
  if (Array.isArray(defaultValue) && !Array.isArray(parsed)) return false;
  // If default is a plain object, parsed should be a plain object
  if (
    typeof defaultValue === "object" &&
    !Array.isArray(defaultValue) &&
    defaultValue !== null
  ) {
    if (typeof parsed !== "object" || Array.isArray(parsed)) return false;
  }
  return true;
}

const STORAGE_WARN_BYTES = 4_000_000; // warn at ~4MB

function subscribeToNothing() {
  return () => {};
}

function getHydratedSnapshot() {
  return true;
}

function getHydratedServerSnapshot() {
  return false;
}

export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void, boolean] {
  const hydrated = useSyncExternalStore(
    subscribeToNothing,
    getHydratedSnapshot,
    getHydratedServerSnapshot
  );

  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        if (isValidShape(parsed, defaultValue)) {
          return parsed;
        }
        console.warn(`[Davar] Invalid data shape for ${key}, using default`);
      }
    } catch {
      console.warn(`[Davar] Failed to parse ${key}, using default`);
    }
    return defaultValue;
  });

  // Persist to localStorage on change
  const setStoredValue = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof newValue === "function"
            ? (newValue as (prev: T) => T)(prev)
            : newValue;
        try {
          const json = JSON.stringify(resolved);
          localStorage.setItem(key, json);

          // Check storage usage after write
          const { used } = getStorageUsage();
          if (used > STORAGE_WARN_BYTES) {
            console.warn(
              `[Davar] Storage usage is high: ${(used / 1024 / 1024).toFixed(1)}MB. Consider exporting and clearing old data.`
            );
          }
        } catch (e) {
          console.error(`[Davar] Failed to save ${key}:`, e);
        }
        return resolved;
      });
    },
    [key]
  );

  return [value, setStoredValue, hydrated];
}
