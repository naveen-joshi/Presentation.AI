"use client";

import Link from "next/link";
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
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
import { MarkdownEditor, type MarkdownEditorHandle } from "../../(app)/deck/[id]/components/MarkdownEditor";
import { EditorToolbar } from "../../(app)/deck/[id]/components/EditorToolbar";
import { AiCopilotBar } from "../../(app)/deck/[id]/components/AiCopilotBar";
import { AiGenerateModal } from "../../(app)/deck/[id]/components/AiGenerateModal";

const PRESET_DECKS: Record<
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
:::grid(cols=3)
:::card(title="Clunky UX", icon="🐌")
Traditional slide tools waste hours on alignment and box tweaking.
:::
:::card(title="Binary Git Lock", icon="🔒")
Version control fails completely on binary \`.pptx\` and \`.key\` files.
:::
:::card(title="Slow Delivery", icon="⏳")
Content creation is disconnected from codebase and documentation.
:::
:::

---

## 💡 The Solution

:::callout(type="tip")
💡 **Markdown First**: Keep your presentations directly in Git with branch reviews, pull requests, and instant CI deploys.
:::

:::grid(cols=3)
:::metric(value="+340%", label="Creation Speed", sub="Compared to manual editors")
:::metric(value="0 ms", label="Merge Conflicts", sub="Automated CRDT resolution")
:::metric(value="30+", label="Theme Presets", sub="Engineered typography")
:::

---

## 🏗️ Architecture Pipeline

\`\`\`mermaid
graph LR
  A[Markdown Source] --> B[Renderer Engine]
  B --> C[Vector PDF Print]
  B --> D[Dual-Screen Presenter]
  B --> E[Mobile Touch Remote]
\`\`\`

<!-- note:
Highlight the sub-second compilation and vector PDF engine.
-->

---

# Ready to experience the future?
Built with Next.js 16, React 19, and Yjs CRDTs.
`,
  },
  tech: {
    name: "Tech Keynote",
    icon: "💻",
    theme: "midnight",
    markdown: `# Building Real-Time Systems with CRDTs
Deep dive into Conflict-Free Replicated Data Types.

---

## 💻 Quick Start

:::terminal(title="bash")
$ pnpm create presentation my-talk
$ cd my-talk && pnpm dev
✓ Ready at http://localhost:3000
:::

---

## 🔄 State Vector Convergence

\`\`\`ts
// 1. Client A sends compact state vector
channel.send({ event: "sync-step-1", svA });

// 2. Client B computes exact missing diff
const diffForA = Y.encodeStateAsUpdate(docB, svA);

// 3. Client A applies update with 0 conflict
Y.applyUpdate(docA, diffForA);
\`\`\`

---

## 🎯 Architectural Guarantees

:::grid(cols=3)
:::card(title="Deterministic", icon="🎯")
Every connected peer converges to the identical presentation state.
:::
:::card(title="Offline First", icon="📴")
Edit on airplanes or trains; reconcile seamlessly on reconnection.
:::
:::card(title="Zero Locking", icon="⚡")
No centralized server lock contention or file blocking.
:::
:::
`,
  },
  showcase: {
    name: "Product Showcase",
    icon: "✨",
    theme: "neon",
    markdown: `# Presentation.AI 2.0
The fastest way to build slides.

---

## 🎨 Built for High-Stakes Delivery

:::grid(cols=3)
:::card(title="AI Copilot", icon="🤖")
Generate complete multi-slide keynotes with Nemotron 3.5 MoE.
:::
:::card(title="Presenter Pro", icon="🎙️")
Dual-screen cockpit with live timer, notes, and next slide view.
:::
:::card(title="Mobile Remote", icon="📱")
Advance slides and read talking cues directly on your phone.
:::
:::

---

## 📊 Performance Benchmarks

:::grid(cols=3)
:::metric(value="< 12ms", label="Render P99", sub="Sub-frame visual update")
:::metric(value="100%", label="Offline Ready", sub="IndexedDB storage")
:::metric(value="4K/60", label="Smooth Canvas", sub="Hardware accelerated")
:::

---

# Start Presenting Today
Free • Open Source • Markdown Native
`,
  },
};

