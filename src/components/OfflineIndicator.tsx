"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getSnapshot() {
  return navigator.onLine;
}

function getServerSnapshot() {
  // During SSR, assume online
  return true;
}

/**
 * Small hook to track the "just reconnected" state.
 * Shows a green banner for 3 seconds after coming back online.
 */
function useReconnectedBanner(isOnline: boolean): boolean {
  const [visible, setVisible] = useState(false);
  const wasOfflineRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isOnline) {
      // We're offline now — mark it
      wasOfflineRef.current = true;
      setVisible(false);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    } else if (wasOfflineRef.current) {
      // Just came back online
      wasOfflineRef.current = false;
      setVisible(true);
      timerRef.current = setTimeout(() => {
        setVisible(false);
        timerRef.current = null;
      }, 3000);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isOnline]);

  return visible;
}

export default function OfflineIndicator() {
  const isOnline = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const reconnectedVisible = useReconnectedBanner(isOnline);

  // Nothing to show when online and not recently reconnected
  if (isOnline && !reconnectedVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 text-center text-xs font-medium py-1.5 px-4 transition-all duration-300",
        !isOnline
          ? "bg-amber-500/90 text-amber-950"
          : "bg-green-500/90 text-green-950"
      )}
    >
      {!isOnline
        ? "You're offline — progress will sync when reconnected"
        : "Back online!"}
    </div>
  );
}
