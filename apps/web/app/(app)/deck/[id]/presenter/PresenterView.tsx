"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  generateHtml,
  parseSlides,
  type ThemeName,
  type SizeName,
  type TemplateName,
  type TransitionName,
} from "@presentation-ai/renderer";
import type { Deck } from "@/lib/types";

interface PresenterViewProps {
  deck: Deck;
}

export function PresenterView({ deck }: PresenterViewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Parse slides into raw array
  const rawSlides = useMemo(() => {
    return deck.markdown.split(/\n---\n/).map((s) => s.trim());
  }, [deck.markdown]);

  const totalSlides = rawSlides.length;

  // Extract speaker notes for each slide (e.g. <!-- note: hello -->)
  const speakerNotes = useMemo(() => {
    return rawSlides.map((slide) => {
      const match = slide.match(/<!--\s*note:\s*([\s\S]*?)-->/i);
      return match ? match[1].trim() : "No speaker notes for this slide.";
    });
  }, [rawSlides]);

  // Clean slide content without notes
  const cleanSlides = useMemo(() => {
    return rawSlides.map((slide) => {
      return slide.replace(/<!--\s*note:\s*[\s\S]*?-->/gi, "").trim();
    });
  }, [rawSlides]);

  // Render HTML for current slide
  const currentSlideHtml = useMemo(() => {
    const slideText = cleanSlides[currentSlide] || "";
    const parsed = parseSlides(slideText);
    return generateHtml(
      parsed,
      deck.title,
      false,
      deck.theme as ThemeName,
      deck.size as SizeName,
      { head: deck.head_font, body: deck.body_font },
      { template: deck.template as TemplateName, transition: deck.transition as TransitionName }
    );
  }, [cleanSlides, currentSlide, deck]);

  // Render HTML for next slide preview
  const nextSlideHtml = useMemo(() => {
    if (currentSlide + 1 >= totalSlides) return null;
    const slideText = cleanSlides[currentSlide + 1] || "";
    const parsed = parseSlides(slideText);
    return generateHtml(
      parsed,
      deck.title,
      false,
      deck.theme as ThemeName,
      deck.size as SizeName,
      { head: deck.head_font, body: deck.body_font },
      { template: deck.template as TemplateName, transition: deck.transition as TransitionName }
    );
  }, [cleanSlides, currentSlide, totalSlides, deck]);

  // Presentation Timer
  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1));
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Home") {
        setCurrentSlide(0);
      } else if (e.key === "End") {
        setCurrentSlide(totalSlides - 1);
      }
    },
    [totalSlides]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="h-screen w-screen bg-[#0d1117] text-white flex flex-col overflow-hidden select-none font-sans">
      {/* ─── Top Control Bar ────────────────────────────────────────── */}
      <header className="h-12 border-b border-white/10 bg-[#161b22] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href={`/deck/${deck.id}`}
            className="text-xs text-neutral-400 hover:text-white transition-colors"
          >
            ← Exit Presenter View
          </Link>
          <span className="text-white/20">|</span>
          <span className="text-sm font-semibold text-white truncate max-w-sm">
            {deck.title}
          </span>
          <span className="px-2 py-0.5 rounded bg-brand-900/60 text-brand-300 border border-brand-700/50 text-[10px] uppercase font-bold tracking-wider">
            Presenter View
          </span>
        </div>

        <div className="flex items-center gap-6">
          {/* Timer */}
          <div className="flex items-center gap-2 font-mono text-sm bg-black/40 px-3 py-1 rounded-lg border border-white/10">
            <span className="text-neutral-400 text-xs">TIMER:</span>
            <span className="font-bold text-emerald-400">{formatTime(elapsedSeconds)}</span>
            <button
              type="button"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="text-xs text-neutral-400 hover:text-white px-1"
            >
              {isTimerRunning ? "⏸" : "▶"}
            </button>
            <button
              type="button"
              onClick={() => setElapsedSeconds(0)}
              className="text-xs text-neutral-400 hover:text-white px-1"
            >
              ↺
            </button>
          </div>

          {/* Slide counter */}
          <div className="text-sm font-semibold text-neutral-200">
            Slide <span className="text-white">{currentSlide + 1}</span> of {totalSlides}
          </div>

          {/* Audience Window Button */}
          <Link
            href={`/deck/${deck.id}/present`}
            target="_blank"
            className="px-3 py-1 rounded-md bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors"
          >
            Open Audience Window ↗
          </Link>
        </div>
      </header>

      {/* ─── Main Presenter Workspace ───────────────────────────────── */}
      <div className="flex-1 grid grid-cols-12 gap-4 p-4 min-h-0">
        {/* Left: Live Current Slide (Audience View) */}
        <div className="col-span-7 flex flex-col rounded-xl bg-black border border-white/10 overflow-hidden shadow-2xl">
          <div className="h-8 bg-neutral-900/80 px-3 flex items-center justify-between border-b border-white/10 text-xs font-semibold text-neutral-400">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Current Slide (On Screen)
            </span>
            <span className="font-mono text-[11px]">{currentSlide + 1} / {totalSlides}</span>
          </div>
          <div className="flex-1 relative bg-black">
            <iframe
              key={`curr-${currentSlide}`}
              srcDoc={currentSlideHtml}
              className="w-full h-full border-0 pointer-events-none"
              title="Current Slide"
            />
          </div>
          {/* Navigation Bar */}
          <div className="h-12 bg-neutral-900/90 px-4 flex items-center justify-between border-t border-white/10">
            <button
              type="button"
              disabled={currentSlide === 0}
              onClick={() => setCurrentSlide((p) => Math.max(p - 1, 0))}
              className="px-4 py-1.5 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30 text-xs font-bold transition-all cursor-pointer"
            >
              ← Previous (← / Space)
            </button>
            <div className="flex items-center gap-1 overflow-x-auto max-w-xs py-1">
              {rawSlides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-6 h-6 rounded text-xs font-mono transition-colors cursor-pointer ${
                    currentSlide === idx
                      ? "bg-brand-600 text-white font-bold"
                      : "bg-white/5 text-neutral-400 hover:bg-white/10"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={currentSlide === totalSlides - 1}
              onClick={() => setCurrentSlide((p) => Math.min(p + 1, totalSlides - 1))}
              className="px-4 py-1.5 rounded bg-brand-600 hover:bg-brand-500 disabled:opacity-30 text-xs font-bold transition-all cursor-pointer"
            >
              Next → (→ / Space)
            </button>
          </div>
        </div>

        {/* Right: Next Slide Preview & Speaker Notes */}
        <div className="col-span-5 flex flex-col gap-4 min-h-0">
          {/* Next Slide Preview */}
          <div className="h-44 rounded-xl bg-black border border-white/10 overflow-hidden flex flex-col shrink-0">
            <div className="h-7 bg-neutral-900/80 px-3 flex items-center justify-between border-b border-white/10 text-xs font-semibold text-neutral-400">
              <span>Next Slide Preview</span>
              <span className="text-[10px] text-neutral-500">
                {currentSlide + 1 < totalSlides ? `Slide ${currentSlide + 2}` : "End of Deck"}
              </span>
            </div>
            <div className="flex-1 relative bg-black">
              {nextSlideHtml ? (
                <iframe
                  key={`next-${currentSlide}`}
                  srcDoc={nextSlideHtml}
                  className="w-full h-full border-0 pointer-events-none scale-75 origin-top"
                  title="Next Slide Preview"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-neutral-500">
                  🎉 You have reached the end of the presentation.
                </div>
              )}
            </div>
          </div>

          {/* Speaker Talking Notes */}
          <div className="flex-1 rounded-xl bg-[#161b22] border border-white/10 overflow-hidden flex flex-col min-h-0">
            <div className="h-8 bg-neutral-900/80 px-3 flex items-center justify-between border-b border-white/10 text-xs font-semibold text-amber-400">
              <span className="flex items-center gap-1.5">
                <span>🎙️</span> Speaker Talking Notes
              </span>
              <span className="text-[10px] text-neutral-500 font-mono">
                {speakerNotes[currentSlide].split(" ").length} words
              </span>
            </div>
            <div className="flex-1 p-4 overflow-y-auto font-sans text-sm text-neutral-200 leading-relaxed space-y-3">
              <p className="whitespace-pre-wrap">{speakerNotes[currentSlide]}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
