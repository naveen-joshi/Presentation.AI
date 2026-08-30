"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  generatePreviewHtml,
  generateHtml,
  parseSlides,
  renderSlide,
  type ThemeName,
  type SizeName,
  type TemplateName,
  type TransitionName,
} from "@presentation-ai/renderer";
import {
  THEME_OPTIONS,
  SIZE_OPTIONS,
  TEMPLATE_OPTIONS,
  TRANSITION_OPTIONS,
} from "@/lib/deck-meta";

const SAMPLE_DECKS: Record<
  string,
  { name: string; icon: string; theme: string; markdown: string }
> = {
  pitch: {
    name: "Startup Pitch",
    icon: "🚀",
    theme: "nord",
    markdown: `# NextGen Presentation Engine
Transform Markdown into world-class slides in seconds.

---

## ⚡ The Problem
- Slide builders are clunky, slow, and proprietary.
- Version control doesn't work on binary \`.pptx\` or \`.key\` files.
- Developers and tech teams waste hours aligning boxes.

---

## 💡 The Solution
1. **Markdown Native**: Keep presentations in Git alongside your code.
2. **Instant Theming**: Choose from 30+ crafted themes.
3. **Real-time Sync**: Collaborate seamlessly with CRDTs.

---

## 📊 Market Traction
| Metric | Q1 | Q2 | Q3 |
|---|---|---|---|
| Active Decks | 1,200 | 8,400 | 32,000 |
| Teams | 45 | 320 | 1,400 |
| NPS Score | 72 | 78 | 84 |

---

# Ready to experience the future?
Built with Next.js, React 19, and Yjs CRDTs.
`,
  },
  code: {
    name: "Developer Tech Talk",
    icon: "💻",
    theme: "midnight",
    markdown: `# Building Real-Time Systems with CRDTs
Deep dive into Conflict-Free Replicated Data Types.

---

## What is a State Vector?

A **State Vector** compacts logical clocks across all active clients:

\`\`\`ts
interface StateVector {
  [clientID: number]: number; // client -> latest clock
}

const sv = Y.encodeStateVector(doc);
\`\`\`

---

## Deterministic Convergence

\`\`\`ts
// 1. Client A sends state vector
channel.send({ event: "sync-step-1", svA });

// 2. Client B computes exact missing diff
const diffForA = Y.encodeStateAsUpdate(docB, svA);

// 3. Client A applies update without conflicts
Y.applyUpdate(docA, diffForA);
\`\`\`

---

## 🎯 Key Takeaways
- No central lock contention.
- Zero data loss on network partition.
- True offline-first capability.
`,
  },
  launch: {
    name: "Product Showcase",
    icon: "✨",
    theme: "neon",
    markdown: `# Presentation.AI 2.0
The fastest way to build slides.

---

## 🎨 30+ Designer Themes
- **Nord** • Frost blue minimalism
- **Midnight** • Deep dark obsidian
- **Paper** • Editorial serif aesthetic
- **Neon** • Vibrant cybernetic contrast
- **Sunset** • Warm dusk gradients

---

## 🛠️ Complete Feature Matrix
- [x] Split-pane CodeMirror 6 editor
- [x] Fullscreen presentation mode
- [x] Tokenized share links & collaborator roles
- [x] Offline-first with IndexedDB persistence
- [x] Desktop app with vector PDF export

---

# Start Presenting Today
Free • Open Source • Markdown Native
`,
  },
};

