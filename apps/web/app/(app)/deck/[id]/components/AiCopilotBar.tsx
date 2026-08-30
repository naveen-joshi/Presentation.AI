"use client";

import { useState } from "react";

interface AiCopilotBarProps {
  onTransform: (action: "punchy" | "summarize" | "expand" | "generate-notes" | "translate", lang?: string) => Promise<void>;
  onOpenGenerator: () => void;
  disabled?: boolean;
}

export function AiCopilotBar({
  onTransform,
  onOpenGenerator,
  disabled = false,
}: AiCopilotBarProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTranslateMenu, setShowTranslateMenu] = useState(false);

  const handleAction = async (
    action: "punchy" | "summarize" | "expand" | "generate-notes" | "translate",
    lang?: string
  ) => {
    if (disabled || isProcessing) return;
    setIsProcessing(true);
    setShowTranslateMenu(false);
    try {
      await onTransform(action, lang);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex items-center justify-between px-3 py-1.5 bg-surface/90 border-b border-[var(--border)] text-xs select-none shrink-0 gap-2">
      {/* Left: AI Generation trigger */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenGenerator}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold text-[11px] shadow-sm transition-all disabled:opacity-50 cursor-pointer shrink-0"
        >
          <span>✨</span> Generate with AI
        </button>

        <div className="h-4 w-px bg-[var(--border)] hidden sm:block" />

        {/* Action Pills Cluster */}
        <div className="flex items-center gap-1 p-0.5 bg-background rounded-lg border border-[var(--border)]">
          <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider px-2 py-0.5">
            Slide Copilot
          </span>

          <button
            type="button"
            onClick={() => handleAction("punchy")}
            disabled={disabled || isProcessing}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium text-[var(--text-secondary)] hover:text-foreground hover:bg-surface-2 transition-all disabled:opacity-50 cursor-pointer"
            title="Make current slide punchy and concise"
          >
            <span>⚡</span> Punchy
          </button>

          <button
            type="button"
            onClick={() => handleAction("summarize")}
            disabled={disabled || isProcessing}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium text-[var(--text-secondary)] hover:text-foreground hover:bg-surface-2 transition-all disabled:opacity-50 cursor-pointer"
            title="Summarize into 3 key takeaways"
          >
            <span>📝</span> Summarize
          </button>

          <button
            type="button"
            onClick={() => handleAction("expand")}
            disabled={disabled || isProcessing}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium text-[var(--text-secondary)] hover:text-foreground hover:bg-surface-2 transition-all disabled:opacity-50 cursor-pointer"
            title="Expand with examples and detail"
          >
            <span>🔍</span> Expand
          </button>

          <button
            type="button"
            onClick={() => handleAction("generate-notes")}
            disabled={disabled || isProcessing}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium text-[var(--text-secondary)] hover:text-foreground hover:bg-surface-2 transition-all disabled:opacity-50 cursor-pointer"
            title="Generate private speaker script"
          >
            <span>🎙️</span> Notes
          </button>

          <div className="relative inline-block text-left">
            <button
              type="button"
              onClick={() => setShowTranslateMenu(!showTranslateMenu)}
              disabled={disabled || isProcessing}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium text-[var(--text-secondary)] hover:text-foreground hover:bg-surface-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              <span>🌐</span> Translate
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {showTranslateMenu && (
              <div className="absolute left-0 top-full mt-1 w-36 rounded-xl bg-surface border border-[var(--border)] p-1 shadow-xl z-50 animate-fade-in space-y-0.5">
                {["Spanish", "French", "German", "Japanese", "Hindi", "Chinese"].map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => handleAction("translate", lang)}
                    className="w-full text-left px-2.5 py-1.5 text-xs text-foreground hover:bg-surface-2 rounded-md transition-colors cursor-pointer"
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isProcessing && (
        <div className="flex items-center gap-1.5 text-[11px] text-brand-600 font-semibold animate-pulse">
          <span className="w-2.5 h-2.5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          Transforming…
        </div>
      )}
    </div>
  );
}
