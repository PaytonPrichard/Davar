"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ALPHABET } from "@/data/alphabet";
import AudioButton from "./AudioButton";
import { cn } from "@/lib/utils";

type PracticeMode = "trace" | "type";

export default function WritingPractice() {
  const [mode, setMode] = useState<PracticeMode>("trace");
  const [letterIdx, setLetterIdx] = useState(0);
  const [practiced, setPracticed] = useState<Set<number>>(new Set());

  // Type mode state
  const [typeAnswer, setTypeAnswer] = useState("");
  const [typeResult, setTypeResult] = useState<"correct" | "incorrect" | null>(null);

  const letter = ALPHABET[letterIdx];

  const markPracticed = useCallback(() => {
    setPracticed((prev) => new Set(prev).add(letterIdx));
  }, [letterIdx]);

  const goTo = (idx: number) => {
    setLetterIdx(idx);
    setTypeAnswer("");
    setTypeResult(null);
  };

  const prev = () => goTo(Math.max(0, letterIdx - 1));
  const next = () => {
    markPracticed();
    goTo(Math.min(ALPHABET.length - 1, letterIdx + 1));
  };

  // Arrow key navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
      if (e.key === "ArrowRight") { e.preventDefault(); next(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const checkType = () => {
    if (!typeAnswer.trim()) return;
    const correct = typeAnswer.trim() === letter.hebrew;
    setTypeResult(correct ? "correct" : "incorrect");
    if (correct) markPracticed();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode("trace")}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-medium transition-colors border",
            mode === "trace"
              ? "bg-accent text-white border-accent"
              : "bg-bg-card text-text-secondary border-border hover:border-accent/50"
          )}
        >
          Trace Mode
        </button>
        <button
          onClick={() => setMode("type")}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-medium transition-colors border",
            mode === "type"
              ? "bg-accent text-white border-accent"
              : "bg-bg-card text-text-secondary border-border hover:border-accent/50"
          )}
        >
          Type Mode
        </button>
      </div>

      {/* Letter info & navigation */}
      <div className="bg-bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prev}
            disabled={letterIdx === 0}
            className={cn(
              "p-2 rounded-lg border transition-colors",
              letterIdx > 0
                ? "border-border text-text-secondary hover:text-text-primary hover:bg-bg-card-hover"
                : "border-transparent text-text-muted/30 cursor-not-allowed"
            )}
          >
            &#8592;
          </button>
          <div className="text-center">
            <p className="text-xs text-text-muted">
              {letterIdx + 1} / {ALPHABET.length}
            </p>
            <h3 className="text-lg font-semibold text-text-primary">
              {letter.name}
            </h3>
          </div>
          <button
            onClick={next}
            disabled={letterIdx === ALPHABET.length - 1}
            className={cn(
              "p-2 rounded-lg border transition-colors",
              letterIdx < ALPHABET.length - 1
                ? "border-border text-text-secondary hover:text-text-primary hover:bg-bg-card-hover"
                : "border-transparent text-text-muted/30 cursor-not-allowed"
            )}
          >
            &#8594;
          </button>
        </div>

        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="text-sm text-text-secondary">
            <span className="text-text-muted">Sound:</span> {letter.sound}
          </div>
          <div className="text-sm text-text-secondary">
            <span className="text-text-muted">Transliteration:</span>{" "}
            <span className="text-accent italic">{letter.transliteration}</span>
          </div>
          <AudioButton text={letter.hebrew} size="md" />
          {letter.final && (
            <div className="text-sm text-text-secondary">
              <span className="text-text-muted">Final form:</span>{" "}
              <span className="hebrew-text text-xl">{letter.final}</span>
            </div>
          )}
        </div>

        {/* Trace Mode */}
        {mode === "trace" && (
          <TraceCanvas letter={letter.hebrew} onDraw={markPracticed} />
        )}

        {/* Type Mode */}
        {mode === "type" && (
          <div className="text-center">
            <div className="bg-bg-secondary rounded-xl p-8 mb-4">
              <p className="text-text-muted text-sm mb-2">
                Type this letter:
              </p>
              <p className="text-text-primary text-lg font-medium mb-1">
                {letter.name} — {letter.transliteration}
              </p>
              <p className="text-text-muted text-xs">{letter.sound}</p>
            </div>
            <div className="flex items-center gap-3 max-w-xs mx-auto">
              <input
                type="text"
                value={typeAnswer}
                onChange={(e) => {
                  setTypeAnswer(e.target.value);
                  setTypeResult(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (typeResult) {
                      next();
                    } else {
                      checkType();
                    }
                  }
                }}
                dir="rtl"
                placeholder="Type here"
                className="flex-1 px-4 py-3 bg-bg-secondary border border-border rounded-xl text-text-primary hebrew-text text-2xl text-center"
                maxLength={2}
                disabled={typeResult !== null}
              />
              {typeResult === null ? (
                <button
                  onClick={checkType}
                  className="px-5 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-medium text-sm transition-colors"
                >
                  Check
                </button>
              ) : (
                <button
                  onClick={next}
                  className="px-5 py-3 rounded-xl bg-accent-blue/20 text-accent-blue font-medium text-sm transition-colors"
                >
                  Next
                </button>
              )}
            </div>
            {typeResult === "correct" && (
              <p className="mt-3 text-accent-green font-medium animate-[fadeIn_0.2s_ease-out]">
                Correct!
              </p>
            )}
            {typeResult === "incorrect" && (
              <div className="mt-3 animate-[fadeIn_0.2s_ease-out]">
                <p className="text-red-400 font-medium mb-1">Not quite</p>
                <p className="text-text-secondary text-sm">
                  The correct letter is:{" "}
                  <span className="hebrew-text text-3xl text-text-primary">
                    {letter.hebrew}
                  </span>
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Letter grid */}
      <div className="bg-bg-card rounded-2xl border border-border p-6">
        <h4 className="text-sm font-medium text-text-secondary mb-3">
          Progress — {practiced.size}/{ALPHABET.length} practiced
        </h4>
        <div className="grid grid-cols-9 sm:grid-cols-14 gap-2">
          {ALPHABET.map((l, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center hebrew-text text-lg font-bold transition-colors border",
                i === letterIdx
                  ? "bg-accent text-white border-accent"
                  : practiced.has(i)
                    ? "bg-accent-green/15 text-accent-green border-accent-green/30"
                    : "bg-bg-secondary text-text-muted border-border hover:border-text-muted"
              )}
              title={l.name}
            >
              {l.hebrew}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Canvas sub-component for tracing ─────────────────────────── */

function TraceCanvas({
  letter,
  onDraw,
}: {
  letter: string;
  onDraw: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const hasDrawn = useRef(false);

  const getCtx = () => canvasRef.current?.getContext("2d") ?? null;

  const clearCanvas = useCallback(() => {
    const ctx = getCtx();
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw guide letter
    ctx.save();
    ctx.font = "180px serif";
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(letter, canvas.width / 2, canvas.height / 2);
    ctx.restore();
    hasDrawn.current = false;
  }, [letter]);

  // Redraw guide when letter changes
  useEffect(() => {
    clearCanvas();
  }, [clearCanvas]);

  // Resize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    const ctx = getCtx();
    if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    clearCanvas();
  }, [clearCanvas]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      const touch = e.touches[0];
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isDrawing.current = true;
    const ctx = getCtx();
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.strokeStyle = "#e94560";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const ctx = getCtx();
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    if (!hasDrawn.current) {
      hasDrawn.current = true;
      onDraw();
    }
  };

  const endDraw = () => {
    isDrawing.current = false;
  };

  return (
    <div className="text-center">
      <canvas
        ref={canvasRef}
        className="w-full max-w-[300px] h-[250px] mx-auto bg-bg-secondary rounded-xl border border-border cursor-crosshair touch-none"
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
      />
      <button
        onClick={clearCanvas}
        className="mt-3 px-4 py-2 rounded-xl bg-bg-secondary border border-border text-text-secondary hover:text-text-primary text-sm font-medium transition-colors"
      >
        Clear
      </button>
    </div>
  );
}
