"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
import type { Deck, DeckRole } from "@/lib/types";
import { MarkdownEditor } from "./MarkdownEditor";
import { PreviewPane } from "./PreviewPane";
import { SettingsPanel } from "./SettingsPanel";
import { ShareModal } from "./ShareModal";
import { SaveTemplateModal } from "./SaveTemplateModal";
import { CollabBar } from "./CollabBar";
import { AiGenerateModal } from "./AiGenerateModal";
import { AiCopilotBar } from "./AiCopilotBar";
import { updateDeckMarkdown, updateDeck } from "@/lib/actions/deck-actions";

interface EditorShellProps {
  deck: Deck;
  access?: {
    role: DeckRole;
    isOwner: boolean;
    canEdit: boolean;
  };
}

export function EditorShell({
  deck: initialDeck,
  access = { role: "owner", isOwner: true, canEdit: true },
}: EditorShellProps) {
  const [deck, setDeck] = useState<Deck>(initialDeck);
  const [markdown, setMarkdown] = useState(initialDeck.markdown);
  const [theme, setTheme] = useState(initialDeck.theme);
  const [template, setTemplate] = useState(initialDeck.template);
  const [transition, setTransition] = useState(initialDeck.transition);
  const [size, setSize] = useState(initialDeck.size);
  const [headFont, setHeadFont] = useState(initialDeck.head_font ?? "");
  const [bodyFont, setBodyFont] = useState(initialDeck.body_font ?? "");
  const [showSettings, setShowSettings] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">("idle");

  // Extract title from first heading
  const extractTitle = useCallback((md: string) => {
    const match = md.match(/^#\s+(.+)$/m);
    return match ? match[1].trim() : undefined;
  }, []);

  // Debounced autosave (only if user has edit rights)
  const saveMarkdown = useCallback(
    async (md: string) => {
      if (!access.canEdit) return;
      setSaveStatus("saving");
      try {
        const title = extractTitle(md);
        await updateDeckMarkdown(deck.id, md, title);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch {
        setSaveStatus("idle");
      }
    },
    [deck.id, extractTitle, access.canEdit]
  );

  const handleSettingChange = useCallback(
    async (key: string, value: string) => {
      if (!access.canEdit) return;
      const setter: Record<string, (v: string) => void> = {
        theme: setTheme,
        template: setTemplate,
        transition: setTransition,
        size: setSize,
        head_font: setHeadFont,
        body_font: setBodyFont,
      };
      setter[key]?.(value);
      await updateDeck(deck.id, { [key]: value || null });
    },
    [deck.id, access.canEdit]
  );

  const handleTransformSlide = async (
    action: "punchy" | "summarize" | "expand" | "generate-notes" | "translate",
    targetLanguage?: string
  ) => {
    if (!access.canEdit) return;
    try {
      const res = await fetch("/api/ai/transform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          markdown,
          action,
          targetLanguage,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.result) {
          setMarkdown(data.result);
          saveMarkdown(data.result);
        }
      }
    } catch (e) {
      console.error("Transform error:", e);
    }
  };

  const handleApplyAiGenerated = (newMd: string, newTheme?: string) => {
    setMarkdown(newMd);
    saveMarkdown(newMd);
    if (newTheme) {
      handleSettingChange("theme", newTheme);
    }
  };

  const handleDeckUpdated = (updates: Partial<Deck>) => {
    setDeck((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Toolbar */}
      <div className="flex items-center justify-between h-10 px-4 border-b border-[var(--border)] bg-surface shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-sm text-[var(--text-secondary)] hover:text-foreground transition-colors"
          >
            ← Back
          </Link>
          <span className="text-[var(--border)]">|</span>
          <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
            {extractTitle(markdown) ?? "Untitled deck"}
          </span>
          {!access.canEdit && (
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50">
              {access.role} mode
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <CollabBar status="connected" isSynced={saveStatus !== "saving"} />

          {access.canEdit && saveStatus === "saving" && (
            <span className="text-xs text-[var(--text-tertiary)] animate-pulse-subtle">
              Saving…
            </span>
          )}
          {access.canEdit && saveStatus === "saved" && (
            <span className="text-xs text-emerald-500 animate-fade-in">
              ✓ Saved
            </span>
          )}

          {/* AI Generator trigger */}
          {access.canEdit && (
            <button
              type="button"
              onClick={() => setShowAiModal(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
              title="Generate or rewrite deck with AI"
            >
              <span>✨</span> AI Copilot
            </button>
          )}

          {/* Save as template */}
          <button
            type="button"
            onClick={() => setShowTemplateModal(true)}
            className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-foreground hover:bg-surface-2 transition-colors cursor-pointer"
            title="Save as template"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
          </button>

          {/* Share modal button (only if owner or editor) */}
          {access.canEdit && (
            <button
              type="button"
              onClick={() => setShowShareModal(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-background px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-surface-2 transition-colors cursor-pointer"
              title="Share deck"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              Share
            </button>
          )}

          {/* Settings button */}
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            disabled={!access.canEdit}
            className={`p-1.5 rounded-md transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              showSettings
                ? "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                : "text-[var(--text-secondary)] hover:text-foreground hover:bg-surface-2"
            }`}
            title="Deck settings"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>

          {/* Presenter View */}
          <Link
            href={`/deck/${deck.id}/presenter`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] px-2.5 py-1 text-xs font-semibold text-[var(--text-secondary)] hover:text-foreground hover:bg-surface-2 transition-colors"
            title="Open dual-screen Presenter Pro view with timer & notes"
          >
            <span>🎙️</span> Presenter
          </Link>

          {/* Present */}
          <Link
            href={`/deck/${deck.id}/present`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 transition-colors"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <polygon points="5,3 19,12 5,21" />
            </svg>
            Present
          </Link>
        </div>
      </div>

      {/* Editor + Preview split */}
      <div className="flex flex-1 min-h-0">
        {/* Markdown editor with AI Copilot Bar */}
        <div className="flex-1 min-w-0 border-r border-[var(--border)] flex flex-col">
          <AiCopilotBar
            onTransform={handleTransformSlide}
            onOpenGenerator={() => setShowAiModal(true)}
            disabled={!access.canEdit}
          />
          <div className="flex-1 min-h-0">
            <MarkdownEditor
              initialValue={markdown}
              readOnly={!access.canEdit}
              onChange={(val) => {
                setMarkdown(val);
                saveMarkdown(val);
              }}
            />
          </div>
        </div>

        {/* Preview pane */}
        <div className="flex-1 min-w-0 bg-surface">
          <PreviewPane
            markdown={markdown}
            theme={theme}
            template={template}
            transition={transition}
            size={size}
            headFont={headFont}
            bodyFont={bodyFont}
          />
        </div>

        {/* Settings sidebar */}
        {showSettings && access.canEdit && (
          <div className="w-64 border-l border-[var(--border)] bg-background overflow-y-auto animate-slide-in-right shrink-0">
            <SettingsPanel
              theme={theme}
              template={template}
              transition={transition}
              size={size}
              headFont={headFont}
              bodyFont={bodyFont}
              onChange={handleSettingChange}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {showShareModal && (
        <ShareModal
          deck={deck}
          onClose={() => setShowShareModal(false)}
          onDeckUpdated={handleDeckUpdated}
        />
      )}

      {showTemplateModal && (
        <SaveTemplateModal
          deckId={deck.id}
          defaultTitle={extractTitle(markdown) ?? deck.title}
          onClose={() => setShowTemplateModal(false)}
        />
      )}

      {showAiModal && (
        <AiGenerateModal
          isOpen={showAiModal}
          onClose={() => setShowAiModal(false)}
          onApply={handleApplyAiGenerated}
        />
      )}
    </div>
  );
}
