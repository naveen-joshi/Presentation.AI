"use client";

import { useState } from "react";
import { THEME_OPTIONS } from "@/lib/deck-meta";

interface AiGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (markdown: string, theme?: string) => void;
}

export function AiGenerateModal({
  isOpen,
  onClose,
  onApply,
}: AiGenerateModalProps) {
  const [prompt, setPrompt] = useState("");
  const [slideCount, setSlideCount] = useState("5");
  const [audience, setAudience] = useState<"general" | "executives" | "developers" | "students" | "investors">("general");
  const [theme, setTheme] = useState("auto");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          slideCount: Number(slideCount),
          audience,
          theme: theme === "auto" ? undefined : theme,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate presentation");
      }

      const data = await res.json();
      setGeneratedResult(data.markdown);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e?.message || "Generation error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!generatedResult) return;
    onApply(generatedResult, theme === "auto" ? undefined : theme);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl rounded-2xl bg-surface border border-[var(--border)] p-6 shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-indigo-700 flex items-center justify-center text-white text-xs font-bold shadow-xs">
              ✨
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">AI Presentation Copilot</h2>
              <p className="text-xs text-[var(--text-tertiary)]">
                Powered by NVIDIA Nemotron 3.5 Lightning (30B-A3B MoE)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-foreground text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {!generatedResult ? (
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Presentation Topic or Prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Scaling distributed database architectures with raft consensus and zero-downtime migrations..."
                  rows={4}
                  className="w-full rounded-xl border border-[var(--border)] bg-background px-3.5 py-2.5 text-xs text-foreground placeholder-[var(--text-tertiary)] outline-none focus:border-brand-500 transition-colors resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Slide Count
                  </label>
                  <select
                    value={slideCount}
                    onChange={(e) => setSlideCount(e.target.value)}
                    className="w-full rounded-lg border border-[var(--border)] bg-background px-3 py-2 text-xs text-foreground outline-none cursor-pointer"
                  >
                    <option value="3">3 Slides (Quick Pitch)</option>
                    <option value="5">5 Slides (Standard)</option>
                    <option value="8">8 Slides (Deep Dive)</option>
                    <option value="12">12 Slides (Masterclass)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Target Audience
                  </label>
                  <select
                    value={audience}
                    onChange={(e) =>
                      setAudience(
                        e.target.value as
                          | "general"
                          | "executives"
                          | "developers"
                          | "students"
                          | "investors"
                      )
                    }
                    className="w-full rounded-lg border border-[var(--border)] bg-background px-3 py-2 text-xs text-foreground outline-none cursor-pointer"
                  >
                    <option value="general">General Public</option>
                    <option value="executives">C-Suite & Executives</option>
                    <option value="developers">Developers & Engineers</option>
                    <option value="investors">Venture Capital / Investors</option>
                    <option value="students">Students & Learners</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Theme
                  </label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full rounded-lg border border-[var(--border)] bg-background px-3 py-2 text-xs text-foreground outline-none cursor-pointer"
                  >
                    <option value="auto">Auto-select</option>
                    {THEME_OPTIONS.map((t) => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 p-3 text-xs text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-[var(--border)] text-xs font-medium text-[var(--text-secondary)] hover:text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !prompt.trim()}
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-xs font-bold text-white shadow-md transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Synthesizing slides…
                    </>
                  ) : (
                    <>
                      <span>✨</span> Generate Presentation
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1.5">
                  ✓ Slides Generated Successfully
                </span>
                <button
                  type="button"
                  onClick={() => setGeneratedResult(null)}
                  className="text-xs text-brand-600 hover:underline cursor-pointer"
                >
                  ← Edit Prompt
                </button>
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-background p-3.5 max-h-[300px] overflow-y-auto font-mono text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                {generatedResult}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setGeneratedResult(null)}
                  className="px-4 py-2 rounded-lg border border-[var(--border)] text-xs font-medium text-[var(--text-secondary)] cursor-pointer"
                >
                  Regenerate
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="px-5 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-xs font-bold text-white shadow-md transition-colors cursor-pointer"
                >
                  Insert into Presentation →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
