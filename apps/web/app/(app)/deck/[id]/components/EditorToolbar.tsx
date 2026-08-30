"use client";

import { useState } from "react";
import type { MarkdownEditorHandle } from "./MarkdownEditor";

interface EditorToolbarProps {
  editorRef: React.RefObject<MarkdownEditorHandle | null>;
  disabled?: boolean;
}

export function EditorToolbar({ editorRef, disabled = false }: EditorToolbarProps) {
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const [showDiagramMenu, setShowDiagramMenu] = useState(false);

  const insertSnippet = (snippet: string) => {
    editorRef.current?.insertSnippet(snippet);
  };

  const wrapSelection = (before: string, after: string, defaultText = "text") => {
    editorRef.current?.wrapSelection(before, after, defaultText);
  };

  return (
    <div className="flex flex-wrap items-center gap-1 px-3 py-1.5 border-b border-[var(--border)] bg-surface text-xs select-none">
      {/* ─── Slide Actions ────────────────────────────────────────── */}
      <button
        type="button"
        disabled={disabled}
        onClick={() =>
          insertSnippet("\n\n---\n\n## New Slide\n\nAdd your slide content here…\n")
        }
        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-brand-50 hover:bg-brand-100 dark:bg-brand-900/30 dark:hover:bg-brand-900/50 text-brand-600 font-semibold text-[11px] transition-colors cursor-pointer disabled:opacity-50"
        title="Insert New Slide Divider"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        New Slide
      </button>

      <div className="h-4 w-px bg-[var(--border)] mx-1" />

      {/* ─── Formatting ───────────────────────────────────────────── */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => wrapSelection("**", "**", "bold text")}
        className="p-1.5 rounded hover:bg-surface-2 text-foreground font-bold text-xs cursor-pointer disabled:opacity-50"
        title="Bold (Ctrl+B)"
      >
        B
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={() => wrapSelection("*", "*", "italic text")}
        className="p-1.5 rounded hover:bg-surface-2 text-foreground italic text-xs cursor-pointer disabled:opacity-50"
        title="Italic (Ctrl+I)"
      >
        I
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={() => wrapSelection("~~", "~~", "strikethrough text")}
        className="p-1.5 rounded hover:bg-surface-2 text-foreground line-through text-xs cursor-pointer disabled:opacity-50"
        title="Strikethrough"
      >
        S
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={() => wrapSelection("`", "`", "code")}
        className="p-1.5 rounded hover:bg-surface-2 text-foreground font-mono text-[11px] cursor-pointer disabled:opacity-50"
        title="Inline Code"
      >
        &lt;/&gt;
      </button>

      <div className="h-4 w-px bg-[var(--border)] mx-1" />

      {/* ─── Headings ─────────────────────────────────────────────── */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => wrapSelection("# ", "\n", "Slide Title")}
        className="px-1.5 py-1 rounded hover:bg-surface-2 text-foreground font-bold text-[11px] cursor-pointer disabled:opacity-50"
        title="Title Heading (H1)"
      >
        H1
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={() => wrapSelection("## ", "\n", "Slide Heading")}
        className="px-1.5 py-1 rounded hover:bg-surface-2 text-foreground font-semibold text-[11px] cursor-pointer disabled:opacity-50"
        title="Section Heading (H2)"
      >
        H2
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={() => wrapSelection("### ", "\n", "Subheading")}
        className="px-1.5 py-1 rounded hover:bg-surface-2 text-foreground text-[11px] cursor-pointer disabled:opacity-50"
        title="Subheading (H3)"
      >
        H3
      </button>

      <div className="h-4 w-px bg-[var(--border)] mx-1" />

      {/* ─── Lists & Tables ────────────────────────────────────────── */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => insertSnippet("\n- Key takeaway 1\n- Key takeaway 2\n- Key takeaway 3\n")}
        className="p-1.5 rounded hover:bg-surface-2 text-foreground cursor-pointer disabled:opacity-50"
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
        className="p-1.5 rounded hover:bg-surface-2 text-foreground cursor-pointer disabled:opacity-50"
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
        className="p-1.5 rounded hover:bg-surface-2 text-foreground cursor-pointer disabled:opacity-50"
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

      <div className="h-4 w-px bg-[var(--border)] mx-1" />

      {/* ─── Rich Visual Widgets Menu ──────────────────────────────── */}
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            setShowLayoutMenu(!showLayoutMenu);
            setShowDiagramMenu(false);
          }}
          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-2 hover:bg-surface-3 text-foreground font-medium text-[11px] transition-colors cursor-pointer disabled:opacity-50"
        >
          <span>🧩</span> Smart Layouts
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {showLayoutMenu && (
          <div className="absolute top-full left-0 mt-1 w-56 rounded-xl border border-[var(--border)] bg-surface p-1.5 shadow-xl z-30 animate-fade-in space-y-1">
            <button
              type="button"
              onClick={() => {
                insertSnippet(
                  '\n:::grid(cols=3)\n:::card(title="Performance", icon="⚡")\nOptimized for sub-second slide transitions and zero bundle bloat.\n:::\n:::card(title="Offline Ready", icon="📴")\nCreate and present anywhere on planes, trains, or disconnected stages.\n:::\n:::card(title="CRDT Sync", icon="🔄")\nReal-time collaborative editing without merge conflicts.\n:::\n:::\n'
                );
                setShowLayoutMenu(false);
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
                setShowLayoutMenu(false);
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
                  '\n:::callout(type="tip")\n💡 **Pro Tip**: Use keyboard arrows (← / →) or mobile remote controller for hands-free stage delivery.\n:::\n'
                );
                setShowLayoutMenu(false);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-surface-2 text-xs flex items-center gap-2 text-foreground cursor-pointer"
            >
              <span>💡</span>
              <div>
                <div className="font-semibold">Callout Banner</div>
                <div className="text-[10px] text-[var(--text-secondary)]">Tip / Warning / Note alert</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                insertSnippet(
                  '\n:::terminal(title="bash")\n$ pnpm create presentation my-pitch\n$ cd my-pitch && pnpm dev\n✓ Ready on http://localhost:3000\n:::\n'
                );
                setShowLayoutMenu(false);
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

      {/* ─── Diagram & Visuals Menu ────────────────────────────────── */}
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            setShowDiagramMenu(!showDiagramMenu);
            setShowLayoutMenu(false);
          }}
          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-2 hover:bg-surface-3 text-foreground font-medium text-[11px] transition-colors cursor-pointer disabled:opacity-50"
        >
          <span>🧜‍♂️</span> Diagrams
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {showDiagramMenu && (
          <div className="absolute top-full left-0 mt-1 w-56 rounded-xl border border-[var(--border)] bg-surface p-1.5 shadow-xl z-30 animate-fade-in space-y-1">
            <button
              type="button"
              onClick={() => {
                insertSnippet(
                  "\n```mermaid\ngraph LR\n  A[Markdown Content] --> B[Renderer Core]\n  B --> C[Vector PDF Export]\n  B --> D[Dual-Screen Presenter]\n```\n"
                );
                setShowDiagramMenu(false);
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
                setShowDiagramMenu(false);
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

      <div className="h-4 w-px bg-[var(--border)] mx-1" />

      {/* ─── Speaker Notes ─────────────────────────────────────────── */}
      <button
        type="button"
        disabled={disabled}
        onClick={() =>
          insertSnippet("\n<!-- note:\nSpeaker cues:\n- Pause here and ask the audience for questions.\n- Emphasize the 3x latency reduction.\n-->\n")
        }
        className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-surface-2 text-amber-600 dark:text-amber-400 font-medium text-[11px] transition-colors cursor-pointer disabled:opacity-50"
        title="Insert Private Speaker Notes"
      >
        <span>🎙️</span> Speaker Note
      </button>
    </div>
  );
}