export function LivePlayground() {
  const [activeTab, setActiveTab] = useState<"playground" | "themes" | "samples" | "collab">("playground");
  const [selectedSample, setSelectedSample] = useState<string>("pitch");
  const [markdown, setMarkdown] = useState<string>(SAMPLE_DECKS.pitch.markdown);
  const [theme, setTheme] = useState<string>("nord");
  const [size, setSize] = useState<string>("m");
  const [template, setTemplate] = useState<string>("classic");
  const [transition, setTransition] = useState<string>("slide");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fullscreenIframeRef = useRef<HTMLIFrameElement>(null);

  // Generate preview shell
  const shellHtml = useMemo(() => {
    try {
      return generatePreviewHtml(
        theme as ThemeName,
        size as SizeName,
        { head: null, body: null },
        template as TemplateName,
        transition as TransitionName,
        "cdn"
      );
    } catch {
      return "<html><body>Preview error</body></html>";
    }
  }, [theme, size, template, transition]);

  // Parse slides
  const slideHtmls = useMemo(() => {
    try {
      const slides = parseSlides(markdown);
      return slides.map((s, i) => renderSlide(s, i));
    } catch {
      return [];
    }
  }, [markdown]);

  // Full presentation HTML for export / fullscreen
  const fullPresentationHtml = useMemo(() => {
    try {
      const slides = parseSlides(markdown);
      return generateHtml(
        slides,
        "Presentation Demo",
        true,
        theme as ThemeName,
        size as SizeName,
        {},
        { template: template as TemplateName, transition: transition as TransitionName }
      );
    } catch {
      return "<html><body>Render error</body></html>";
    }
  }, [markdown, theme, size, template, transition]);

  // Sync slides into preview iframe via postMessage
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      iframe.contentWindow?.postMessage(
        {
          type: "render",
          slides: slideHtmls,
          css: "",
          cursor: 0,
        },
        "*"
      );
    };

    iframe.addEventListener("load", handleLoad);
    iframe.contentWindow?.postMessage(
      {
        type: "render",
        slides: slideHtmls,
        css: "",
        cursor: 0,
      },
      "*"
    );

    return () => iframe.removeEventListener("load", handleLoad);
  }, [slideHtmls, shellHtml]);

  const handleSelectSample = (key: string) => {
    setSelectedSample(key);
    setMarkdown(SAMPLE_DECKS[key].markdown);
    setTheme(SAMPLE_DECKS[key].theme);
  };

  const handleDownloadHtml = () => {
    const blob = new Blob([fullPresentationHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "presentation.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "slides.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full">
      {/* ─── Tabs Header ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 border-b border-[var(--border)] pb-4">
        <div className="flex items-center gap-1.5 p-1 bg-surface rounded-xl border border-[var(--border)]">
          <button
            type="button"
            onClick={() => setActiveTab("playground")}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "playground"
                ? "bg-brand-600 text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-foreground"
            }`}
          >
            <span>⚡</span> Live Playground
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("themes")}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "themes"
                ? "bg-brand-600 text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-foreground"
            }`}
          >
            <span>🎨</span> 30+ Themes
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("samples")}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "samples"
                ? "bg-brand-600 text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-foreground"
            }`}
          >
            <span>🪄</span> Sample Decks
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("collab")}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "collab"
                ? "bg-brand-600 text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-foreground"
            }`}
          >
            <span>🤝</span> Sync & Offline
          </button>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadMarkdown}
            className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-surface hover:bg-surface-2 text-xs font-medium text-foreground transition-colors cursor-pointer"
            title="Download as Markdown"
          >
            ↓ .md
          </button>
          <button
            type="button"
            onClick={handleDownloadHtml}
            className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-surface hover:bg-surface-2 text-xs font-medium text-foreground transition-colors cursor-pointer"
            title="Download as standalone HTML"
          >
            ↓ .html
          </button>
          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-xs font-semibold text-white shadow-sm transition-all cursor-pointer"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,3 19,12 5,21" />
            </svg>
            Present
          </button>
        </div>
      </div>

      {/* ─── Tab 1: Live Interactive Playground ──────────────────────── */}
      {activeTab === "playground" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 rounded-2xl border border-[var(--border)] bg-surface/50 p-4 shadow-xl backdrop-blur-sm animate-fade-in">
          {/* Controls Header */}
          <div className="lg:col-span-12 flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground">Theme:</span>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="rounded-lg border border-[var(--border)] bg-background px-2.5 py-1 text-xs text-foreground font-medium outline-none cursor-pointer"
              >
                {THEME_OPTIONS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label} ({t.mood})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-[var(--text-secondary)]">Template:</span>
                <select
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  className="rounded-md border border-[var(--border)] bg-background px-2 py-1 text-xs text-foreground outline-none cursor-pointer"
                >
                  {TEMPLATE_OPTIONS.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-[var(--text-secondary)]">Transition:</span>
                <select
                  value={transition}
                  onChange={(e) => setTransition(e.target.value)}
                  className="rounded-md border border-[var(--border)] bg-background px-2 py-1 text-xs text-foreground outline-none cursor-pointer"
                >
                  {TRANSITION_OPTIONS.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-[var(--text-secondary)]">Size:</span>
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="rounded-md border border-[var(--border)] bg-background px-2 py-1 text-xs text-foreground outline-none cursor-pointer"
                >
                  {SIZE_OPTIONS.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Left: Interactive Markdown Editor */}
          <div className="lg:col-span-5 flex flex-col h-[460px] rounded-xl border border-[var(--border)] bg-background overflow-hidden">
            <div className="px-3.5 py-2 bg-surface border-b border-[var(--border)] flex items-center justify-between text-xs text-[var(--text-secondary)] font-medium">
              <span>Markdown Source</span>
              <span className="text-[10px] text-brand-600 bg-brand-50 dark:bg-brand-900/30 px-2 py-0.5 rounded">
                Live Edit
              </span>
            </div>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="flex-1 p-3.5 bg-transparent text-foreground font-mono text-xs leading-relaxed resize-none outline-none focus:ring-0"
              placeholder="Write your slides in markdown..."
            />
          </div>

          {/* Right: Live Presentation Preview */}
          <div className="lg:col-span-7 flex flex-col h-[460px] rounded-xl border border-[var(--border)] bg-black overflow-hidden relative shadow-inner">
            <iframe
              ref={iframeRef}
              srcDoc={shellHtml}
              className="w-full h-full border-0"
              title="Live Slide Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
      )}

      {/* ─── Tab 2: Theme Explorer ──────────────────────────────────── */}
      {activeTab === "themes" && (
        <div className="space-y-4 animate-fade-in">
          <p className="text-sm text-[var(--text-secondary)]">
            Click any palette below to instantly apply it to the live slide preview.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {THEME_OPTIONS.map((t) => {
              const isSelected = theme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTheme(t.id);
                    setActiveTab("playground");
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "border-brand-500 bg-brand-50/50 dark:bg-brand-900/20 ring-2 ring-brand-500/20 shadow-md"
                      : "border-[var(--border)] bg-surface hover:border-[var(--border-hover)] hover:bg-surface-2"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-xs text-foreground">{t.label}</span>
                    <span className="text-[10px] uppercase font-mono text-[var(--text-tertiary)]">{t.mood}</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] line-clamp-1">{t.blurb || "Engineered palette"}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Tab 3: Sample Decks ────────────────────────────────────── */}
      {activeTab === "samples" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
          {Object.entries(SAMPLE_DECKS).map(([key, sample]) => {
            const isSelected = selectedSample === key;
            return (
              <div
                key={key}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isSelected
                    ? "border-brand-500 bg-brand-50/30 dark:bg-brand-900/20 shadow-md"
                    : "border-[var(--border)] bg-surface hover:border-[var(--border-hover)]"
                }`}
              >
                <div>
                  <div className="text-2xl mb-2">{sample.icon}</div>
                  <h3 className="font-bold text-foreground text-sm mb-1">{sample.name}</h3>
                  <p className="text-xs text-[var(--text-secondary)] mb-4">
                    Formatted markdown deck with theme preset <code>{sample.theme}</code>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleSelectSample(key);
                    setActiveTab("playground");
                  }}
                  className="w-full py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Load in Playground →
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Tab 4: Collaboration & Offline Simulator ───────────────── */}
      {activeTab === "collab" && (
        <div className="rounded-2xl border border-[var(--border)] bg-surface p-6 animate-fade-in space-y-6">
          <div>
            <h3 className="font-bold text-foreground text-base mb-1">
              Deterministic CRDT Sync & Offline Engine
            </h3>
            <p className="text-xs text-[var(--text-secondary)] max-w-2xl leading-relaxed">
              Presentation.AI uses state vectors and Yjs CRDTs over Supabase Realtime broadcast channels.
              Edits made while offline on a plane or disconnected network automatically reconcile when reconnected.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-background border border-[var(--border)]">
              <div className="text-emerald-500 font-bold mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                1. Continuous Broadcast
              </div>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Keystrokes are transmitted instantly via lightweight binary packets to all connected peers in the channel.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-background border border-[var(--border)]">
              <div className="text-brand-500 font-bold mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-500" />
                2. 2-Step Handshake
              </div>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                New peers exchange State Vectors (<code>SyncStep 1</code>) and receive only missing diffs (<code>SyncStep 2</code>).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-background border border-[var(--border)]">
              <div className="text-amber-500 font-bold mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                3. Offline First
              </div>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Edits persist in local IndexedDB. When online connectivity returns, changes merge deterministically.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-background border border-[var(--border)] font-mono text-[11px] text-[var(--text-secondary)] overflow-x-auto">
            <span className="text-emerald-400">✓ Collab Lab Experiment passed</span>: Two disconnected Y.Doc instances converged to identical content with zero conflicts.
          </div>
        </div>
      )}

      {/* ─── Fullscreen Presentation Modal ──────────────────────────── */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[9999] bg-black">
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 z-50 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer border border-white/20"
          >
            ✕ Exit Fullscreen (Esc)
          </button>
          <iframe
            ref={fullscreenIframeRef}
            srcDoc={fullPresentationHtml}
            className="w-full h-full border-0"
            title="Fullscreen Presentation"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      )}
    </div>
  );
}
