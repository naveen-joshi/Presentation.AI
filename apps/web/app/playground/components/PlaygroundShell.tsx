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
  FONT_OPTIONS,
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
    markdown: `<!-- bg: gradient-dark -->
:::watermark(text="CONFIDENTIAL - SERIES A")

:::layout(cover)
# NextGen {gradient:sunset}Presentation Engine{/gradient}
### Transform Markdown into high-converting investor slides in seconds.
:::badge(text="Series A Round", color="emerald", pulse=true)
:::

:::footer(left="© 2026 Presentation.AI Inc.", center="Strictly Confidential", right="Slide %slide% of %total%")

---

:::header(title="Presentation.AI Pitch", category="Opportunity", logo="⚡")

## ⚡ Problem vs {color:emerald}The Solution{/color}

:::layout(split)
:::col
### 🐌 Legacy Tools are Broken
- Manual alignment of pixel boxes
- Corrupted \`.pptx\` files on stage
- High presenter cognitive load {click}
:::
:::col
### 🚀 {gradient:aurora}Code-Speed Velocity{/gradient}
- {bg:amber}Engineered typography{/bg} & grid layouts
- Real-time mobile remote control
- Instant {color:cyan}Vector PDF & PPTX{/color} export {click}
:::
:::

:::footer(left="© 2026 Presentation.AI Inc.", center="Strictly Confidential", right="Slide %slide% of %total%")

---

:::header(title="Financials", category="Traction", logo="📊")

## 📊 Exponential Revenue Growth

:::chart(type="bar", title="Annual Recurring Revenue ($M)")
labels: 2023, 2024, 2025, 2026 (Est.)
series: Enterprise [1.2, 3.8, 8.4, 18.2]
series: Self-Serve [0.8, 2.1, 5.2, 11.5]
:::

:::footer(left="© 2026 Presentation.AI Inc.", center="Strictly Confidential", right="Slide %slide% of %total%")

<!-- note:
Highlight our 240% Net Revenue Retention across enterprise accounts.
-->

---

<!-- bg: gradient-indigo -->
:::layout(quote)
"Presentation.AI gives our team 10x presentation creation speed with unmatched stage polish."
— Principal Architect, Global Cloud Provider
:::

---

# Invest in {gradient:sunset}The Future of Presenting{/gradient}
:::badge(text="Raising $5M", color="purple")
contact@presentation.ai • San Francisco, CA
`,
  },
  tech: {
    name: "Tech Keynote",
    icon: "💻",
    theme: "midnight",
    markdown: `# High-Scale Distributed Systems
:::badge(text="Architecture Deep Dive", color="blue")
Achieving sub-10ms P99 latency with zero runtime jank.

---

## 💻 Developer Experience

:::terminal(title="bash")
$ pnpm create presentation my-keynote
$ cd my-keynote && pnpm dev
✓ Ready at http://localhost:3000
:::

---

## 📈 System Throughput & Latency

:::chart(type="area", title="Requests per Second (k RPS) vs Latency (ms)")
labels: 10k, 25k, 50k, 100k, 200k, 500k
series: P99 Latency [2.1, 2.4, 3.1, 4.2, 5.8, 8.4]
:::

---

## 🎯 Architectural Guarantees

:::grid(cols=3)
:::card(title="Deterministic", icon="🎯")
Every peer converges to identical state with zero merge conflicts.
:::
:::card(title="Offline Ready", icon="📴")
Present seamlessly on airplanes or disconnected conference halls.
:::
:::card(title="Hardware Accelerated", icon="⚡")
Pure CSS transforms and GPU rasterization for locked 60 FPS.
:::
:::
`,
  },
  showcase: {
    name: "Product Showcase",
    icon: "✨",
    theme: "neon",
    markdown: `# Presentation.AI 2.0
:::badge(text="v2.0 Live", color="emerald", pulse=true)
The world's most powerful presentation engine.

---

## 🎨 Everything You Need on Stage

:::bento
:::box(span=2, bg="gradient")
### 🎙️ Dual-Screen Presenter Cockpit
Private speaker notes, live elapsed timer, and next-slide preview.
:::
:::box(span=1)
### 📱 Mobile Remote
Scan QR code to turn your phone into a tactile wireless clicker.
:::
:::box(span=1)
### 📊 Interactive Charts
Bar, Line, Area, and Donut visualizations built right into Markdown.
:::
:::box(span=2, bg="dark")
### 📥 Universal Native Export
Download editable Microsoft PowerPoint (.pptx), Standalone HTML, or PDF.
:::
:::

---

## 🍩 Audience Channel Breakdown

:::chart(type="donut", title="User Distribution")
Enterprise Engineering: 42
Founders & Product: 33
Designers & Educators: 25
:::

---

# Create Your Deck Now
Free • No Account Required • 100% Client-Side
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
  const [headFont, setHeadFont] = useState<string>("");
  const [bodyFont, setBodyFont] = useState<string>("");
  const [showAiModal, setShowAiModal] = useState(false);
  const [showPresenterModal, setShowPresenterModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);
  const [showDesignMenu, setShowDesignMenu] = useState(false);
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
        { head: headFont || null, body: bodyFont || null },
        template as TemplateName,
        transition as TransitionName,
        "cdn"
      );
    } catch {
      return `<html><body>Preview error</body></html>`;
    }
  }, [theme, template, transition, size, headFont, bodyFont]);

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
        { head: headFont || null, body: bodyFont || null },
        { template: template as TemplateName, transition: transition as TransitionName }
      );
    } catch {
      return `<html><body>Render error</body></html>`;
    }
  }, [parsedSlides, markdown, theme, size, template, transition, headFont, bodyFont, extractTitle]);

  const iframeReadyRef = useRef(false);

  // Dispatch render message to an iframe
  const dispatchRender = useCallback(
    (iframe: HTMLIFrameElement | null) => {
      if (!iframe || !iframe.contentWindow) return;
      iframe.contentWindow.postMessage(
        {
          type: "render",
          slides: slideHtmls,
          mode: "single",
          index: currentSlideIndex,
        },
        "*"
      );
    },
    [slideHtmls, currentSlideIndex]
  );

  // Send index update to iframes
  useEffect(() => {
    const updateIndex = (iframe: HTMLIFrameElement | null) => {
      if (!iframe || !iframe.contentWindow) return;
      iframe.contentWindow.postMessage(
        {
          type: "index",
          index: currentSlideIndex,
        },
        "*"
      );
    };
    updateIndex(iframeRef.current);
    updateIndex(fullscreenIframeRef.current);
    updateIndex(presenterIframeRef.current);
  }, [currentSlideIndex]);

  // Send theme & font updates to iframes
  useEffect(() => {
    const updateTheme = (iframe: HTMLIFrameElement | null) => {
      if (!iframe || !iframe.contentWindow) return;
      iframe.contentWindow.postMessage(
        {
          type: "theme",
          theme,
          size,
          head: headFont || "",
          body: bodyFont || "",
          template,
          transition,
        },
        "*"
      );
    };
    updateTheme(iframeRef.current);
    updateTheme(fullscreenIframeRef.current);
    updateTheme(presenterIframeRef.current);
  }, [theme, size, headFont, bodyFont, template, transition]);

  // Listen for iframe communication (ready, navigation, goto, actions)
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (!e.data || typeof e.data !== "object") return;
      if (e.data.type === "ready") {
        iframeReadyRef.current = true;
        dispatchRender(iframeRef.current);
        dispatchRender(fullscreenIframeRef.current);
        dispatchRender(presenterIframeRef.current);
      } else if (e.data.type === "nav") {
        const delta = typeof e.data.delta === "number" ? e.data.delta : 0;
        setCurrentSlideIndex((prev) => Math.max(0, Math.min(parsedSlides.length - 1, prev + delta)));
      } else if (e.data.type === "goto" && typeof e.data.index === "number") {
        setCurrentSlideIndex(Math.max(0, Math.min(parsedSlides.length - 1, e.data.index)));
      } else if (e.data.type === "action" && e.data.action === "present") {
        setIsFullscreen(true);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [dispatchRender, parsedSlides.length]);

  // Global keyboard navigation handler
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const activeEl = document.activeElement;
      const isInput =
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.closest(".cm-content") ||
          activeEl.getAttribute("contenteditable") === "true");

      if (e.key === "Escape") {
        if (isFullscreen) setIsFullscreen(false);
        if (showPresenterModal) setShowPresenterModal(false);
        return;
      }

      // If user is actively typing in the editor, don't navigate unless Alt is pressed
      if (isInput && !e.altKey) return;

      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "PageDown" || (e.key === " " && !isInput)) {
        e.preventDefault();
        setCurrentSlideIndex((prev) => Math.min(parsedSlides.length - 1, prev + 1));
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        setCurrentSlideIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === "Home") {
        e.preventDefault();
        setCurrentSlideIndex(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setCurrentSlideIndex(parsedSlides.length - 1);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [parsedSlides.length, isFullscreen, showPresenterModal]);

  // Sync slides into all active preview iframes in realtime
  useEffect(() => {
    dispatchRender(iframeRef.current);
    dispatchRender(fullscreenIframeRef.current);
    dispatchRender(presenterIframeRef.current);
  }, [dispatchRender, shellHtml]);

  // AI transformations for the current active slide
  const handleTransformSlide = async (
    action: "punchy" | "summarize" | "expand" | "generate-notes" | "translate",
    targetLanguage?: string
  ) => {
    try {
      const slideSections = markdown
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .split(/\n[ \t]*---[ \t]*\n/);

      const targetIndex = Math.min(Math.max(0, currentSlideIndex), slideSections.length - 1);
      const currentSlideMarkdown = slideSections[targetIndex] || markdown;

      const res = await fetch("/api/ai/transform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          markdown: currentSlideMarkdown,
          action,
          targetLanguage,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.result) {
          slideSections[targetIndex] = data.result;
          const updatedMarkdown = slideSections.join("\n\n---\n\n");
          setMarkdown(updatedMarkdown);
          editorRef.current?.setValue(updatedMarkdown);
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

  const [isExportingPptx, setIsExportingPptx] = useState(false);

  // Downloads
  const handleDownloadPptx = async () => {
    try {
      setIsExportingPptx(true);
      const { exportToPptx } = await import("@/lib/export/pptxExport");
      await exportToPptx(markdown, extractTitle(markdown), theme);
    } catch (e) {
      console.error("PPTX export failed:", e);
    } finally {
      setIsExportingPptx(false);
      setShowExportMenu(false);
    }
  };

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
        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-md shrink-0">
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

          {/* Sample Presets Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPresetsMenu(!showPresetsMenu)}
              className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-[var(--border)] bg-background hover:bg-surface-2 text-xs font-semibold text-foreground transition-all cursor-pointer shadow-xs"
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
        </div>

        {/* Center Pod: Design Settings (Full inline strip on 2xl, compact popover on smaller screens) */}
        <div className="flex items-center">
          {/* 2xl+ Screen Inline Strip */}
          <div className="hidden 2xl:flex items-center h-9 px-1.5 bg-background rounded-lg border border-[var(--border)] gap-1 shadow-xs shrink-0">
            {/* Theme */}
            <div className="flex items-center gap-1 px-1.5">
              <span className="text-xs">🎨</span>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="bg-transparent text-xs text-foreground font-medium outline-none cursor-pointer pr-1 w-20 truncate"
                title="Presentation Theme"
              >
                {THEME_OPTIONS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="h-4 w-px bg-[var(--border)] shrink-0" />

            {/* Template */}
            <div className="flex items-center gap-1 px-1.5">
              <span className="text-xs">📐</span>
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="bg-transparent text-xs text-foreground font-medium outline-none cursor-pointer pr-1 w-18 capitalize"
                title="Slide Layout Template"
              >
                {TEMPLATE_OPTIONS.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="h-4 w-px bg-[var(--border)] shrink-0" />

            {/* Transition */}
            <div className="flex items-center gap-1 px-1.5">
              <span className="text-xs">🔀</span>
              <select
                value={transition}
                onChange={(e) => setTransition(e.target.value)}
                className="bg-transparent text-xs text-foreground font-medium outline-none cursor-pointer pr-1 w-16 capitalize"
                title="Slide Transition Effect"
              >
                {TRANSITION_OPTIONS.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="h-4 w-px bg-[var(--border)] shrink-0" />

            {/* Size */}
            <div className="flex items-center gap-1 px-1.5">
              <span className="text-xs">🖥️</span>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="bg-transparent text-xs text-foreground font-medium outline-none cursor-pointer pr-1 w-14 uppercase"
                title="Typography Scale"
              >
                {SIZE_OPTIONS.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>

            <div className="h-4 w-px bg-[var(--border)] shrink-0" />

            {/* Head Font */}
            <div className="flex items-center gap-1 px-1.5">
              <span className="text-xs" title="Heading Font">🔤</span>
              <select
                value={headFont}
                onChange={(e) => setHeadFont(e.target.value)}
                className="bg-transparent text-xs text-foreground font-medium outline-none cursor-pointer pr-1 w-24 truncate"
                title="Heading Font Family"
              >
                <option value="">Head Font</option>
                {FONT_OPTIONS.map((f) => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
            </div>

            <div className="h-4 w-px bg-[var(--border)] shrink-0" />

            {/* Body Font */}
            <div className="flex items-center gap-1 px-1.5">
              <span className="text-xs text-[var(--text-tertiary)]" title="Body Font">Aa</span>
              <select
                value={bodyFont}
                onChange={(e) => setBodyFont(e.target.value)}
                className="bg-transparent text-xs text-foreground font-medium outline-none cursor-pointer pr-1 w-24 truncate"
                title="Body Font Family"
              >
                <option value="">Body Font</option>
                {FONT_OPTIONS.map((f) => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Compact Design Popover for < 2xl screens */}
          <div className="relative 2xl:hidden">
            <button
              type="button"
              onClick={() => setShowDesignMenu(!showDesignMenu)}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[var(--border)] bg-background hover:bg-surface-2 text-xs font-semibold text-foreground transition-all cursor-pointer shadow-xs"
              title="Theme, Fonts & Layout Settings"
            >
              <span>🎨</span> Design Settings
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {showDesignMenu && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 rounded-xl border border-[var(--border)] bg-surface p-3 shadow-2xl z-50 animate-fade-in space-y-2.5">
                <div className="text-[11px] font-bold text-foreground flex items-center justify-between pb-1 border-b border-[var(--border)]">
                  <span>🎨 Deck Design & Typography</span>
                  <button
                    type="button"
                    onClick={() => setShowDesignMenu(false)}
                    className="text-[var(--text-tertiary)] hover:text-foreground text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block mb-1">Theme</label>
                    <select
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      className="w-full p-1.5 rounded-lg bg-background border border-[var(--border)] text-xs text-foreground font-medium outline-none"
                    >
                      {THEME_OPTIONS.map((t) => (
                        <option key={t.id} value={t.id}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block mb-1">Layout Template</label>
                    <select
                      value={template}
                      onChange={(e) => setTemplate(e.target.value)}
                      className="w-full p-1.5 rounded-lg bg-background border border-[var(--border)] text-xs text-foreground font-medium outline-none capitalize"
                    >
                      {TEMPLATE_OPTIONS.map((t) => (
                        <option key={t.id} value={t.id}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block mb-1">Transition</label>
                    <select
                      value={transition}
                      onChange={(e) => setTransition(e.target.value)}
                      className="w-full p-1.5 rounded-lg bg-background border border-[var(--border)] text-xs text-foreground font-medium outline-none capitalize"
                    >
                      {TRANSITION_OPTIONS.map((t) => (
                        <option key={t.id} value={t.id}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block mb-1">Scale / Size</label>
                    <select
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      className="w-full p-1.5 rounded-lg bg-background border border-[var(--border)] text-xs text-foreground font-medium outline-none uppercase"
                    >
                      {SIZE_OPTIONS.map((s) => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block mb-1">Heading Font</label>
                    <select
                      value={headFont}
                      onChange={(e) => setHeadFont(e.target.value)}
                      className="w-full p-1.5 rounded-lg bg-background border border-[var(--border)] text-xs text-foreground font-medium outline-none"
                    >
                      <option value="">Theme Default</option>
                      {FONT_OPTIONS.map((f) => (
                        <option key={f.id} value={f.id}>{f.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block mb-1">Body Font</label>
                    <select
                      value={bodyFont}
                      onChange={(e) => setBodyFont(e.target.value)}
                      className="w-full p-1.5 rounded-lg bg-background border border-[var(--border)] text-xs text-foreground font-medium outline-none"
                    >
                      <option value="">Theme Default</option>
                      {FONT_OPTIONS.map((f) => (
                        <option key={f.id} value={f.id}>{f.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Pod: Actions Cluster */}
        <div className="flex items-center gap-2 shrink-0">
          {/* AI Generator Button */}
          <button
            type="button"
            onClick={() => setShowAiModal(true)}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer active:scale-95 shrink-0"
          >
            <span>✨</span>
            <span className="hidden sm:inline">AI Generator</span>
            <span className="sm:hidden">AI</span>
          </button>

          {/* Delivery & Export Grouped Pod */}
          <div className="flex items-center p-0.5 bg-background rounded-lg border border-[var(--border)] h-8 shrink-0">
            <button
              type="button"
              onClick={() => setShowPresenterModal(true)}
              className="inline-flex items-center gap-1 h-full px-2.5 rounded-md hover:bg-surface-2 text-xs font-semibold text-foreground transition-colors cursor-pointer"
              title="Open Dual-Screen Presenter Cockpit"
            >
              <span>🎙️</span>
              <span className="hidden md:inline">Presenter</span>
            </button>

            <div className="h-4 w-px bg-[var(--border)] mx-0.5" />

            {/* Present Fullscreen */}
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="inline-flex items-center gap-1 h-full px-2.5 rounded-md hover:bg-surface-2 text-xs font-semibold text-foreground transition-colors cursor-pointer"
              title="Fullscreen Presentation"
            >
              <span>⤢</span>
              <span className="hidden md:inline">Present</span>
            </button>

            <div className="h-4 w-px bg-[var(--border)] mx-0.5" />

            {/* Export Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="inline-flex items-center gap-1 h-full px-2.5 rounded-md hover:bg-surface-2 text-xs font-semibold text-foreground transition-colors cursor-pointer"
              >
                <span>📥</span> Export
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {showExportMenu && (
                <div className="absolute top-full right-0 mt-1.5 w-52 rounded-xl border border-[var(--border)] bg-surface p-1.5 shadow-2xl z-50 animate-fade-in space-y-1">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-2 text-xs flex items-center justify-between text-foreground cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span>📄</span> Export as PDF
                    </span>
                    <span className="text-[10px] text-[var(--text-tertiary)] font-mono">Vector</span>
                  </button>

                  <button
                    type="button"
                    disabled={isExportingPptx}
                    onClick={handleDownloadPptx}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-2 text-xs flex items-center justify-between text-foreground cursor-pointer disabled:opacity-50"
                  >
                    <span className="flex items-center gap-2">
                      <span>📊</span> {isExportingPptx ? "Exporting..." : "Export as PPTX"}
                    </span>
                    <span className="text-[10px] text-brand-500 font-mono font-bold">PowerPoint</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadHtml}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-2 text-xs flex items-center justify-between text-foreground cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span>🌐</span> Standalone HTML
                    </span>
                    <span className="text-[10px] text-[var(--text-tertiary)] font-mono">Web</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadMarkdown}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-2 text-xs flex items-center justify-between text-foreground cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span>📝</span> Markdown File
                    </span>
                    <span className="text-[10px] text-[var(--text-tertiary)] font-mono">.md</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sign Up CTA */}
          <Link
            href="/sign-up"
            className="hidden sm:inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-surface-2 hover:bg-surface border border-[var(--border)] text-xs font-semibold text-foreground transition-all shrink-0"
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
          <div className="h-8 bg-surface border-b border-[var(--border)] px-3 flex items-center justify-between text-[11px] text-[var(--text-secondary)] font-medium select-none shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">Live Slide Preview</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-2 text-[var(--text-tertiary)] font-mono">
                {parsedSlides.length} {parsedSlides.length === 1 ? "slide" : "slides"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[var(--text-tertiary)] hidden sm:inline">Navigate: ← / →</span>
              <button
                type="button"
                onClick={() => setIsFullscreen(true)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-brand-50 hover:bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 font-semibold text-[10px] transition-colors cursor-pointer"
              >
                ⤢ Fullscreen
              </button>
            </div>
          </div>

          <div className="flex-1 relative bg-neutral-950">
            <iframe
              ref={iframeRef}
              srcDoc={shellHtml}
              className="w-full h-full border-0"
              title="Live Slide Preview"
              sandbox="allow-scripts allow-same-origin"
              onLoad={() => dispatchRender(iframeRef.current)}
            />
          </div>

          {/* Bottom Floating Navigation Toolbar */}
          <div className="h-10 bg-surface/90 backdrop-blur border-t border-[var(--border)] px-4 flex items-center justify-between text-xs select-none shrink-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentSlideIndex <= 0}
                onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-2 hover:bg-surface border border-[var(--border)] text-foreground font-semibold text-xs transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                title="Previous Slide (Arrow Left)"
              >
                ← Prev
              </button>
              <button
                type="button"
                disabled={currentSlideIndex >= parsedSlides.length - 1}
                onClick={() => setCurrentSlideIndex((prev) => Math.min(parsedSlides.length - 1, prev + 1))}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-2 hover:bg-surface border border-[var(--border)] text-foreground font-semibold text-xs transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                title="Next Slide (Arrow Right)"
              >
                Next →
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-[var(--text-secondary)]">
                Slide <span className="text-foreground font-bold">{currentSlideIndex + 1}</span> of{" "}
                <span className="text-foreground font-bold">{parsedSlides.length || 1}</span>
              </span>
            </div>

            <div className="flex items-center gap-1">
              {parsedSlides.slice(0, 10).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentSlideIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                    i === currentSlideIndex
                      ? "bg-brand-600 w-4"
                      : "bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400"
                  }`}
                  title={`Jump to Slide ${i + 1}`}
                />
              ))}
              {parsedSlides.length > 10 && (
                <span className="text-[9px] text-[var(--text-tertiary)] pl-1">+{parsedSlides.length - 10}</span>
              )}
            </div>
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
