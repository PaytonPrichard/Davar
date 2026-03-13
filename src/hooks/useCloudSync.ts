"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { STORAGE_PREFIX, SK_ACHIEVEMENTS, SK_CARD_STATES, SK_SETTINGS, SK_STREAK, SK_TOTAL_REVIEWS, SK_XP } from "@/lib/storage-keys";

const DAVAR_PREFIX = STORAGE_PREFIX;
// Keys that contain API keys / secrets — never sync to cloud
const EXCLUDED_KEYS = [SK_SETTINGS];

type SyncStatus = "idle" | "syncing" | "synced" | "error" | "conflict";

interface SyncState {
  status: SyncStatus;
  lastSynced: string | null;
  error: string | null;
}

/** Collect all davar-* keys from localStorage into a plain object. */
function getLocalData(): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(DAVAR_PREFIX)) continue;
    if (EXCLUDED_KEYS.includes(key)) continue;
    try {
      data[key] = JSON.parse(localStorage.getItem(key)!);
    } catch {
      data[key] = localStorage.getItem(key);
    }
  }
  return data;
}

/** Write cloud data into localStorage, preserving any keys not in the payload. */
function applyCloudData(data: Record<string, unknown>) {
  for (const [key, value] of Object.entries(data)) {
    if (!key.startsWith(DAVAR_PREFIX)) continue;
    if (EXCLUDED_KEYS.includes(key)) continue;
    localStorage.setItem(key, JSON.stringify(value));
  }
}

/**
 * Simple merge: for each key, pick whichever side has more "progress".
 * Falls back to cloud data for keys that only exist on one side.
 */
function mergeData(
  local: Record<string, unknown>,
  cloud: Record<string, unknown>
): Record<string, unknown> {
  const allKeys = new Set([...Object.keys(local), ...Object.keys(cloud)]);
  const merged: Record<string, unknown> = {};

  for (const key of allKeys) {
    const l = local[key];
    const c = cloud[key];

    if (l === undefined) {
      merged[key] = c;
      continue;
    }
    if (c === undefined) {
      merged[key] = l;
      continue;
    }

    // For XP state, keep higher totalXP
    if (key === SK_XP) {
      const lxp = (l as Record<string, number>)?.totalXP ?? 0;
      const cxp = (c as Record<string, number>)?.totalXP ?? 0;
      merged[key] = lxp >= cxp ? l : c;
      continue;
    }

    // For streak, keep higher current
    if (key === SK_STREAK) {
      const ls = (l as Record<string, number>)?.current ?? 0;
      const cs = (c as Record<string, number>)?.current ?? 0;
      merged[key] = ls >= cs ? l : c;
      continue;
    }

    // For card states (SRS), keep whichever has more entries
    if (key === SK_CARD_STATES) {
      const lCount = Object.keys(l as Record<string, unknown>).length;
      const cCount = Object.keys(c as Record<string, unknown>).length;
      // Merge individual cards — keep each card's most recent review
      if (typeof l === "object" && typeof c === "object") {
        const lCards = l as Record<string, Record<string, unknown>>;
        const cCards = c as Record<string, Record<string, unknown>>;
        const mergedCards: Record<string, unknown> = { ...cCards };
        for (const [cardId, cardState] of Object.entries(lCards)) {
          const cloudCard = cCards[cardId] as Record<string, string> | undefined;
          if (
            !cloudCard ||
            (cardState as Record<string, string>).lastReview > cloudCard.lastReview
          ) {
            mergedCards[cardId] = cardState;
          }
        }
        merged[key] = mergedCards;
        continue;
      }
      merged[key] = lCount >= cCount ? l : c;
      continue;
    }

    // For total-reviews, keep higher
    if (key === SK_TOTAL_REVIEWS) {
      merged[key] = Math.max(
        typeof l === "number" ? l : 0,
        typeof c === "number" ? c : 0
      );
      continue;
    }

    // For achievements, merge unlocked IDs
    if (key === SK_ACHIEVEMENTS) {
      const la = l as { unlockedIds?: string[]; unlockedAt?: Record<string, string> };
      const ca = c as { unlockedIds?: string[]; unlockedAt?: Record<string, string> };
      const ids = [...new Set([...(la.unlockedIds ?? []), ...(ca.unlockedIds ?? [])])];
      const at = { ...(ca.unlockedAt ?? {}), ...(la.unlockedAt ?? {}) };
      merged[key] = { unlockedIds: ids, unlockedAt: at };
      continue;
    }

    // Default: local wins (user's current device is authoritative)
    merged[key] = l;
  }

  return merged;
}

export function useCloudSync(user: User | null) {
  const [state, setState] = useState<SyncState>({
    status: "idle",
    lastSynced: null,
    error: null,
  });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSyncing = useRef(false);

  /** Pull from cloud, merge with local, push merged result back. */
  const sync = useCallback(async () => {
    if (!supabase || !user || isSyncing.current) return;
    isSyncing.current = true;
    setState((s) => ({ ...s, status: "syncing", error: null }));

    try {
      // 1. Fetch cloud data
      const { data: row, error: fetchErr } = await supabase
        .from("user_progress")
        .select("progress_data, updated_at")
        .eq("user_id", user.id)
        .maybeSingle();

      if (fetchErr) throw fetchErr;

      const localData = getLocalData();
      const cloudData = (row?.progress_data as Record<string, unknown>) ?? {};

      // 2. Merge
      const merged = mergeData(localData, cloudData);

      // 3. Apply merged data locally
      applyCloudData(merged);

      // 4. Push merged data to cloud
      const { error: upsertErr } = await supabase.from("user_progress").upsert(
        {
          user_id: user.id,
          progress_data: merged,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      if (upsertErr) throw upsertErr;

      const now = new Date().toISOString();
      setState({ status: "synced", lastSynced: now, error: null });
    } catch (err) {
      setState((s) => ({
        ...s,
        status: "error",
        error: err instanceof Error ? err.message : "Sync failed",
      }));
    } finally {
      isSyncing.current = false;
    }
  }, [user]);

  /** Debounced push — call this after meaningful user actions. */
  const scheduleSync = useCallback(() => {
    if (!supabase || !user) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => sync(), 5000);
  }, [user, sync]);

  // Sync on sign-in
  useEffect(() => {
    if (user) sync();
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [user, sync]);

  // Listen for localStorage changes (from other hooks) and schedule sync
  useEffect(() => {
    if (!user) return;

    const handleStorage = (e: StorageEvent) => {
      if (e.key?.startsWith(DAVAR_PREFIX) && !EXCLUDED_KEYS.includes(e.key)) {
        scheduleSync();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [user, scheduleSync]);

  return {
    ...state,
    sync,
    scheduleSync,
  };
}
