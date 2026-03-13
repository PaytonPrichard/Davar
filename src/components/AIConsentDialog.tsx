"use client";

import { acceptAIConsent } from "@/lib/ai";

interface AIConsentDialogProps {
  provider: string;
  onAccept: () => void;
  onDecline: () => void;
}

export default function AIConsentDialog({
  provider,
  onAccept,
  onDecline,
}: AIConsentDialogProps) {
  const handleAccept = () => {
    acceptAIConsent();
    onAccept();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-bg-card border border-border rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
        <h2 className="text-lg font-bold text-text-primary mb-3">
          AI Provider Notice
        </h2>
        <p className="text-sm text-text-secondary leading-relaxed mb-6">
          You&apos;re about to use {provider}. Text you enter will be sent to{" "}
          {provider}&apos;s servers for processing. Your API key is transmitted
          securely through our server and is never stored by us.
        </p>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onDecline}
            className="px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary border border-border hover:border-text-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
