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
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface/80 border-b border-[var(--border)] text-xs overflow-x-auto shrink-0">
      <button
        type="button"
        onClick={onOpenGenerator}
        disabled={disabled}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-semibold text-[11px] shadow-xs transition-all disabled:opacity-50 cursor-pointer shrink-0"
      >
        <span>✨</span> AI Generator
      </button>

      <span className="text-[var(--border)]">|</span>
      <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] tracking-wider">
        Slide AI:
      </span>

      <button
        type="button"
        onClick={() => handleAction("punchy")}
        disabled={disabled || isProcessing}
        className="px-2 py-1 rounded hover:bg-surface-2 text-[var(--text-secondary)] hover:text-foreground transition-colors disabled:opacity-50 cursor-pointer shrink-0"
        title="Make current slide concise and high-impact"
      >
        ⚡ Make Punchy
      </button>

      <button
        type="button"
        onClick={() => handleAction("summarize")}
        disabled={disabled || isProcessing}
        className="px-2 py-1 rounded hover:bg-surface-2 text-[var(--text-secondary)] hover:text-foreground transition-colors disabled:opacity-50 cursor-pointer shrink-0"
        title="Summarize into 3 key takeaways"
      >
        📝 Summarize
      </button>

      <button
        type="button"
        onClick={() => handleAction("generate-notes")}
        disabled={disabled || isProcessing}
        className="px-2 py-1 rounded hover:bg-surface-2 text-[var(--text-secondary)] hover:text-foreground transition-colors disabled:opacity-50 cursor-pointer shrink-0"
        title="Generate speaker notes comments"
      >
        🎙️ Add Notes
      </button>

      <div className="relative inline-block text-left">
        <button
          type="button"
          onClick={() => setShowTranslateMenu(!showTranslateMenu)}
          disabled={disabled || isProcessing}
          className="px-2 py-1 rounded hover:bg-surface-2 text-[var(--text-secondary)] hover:text-foreground transition-colors disabled:opacity-50 cursor-pointer inline-flex items-center gap-1 shrink-0"
        >
          🌐 Translate ▾
        </button>

        {showTranslateMenu && (
          <div className="absolute left-0 top-full mt-1 w-32 rounded-lg bg-surface border border-[var(--border)] py-1 shadow-xl z-50 animate-fade-in">
            {["Spanish", "French", "German", "Japanese", "Hindi", "Chinese"].map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => handleAction("translate", lang)}
                className="w-full text-left px-3 py-1.5 text-xs text-foreground hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-colors cursor-pointer"
              >
                {lang}
              </button>
            ))}
          </div>
        )}
      </div>

      {isProcessing && (
        <span className="text-[11px] text-brand-500 font-medium animate-pulse ml-2 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping" />
          AI Working…
        </span>
      )}
    </div>
  );
}
