"use client";

interface XPNotificationProps {
  amount: number;
  action: string;
  visible: boolean;
}

export default function XPNotification({
  amount,
  action,
  visible,
}: XPNotificationProps) {
  if (!visible) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 bg-accent/90 text-white rounded-xl px-4 py-2 shadow-lg animate-[slideUp_0.3s_ease-out]"
      role="status"
      aria-live="polite"
    >
      <p className="text-sm font-semibold">+{amount} XP</p>
      <p className="text-xs opacity-80">{action}</p>
    </div>
  );
}
