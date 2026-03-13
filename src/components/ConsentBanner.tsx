"use client";

import { useState, useEffect } from "react";

const CONSENT_KEY = "davar-consent-accepted";

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(CONSENT_KEY)) {
        setVisible(true);
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(CONSENT_KEY, "true");
    } catch {
      // localStorage unavailable
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-bg-secondary border-t border-border px-4 py-3">
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm text-text-secondary">
          Davar uses local storage to save your learning progress and
          preferences.{" "}
          <a
            href="/privacy"
            className="text-accent hover:text-accent-hover underline transition-colors"
          >
            Privacy Policy
          </a>
        </p>
        <button
          onClick={accept}
          className="px-4 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors shrink-0"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
