"use client";

import { ALPHABET } from "@/data/alphabet";
import AudioButton from "./AudioButton";

export default function AlphabetMode() {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-accent/10 border border-accent/20 rounded-xl px-4 py-3 text-sm text-text-secondary leading-relaxed">
        <span className="font-medium text-accent">Hebrew reads right to left.</span>{" "}
        The alphabet below flows the same way — start from the top-right. This also applies to words,
        sentences, and books. Numbers, however, are read left to right just like in English.
      </div>

      <p className="text-text-secondary text-sm">
        Click any letter to hear its pronunciation. The Hebrew alphabet has 22
        letters, some with alternate forms.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3" dir="rtl">
        {ALPHABET.map((letter, i) => (
          <div
            key={i}
            className="bg-bg-card border border-border rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-bg-card-hover hover:border-accent/50 transition-colors"
          >
            <div className="hebrew-text text-4xl font-bold text-text-primary">
              {letter.hebrew}
            </div>
            {letter.final && (
              <div className="hebrew-text text-2xl text-text-muted">
                {letter.final}
                <span className="text-xs ml-1">(final)</span>
              </div>
            )}
            <div className="text-sm font-medium text-accent">
              {letter.name}
            </div>
            <div className="text-xs text-text-secondary">{letter.sound}</div>
            <div className="text-xs text-text-muted">
              /{letter.transliteration}/
            </div>
            <AudioButton text={letter.hebrew} size="sm" />
          </div>
        ))}
      </div>
    </div>
  );
}
