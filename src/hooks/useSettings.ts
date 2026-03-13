"use client";

import { useLocalStorage } from "./useLocalStorage";
import { AppSettings, DEFAULT_SETTINGS } from "@/types";
import { SK_SETTINGS } from "@/lib/storage-keys";

export function useSettings() {
  const [settings, setSettings, hydrated] = useLocalStorage<AppSettings>(
    SK_SETTINGS,
    DEFAULT_SETTINGS
  );

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return { settings, updateSetting, hydrated };
}