const STORAGE_KEY = "presentation_ai_playground_deck";

export function PlaygroundShell() {
  const [markdown, setMarkdown] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return saved;
    }
    return PRESET_DECKS.pitch.markdown;
  });

  const [theme, setTheme] = useState<string>("nord");
  const [template, setTemplate] = useState<string>("classic");
  const [transition, setTransition] = useState<string>("slide");
  const [size, setSize] = useState<string>("m");
  const [showAiModal, setShowAiModal] = useState(false);
  const [showPresenterModal, setShowPresenterModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Presenter cockpit timer state
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const editorRef = useRef<MarkdownEditorHandle>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fullscreenIframeRef = useRef<HTMLIFrameElement>(null);
  const presenterIframeRef = useRef<HTMLIFrameElement>(null);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, markdown);
    } catch {}
  }, [markdown]);

  // Timer logic for Presenter Pro Cockpit
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Extract deck title
  const extractTitle = useCallback((md: string) => {
    const match = md.match(/^#\s+(.+)$/m);
    return match ? match[1].trim() : "Interactive Presentation";
  }, []);

  // Generate preview shell HTML
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
      return `<html><body>Preview error</body></html>`;
    }
  }, [theme, template, transition, size]);

  // Parse slides
  const parsedSlides = useMemo(() => {
    try {
      return parseSlides(markdown);
    } catch {
      return [];
    }
  }, [markdown]);

  const slideHtmls = useMemo(() => {
    return parsedSlides.map((s, i) => renderSlide(s, i));
  }, [parsedSlides]);

  // Full presentation standalone HTML
  const fullHtml = useMemo(() => {
    try {
      return generateHtml(
        parsedSlides,
        extractTitle(markdown),
        true,
        theme as ThemeName,
        size as SizeName,
        {},
        { template: template as TemplateName, transition: transition as TransitionName }
      );
    } catch {
      return `<html><body>Render error</body></html>`;
    }
  }, [parsedSlides, markdown, theme, size, template, transition, extractTitle]);

  // Dispatch render message to an iframe
  const dispatchRender = useCallback(
    (iframe: HTMLIFrameElement | null) => {
      if (!iframe || !iframe.contentWindow) return;
      iframe.contentWindow.postMessage(
        {
          type: "render",
          slides: slideHtmls,
          css: "",
          cursor: currentSlideIndex,
        },
        "*"
      );
    },
    [slideHtmls, currentSlideIndex]
  );

  // Sync slides into all active preview iframes in realtime
  useEffect(() => {
    dispatchRender(iframeRef.current);
    dispatchRender(fullscreenIframeRef.current);
    dispatchRender(presenterIframeRef.current);
  }, [dispatchRender, shellHtml]);

  // AI transformations
  const handleTransformSlide = async (
    action: "punchy" | "summarize" | "expand" | "generate-notes" | "translate",
    targetLanguage?: string
  ) => {
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
          editorRef.current?.setValue(data.result);
        }
      }
    } catch (e) {
      console.error("Transform error:", e);
    }
  };

  const handleApplyAiGenerated = (newMd: string, newTheme?: string) => {
    setMarkdown(newMd);
    editorRef.current?.setValue(newMd);
    if (newTheme) setTheme(newTheme);
  };

  // Downloads
  const handleDownloadHtml = () => {
    const blob = new Blob([fullHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${extractTitle(markdown).toLowerCase().replace(/[^a-z0-9]/g, "-")}.html`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${extractTitle(markdown).toLowerCase().replace(/[^a-z0-9]/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const currentNotes = parsedSlides[currentSlideIndex]?.notes || "No speaker notes written for this slide. Add <!-- note: ... --> in markdown.";
  const nextSlideHtml = slideHtmls[currentSlideIndex + 1] || null;

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* ─── Top Main Navigation Bar ───────────────────────────────── */}
      <header className="flex items-center justify-between h-14 px-4 border-b border-[var(--border)] bg-surface shrink-0 z-20 gap-3">
        {/* Left Pod: Brand & Presets */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-md">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8" />
                <path d="M12 17v4" />
              </svg>
            </div>
            <span className="text-sm font-bold text-foreground tracking-tight hidden sm:inline">
              Presentation<span className="text-brand-500">.AI</span>
            </span>
          </Link>

          <span className="text-[var(--border)] hidden sm:inline">|</span>

          {/* Sample Presets Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPresetsMenu(!showPresetsMenu)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-background hover:bg-surface-2 text-xs font-semibold text-foreground transition-all cursor-pointer shadow-xs"
            >
              <span>🪄</span> Templates
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {showPresetsMenu && (
              <div className="absolute top-full left-0 mt-1.5 w-64 rounded-xl border border-[var(--border)] bg-surface p-1.5 shadow-2xl z-50 animate-fade-in space-y-1">
                {Object.entries(PRESET_DECKS).map(([key, deck]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setMarkdown(deck.markdown);
                      setTheme(deck.theme);
                      editorRef.current?.setValue(deck.markdown);
                      setShowPresetsMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-2 text-xs flex items-center gap-2.5 text-foreground cursor-pointer transition-colors"
                  >
                    <span className="text-lg">{deck.icon}</span>
                    <div>
                      <div className="font-semibold">{deck.name}</div>
                      <div className="text-[10px] text-[var(--text-secondary)]">Theme: {deck.theme}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Sandbox Mode
          </div>
        </div>

        {/* Center Pod: Design Settings Segmented Control */}
        <div className="hidden xl:flex items-center p-1 bg-background rounded-xl border border-[var(--border)] gap-1 shadow-xs">
          <div className="flex items-center gap-1 px-2">
            <span className="text-xs">🎨</span>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="bg-transparent text-xs text-foreground font-medium outline-none cursor-pointer pr-1"
            >
              {THEME_OPTIONS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="h-4 w-px bg-[var(--border)]" />

          <div className="flex items-center gap-1 px-2">
            <span className="text-xs">📐</span>
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="bg-transparent text-xs text-foreground font-medium outline-none cursor-pointer pr-1"
            >
              {TEMPLATE_OPTIONS.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="h-4 w-px bg-[var(--border)]" />

          <div className="flex items-center gap-1 px-2">
            <span className="text-xs">🔀</span>
            <select
              value={transition}
              onChange={(e) => setTransition(e.target.value)}
              className="bg-transparent text-xs text-foreground font-medium outline-none cursor-pointer pr-1"
            >
              {TRANSITION_OPTIONS.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="h-4 w-px bg-[var(--border)]" />

          <div className="flex items-center gap-1 px-2">
            <span className="text-xs">🖥️</span>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="bg-transparent text-xs text-foreground font-medium outline-none cursor-pointer pr-1"
            >
              {SIZE_OPTIONS.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Pod: Actions Cluster */}
        <div className="flex items-center gap-2">
          {/* AI Generator Button */}
          <button
            type="button"
            onClick={() => setShowAiModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <span>✨</span> AI Generator
          </button>

          {/* Delivery & Export Grouped Pod */}
          <div className="flex items-center p-0.5 bg-background rounded-lg border border-[var(--border)]">
            <button
              type="button"
              onClick={() => setShowPresenterModal(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-surface-2 text-xs font-semibold text-foreground transition-colors cursor-pointer"
              title="Open Dual-Screen Presenter Cockpit"
            >
              <span>🎙️</span> Presenter
            </button>

            <div className="h-4 w-px bg-[var(--border)] mx-0.5" />

            {/* Export Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-surface-2 text-xs font-semibold text-foreground transition-colors cursor-pointer"
              >
                <span>📥</span> Export
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {showExportMenu && (
                <div className="absolute top-full right-0 mt-1.5 w-56 rounded-xl border border-[var(--border)] bg-surface p-1.5 shadow-2xl z-50 animate-fade-in space-y-1">
                  <button
                    type="button"
                    onClick={handleDownloadHtml}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-surface-2 text-xs flex items-center gap-2 text-foreground cursor-pointer"
                  >
                    <span>🌐</span>
                    <div>
                      <div className="font-semibold">Standalone HTML</div>
                      <div className="text-[10px] text-[var(--text-secondary)]">Single self-contained file</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadMarkdown}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-surface-2 text-xs flex items-center gap-2 text-foreground cursor-pointer"
                  >
                    <span>📄</span>
                    <div>
                      <div className="font-semibold">Markdown (.md)</div>
                      <div className="text-[10px] text-[var(--text-secondary)]">Raw slides with notes</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-surface-2 text-xs flex items-center gap-2 text-foreground cursor-pointer"
                  >
                    <span>🖨️</span>
                    <div>
                      <div className="font-semibold">Print / Vector PDF</div>
                      <div className="text-[10px] text-[var(--text-secondary)]">Browser print preview</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            <div className="h-4 w-px bg-[var(--border)] mx-0.5" />

            {/* Present Mode */}
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5,3 19,12 5,21" />
              </svg>
              Present
            </button>
          </div>

          <div className="h-5 w-px bg-[var(--border)] hidden sm:block" />

          {/* Sign Up CTA */}
          <Link
            href="/sign-up"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 hover:bg-surface-3 text-xs font-semibold text-foreground border border-[var(--border)] transition-colors shadow-xs"
          >
            <span>☁️</span> Save to Cloud
          </Link>
        </div>
      </header>

      {/* ─── Main Editor + Preview Split ────────────────────────────── */}
      <div className="flex flex-1 min-h-0">
        {/* Left Side: Markdown Editor, AI Copilot, and Insert Toolbar */}
        <div className="flex-1 min-w-0 border-r border-[var(--border)] flex flex-col bg-background">
          <AiCopilotBar
            onTransform={handleTransformSlide}
            onOpenGenerator={() => setShowAiModal(true)}
          />
          <EditorToolbar editorRef={editorRef} />
          <div className="flex-1 min-h-0">
            <MarkdownEditor
              ref={editorRef}
              initialValue={markdown}
              onChange={(val) => setMarkdown(val)}
            />
          </div>
        </div>

        {/* Right Side: Live Slide Preview Frame */}
        <div className="flex-1 min-w-0 bg-black relative flex flex-col">
          <div className="h-7 bg-surface border-b border-[var(--border)] px-3 flex items-center justify-between text-[11px] text-[var(--text-secondary)] font-medium">
            <span>Live Presentation Preview ({parsedSlides.length} slides)</span>
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="text-brand-600 hover:text-brand-500 font-semibold cursor-pointer"
            >
              ⤢ Fullscreen
            </button>
          </div>
          <div className="flex-1 relative">
            <iframe
              ref={iframeRef}
              srcDoc={shellHtml}
              className="w-full h-full border-0"
              title="Live Slide Preview"
              sandbox="allow-scripts allow-same-origin"
              onLoad={() => dispatchRender(iframeRef.current)}
            />
          </div>
        </div>
      </div>

      {/* ─── AI Generator Modal ─────────────────────────────────────── */}
      {showAiModal && (
        <AiGenerateModal
          isOpen={showAiModal}
          onClose={() => setShowAiModal(false)}
          onApply={handleApplyAiGenerated}
        />
      )}

      {/* ─── Presenter Pro Cockpit View Modal ──────────────────────── */}
      {showPresenterModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col p-4 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 text-white">
            <div className="flex items-center gap-3">
              <span className="text-base font-bold">🎙️ Presenter Pro Cockpit</span>
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                Slide {currentSlideIndex + 1} of {parsedSlides.length}
              </span>
            </div>

            {/* Stopwatch */}
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded-lg bg-white/10 font-mono text-base text-emerald-400 font-bold">
                ⏱️ {formatTime(elapsedSeconds)}
              </div>
              <button
                type="button"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="px-2.5 py-1 rounded bg-white/20 hover:bg-white/30 text-xs font-semibold cursor-pointer"
              >
                {isTimerRunning ? "Pause" : "Start"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsTimerRunning(false);
                  setElapsedSeconds(0);
                }}
                className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-xs cursor-pointer"
              >
                Reset
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowPresenterModal(false)}
              className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-xs font-semibold cursor-pointer"
            >
              ✕ Exit Cockpit
            </button>
          </div>

          {/* Dual Screen Simulator Body */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 pt-4 min-h-0">
            {/* Main Stage Slide Preview */}
            <div className="lg:col-span-7 rounded-xl border border-white/10 bg-black overflow-hidden relative shadow-2xl">
              <div className="absolute top-2 left-2 z-10 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500 text-black">
                Audience Projector View
              </div>
              <iframe
                ref={presenterIframeRef}
                srcDoc={shellHtml}
                className="w-full h-full border-0"
                title="Presenter Preview"
                sandbox="allow-scripts allow-same-origin"
                onLoad={() => dispatchRender(presenterIframeRef.current)}
              />
            </div>

            {/* Next Slide & Speaker Notes Sidebar */}
            <div className="lg:col-span-5 flex flex-col gap-4 min-h-0">
              {/* Next Slide Preview */}
              <div className="h-44 rounded-xl border border-white/10 bg-surface/10 p-3 flex flex-col">
                <span className="text-xs font-semibold text-white/70 mb-2">👁️ Upcoming Slide Preview</span>
                <div className="flex-1 bg-black/60 rounded-lg p-3 overflow-hidden text-xs text-white/80">
                  {nextSlideHtml ? (
                    <div dangerouslySetInnerHTML={{ __html: nextSlideHtml }} className="scale-75 origin-top-left" />
                  ) : (
                    <span className="text-white/40 italic">End of presentation</span>
                  )}
                </div>
              </div>

              {/* Speaker Notes */}
              <div className="flex-1 rounded-xl border border-white/10 bg-surface/10 p-4 flex flex-col overflow-hidden">
                <span className="text-xs font-bold text-amber-400 mb-2 flex items-center gap-1.5">
                  <span>📝</span> Speaker Talking Script
                </span>
                <div className="flex-1 overflow-y-auto font-sans text-xs text-white/90 leading-relaxed whitespace-pre-wrap bg-black/40 p-3 rounded-lg border border-white/5">
                  {currentNotes}
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={currentSlideIndex <= 0}
                  onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                  className="flex-1 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-30"
                >
                  ← Previous Slide
                </button>
                <button
                  type="button"
                  disabled={currentSlideIndex >= parsedSlides.length - 1}
                  onClick={() => setCurrentSlideIndex((prev) => Math.min(parsedSlides.length - 1, prev + 1))}
                  className="flex-1 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-30"
                >
                  Next Slide →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Fullscreen In-Browser Presentation View ────────────────── */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="absolute top-3 right-3 z-50">
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="px-3 py-1.5 rounded-lg bg-black/60 hover:bg-black text-white text-xs font-semibold backdrop-blur border border-white/20 transition-all cursor-pointer"
            >
              ✕ Exit Fullscreen (Esc)
            </button>
          </div>
          <iframe
            ref={fullscreenIframeRef}
            srcDoc={shellHtml}
            className="w-full h-full border-0"
            title="Fullscreen Presentation"
            sandbox="allow-scripts allow-same-origin"
            onLoad={() => dispatchRender(fullscreenIframeRef.current)}
          />
        </div>
      )}
    </div>
  );
}
