"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Deck } from "@/lib/types";

interface RemoteViewProps {
  deck: Deck;
}

export function RemoteView({ deck }: RemoteViewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const rawSlides = useMemo(() => {
    return deck.markdown.split(/\n---\n/).map((s) => s.trim());
  }, [deck.markdown]);

  const totalSlides = rawSlides.length;

  const speakerNotes = useMemo(() => {
    return rawSlides.map((slide) => {
      const match = slide.match(/<!--\s*note:\s*([\s\S]*?)-->/i);
      return match ? match[1].trim() : "No speaker notes for this slide.";
    });
  }, [rawSlides]);

  const handleNext = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide((p) => p + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide((p) => p - 1);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between p-4 max-w-md mx-auto select-none font-sans">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <Link
          href={`/deck/${deck.id}`}
          className="text-xs text-neutral-400 hover:text-white"
        >
          ← Back
        </Link>
        <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">
          📱 Remote Control
        </span>
        <span className="text-xs font-mono text-neutral-300">
          {currentSlide + 1} / {totalSlides}
        </span>
      </div>

      {/* Slide Title / Preview Header */}
      <div className="my-4 p-4 rounded-xl bg-neutral-900 border border-white/10 text-center">
        <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block mb-1">
          Current Slide Title
        </span>
        <h2 className="text-base font-bold text-white truncate">
          {rawSlides[currentSlide].split("\n")[0].replace(/^#+\s*/, "") || "Untitled Slide"}
        </h2>
      </div>

      {/* Speaker Notes */}
      <div className="flex-1 min-h-[160px] p-4 rounded-xl bg-[#161b22] border border-white/10 overflow-y-auto mb-4 text-xs text-neutral-300 leading-relaxed">
        <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">
          🎙️ Speaker Notes
        </span>
        <p className="whitespace-pre-wrap">{speakerNotes[currentSlide]}</p>
      </div>

      {/* Big Touch Controls */}
      <div className="grid grid-cols-2 gap-3 pb-4">
        <button
          type="button"
          disabled={currentSlide === 0}
          onClick={handlePrev}
          className="h-20 rounded-2xl bg-neutral-800 active:bg-neutral-700 disabled:opacity-30 text-white font-bold text-lg flex items-center justify-center border border-white/10 shadow-lg cursor-pointer"
        >
          ← Prev
        </button>
        <button
          type="button"
          disabled={currentSlide === totalSlides - 1}
          onClick={handleNext}
          className="h-20 rounded-2xl bg-brand-600 active:bg-brand-500 disabled:opacity-30 text-white font-bold text-lg flex items-center justify-center border border-brand-500 shadow-lg cursor-pointer"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
