"use client";

import { useState } from "react";
import type { MarkdownEditorHandle } from "./MarkdownEditor";

interface EditorToolbarProps {
  editorRef: React.RefObject<MarkdownEditorHandle | null>;
  disabled?: boolean;
}

export function EditorToolbar({ editorRef, disabled = false }: EditorToolbarProps) {
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showBackgroundMenu, setShowBackgroundMenu] = useState(false);
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const [showHeaderFooterMenu, setShowHeaderFooterMenu] = useState(false);
  const [showDiagramMenu, setShowDiagramMenu] = useState(false);
  const [showChartMenu, setShowChartMenu] = useState(false);
  const [showBadgeMenu, setShowBadgeMenu] = useState(false);

  // Custom Color Pickers
  const [customColor, setCustomColor] = useState("#38bdf8");
  const [customBgColor, setCustomBgColor] = useState("#0f172a");

  const insertSnippet = (snippet: string) => {
    editorRef.current?.insertSnippet(snippet);
  };

  const wrapSelection = (before: string, after: string, defaultText = "text") => {
    editorRef.current?.wrapSelection(before, after, defaultText);
  };

  const closeAllMenus = () => {
    setShowColorMenu(false);
    setShowBackgroundMenu(false);
    setShowFontMenu(false);
    setShowLayoutMenu(false);
    setShowHeaderFooterMenu(false);
    setShowDiagramMenu(false);
    setShowChartMenu(false);
    setShowBadgeMenu(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 px-3 py-1.5 border-b border-[var(--border)] bg-surface text-xs select-none">
      {/* ─── Slide Actions Pod ────────────────────────────────────── */}
      <div className="flex items-center p-0.5 bg-background rounded-lg border border-[var(--border)]">
        <button
          type="button"
          disabled={disabled}
          onClick={() =>
            insertSnippet("\n\n---\n\n## New Slide\n\nAdd your slide content here…\n")
          }
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-brand-50 hover:bg-brand-100 dark:bg-brand-900/30 dark:hover:bg-brand-900/50 text-brand-600 font-semibold text-[11px] transition-colors cursor-pointer disabled:opacity-50"
          title="Insert New Slide Divider"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Slide
        </button>
      </div>

      {/* ─── Dynamic Colors & Highlight Pod ───────────────────────── */}
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            const next = !showColorMenu;
            closeAllMenus();
            setShowColorMenu(next);
          }}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-background border border-[var(--border)] hover:bg-surface-2 text-foreground font-semibold text-[11px] transition-colors cursor-pointer disabled:opacity-50"
          title="Text Colors, Highlights & Color Picker"
        >
          <span>🎨</span> Colors
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {showColorMenu && (
          <div className="absolute top-full left-0 mt-1.5 w-72 rounded-xl border border-[var(--border)] bg-surface p-2.5 shadow-2xl z-30 animate-fade-in space-y-2.5">
            {/* Solid Colors Palette */}
            <div>
              <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider px-1 mb-1.5 flex items-center justify-between">
                <span>Solid Text Colors</span>
                <span className="text-[9px] lowercase font-mono">16 swatches</span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { name: "White", val: "#ffffff" },
                  { name: "Black", val: "#000000" },
                  { name: "Slate", val: "#64748b" },
                  { name: "Zinc", val: "#71717a" },
                  { name: "Red", val: "#ef4444" },
                  { name: "Orange", val: "#f97316" },
                  { name: "Amber", val: "#f59e0b" },
                  { name: "Emerald", val: "#10b981" },
                  { name: "Teal", val: "#14b8a6" },
                  { name: "Cyan", val: "#06b6d4" },
                  { name: "Sky", val: "#0ea5e9" },
                  { name: "Blue", val: "#3b82f6" },
                  { name: "Indigo", val: "#6366f1" },
                  { name: "Violet", val: "#8b5cf6" },
                  { name: "Purple", val: "#a855f7" },
                  { name: "Rose", val: "#f43f5e" },
                ].map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => {
                      wrapSelection(`{color:${c.val}}`, "{/color}", `${c.name} text`);
                      closeAllMenus();
                    }}
                    className="flex items-center gap-1.5 px-1.5 py-1 rounded hover:bg-surface-2 text-[10px] text-foreground cursor-pointer"
                    title={`Apply ${c.name} (${c.val})`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/20 dark:border-white/20" style={{ backgroundColor: c.val }} />
                    <span className="truncate">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Color Picker */}
            <div className="border-t border-[var(--border)] pt-2">
              <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider px-1 mb-1.5">
                Custom Color Picker
              </div>
              <div className="flex items-center gap-2 px-1">
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border border-[var(--border)] p-0.5 bg-transparent shrink-0"
                  title="Pick any color"
                />
                <input
                  type="text"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="w-20 px-2 py-1 text-[11px] font-mono rounded bg-background border border-[var(--border)] text-foreground"
                />
                <div className="flex flex-col gap-1 flex-1">
                  <button
                    type="button"
                    onClick={() => {
                      wrapSelection(`{color:${customColor}}`, "{/color}", "custom text");
                      closeAllMenus();
                    }}
                    className="px-2 py-0.5 rounded bg-brand-600 hover:bg-brand-500 text-white text-[10px] font-semibold transition-colors cursor-pointer"
                  >
                    Text Color
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      wrapSelection(`{bg:${customColor}}`, "{/bg}", "highlighted text");
                      closeAllMenus();
                    }}
                    className="px-2 py-0.5 rounded bg-surface-2 hover:bg-surface border border-[var(--border)] text-foreground text-[10px] font-semibold transition-colors cursor-pointer"
                  >
                    Highlight Bg
                  </button>
                </div>
              </div>
            </div>

            {/* Gradients & Background Highlights */}
            <div className="border-t border-[var(--border)] pt-2 space-y-1">
              <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider px-1 mb-1">
                Gradient Headlines
              </div>
              <button
                type="button"
                onClick={() => {
                  wrapSelection("{gradient:sunset}", "{/gradient}", "Sunset Keynote Title");
                  closeAllMenus();
                }}
                className="w-full text-left px-2 py-1 rounded hover:bg-surface-2 text-[11px] font-bold bg-gradient-to-r from-rose-500 to-orange-400 bg-clip-text text-transparent cursor-pointer"
              >
                🌅 Sunset Gradient
              </button>
              <button
                type="button"
                onClick={() => {
                  wrapSelection("{gradient:aurora}", "{/gradient}", "Aurora Glowing Headline");
                  closeAllMenus();
                }}
                className="w-full text-left px-2 py-1 rounded hover:bg-surface-2 text-[11px] font-bold bg-gradient-to-r from-teal-400 via-emerald-400 to-indigo-500 bg-clip-text text-transparent cursor-pointer"
              >
                🌌 Aurora Gradient
              </button>
              <button
                type="button"
                onClick={() => {
                  wrapSelection("{gradient:ocean}", "{/gradient}", "Ocean Sky Title");
                  closeAllMenus();
                }}
                className="w-full text-left px-2 py-1 rounded hover:bg-surface-2 text-[11px] font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent cursor-pointer"
              >
                🌊 Ocean Gradient
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Slide Background Pod ─────────────────────────────────── */}
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            const next = !showBackgroundMenu;
            closeAllMenus();
            setShowBackgroundMenu(next);
          }}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-background border border-[var(--border)] hover:bg-surface-2 text-foreground font-semibold text-[11px] transition-colors cursor-pointer disabled:opacity-50"
          title="Slide Backgrounds, Solid Colors & Color Picker"
        >
          <span>🖼️</span> Background
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {showBackgroundMenu && (
          <div className="absolute top-full left-0 mt-1.5 w-68 rounded-xl border border-[var(--border)] bg-surface p-2.5 shadow-2xl z-30 animate-fade-in space-y-2.5">
            {/* Solid Slide Background Swatches */}
            <div>
              <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider px-1 mb-1.5 flex items-center justify-between">
                <span>Solid Slide Backgrounds</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { name: "Obsidian", val: "#09090b" },
                  { name: "Deep Slate", val: "#0f172a" },
                  { name: "True Black", val: "#000000" },
                  { name: "Forest Dark", val: "#022c22" },
                  { name: "Wine Dark", val: "#2d060e" },
                  { name: "Dark Velvet", val: "#18181b" },
                  { name: "Pure White", val: "#ffffff" },
                  { name: "Warm Cream", val: "#fef3c7" },
                  { name: "Cool Paper", val: "#f8fafc" },
                ].map((bg) => (
                  <button
                    key={bg.name}
                    type="button"
                    onClick={() => {
                      insertSnippet(`<!-- bg: ${bg.val} -->\n`);
                      closeAllMenus();
                    }}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-surface-2 border border-[var(--border)] text-[10px] text-foreground cursor-pointer"
                  >
                    <span className="w-3 h-3 rounded-full border border-black/20 dark:border-white/20 shrink-0" style={{ backgroundColor: bg.val }} />
                    <span className="truncate">{bg.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Background Color Picker */}
            <div className="border-t border-[var(--border)] pt-2">
              <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider px-1 mb-1.5">
                Custom Background Picker
              </div>
              <div className="flex items-center gap-2 px-1">
                <input
                  type="color"
                  value={customBgColor}
                  onChange={(e) => setCustomBgColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border border-[var(--border)] p-0.5 bg-transparent shrink-0"
                  title="Pick any background color"
                />
                <input
                  type="text"
                  value={customBgColor}
                  onChange={(e) => setCustomBgColor(e.target.value)}
                  className="w-20 px-2 py-1 text-[11px] font-mono rounded bg-background border border-[var(--border)] text-foreground"
                />
                <button
                  type="button"
                  onClick={() => {
                    insertSnippet(`<!-- bg: ${customBgColor} -->\n`);
                    closeAllMenus();
                  }}
                  className="flex-1 py-1.5 rounded bg-brand-600 hover:bg-brand-500 text-white text-[10px] font-semibold transition-colors cursor-pointer"
                >
                  Set Slide Bg
                </button>
              </div>
            </div>

            {/* Gradients & Mesh */}
            <div className="border-t border-[var(--border)] pt-2 space-y-1">
              <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider px-1 mb-1">
                Curated Mesh & Gradients
              </div>
              {[
                { label: "Dark Radial Mesh", val: "<!-- bg: gradient-dark -->\n" },
                { label: "Indigo Deep Glow", val: "<!-- bg: gradient-indigo -->\n" },
                { label: "Sunset Glow", val: "<!-- bg: gradient-sunset -->\n" },
                { label: "Aurora Emerald", val: "<!-- bg: gradient-aurora -->\n" },
                { label: "Ocean Sky Blue", val: "<!-- bg: gradient-ocean -->\n" },
                { label: "Engineering Grid Pattern", val: "<!-- bg: pattern-grid -->\n" },
                { label: "Subtle Dots Mesh", val: "<!-- bg: pattern-dots -->\n" },
              ].map((bg) => (
                <button
                  key={bg.label}
                  type="button"
                  onClick={() => {
                    insertSnippet(bg.val);
                    closeAllMenus();
                  }}
                  className="w-full text-left px-2.5 py-1 rounded-lg hover:bg-surface-2 text-xs flex items-center justify-between text-foreground cursor-pointer"
                >
                  <span>{bg.label}</span>
                  <span className="text-[10px] text-[var(--text-tertiary)] font-mono">mesh</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── Typography & Fonts Pod ───────────────────────────────── */}
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            const next = !showFontMenu;
            closeAllMenus();
            setShowFontMenu(next);
          }}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-background border border-[var(--border)] hover:bg-surface-2 text-foreground font-semibold text-[11px] transition-colors cursor-pointer disabled:opacity-50"
          title="Typography & Google Fonts"
        >
          <span>🔤</span> Fonts
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {showFontMenu && (
          <div className="absolute top-full left-0 mt-1.5 w-68 max-h-96 overflow-y-auto rounded-xl border border-[var(--border)] bg-surface p-2.5 shadow-2xl z-30 animate-fade-in space-y-2.5">
            {/* Modern Sans */}
            <div>
              <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider px-1 mb-1">
                Modern Sans-Serif
              </div>
              <div className="grid grid-cols-2 gap-1">
                {[
                  "Inter",
                  "Outfit",
                  "Plus Jakarta Sans",
                  "Poppins",
                  "Montserrat",
                  "Space Grotesk",
                  "Syne",
                  "Sora",
                  "Manrope",
                  "Figtree",
                  "Archivo",
                ].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => {
                      wrapSelection(`{font:${f}}`, "{/font}", `${f} Heading`);
                      closeAllMenus();
                    }}
                    className="text-left px-2 py-1.5 rounded hover:bg-surface-2 text-xs text-foreground cursor-pointer truncate"
                    title={`Apply font: ${f}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Editorial Serif */}
            <div className="border-t border-[var(--border)] pt-2">
              <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider px-1 mb-1">
                Editorial & Serif
              </div>
              <div className="grid grid-cols-2 gap-1">
                {[
                  "Playfair Display",
                  "Fraunces",
                  "Cormorant Garamond",
                  "Cinzel",
                  "Lora",
                  "Newsreader",
                ].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => {
                      wrapSelection(`{font:${f}}`, "{/font}", `${f} Heading`);
                      closeAllMenus();
                    }}
                    className="text-left px-2 py-1.5 rounded hover:bg-surface-2 text-xs font-serif text-foreground cursor-pointer truncate"
                    title={`Apply font: ${f}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Monospace */}
            <div className="border-t border-[var(--border)] pt-2">
              <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider px-1 mb-1">
                Technical & Mono
              </div>
              <div className="grid grid-cols-2 gap-1">
                {[
                  "JetBrains Mono",
                  "Fira Code",
                  "Space Mono",
                  "IBM Plex Mono",
                  "Source Code Pro",
                ].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => {
                      wrapSelection(`{font:${f}}`, "{/font}", `${f} Code`);
                      closeAllMenus();
                    }}
                    className="text-left px-2 py-1.5 rounded hover:bg-surface-2 text-xs font-mono text-foreground cursor-pointer truncate"
                    title={`Apply font: ${f}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Text Formatting Pod ──────────────────────────────────── */}
      <div className="flex items-center p-0.5 bg-background rounded-lg border border-[var(--border)] gap-0.5">
        <button
          type="button"
          disabled={disabled}
          onClick={() => wrapSelection("**", "**", "bold text")}
          className="w-6 h-6 rounded flex items-center justify-center hover:bg-surface-2 text-foreground font-bold text-xs cursor-pointer disabled:opacity-50"
          title="Bold (Ctrl+B)"
        >
          B
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => wrapSelection("*", "*", "italic text")}
          className="w-6 h-6 rounded flex items-center justify-center hover:bg-surface-2 text-foreground italic text-xs cursor-pointer disabled:opacity-50"
          title="Italic (Ctrl+I)"
        >
          I
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => wrapSelection("~~", "~~", "strikethrough text")}
          className="w-6 h-6 rounded flex items-center justify-center hover:bg-surface-2 text-foreground line-through text-xs cursor-pointer disabled:opacity-50"
          title="Strikethrough"
        >
          S
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => wrapSelection("`", "`", "code")}
          className="px-1.5 h-6 rounded flex items-center justify-center hover:bg-surface-2 text-foreground font-mono text-[10px] cursor-pointer disabled:opacity-50"
          title="Inline Code"
        >
          &lt;/&gt;
        </button>
      </div>

      {/* ─── Headings Pod ─────────────────────────────────────────── */}
      <div className="flex items-center p-0.5 bg-background rounded-lg border border-[var(--border)] gap-0.5">
        <button
          type="button"
          disabled={disabled}
          onClick={() => wrapSelection("# ", "\n", "Slide Title")}
          className="px-2 h-6 rounded flex items-center justify-center hover:bg-surface-2 text-foreground font-bold text-[10px] cursor-pointer disabled:opacity-50"
          title="Title Heading (H1)"
        >
          H1
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => wrapSelection("## ", "\n", "Slide Heading")}
          className="px-2 h-6 rounded flex items-center justify-center hover:bg-surface-2 text-foreground font-semibold text-[10px] cursor-pointer disabled:opacity-50"
          title="Section Heading (H2)"
        >
          H2
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => wrapSelection("### ", "\n", "Subheading")}
          className="px-2 h-6 rounded flex items-center justify-center hover:bg-surface-2 text-foreground text-[10px] cursor-pointer disabled:opacity-50"
          title="Subheading (H3)"
        >
          H3
        </button>
      </div>

      {/* ─── Structure & Tables Pod ───────────────────────────────── */}
      <div className="flex items-center p-0.5 bg-background rounded-lg border border-[var(--border)] gap-0.5">
        <button
          type="button"
          disabled={disabled}
          onClick={() => insertSnippet("\n- Key takeaway 1\n- Key takeaway 2 {click}\n- Key takeaway 3 {click}\n")}
          className="w-6 h-6 rounded flex items-center justify-center hover:bg-surface-2 text-foreground cursor-pointer disabled:opacity-50"
          title="Bullet List"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => insertSnippet("\n1. Step 1\n2. Step 2\n3. Step 3\n")}
          className="w-6 h-6 rounded flex items-center justify-center hover:bg-surface-2 text-foreground cursor-pointer disabled:opacity-50"
          title="Numbered List"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="10" y1="6" x2="21" y2="6" />
            <line x1="10" y1="12" x2="21" y2="12" />
            <line x1="10" y1="18" x2="21" y2="18" />
            <path d="M4 6h1v4" />
            <path d="M4 10h2" />
            <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
          </svg>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() =>
            insertSnippet(
              "\n| Feature | Starter | Enterprise |\n|---|---|---|\n| Real-time Sync | ❌ | ✅ |\n| Custom Fonts | ❌ | ✅ |\n| AI Generation | 5 / mo | Unlimited |\n"
            )
          }
          className="w-6 h-6 rounded flex items-center justify-center hover:bg-surface-2 text-foreground cursor-pointer disabled:opacity-50"
          title="Insert Markdown Table"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="3" y1="15" x2="21" y2="15" />
            <line x1="9" y1="3" x2="9" y2="21" />
            <line x1="15" y1="3" x2="15" y2="21" />
          </svg>
        </button>
      </div>

      {/* ─── Charts & Data Visualization Pod ──────────────────────── */}
      <div className="flex items-center p-0.5 bg-background rounded-lg border border-[var(--border)] gap-1">
        <div className="relative">
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              const next = !showChartMenu;
              closeAllMenus();
              setShowChartMenu(next);
            }}
            className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-surface-2 text-foreground font-medium text-[11px] transition-colors cursor-pointer disabled:opacity-50"
          >
            <span>📊</span> Charts
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {showChartMenu && (
            <div className="absolute top-full left-0 mt-1.5 w-64 rounded-xl border border-[var(--border)] bg-surface p-1.5 shadow-2xl z-30 animate-fade-in space-y-1">
              <button
                type="button"
                onClick={() => {
                  insertSnippet(
                    '\n:::chart(type="bar", title="Quarterly Revenue ($M)")\nlabels: Q1, Q2, Q3, Q4\nseries: 2025 [25, 45, 70, 95]\nseries: 2026 [40, 75, 110, 160]\n:::\n'
                  );
                  closeAllMenus();
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-surface-2 text-xs flex items-center gap-2 text-foreground cursor-pointer"
              >
                <span>📊</span>
                <div>
                  <div className="font-semibold">Multi-Series Bar Chart</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">Compare performance categories</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  insertSnippet(
                    '\n:::chart(type="area", title="Monthly Active Users (Growth)")\nlabels: Jan, Feb, Mar, Apr, May, Jun\nseries: MAU [10k, 25k, 48k, 85k, 140k, 220k]\n:::\n'
                  );
                  closeAllMenus();
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-surface-2 text-xs flex items-center gap-2 text-foreground cursor-pointer"
              >
                <span>📈</span>
                <div>
                  <div className="font-semibold">Trend Line / Area Chart</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">Smooth growth gradient curve</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  insertSnippet(
                    '\n:::chart(type="donut", title="Revenue by Channel")\nDirect Sales: 45\nPartner Network: 30\nOrganic / Viral: 25\n:::\n'
                  );
                  closeAllMenus();
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-surface-2 text-xs flex items-center gap-2 text-foreground cursor-pointer"
              >
                <span>🍩</span>
                <div>
                  <div className="font-semibold">Donut / Breakdown Chart</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">Percentages and distributions</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Layouts Dropdown */}
        <div className="relative">
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              const next = !showLayoutMenu;
              closeAllMenus();
              setShowLayoutMenu(next);
            }}
            className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-surface-2 text-foreground font-medium text-[11px] transition-colors cursor-pointer disabled:opacity-50"
          >
            <span>🧩</span> Layouts
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {showLayoutMenu && (
            <div className="absolute top-full left-0 mt-1.5 w-64 rounded-xl border border-[var(--border)] bg-surface p-1.5 shadow-2xl z-30 animate-fade-in space-y-1">
              <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider px-2 py-0.5">
                Master Slide Layouts
              </div>
              <button
                type="button"
                onClick={() => {
                  insertSnippet(
                    '\n:::layout(split)\n:::col\n### 👈 Left Column\n- Point 1\n- Point 2\n:::\n:::col\n### 👉 Right Column\n- Feature A\n- Feature B\n:::\n:::\n'
                  );
                  closeAllMenus();
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-surface-2 text-xs flex items-center gap-2 text-foreground cursor-pointer"
              >
                <span>⚖️</span>
                <div>
                  <div className="font-semibold">Split 50/50 Columns</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">Side-by-side comparison</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  insertSnippet(
                    '\n:::layout(cover)\n# Next-Gen Platform\n### High-Velocity Presentation Engine\n:::badge(text="Enterprise Release", color="emerald", pulse=true)\n:::\n'
                  );
                  closeAllMenus();
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-surface-2 text-xs flex items-center gap-2 text-foreground cursor-pointer"
              >
                <span>🌟</span>
                <div>
                  <div className="font-semibold">Cover Hero Slide</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">Centered keynote title & badge</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  insertSnippet(
                    '\n:::layout(quote)\n"Simplicity is prerequisite for reliability."\n— Edsger W. Dijkstra\n:::\n'
                  );
                  closeAllMenus();
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-surface-2 text-xs flex items-center gap-2 text-foreground cursor-pointer"
              >
                <span>💬</span>
                <div>
                  <div className="font-semibold">Keynote Quote</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">Large quote with attribution</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  insertSnippet(
                    '\n:::layout(showcase)\n:::col\n## Core Engine\nDetailed breakdown of architectural capabilities.\n:::\n:::col\n:::metric(value="< 10ms", label="P99 Latency")\n:::metric(value="99.99%", label="Edge Uptime")\n:::\n:::\n'
                  );
                  closeAllMenus();
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-surface-2 text-xs flex items-center gap-2 text-foreground cursor-pointer"
              >
                <span>✨</span>
                <div>
                  <div className="font-semibold">Showcase 60/40</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">Hero text with metric stack</div>
                </div>
              </button>

              <div className="border-t border-[var(--border)] my-1" />

              <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider px-2 py-0.5">
                Cards & Bento
              </div>

              <button
                type="button"
                onClick={() => {
                  insertSnippet(
                    '\n:::bento\n:::box(span=2, bg="gradient")\n### 🚀 High-Velocity Engine\nSub-second transitions with zero runtime jank.\n:::\n:::box(span=1)\n### 99.99%\nGlobal Edge Uptime\n:::\n:::box(span=1)\n### 📴 Offline First\nLocal files & sync\n:::\n:::box(span=2, bg="dark")\n### 🔒 CRDT State Sync\nReal-time collaborative merging\n:::\n:::\n'
                  );
                  closeAllMenus();
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-surface-2 text-xs flex items-center gap-2 text-foreground cursor-pointer"
              >
                <span>🍱</span>
                <div>
                  <div className="font-semibold">Bento Box Grid</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">Modern asymmetric visual cards</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  insertSnippet(
                    '\n:::timeline\n:::milestone(date="Q1 2025", title="Foundations", status="completed")\nScaffolded core runtime and parser.\n:::\n:::milestone(date="Q2 2025", title="Beta Launch", status="active")\nLive playground and real-time collaboration.\n:::\n:::milestone(date="Q3 2025", title="Global Scale", status="upcoming")\nEnterprise plugins and native export.\n:::\n:::\n'
                  );
                  closeAllMenus();
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-surface-2 text-xs flex items-center gap-2 text-foreground cursor-pointer"
              >
                <span>🗓️</span>
                <div>
                  <div className="font-semibold">Milestone Timeline</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">Connected journey roadmaps</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  insertSnippet(
                    '\n:::grid(cols=3)\n:::card(title="Performance", icon="⚡")\nOptimized for sub-second slide transitions.\n:::\n:::card(title="Offline Ready", icon="📴")\nPresent anywhere without WiFi.\n:::\n:::card(title="CRDT Sync", icon="🔄")\nReal-time collaborative editing.\n:::\n:::\n'
                  );
                  closeAllMenus();
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-surface-2 text-xs flex items-center gap-2 text-foreground cursor-pointer"
              >
                <span>🗂️</span>
                <div>
                  <div className="font-semibold">3-Card Auto Grid</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">Side-by-side feature cards</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  insertSnippet(
                    '\n:::grid(cols=3)\n:::metric(value="+340%", label="Revenue Growth", sub="+45% vs Q3")\n:::metric(value="99.99%", label="Uptime SLA", sub="Global edge network")\n:::metric(value="< 12ms", label="P99 Latency", sub="Zero jank runtime")\n:::\n'
                  );
                  closeAllMenus();
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-surface-2 text-xs flex items-center gap-2 text-foreground cursor-pointer"
              >
                <span>📊</span>
                <div>
                  <div className="font-semibold">Key Metrics & Stats</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">Bold number callouts</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  insertSnippet(
                    '\n:::terminal(title="bash")\n$ pnpm create presentation my-pitch\n$ cd my-pitch && pnpm dev\n✓ Ready on http://localhost:3000\n:::\n'
                  );
                  closeAllMenus();
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-surface-2 text-xs flex items-center gap-2 text-foreground cursor-pointer"
              >
                <span>💻</span>
                <div>
                  <div className="font-semibold">Terminal Window</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">Realistic macOS window frame</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Header & Footer / Copyright / Watermarks Pod */}
        <div className="relative">
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              const next = !showHeaderFooterMenu;
              closeAllMenus();
              setShowHeaderFooterMenu(next);
            }}
            className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-surface-2 text-foreground font-medium text-[11px] transition-colors cursor-pointer disabled:opacity-50"
          >
            <span>📑</span> Header / Footer
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {showHeaderFooterMenu && (
            <div className="absolute top-full left-0 mt-1.5 w-64 rounded-xl border border-[var(--border)] bg-surface p-1.5 shadow-2xl z-30 animate-fade-in space-y-1">
              <button
                type="button"
                onClick={() => {
                  insertSnippet(
                    ':::header(title="Company All-Hands 2026", category="Strategic Update", logo="⚡")\n\n'
                  );
                  closeAllMenus();
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-surface-2 text-xs flex items-center gap-2 text-foreground cursor-pointer"
              >
                <span>🔝</span>
                <div>
                  <div className="font-semibold">Slide Header Bar</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">Title, category & brand logo</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  insertSnippet(
                    '\n\n:::footer(left="© 2026 Presentation.AI. All Rights Reserved.", center="Confidential", right="Slide %slide% of %total%")\n'
                  );
                  closeAllMenus();
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-surface-2 text-xs flex items-center gap-2 text-foreground cursor-pointer"
              >
                <span>🔻</span>
                <div>
                  <div className="font-semibold">Footer & Copyright</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">Copyright, slide numbers & status</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  insertSnippet(':::watermark(text="CONFIDENTIAL - DRAFT")\n');
                  closeAllMenus();
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-surface-2 text-xs flex items-center gap-2 text-foreground cursor-pointer"
              >
                <span>🏷️</span>
                <div>
                  <div className="font-semibold text-rose-500">Confidential Watermark</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">Top-right security pill</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  insertSnippet('\n:::divider(type="glow")\n\n');
                  closeAllMenus();
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-surface-2 text-xs flex items-center gap-2 text-foreground cursor-pointer"
              >
                <span>✨</span>
                <div>
                  <div className="font-semibold">Glowing Accent Divider</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">Horizontal illuminated separator</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Diagrams Dropdown */}
        <div className="relative">
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              const next = !showDiagramMenu;
              closeAllMenus();
              setShowDiagramMenu(next);
            }}
            className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-surface-2 text-foreground font-medium text-[11px] transition-colors cursor-pointer disabled:opacity-50"
          >
            <span>🧜‍♂️</span> Diagrams
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {showDiagramMenu && (
            <div className="absolute top-full left-0 mt-1.5 w-60 rounded-xl border border-[var(--border)] bg-surface p-1.5 shadow-2xl z-30 animate-fade-in space-y-1">
              <button
                type="button"
                onClick={() => {
                  insertSnippet(
                    "\n```mermaid\ngraph LR\n  A[Markdown Content] --> B[Renderer Core]\n  B --> C[Vector PDF Export]\n  B --> D[Dual-Screen Presenter]\n```\n"
                  );
                  closeAllMenus();
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-surface-2 text-xs flex items-center gap-2 text-foreground cursor-pointer"
              >
                <span>📈</span>
                <div>
                  <div className="font-semibold">Flowchart (LR)</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">Step-by-step pipeline</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  insertSnippet(
                    "\n```mermaid\nsequenceDiagram\n  autonumber\n  Presenter->>Server: Broadcast Slide #3\n  Server->>Audience: Sync Viewport\n  Server->>Remote: Update Speaker Notes\n```\n"
                  );
                  closeAllMenus();
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-surface-2 text-xs flex items-center gap-2 text-foreground cursor-pointer"
              >
                <span>🔄</span>
                <div>
                  <div className="font-semibold">Sequence Diagram</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">System interaction flows</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Badges & Shapes */}
        <div className="relative">
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              const next = !showBadgeMenu;
              closeAllMenus();
              setShowBadgeMenu(next);
            }}
            className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-surface-2 text-foreground font-medium text-[11px] transition-colors cursor-pointer disabled:opacity-50"
          >
            <span>🏷️</span> Badges
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {showBadgeMenu && (
            <div className="absolute top-full left-0 mt-1.5 w-56 rounded-xl border border-[var(--border)] bg-surface p-1.5 shadow-2xl z-30 animate-fade-in space-y-1">
              <button
                type="button"
                onClick={() => {
                  insertSnippet(':::badge(text="Live Beta", color="emerald", pulse=true) ');
                  closeAllMenus();
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-surface-2 text-xs flex items-center gap-2 text-foreground cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <div className="font-semibold text-emerald-600 dark:text-emerald-400">Live Pulse Badge</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  insertSnippet(':::badge(text="v2.0 Released", color="blue") ');
                  closeAllMenus();
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-surface-2 text-xs flex items-center gap-2 text-foreground cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <div className="font-semibold text-blue-600 dark:text-blue-400">Release Tag</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  insertSnippet(
                    '\n:::callout(type="tip")\n💡 **Pro Tip**: Use keyboard arrows (← / →) or mobile remote controller for hands-free stage delivery.\n:::\n'
                  );
                  closeAllMenus();
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-surface-2 text-xs flex items-center gap-2 text-foreground cursor-pointer"
              >
                <span>💡</span>
                <div className="font-semibold">Callout Banner</div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Stepwise Click Reveal & Speaker Notes Pod ────────────── */}
      <div className="flex items-center p-0.5 bg-background rounded-lg border border-[var(--border)] gap-0.5">
        <button
          type="button"
          disabled={disabled}
          onClick={() => insertSnippet(" {click}")}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded hover:bg-surface-2 text-indigo-600 dark:text-indigo-400 font-semibold text-[11px] transition-colors cursor-pointer disabled:opacity-50"
          title="Add click reveal animation step ({click})"
        >
          <span>✨</span> Step Reveal
        </button>

        <div className="h-4 w-px bg-[var(--border)] mx-0.5" />

        <button
          type="button"
          disabled={disabled}
          onClick={() =>
            insertSnippet("\n<!-- note:\nSpeaker cues:\n- Pause here and ask the audience for questions.\n- Emphasize the 3x latency reduction.\n-->\n")
          }
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded hover:bg-surface-2 text-amber-600 dark:text-amber-400 font-semibold text-[11px] transition-colors cursor-pointer disabled:opacity-50"
          title="Insert Private Speaker Notes"
        >
          <span>🎙️</span> Note
        </button>
      </div>
    </div>
  );
}
