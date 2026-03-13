"use client";

import { cn } from "@/lib/utils";

interface HebrewKeyboardProps {
  onKeyPress: (char: string) => void;
  onBackspace: () => void;
  visible: boolean;
  onToggle: () => void;
}

const ROW_1 = ["ק", "ר", "א", "ט", "ו", "ן", "ם", "פ"];
const ROW_2 = ["ש", "ד", "ג", "כ", "ע", "י", "ח", "ל", "ך", "ף"];
const ROW_3 = ["ז", "ס", "ב", "ה", "נ", "מ", "צ", "ת", "ץ"];

// Common nikud (vowel) marks
const NIKUD = [
  { char: "\u05B7", label: "a" },   // Patach
  { char: "\u05B8", label: "a" },   // Kamatz
  { char: "\u05B6", label: "e" },   // Segol
  { char: "\u05B5", label: "ei" },  // Tsere
  { char: "\u05B4", label: "i" },   // Hiriq
  { char: "\u05B9", label: "o" },   // Holam
  { char: "\u05BB", label: "u" },   // Kubutz
  { char: "\u05BC", label: "·" },   // Dagesh
  { char: "\u05B0", label: ":" },   // Shva
];

export default function HebrewKeyboard({
  onKeyPress,
  onBackspace,
  visible,
  onToggle,
}: HebrewKeyboardProps) {
  return (
    <>
      {/* Toggle button — always visible */}
      <button
        onClick={onToggle}
        className={cn(
          "fixed bottom-4 right-4 z-40 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all",
          visible
            ? "bg-accent text-white bottom-[280px]"
            : "bg-bg-card border border-border text-text-primary hover:bg-bg-card-hover"
        )}
        aria-label={visible ? "Hide Hebrew keyboard" : "Show Hebrew keyboard"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01" />
          <path d="M8 12h.01M12 12h.01M16 12h.01" />
          <path d="M7 16h10" />
        </svg>
      </button>

      {/* Keyboard overlay */}
      {visible && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-bg-secondary border-t border-border rounded-t-2xl shadow-2xl pb-safe">
          <div className="max-w-lg mx-auto px-2 pt-3 pb-4">
            {/* Row 1 */}
            <div className="flex justify-center gap-1 mb-1">
              {ROW_1.map((char) => (
                <Key key={char} char={char} onPress={onKeyPress} />
              ))}
            </div>

            {/* Row 2 */}
            <div className="flex justify-center gap-1 mb-1">
              {ROW_2.map((char) => (
                <Key key={char} char={char} onPress={onKeyPress} />
              ))}
            </div>

            {/* Row 3 */}
            <div className="flex justify-center gap-1 mb-1.5">
              {ROW_3.map((char) => (
                <Key key={char} char={char} onPress={onKeyPress} />
              ))}
            </div>

            {/* Nikud row */}
            <div className="flex justify-center gap-1 mb-1.5">
              {NIKUD.map((n, i) => (
                <button
                  key={`nikud-${i}`}
                  onClick={() => onKeyPress(n.char)}
                  className="w-8 h-8 rounded-lg bg-bg-card border border-border text-text-primary text-sm font-medium flex flex-col items-center justify-center hover:bg-bg-card-hover active:scale-95 transition-all"
                  aria-label={`Nikud ${n.label}`}
                >
                  <span className="hebrew-text text-base leading-none">
                    {"\u25CC"}{n.char}
                  </span>
                </button>
              ))}
            </div>

            {/* Bottom row: backspace + space */}
            <div className="flex justify-center gap-1">
              <button
                onClick={onBackspace}
                className="h-10 px-4 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-medium flex items-center justify-center hover:bg-red-500/25 active:scale-95 transition-all"
                aria-label="Backspace"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                  <line x1="18" y1="9" x2="12" y2="15" />
                  <line x1="12" y1="9" x2="18" y2="15" />
                </svg>
              </button>
              <button
                onClick={() => onKeyPress(" ")}
                className="flex-1 max-w-[200px] h-10 rounded-lg bg-bg-card border border-border text-text-muted text-xs font-medium flex items-center justify-center hover:bg-bg-card-hover active:scale-95 transition-all"
                aria-label="Space"
              >
                space
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Key({
  char,
  onPress,
}: {
  char: string;
  onPress: (char: string) => void;
}) {
  return (
    <button
      onClick={() => onPress(char)}
      className="w-9 h-10 rounded-lg bg-bg-card border border-border text-text-primary hebrew-text text-lg font-medium flex items-center justify-center hover:bg-bg-card-hover active:scale-95 transition-all shadow-sm"
    >
      {char}
    </button>
  );
}
