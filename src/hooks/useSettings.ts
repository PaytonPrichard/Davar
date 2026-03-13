"use client";

import { useLocalStorage } from "./useLocalStorage";
import { AppSettings, DEFAULT_SETTINGS } from "@/types";

export function useSettings() {
  const [settings, setSettings, hydrated] = useLocalStorage<AppSettings>(
    "davar-settings",
    DEFAULT_SETTINGS
  );

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return { settings, updateSetting, hydrated };
}
