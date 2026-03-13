"use client";

import { useState, useRef, useMemo } from "react";

const DAVAR_PREFIX = "davar-";

function getAllDavarData(): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(DAVAR_PREFIX)) {
        try {
          data[key] = JSON.parse(localStorage.getItem(key) ?? "null");
        } catch {
          data[key] = localStorage.getItem(key);
        }
      }
    }
  } catch {}
  return data;
}

function getStorageSizeBytes(): number {
  let total = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(DAVAR_PREFIX)) {
        total += (localStorage.getItem(key) ?? "").length * 2; // UTF-16
      }
    }
  } catch {}
  return total;
}

export default function ExportImport() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const sizeKB = useMemo(() => {
    if (typeof window === "undefined") return 0;
    return (getStorageSizeBytes() / 1024).toFixed(1);
  }, []);

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
    setMessage({ type: "success", text: "Backup downloaded!" });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (typeof data !== "object" || data === null) {
          setMessage({ type: "error", text: "Invalid backup file format." });
          return;
        }

        // Validate it has davar- keys
        const keys = Object.keys(data);
        const davarKeys = keys.filter((k) => k.startsWith(DAVAR_PREFIX));
        if (davarKeys.length === 0) {
          setMessage({
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

        setMessage({
          type: "success",
          text: `Imported ${davarKeys.length} entries. Reload the page to see changes.`,
        });
      } catch {
        setMessage({ type: "error", text: "Could not parse the backup file." });
      }
    };
    reader.readAsText(file);

    // Reset file input
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleReset = () => {
    if (
      !window.confirm(
        "Are you sure you want to delete ALL your Davar progress? This cannot be undone."
      )
    ) {
      return;
    }

    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(DAVAR_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      for (const key of keysToRemove) {
        localStorage.removeItem(key);
      }
      setMessage({
        type: "success",
        text: `Cleared ${keysToRemove.length} entries. Reload the page to start fresh.`,
      });
    } catch {
      setMessage({ type: "error", text: "Failed to clear data." });
    }
  };

  return (
    <div className="bg-bg-card rounded-2xl border border-border p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-1">
        Data Management
      </h3>
      <p className="text-xs text-text-muted mb-4">
        Current storage: ~{sizeKB} KB
      </p>

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
          Export Backup
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
          Import Backup
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
          Reset All Data
        </button>
      </div>

      {/* Status message */}
      {message && (
        <div
          className={`mt-3 text-sm px-3 py-2 rounded-lg ${
            message.type === "success"
              ? "bg-accent-green/10 text-accent-green"
              : "bg-red-500/10 text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
