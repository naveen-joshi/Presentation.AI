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

const SLIDE_TEMPLATES: Record<string, { label: string; icon: string; snippet: string }> = {
  title: {
    label: "Title / Hero Cover",
    icon: "🌟",
    snippet: `<!-- bg: gradient-dark -->
:::layout(cover)
# {gradient:sunset}Presentation Title{/gradient}
### Clear and Compelling Subtitle
:::badge(text="Keynote", color="emerald", pulse=true)
:::
<!-- note: Welcome the audience and outline the goals. -->`,
  },
  split: {
    label: "50/50 Comparison",
    icon: "⚖️",
    snippet: `## ⚖️ Strategic Comparison

:::layout(split)
:::col
### 👈 Option A
- High speed execution
- Cost effective scaling
:::
:::col
### 👉 Option B
- Dedicated enterprise SLA
- Advanced customizations
:::
:::
<!-- note: Contrast tradeoffs between options. -->`,
  },
  cards: {
    label: "2-Column Cards",
    icon: "🃏",
    snippet: `## 🎯 Strategic Pillars

:::grid(cols=2)
:::card(title="Performance Pillar", icon="⚡")
- Sub-10ms response time
- 99.99% reliability SLA
:::
:::card(title="Security Architecture", icon="🛡️")
- End-to-end encryption
- Zero-trust access controls
:::
:::
<!-- note: Detail each pillar. -->`,
  },
  metric: {
    label: "Big Metric Stat",
    icon: "📈",
    snippet: `## 📈 Explosive Growth Metric

:::metric(value="+340%", label="Annual Scale & Adoption", sub="5-Year Horizon")

Key growth drivers powered by developer adoption and enterprise expansion.
<!-- note: Highlight the key metrics. -->`,
  },
  chart: {
    label: "Multi-Series Chart",
    icon: "📊",
    snippet: `## 📊 Multi-Year Revenue Comparison

:::chart(type="bar", title="Annual Recurring Revenue ($M)")
labels: 2022, 2023, 2024, 2025, 2026
series: Product A [15, 30, 55, 90, 140]
series: Product B [10, 22, 40, 68, 105]
:::
<!-- note: Walk through year-by-year data. -->`,
  },
  bento: {
    label: "Bento Box Grid",
    icon: "🍱",
    snippet: `## 🍱 Comprehensive Overview

:::bento
:::box(span=2, bg="gradient")
### 🚀 Primary Pillar
Transforming how teams present worldwide.
:::
:::box(span=1, bg="glass")
### ⚡ Speed
:::metric(value="10x", label="Creation Velocity")
:::
:::
<!-- note: Overview of the core structure. -->`,
  },
  quote: {
    label: "Impactful Quote",
    icon: "💬",
    snippet: `<!-- bg: gradient-indigo -->
:::layout(quote)
"Presentation.AI gives our team 10x presentation velocity with unmatched stage polish."
— Chief Technology Officer, Global Tech Leader
:::
<!-- note: Customer testimonial and validation. -->`,
  },
  image: {
    label: "Image Showcase",
    icon: "🖼️",
    snippet: `## 🖼️ Visual Showcase

![High Impact Architecture](https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80)

<!-- note: Detail the architecture image. -->`,
  },
  blank: {
    label: "Standard Slide",
    icon: "📄",
    snippet: `## Slide Title

- First key takeaway
- Second key takeaway {click}
- Third key takeaway {click}

<!-- note: Speaker notes go here. -->`,
  },
};

const UNSPLASH_PRESETS = [
  { label: "Dashboard", url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80" },
  { label: "Modern Tech", url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80" },
  { label: "Team / Office", url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80" },
  { label: "Abstract Gradient", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80" },
  { label: "Cyber Matrix", url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80" },
];

const FONT_SIZES = [
  12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 44, 48, 56, 64, 72, 80, 96,
];

const STORAGE_KEY = "presentation_ai_playground_deck";

interface SelectedElementData {
  elType: string;
  text: string;
  title: string;
  value: string;
  label: string;
  src?: string;
  tagName: string;
}

export function PlaygroundShell() {
  const [markdown, setMarkdown] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return saved;
    }
    return PRESET_DECKS.pitch.markdown;
  });

  // View Mode: "studio" (PowerPoint style), "split" (Side-by-side), "markdown" (Raw code)
  const [viewMode, setViewMode] = useState<"studio" | "split" | "markdown">("studio");
  const [activeRibbonTab, setActiveRibbonTab] = useState<"home" | "elements" | "design" | "media" | "slideshow" | "transitions" | "ai">("home");
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);

  // In-Slide Interactive Selection State
  const [selectedElement, setSelectedElement] = useState<SelectedElementData | null>(null);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [currentFontSize, setCurrentFontSize] = useState<number>(32);

  // Deck Theme & Styling
  const [theme, setTheme] = useState<string>("nord");
  const [template, setTemplate] = useState<string>("classic");
  const [transition, setTransition] = useState<string>("slide");
  const [size, setSize] = useState<string>("m");
  const [headFont, setHeadFont] = useState<string>("");
  const [bodyFont, setBodyFont] = useState<string>("");

  // Modals & Popovers
  const [showAiModal, setShowAiModal] = useState(false);
  const [showPresenterModal, setShowPresenterModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);
  const [showAddSlideMenu, setShowAddSlideMenu] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showGridModal, setShowGridModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Screen blanking state
  const [blankScreenMode, setBlankScreenMode] = useState<"none" | "black" | "white">("none");

  // Auto Slideshow State & Configuration
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [autoInterval, setAutoInterval] = useState<number>(5);
  const [autoLoop, setAutoLoop] = useState(true);
  const [autoProgress, setAutoProgress] = useState(0);

  // Custom Color State
  const [customSlideBg, setCustomSlideBg] = useState("#1e1b4b");

  // Presenter Cockpit Timer
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

  // Helper to split markdown into slide array
  const slideSections = useMemo(() => {
    return markdown
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .split(/\n[ \t]*---[ \t]*\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }, [markdown]);

  const activeSlideMarkdown = slideSections[currentSlideIndex] || "";

  // Auto Slideshow Timer Effect
  useEffect(() => {
    if (!isAutoPlaying) return;

    const intervalMs = autoInterval * 1000;
    const stepMs = 100;
    let elapsedMs = 0;

    const timer = setInterval(() => {
      elapsedMs += stepMs;
      const progress = Math.min(100, (elapsedMs / intervalMs) * 100);
      setAutoProgress(progress);

      if (elapsedMs >= intervalMs) {
        elapsedMs = 0;
        setAutoProgress(0);
        setCurrentSlideIndex((prev) => {
          if (prev < slideSections.length - 1) {
            return prev + 1;
          } else if (autoLoop) {
            return 0;
          } else {
            setIsAutoPlaying(false);
            return prev;
          }
        });
      }
    }, stepMs);

    return () => {
      clearInterval(timer);
      setAutoProgress(0);
    };
  }, [isAutoPlaying, autoInterval, autoLoop, slideSections.length]);

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

  // Listen for iframe communication
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
      } else if (e.data.type === "element-selected") {
        setSelectedElement({
          elType: e.data.elType || "text",
          text: e.data.text || "",
          title: e.data.title || "",
          value: e.data.value || "",
          label: e.data.label || "",
          src: e.data.src || "",
          tagName: e.data.tagName || "",
        });
      } else if (e.data.type === "element-deselected") {
        setSelectedElement(null);
      } else if (e.data.type === "text-selected") {
        setSelectedText(e.data.text || null);
      } else if (e.data.type === "text-deselected") {
        setSelectedText(null);
      } else if (e.data.type === "action") {
        const act = e.data.action;
        if (act === "present" || act === "fullscreen") setIsFullscreen((prev) => !prev);
        else if (act === "presenter") setShowPresenterModal((prev) => !prev);
        else if (act === "grid") setShowGridModal((prev) => !prev);
        else if (act === "auto-slideshow") setIsAutoPlaying((prev) => !prev);
        else if (act === "black-screen") setBlankScreenMode((prev) => (prev === "black" ? "none" : "black"));
        else if (act === "white-screen") setBlankScreenMode((prev) => (prev === "white" ? "none" : "white"));
        else if (act === "shortcuts") setShowShortcutsModal((prev) => !prev);
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
        if (blankScreenMode !== "none") { setBlankScreenMode("none"); return; }
        if (isFullscreen) { setIsFullscreen(false); return; }
        if (showPresenterModal) { setShowPresenterModal(false); return; }
        if (showGridModal) { setShowGridModal(false); return; }
        if (showShortcutsModal) { setShowShortcutsModal(false); return; }
        if (showImageModal) { setShowImageModal(false); return; }
        setSelectedElement(null);
        setSelectedText(null);
        return;
      }

      if (isInput && !e.altKey) return;

      const k = e.key.toLowerCase();
      if (!isInput && !e.metaKey && !e.ctrlKey) {
        if (k === "f") { e.preventDefault(); setIsFullscreen((prev) => !prev); return; }
        if (k === "p") { e.preventDefault(); setShowPresenterModal((prev) => !prev); return; }
        if (k === "g") { e.preventDefault(); setShowGridModal((prev) => !prev); return; }
        if (k === "a") { e.preventDefault(); setIsAutoPlaying((prev) => !prev); return; }
        if (k === "b") { e.preventDefault(); setBlankScreenMode((prev) => (prev === "black" ? "none" : "black")); return; }
        if (k === "w") { e.preventDefault(); setBlankScreenMode((prev) => (prev === "white" ? "none" : "white")); return; }
        if (k === "?" || k === "h") { e.preventDefault(); setShowShortcutsModal((prev) => !prev); return; }
      }

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
  }, [parsedSlides.length, isFullscreen, showPresenterModal, showGridModal, showShortcutsModal, showImageModal, blankScreenMode]);

  // Sync slides into all active preview iframes in realtime
  useEffect(() => {
    dispatchRender(iframeRef.current);
    dispatchRender(fullscreenIframeRef.current);
    dispatchRender(presenterIframeRef.current);
  }, [dispatchRender, shellHtml]);

  // ─── Slide Operations for PowerPoint Visual Workflow ──────────────
  const updateActiveSlideMarkdown = useCallback(
    (newSlideMd: string) => {
      const sections = [...slideSections];
      sections[currentSlideIndex] = newSlideMd;
      const combined = sections.join("\n\n---\n\n");
      setMarkdown(combined);
      editorRef.current?.setValue(combined);
    },
    [slideSections, currentSlideIndex]
  );

  const handleAddSlide = (templateKey: string) => {
    const templateSnippet = SLIDE_TEMPLATES[templateKey]?.snippet || SLIDE_TEMPLATES.blank.snippet;
    const sections = [...slideSections];
    const insertIdx = currentSlideIndex + 1;
    sections.splice(insertIdx, 0, templateSnippet);
    const combined = sections.join("\n\n---\n\n");
    setMarkdown(combined);
    editorRef.current?.setValue(combined);
    setCurrentSlideIndex(insertIdx);
    setShowAddSlideMenu(false);
  };

  const handleDuplicateSlide = (idx: number) => {
    const sections = [...slideSections];
    const target = sections[idx];
    if (!target) return;
    sections.splice(idx + 1, 0, target);
    const combined = sections.join("\n\n---\n\n");
    setMarkdown(combined);
    editorRef.current?.setValue(combined);
    setCurrentSlideIndex(idx + 1);
  };

  const handleDeleteSlide = (idx: number) => {
    if (slideSections.length <= 1) return;
    const sections = [...slideSections];
    sections.splice(idx, 1);
    const combined = sections.join("\n\n---\n\n");
    setMarkdown(combined);
    editorRef.current?.setValue(combined);
    setCurrentSlideIndex((prev) => Math.max(0, Math.min(sections.length - 1, prev > idx ? prev - 1 : prev)));
  };

  const handleMoveSlide = (from: number, to: number) => {
    if (to < 0 || to >= slideSections.length) return;
    const sections = [...slideSections];
    const [moved] = sections.splice(from, 1);
    sections.splice(to, 0, moved);
    const combined = sections.join("\n\n---\n\n");
    setMarkdown(combined);
    editorRef.current?.setValue(combined);
    setCurrentSlideIndex(to);
  };

  const handleApplySlideBackground = (bgValue: string) => {
    let current = activeSlideMarkdown;
    current = current.replace(/<!--\s*bg:\s*[^>]+?\s*-->\n?/gi, "");
    if (bgValue) {
      current = `<!-- bg: ${bgValue} -->\n${current.trim()}`;
    }
    updateActiveSlideMarkdown(current);
  };

  const handleInsertActiveSlideSnippet = (snippet: string) => {
    const updated = `${activeSlideMarkdown.trim()}\n\n${snippet.trim()}\n`;
    updateActiveSlideMarkdown(updated);
  };

  // ─── Format Selected Text or Selected Element ─────────────────────
  const handleApplyFormatting = (
    action: "size" | "color" | "bg" | "gradient" | "bold" | "italic" | "underline" | "align" | "reveal" | "clear" | "delete" | "replace-text",
    param?: string | number
  ) => {
    const target = selectedText || selectedElement?.text || selectedElement?.title || selectedElement?.value;
    if (!target) return;

    let md = activeSlideMarkdown;

    if (action === "delete") {
      if (selectedElement?.elType === "image" && selectedElement.src) {
        md = md.replace(new RegExp(`!\\[.*?\\]\\(${selectedElement.src}\\)`, "i"), "");
      } else if (selectedElement?.elType === "card" && selectedElement.title) {
        md = md.replace(new RegExp(`:::card\\(.*?title=["']${selectedElement.title}["'][\\s\\S]*?:::`, "i"), "");
      } else if (selectedElement?.elType === "metric") {
        md = md.replace(/:::metric\(.*?\)[\s\S]*?(?=\n:::|$)/i, "");
      } else if (selectedElement?.elType === "chart") {
        md = md.replace(/:::chart\(.*?\)[\s\S]*?:::/i, "");
      } else if (selectedElement?.elType === "callout") {
        md = md.replace(/:::callout\(.*?\)[\s\S]*?:::/i, "");
      } else {
        md = md.replace(target, "");
      }
      setSelectedElement(null);
      setSelectedText(null);
    } else if (action === "replace-text" && typeof param === "string") {
      md = md.replace(target, param);
      setSelectedElement((prev) => (prev ? { ...prev, text: param } : null));
    } else if (action === "size" && param !== undefined) {
      const numSize = Number(param);
      setCurrentFontSize(numSize);
      // Remove any existing {size:...} wrapper around target if present
      const cleanTarget = target.replace(/\{size:[^}]+\}([\s\S]*?)\{\/size\}/g, "$1");
      md = md.replace(target, `{size:${numSize}}${cleanTarget}{/size}`);
    } else if (action === "color" && param) {
      const cleanTarget = target.replace(/\{color:[^}]+\}([\s\S]*?)\{\/color\}/g, "$1");
      md = md.replace(target, `{color:${param}}${cleanTarget}{/color}`);
    } else if (action === "bg" && param) {
      const cleanTarget = target.replace(/\{bg:[^}]+\}([\s\S]*?)\{\/bg\}/g, "$1");
      md = md.replace(target, `{bg:${param}}${cleanTarget}{/bg}`);
    } else if (action === "gradient") {
      const cleanTarget = target.replace(/\{gradient:[^}]+\}([\s\S]*?)\{\/gradient\}/g, "$1");
      md = md.replace(target, `{gradient:${param || "sunset"}}${cleanTarget}{/gradient}`);
    } else if (action === "bold") {
      md = md.replace(target, `**${target.replace(/\*\*/g, "")}**`);
    } else if (action === "italic") {
      md = md.replace(target, `*${target.replace(/\*/g, "")}*`);
    } else if (action === "underline") {
      md = md.replace(target, `<u>${target.replace(/<\/?u>/g, "")}</u>`);
    } else if (action === "align" && param) {
      md = md.replace(target, `{align:${param}}${target}{/align}`);
    } else if (action === "reveal") {
      md = md.replace(target, `${target} {click}`);
    } else if (action === "clear") {
      const stripped = target
        .replace(/\{[a-z]+:[^}]+\}/gi, "")
        .replace(/\{\/[a-z]+\}/gi, "")
        .replace(/[*_~`]/g, "")
        .replace(/<\/?u>/g, "");
      md = md.replace(target, stripped);
    }

    updateActiveSlideMarkdown(md);
  };

  // AI transformations for current active slide
  const handleTransformSlide = async (
    action: "punchy" | "summarize" | "expand" | "generate-notes" | "translate",
    targetLanguage?: string
  ) => {
    try {
      const res = await fetch("/api/ai/transform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          markdown: activeSlideMarkdown || markdown,
          action,
          targetLanguage,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.result) {
          updateActiveSlideMarkdown(data.result);
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
    setCurrentSlideIndex(0);
  };

  // Downloads
  const handleDownloadPptx = async () => {
    try {
      const { exportToPptx } = await import("@/lib/export/pptxExport");
      await exportToPptx(markdown, extractTitle(markdown), theme);
    } catch (e) {
      console.error("PPTX export failed:", e);
    } finally {
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

  const currentNotes = parsedSlides[currentSlideIndex]?.notes || "";
  const nextSlideHtml = slideHtmls[currentSlideIndex + 1] || null;
  const hasActiveSelection = Boolean(selectedText || selectedElement);
  const activeSelectedSnippet = selectedText || selectedElement?.text || selectedElement?.title || selectedElement?.value || "";

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden select-none font-sans relative">
      {/* Blank Screen Overlay (B/W shortcut pause) */}
      {blankScreenMode !== "none" && (
        <div
          onClick={() => setBlankScreenMode("none")}
          className={`fixed inset-0 z-50 flex items-center justify-center cursor-pointer ${
            blankScreenMode === "black" ? "bg-black text-white/40" : "bg-white text-black/40"
          }`}
        >
          <span className="text-xs font-mono">Screen paused (Press B/W or Esc to resume)</span>
        </div>
      )}

      {/* ─── Top Master Header Bar ─────────────────────────────────── */}
      <header className="flex items-center justify-between h-13 px-3.5 border-b border-[var(--border)] bg-surface shrink-0 z-20 gap-3">
        {/* Left: Brand & Presets */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center shadow-md shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8" />
                <path d="M12 17v4" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-foreground tracking-tight leading-none">
                Presentation<span className="text-brand-500">.AI</span>
              </span>
              <span className="text-[9px] text-[var(--text-tertiary)] uppercase tracking-wider font-semibold">
                Studio
              </span>
            </div>
          </Link>

          <div className="h-5 w-px bg-[var(--border)]" />

          {/* Sample Templates Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPresetsMenu(!showPresetsMenu)}
              className="inline-flex items-center gap-1.5 h-7 px-2 rounded-lg border border-[var(--border)] bg-background hover:bg-surface-2 text-xs font-semibold text-foreground transition-all cursor-pointer shadow-xs"
            >
              <span>🪄</span> Templates
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
                      setCurrentSlideIndex(0);
                      setShowPresetsMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-2 text-xs flex items-center gap-2.5 text-foreground cursor-pointer transition-colors"
                  >
                    <span className="text-base">{deck.icon}</span>
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

        {/* Center: PowerPoint View Mode Pill Switcher */}
        <div className="flex items-center bg-background rounded-lg border border-[var(--border)] p-0.5 shadow-xs">
          <button
            type="button"
            onClick={() => setViewMode("studio")}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
              viewMode === "studio"
                ? "bg-brand-600 text-white shadow-xs"
                : "text-[var(--text-secondary)] hover:text-foreground hover:bg-surface-2"
            }`}
          >
            <span>🖥️</span>
            <span>Studio View</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("split")}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
              viewMode === "split"
                ? "bg-brand-600 text-white shadow-xs"
                : "text-[var(--text-secondary)] hover:text-foreground hover:bg-surface-2"
            }`}
          >
            <span>⚖️</span>
            <span>Split View</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("markdown")}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
              viewMode === "markdown"
                ? "bg-brand-600 text-white shadow-xs"
                : "text-[var(--text-secondary)] hover:text-foreground hover:bg-surface-2"
            }`}
          >
            <span>📝</span>
            <span>Code (MD)</span>
          </button>
        </div>

        {/* Right: Actions (AI, Presenter, Present, Export, Help) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Keyboard Shortcuts Button */}
          <button
            type="button"
            onClick={() => setShowShortcutsModal(true)}
            className="w-8 h-8 rounded-lg border border-[var(--border)] bg-background hover:bg-surface-2 text-xs font-bold text-[var(--text-secondary)] hover:text-foreground flex items-center justify-center cursor-pointer transition-colors"
            title="Keyboard Shortcuts (?)"
          >
            ?
          </button>

          {/* AI Generator Button */}
          <button
            type="button"
            onClick={() => setShowAiModal(true)}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer active:scale-95 shrink-0"
          >
            <span>✨</span>
            <span className="hidden sm:inline">AI Presentation</span>
            <span className="sm:hidden">AI</span>
          </button>

          {/* Delivery & Export Grouped Pod */}
          <div className="flex items-center p-0.5 bg-background rounded-lg border border-[var(--border)] h-8 shrink-0">
            <button
              type="button"
              onClick={() => setShowPresenterModal(true)}
              className="inline-flex items-center gap-1 h-full px-2.5 rounded-md hover:bg-surface-2 text-xs font-semibold text-foreground transition-colors cursor-pointer"
              title="Dual-Screen Presenter Cockpit (P)"
            >
              <span>🎙️</span>
              <span className="hidden md:inline">Presenter</span>
            </button>

            <div className="h-4 w-px bg-[var(--border)] mx-0.5" />

            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="inline-flex items-center gap-1 h-full px-2.5 rounded-md bg-brand-50 hover:bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-xs font-bold transition-colors cursor-pointer"
              title="Fullscreen Slide Show (F)"
            >
              <span>⤢</span>
              <span className="hidden md:inline">Present</span>
            </button>

            <div className="h-4 w-px bg-[var(--border)] mx-0.5" />

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
                    onClick={handleDownloadPptx}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-2 text-xs flex items-center justify-between text-foreground cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span>📊</span> PowerPoint (.pptx)
                    </span>
                    <span className="text-[10px] text-brand-500 font-mono font-bold">Native</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-2 text-xs flex items-center justify-between text-foreground cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span>📄</span> Export PDF
                    </span>
                    <span className="text-[10px] text-[var(--text-tertiary)] font-mono">Vector</span>
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
        </div>
      </header>

      {/* ─── PowerPoint Ribbon Navigation Strip ──────────────────────── */}
      <div className="border-b border-[var(--border)] bg-surface text-xs select-none">
        {/* Ribbon Tabs Row */}
        <div className="flex items-center px-4 gap-1 border-b border-[var(--border)]/50 bg-background/50 h-8">
          {[
            { id: "home", label: "Home", icon: "🏠" },
            { id: "elements", label: "Insert Elements", icon: "➕" },
            { id: "media", label: "Images & Media", icon: "🖼️" },
            { id: "design", label: "Design & Themes", icon: "🎨" },
            { id: "slideshow", label: "Slide Show & Auto", icon: "▶️" },
            { id: "transitions", label: "Transitions", icon: "🔀" },
            { id: "ai", label: "AI Copilot", icon: "🤖" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveRibbonTab(tab.id as typeof activeRibbonTab)}
              className={`inline-flex items-center gap-1.5 px-3 h-full border-b-2 font-semibold text-xs transition-all cursor-pointer ${
                activeRibbonTab === tab.id
                  ? "border-brand-500 text-brand-600 dark:text-brand-400 bg-surface"
                  : "border-transparent text-[var(--text-secondary)] hover:text-foreground hover:bg-surface-2"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsInspectorOpen(!isInspectorOpen)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border border-[var(--border)] transition-colors cursor-pointer ${
                isInspectorOpen ? "bg-brand-50 text-brand-600 dark:bg-brand-900/30" : "bg-background text-foreground hover:bg-surface-2"
              }`}
            >
              <span>📋</span>
              <span>Slide Inspector</span>
            </button>
          </div>
        </div>

        {/* Ribbon Action Controls Row */}
        <div className="flex flex-wrap items-center px-3 py-1.5 gap-2 min-h-11">
          {/* TAB 1: HOME - Comprehensive PowerPoint Text Formatting Toolbar */}
          {activeRibbonTab === "home" && (
            <div className="flex items-center gap-2 flex-wrap">
              {/* + New Slide Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAddSlideMenu(!showAddSlideMenu)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  <span>➕</span>
                  <span>New Slide</span>
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {showAddSlideMenu && (
                  <div className="absolute top-full left-0 mt-1.5 w-64 rounded-xl border border-[var(--border)] bg-surface p-1.5 shadow-2xl z-50 animate-fade-in space-y-1">
                    <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider px-2 py-0.5">
                      Slide Layout Templates
                    </div>
                    {Object.entries(SLIDE_TEMPLATES).map(([k, t]) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => handleAddSlide(k)}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-surface-2 text-xs flex items-center gap-2 text-foreground cursor-pointer"
                      >
                        <span className="text-base">{t.icon}</span>
                        <div>
                          <div className="font-semibold">{t.label}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="h-6 w-px bg-[var(--border)]" />

              {/* Numeric Font Size Selector (PowerPoint Style) */}
              <div className="flex items-center bg-background rounded-lg border border-[var(--border)] p-0.5 gap-0.5">
                <span className="text-[10px] font-semibold text-[var(--text-secondary)] pl-1.5">Size:</span>
                <select
                  value={currentFontSize}
                  onChange={(e) => handleApplyFormatting("size", Number(e.target.value))}
                  className="bg-transparent text-xs font-bold text-foreground px-1 outline-none cursor-pointer"
                  title="Font Size (px)"
                >
                  {FONT_SIZES.map((sz) => (
                    <option key={sz} value={sz}>{sz}px</option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => handleApplyFormatting("size", Math.min(96, currentFontSize + 4))}
                  className="px-1.5 py-0.5 rounded hover:bg-surface-2 font-bold text-foreground text-[11px] cursor-pointer"
                  title="Increase Font Size (A+)"
                >
                  A+
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyFormatting("size", Math.max(12, currentFontSize - 4))}
                  className="px-1.5 py-0.5 rounded hover:bg-surface-2 font-bold text-foreground text-[11px] cursor-pointer"
                  title="Decrease Font Size (A-)"
                >
                  A-
                </button>
              </div>

              {/* Bold / Italic / Underline */}
              <div className="flex items-center bg-background rounded-lg border border-[var(--border)] p-0.5 gap-0.5">
                <button
                  type="button"
                  onClick={() => handleApplyFormatting("bold")}
                  className="px-2 py-0.5 rounded hover:bg-surface-2 font-bold text-foreground text-xs cursor-pointer"
                  title="Bold"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyFormatting("italic")}
                  className="px-2 py-0.5 rounded hover:bg-surface-2 italic text-foreground text-xs cursor-pointer"
                  title="Italic"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyFormatting("underline")}
                  className="px-2 py-0.5 rounded hover:bg-surface-2 underline text-foreground text-xs cursor-pointer"
                  title="Underline"
                >
                  U
                </button>
              </div>

              {/* Text Alignment (Left, Center, Right) */}
              <div className="flex items-center bg-background rounded-lg border border-[var(--border)] p-0.5 gap-0.5">
                <button
                  type="button"
                  onClick={() => handleApplyFormatting("align", "left")}
                  className="px-1.5 py-0.5 rounded hover:bg-surface-2 text-foreground text-xs cursor-pointer"
                  title="Align Left"
                >
                  ⇤
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyFormatting("align", "center")}
                  className="px-1.5 py-0.5 rounded hover:bg-surface-2 text-foreground text-xs cursor-pointer"
                  title="Align Center"
                >
                  ⇥⇤
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyFormatting("align", "right")}
                  className="px-1.5 py-0.5 rounded hover:bg-surface-2 text-foreground text-xs cursor-pointer"
                  title="Align Right"
                >
                  ⇥
                </button>
              </div>

              {/* Colors & Highlights Palette */}
              <div className="flex items-center gap-1">
                {[
                  { name: "White", code: "white", bg: "bg-white border border-neutral-300" },
                  { name: "Emerald", code: "emerald", bg: "bg-emerald-500" },
                  { name: "Cyan", code: "cyan", bg: "bg-cyan-500" },
                  { name: "Amber", code: "amber", bg: "bg-amber-500" },
                  { name: "Rose", code: "rose", bg: "bg-rose-500" },
                  { name: "Purple", code: "purple", bg: "bg-purple-500" },
                ].map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => handleApplyFormatting("color", c.code)}
                    className={`w-5 h-5 rounded-full ${c.bg} hover:scale-125 transition-transform cursor-pointer`}
                    title={`Color: ${c.name}`}
                  />
                ))}

                <button
                  type="button"
                  onClick={() => handleApplyFormatting("gradient", "sunset")}
                  className="px-2 py-0.5 rounded bg-brand-500 text-white font-bold text-[10px] cursor-pointer"
                  title="Sunset Gradient"
                >
                  🌈
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyFormatting("bg", "amber")}
                  className="px-2 py-0.5 rounded bg-amber-500 text-white font-bold text-[10px] cursor-pointer"
                  title="Highlight Pill"
                >
                  ✨
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: INSERT ELEMENTS */}
          {activeRibbonTab === "elements" && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleInsertActiveSlideSnippet('\n:::chart(type="bar", title="Multi-Series Comparison")\nlabels: Q1, Q2, Q3, Q4\nseries: 2025 [25, 45, 70, 95]\nseries: 2026 [40, 75, 110, 160]\n:::\n')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background border border-[var(--border)] hover:bg-surface-2 text-foreground font-semibold text-xs cursor-pointer"
              >
                <span>📊</span> Bar Chart
              </button>

              <button
                type="button"
                onClick={() => handleInsertActiveSlideSnippet('\n:::chart(type="donut", title="Market Share Breakdown")\nSegment A: 45\nSegment B: 35\nSegment C: 20\n:::\n')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background border border-[var(--border)] hover:bg-surface-2 text-foreground font-semibold text-xs cursor-pointer"
              >
                <span>🍩</span> Donut Chart
              </button>

              <button
                type="button"
                onClick={() => handleInsertActiveSlideSnippet('\n:::chart(type="area", title="Trend Curve")\nlabels: Jan, Feb, Mar, Apr, May, Jun\nseries: Volume [10, 25, 55, 95, 150, 240]\n:::\n')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background border border-[var(--border)] hover:bg-surface-2 text-foreground font-semibold text-xs cursor-pointer"
              >
                <span>📈</span> Area Curve
              </button>

              <div className="h-6 w-px bg-[var(--border)]" />

              <button
                type="button"
                onClick={() => handleInsertActiveSlideSnippet('\n:::bento\n:::box(span=2, bg="gradient")\n### 🚀 Main Feature Pillar\nCore value proposition and summary.\n:::\n:::box(span=1, bg="glass")\n### ⚡ Metric\n:::metric(value="99.99%", label="Uptime")\n:::\n:::\n')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background border border-[var(--border)] hover:bg-surface-2 text-foreground font-semibold text-xs cursor-pointer"
              >
                <span>🍱</span> Bento Box
              </button>

              <button
                type="button"
                onClick={() => handleInsertActiveSlideSnippet('\n:::timeline\n:::milestone(date="Phase 1", title="Launch", status="completed")\nCore infrastructure.\n:::\n:::milestone(date="Phase 2", title="Scale", status="active")\nMarket adoption.\n:::\n:::milestone(date="Phase 3", title="Dominance", status="upcoming")\nGlobal expansion.\n:::\n:::\n')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background border border-[var(--border)] hover:bg-surface-2 text-foreground font-semibold text-xs cursor-pointer"
              >
                <span>⏱️</span> Roadmap Timeline
              </button>

              <button
                type="button"
                onClick={() => handleInsertActiveSlideSnippet('\n:::callout(type="tip")\n💡 **Key Takeaway**: Strategic summary of the core insight on this slide.\n:::\n')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background border border-[var(--border)] hover:bg-surface-2 text-foreground font-semibold text-xs cursor-pointer"
              >
                <span>💡</span> Callout Box
              </button>

              <button
                type="button"
                onClick={() => handleInsertActiveSlideSnippet('\n:::badge(text="Live Release", color="emerald", pulse=true)\n')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background border border-[var(--border)] hover:bg-surface-2 text-foreground font-semibold text-xs cursor-pointer"
              >
                <span>🏷️</span> Pill Badge
              </button>

              <button
                type="button"
                onClick={() => handleInsertActiveSlideSnippet('\n| Feature | Option A | Option B |\n|---|---|---|\n| Scalability | 100k req/s | 1M req/s |\n| Latency | 15ms | 2ms |\n| Zero Downtime | ❌ | ✅ |\n')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background border border-[var(--border)] hover:bg-surface-2 text-foreground font-semibold text-xs cursor-pointer"
              >
                <span>📄</span> Table
              </button>
            </div>
          )}

          {/* TAB 3: MEDIA & IMAGES */}
          {activeRibbonTab === "media" && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setShowImageModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                <span>🖼️</span> Insert Image from Stock / URL
              </button>

              <div className="h-6 w-px bg-[var(--border)]" />

              <span className="text-[11px] font-semibold text-[var(--text-secondary)]">Stock Presets:</span>
              {UNSPLASH_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleInsertActiveSlideSnippet(`\n![${p.label}](${p.url})\n`)}
                  className="px-2.5 py-1 rounded-lg bg-background border border-[var(--border)] hover:bg-surface-2 text-foreground text-xs font-medium cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}

          {/* TAB 4: DESIGN & THEMES */}
          {activeRibbonTab === "design" && (
            <div className="flex items-center gap-3 flex-wrap">
              {/* Theme Selector */}
              <div className="flex items-center gap-1.5 bg-background rounded-lg border border-[var(--border)] px-2 py-1">
                <span className="text-xs">🎨</span>
                <span className="text-[11px] font-semibold text-[var(--text-secondary)]">Theme:</span>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="bg-transparent text-xs font-bold text-foreground outline-none cursor-pointer capitalize"
                >
                  {THEME_OPTIONS.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="h-6 w-px bg-[var(--border)]" />

              {/* Slide Background Presets */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-[var(--text-secondary)]">Slide Background:</span>
                {[
                  { name: "Dark", val: "gradient-dark", bg: "bg-[#1e1b4b]" },
                  { name: "Indigo", val: "gradient-indigo", bg: "bg-indigo-950" },
                  { name: "Sunset", val: "gradient-sunset", bg: "bg-rose-950" },
                  { name: "Aurora", val: "gradient-aurora", bg: "bg-emerald-950" },
                  { name: "Ocean", val: "gradient-ocean", bg: "bg-sky-950" },
                  { name: "Grid", val: "pattern-grid", bg: "bg-neutral-800" },
                  { name: "Default", val: "", bg: "bg-neutral-700" },
                ].map((b) => (
                  <button
                    key={b.name}
                    type="button"
                    onClick={() => handleApplySlideBackground(b.val)}
                    className={`w-6 h-6 rounded-lg ${b.bg} border border-white/20 hover:scale-110 transition-transform cursor-pointer shadow-xs`}
                    title={`Apply ${b.name} background`}
                  />
                ))}

                {/* Custom Color Input */}
                <div className="flex items-center gap-1 pl-1">
                  <input
                    type="color"
                    value={customSlideBg}
                    onChange={(e) => {
                      setCustomSlideBg(e.target.value);
                      handleApplySlideBackground(e.target.value);
                    }}
                    className="w-6 h-6 rounded-lg cursor-pointer border border-[var(--border)] bg-transparent p-0"
                    title="Pick custom solid slide color"
                  />
                </div>
              </div>

              <div className="h-6 w-px bg-[var(--border)]" />

              {/* Typography */}
              <div className="flex items-center gap-1.5 bg-background rounded-lg border border-[var(--border)] px-2 py-1">
                <span className="text-xs">🔤</span>
                <select
                  value={headFont}
                  onChange={(e) => setHeadFont(e.target.value)}
                  className="bg-transparent text-xs text-foreground outline-none cursor-pointer"
                  title="Head Font"
                >
                  <option value="">Head Font: Default</option>
                  {FONT_OPTIONS.map((f) => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-background rounded-lg border border-[var(--border)] px-2 py-1">
                <select
                  value={bodyFont}
                  onChange={(e) => setBodyFont(e.target.value)}
                  className="bg-transparent text-xs text-foreground outline-none cursor-pointer"
                  title="Body Font"
                >
                  <option value="">Body Font: Default</option>
                  {FONT_OPTIONS.map((f) => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-background rounded-lg border border-[var(--border)] px-2 py-1">
                <span className="text-xs">🖥️</span>
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="bg-transparent text-xs text-foreground outline-none cursor-pointer uppercase"
                  title="Typography Scale"
                >
                  {SIZE_OPTIONS.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* TAB 5: SLIDE SHOW & AUTO ADVANCE */}
          {activeRibbonTab === "slideshow" && (
            <div className="flex items-center gap-3 flex-wrap">
              {/* Play / Pause Toggle */}
              <button
                type="button"
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  isAutoPlaying
                    ? "bg-amber-600 hover:bg-amber-500 text-white shadow-xs animate-pulse"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
                }`}
              >
                <span>{isAutoPlaying ? "⏸️ Pause Auto Slideshow" : "▶️ Start Auto Slideshow"}</span>
              </button>

              {/* Interval Selector */}
              <div className="flex items-center gap-1.5 bg-background rounded-lg border border-[var(--border)] px-2 py-1">
                <span className="text-xs">⏱️</span>
                <span className="text-[11px] font-semibold text-[var(--text-secondary)]">Advance every:</span>
                <select
                  value={autoInterval}
                  onChange={(e) => setAutoInterval(Number(e.target.value))}
                  className="bg-transparent text-xs font-bold text-foreground outline-none cursor-pointer"
                >
                  <option value={3}>3 Seconds (Fast)</option>
                  <option value={5}>5 Seconds (Standard)</option>
                  <option value={8}>8 Seconds</option>
                  <option value={10}>10 Seconds (Detailed)</option>
                  <option value={15}>15 Seconds</option>
                  <option value={30}>30 Seconds (Keynote)</option>
                </select>
              </div>

              {/* Loop Toggle */}
              <label className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={autoLoop}
                  onChange={(e) => setAutoLoop(e.target.checked)}
                  className="rounded border-[var(--border)] text-brand-600 focus:ring-0 cursor-pointer"
                />
                <span>Loop Continuously</span>
              </label>

              <div className="h-6 w-px bg-[var(--border)]" />

              {/* Grid Overview Trigger */}
              <button
                type="button"
                onClick={() => setShowGridModal(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-background border border-[var(--border)] hover:bg-surface-2 text-foreground font-semibold text-xs cursor-pointer"
                title="Slide Grid Overview (G)"
              >
                <span>🔲</span> Slide Overview (G)
              </button>
            </div>
          )}

          {/* TAB 6: TRANSITIONS */}
          {activeRibbonTab === "transitions" && (
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 bg-background rounded-lg border border-[var(--border)] px-2.5 py-1">
                <span className="text-xs">🔀</span>
                <span className="text-[11px] font-semibold text-[var(--text-secondary)]">Slide Transition:</span>
                <select
                  value={transition}
                  onChange={(e) => setTransition(e.target.value)}
                  className="bg-transparent text-xs font-bold text-foreground outline-none cursor-pointer capitalize"
                >
                  {TRANSITION_OPTIONS.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-background rounded-lg border border-[var(--border)] px-2.5 py-1">
                <span className="text-xs">📐</span>
                <span className="text-[11px] font-semibold text-[var(--text-secondary)]">Template:</span>
                <select
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  className="bg-transparent text-xs font-bold text-foreground outline-none cursor-pointer capitalize"
                >
                  {TEMPLATE_OPTIONS.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => handleInsertActiveSlideSnippet(" {click}")}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold text-xs cursor-pointer"
              >
                <span>✨</span> Add Stepwise Reveal ({'{click}'})
              </button>
            </div>
          )}

          {/* TAB 7: AI COPILOT */}
          {activeRibbonTab === "ai" && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setShowAiModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                <span>✨</span> Generate Full Deck with AI
              </button>

              <div className="h-6 w-px bg-[var(--border)]" />

              <button
                type="button"
                onClick={() => handleTransformSlide("punchy")}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-background border border-[var(--border)] hover:bg-surface-2 text-foreground font-semibold text-xs cursor-pointer"
              >
                <span>⚡</span> Make Slide Punchier
              </button>

              <button
                type="button"
                onClick={() => handleTransformSlide("summarize")}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-background border border-[var(--border)] hover:bg-surface-2 text-foreground font-semibold text-xs cursor-pointer"
              >
                <span>🎯</span> Summarize
              </button>

              <button
                type="button"
                onClick={() => handleTransformSlide("generate-notes")}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-background border border-[var(--border)] hover:bg-surface-2 text-amber-600 dark:text-amber-400 font-semibold text-xs cursor-pointer"
              >
                <span>🎙️</span> Write Talking Points
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Main PowerPoint Workspace Layout ──────────────────────── */}
      <div className="flex flex-1 min-h-0 relative">
        {/* 1. LEFT SIDEBAR: Slide Filmstrip Thumbnails (In Studio or Split View) */}
        {(viewMode === "studio" || viewMode === "split") && (
          <aside className="w-52 border-r border-[var(--border)] bg-surface/50 flex flex-col shrink-0">
            <div className="p-2 border-b border-[var(--border)] flex items-center justify-between">
              <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                Slides ({slideSections.length})
              </span>
              <button
                type="button"
                onClick={() => handleAddSlide("blank")}
                className="p-1 rounded-md bg-brand-50 hover:bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 font-bold text-xs cursor-pointer"
                title="Add New Blank Slide"
              >
                ➕ Add
              </button>
            </div>

            {/* Thumbnail Scroll List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {slideSections.map((sec, idx) => {
                const isSelected = idx === currentSlideIndex;
                const titleMatch = sec.match(/^#+\s+(.+)$/m);
                const slideTitle = titleMatch ? titleMatch[1].replace(/\{.*?\}/g, "").trim() : `Slide ${idx + 1}`;

                return (
                  <div
                    key={idx}
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`group relative rounded-xl border p-2 cursor-pointer transition-all ${
                      isSelected
                        ? "border-brand-500 bg-brand-50/20 dark:bg-brand-900/20 shadow-md ring-2 ring-brand-500/20"
                        : "border-[var(--border)] bg-background hover:border-brand-300 hover:bg-surface-2"
                    }`}
                  >
                    {/* Slide Number Badge */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isSelected ? "bg-brand-600 text-white" : "bg-surface-2 text-[var(--text-secondary)]"}`}>
                        {idx + 1}
                      </span>
                      <span className="text-[10px] text-[var(--text-tertiary)] truncate max-w-[120px] font-medium">
                        {slideTitle}
                      </span>
                    </div>

                    {/* Miniature Slide Preview Card */}
                    <div className="aspect-[16/9] w-full rounded-lg bg-neutral-900 overflow-hidden border border-black/20 relative flex items-center justify-center p-2 shadow-inner">
                      <div className="text-[8px] text-white/90 text-center font-bold line-clamp-3 leading-tight">
                        {slideTitle}
                      </div>
                    </div>

                    {/* Hover Actions Pill */}
                    <div className="absolute top-1 right-1 hidden group-hover:flex items-center gap-1 bg-surface border border-[var(--border)] rounded-md p-0.5 shadow-md z-10">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveSlide(idx, idx - 1);
                        }}
                        disabled={idx === 0}
                        className="p-1 hover:bg-surface-2 rounded text-[9px] disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveSlide(idx, idx + 1);
                        }}
                        disabled={idx === slideSections.length - 1}
                        className="p-1 hover:bg-surface-2 rounded text-[9px] disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        ▼
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateSlide(idx);
                        }}
                        className="p-1 hover:bg-surface-2 rounded text-[9px] cursor-pointer"
                        title="Duplicate Slide"
                      >
                        📋
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSlide(idx);
                        }}
                        disabled={slideSections.length <= 1}
                        className="p-1 hover:bg-rose-500 hover:text-white rounded text-[9px] disabled:opacity-30 cursor-pointer text-rose-500"
                        title="Delete Slide"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        )}

        {/* 2. CENTER STAGE CANVAS: Main 16:9 Presentation Studio Display */}
        {viewMode !== "markdown" && (
          <main className="flex-1 min-w-0 bg-neutral-950 flex flex-col relative overflow-hidden">
            {/* Auto Slideshow Progress Bar */}
            {isAutoPlaying && (
              <div className="w-full h-1 bg-neutral-800 relative overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-500 to-indigo-500 transition-all duration-100 ease-linear"
                  style={{ width: `${autoProgress}%` }}
                />
              </div>
            )}

            {/* Top Canvas Bar with In-Slide Contextual Controls */}
            <div className="h-9 bg-surface/80 backdrop-blur border-b border-[var(--border)] px-4 flex items-center justify-between text-xs text-[var(--text-secondary)] font-medium shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">Slide {currentSlideIndex + 1} of {slideSections.length}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-2 text-[var(--text-tertiary)] font-mono">16:9 Widescreen</span>
                {isAutoPlaying && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold animate-pulse flex items-center gap-1">
                    <span>▶️</span> Auto ({autoInterval}s)
                  </span>
                )}
              </div>

              {/* Floating Contextual Quick Operations Toolbar for Selected Text or Element */}
              {hasActiveSelection ? (
                <div className="flex items-center gap-1 bg-brand-50/95 dark:bg-brand-950/90 border border-brand-500/40 px-2.5 py-0.5 rounded-lg text-xs animate-fade-in shadow-lg">
                  <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider truncate max-w-[90px]">
                    {selectedText ? "Text Selection" : selectedElement?.elType}
                  </span>
                  <div className="h-3 w-px bg-brand-500/30 mx-1" />

                  {/* Numeric Font Size Selector (PowerPoint Style) */}
                  <div className="flex items-center bg-background rounded border border-[var(--border)] p-0.5 gap-0.5">
                    <select
                      value={currentFontSize}
                      onChange={(e) => handleApplyFormatting("size", Number(e.target.value))}
                      className="bg-transparent text-[11px] font-bold text-foreground outline-none cursor-pointer"
                      title="Font Size"
                    >
                      {FONT_SIZES.map((sz) => (
                        <option key={sz} value={sz}>{sz}px</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleApplyFormatting("size", Math.min(96, currentFontSize + 4))}
                      className="px-1 py-0.5 rounded text-[10px] font-bold hover:bg-surface-2 cursor-pointer"
                      title="Increase Size"
                    >
                      A+
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyFormatting("size", Math.max(12, currentFontSize - 4))}
                      className="px-1 py-0.5 rounded text-[10px] font-bold hover:bg-surface-2 cursor-pointer"
                      title="Decrease Size"
                    >
                      A-
                    </button>
                  </div>

                  {/* Bold & Italic */}
                  <div className="flex items-center bg-background rounded border border-[var(--border)] p-0.5 gap-0.5">
                    <button
                      type="button"
                      onClick={() => handleApplyFormatting("bold")}
                      className="px-1.5 py-0.5 rounded font-bold text-[10px] hover:bg-surface-2 cursor-pointer"
                      title="Bold"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyFormatting("italic")}
                      className="px-1.5 py-0.5 rounded italic text-[10px] hover:bg-surface-2 cursor-pointer"
                      title="Italic"
                    >
                      I
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyFormatting("underline")}
                      className="px-1.5 py-0.5 rounded underline text-[10px] hover:bg-surface-2 cursor-pointer"
                      title="Underline"
                    >
                      U
                    </button>
                  </div>

                  {/* Text Color Swatches */}
                  <div className="flex items-center gap-1 pl-1">
                    {[
                      { name: "White", code: "white", bg: "bg-white border border-neutral-300" },
                      { name: "Emerald", code: "emerald", bg: "bg-emerald-500" },
                      { name: "Cyan", code: "cyan", bg: "bg-cyan-500" },
                      { name: "Amber", code: "amber", bg: "bg-amber-500" },
                      { name: "Rose", code: "rose", bg: "bg-rose-500" },
                    ].map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => handleApplyFormatting("color", c.code)}
                        className={`w-3.5 h-3.5 rounded-full ${c.bg} hover:scale-125 transition-transform cursor-pointer`}
                        title={`Color: ${c.name}`}
                      />
                    ))}
                  </div>

                  {/* Gradient & Highlight */}
                  <button
                    type="button"
                    onClick={() => handleApplyFormatting("gradient", "sunset")}
                    className="px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-600 dark:text-brand-300 text-[10px] font-semibold hover:bg-brand-500/30 cursor-pointer"
                    title="Apply Gradient"
                  >
                    🌈 Gradient
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyFormatting("bg", "amber")}
                    className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-300 text-[10px] font-semibold hover:bg-amber-500/30 cursor-pointer"
                    title="Highlight Pill"
                  >
                    ✨ Highlight
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyFormatting("reveal")}
                    className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-[10px] font-semibold hover:bg-indigo-500/30 cursor-pointer"
                    title="Add {click} reveal"
                  >
                    👆 Reveal
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyFormatting("delete")}
                    className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-semibold hover:bg-rose-500/30 cursor-pointer"
                    title="Delete Selection"
                  >
                    🗑️ Remove
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-tertiary)]">
                  <span>💡 Highlight any text or click any element to format its font size, color & style</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFullscreen(true)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-brand-50 hover:bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 font-semibold text-[10px] cursor-pointer"
                  title="Fullscreen (F)"
                >
                  ⤢ Fullscreen (F)
                </button>
              </div>
            </div>

            {/* 16:9 Canvas Stage Wrapper */}
            <div className="flex-1 flex items-center justify-center p-4 lg:p-8 overflow-hidden relative">
              <div className="w-full max-w-5xl aspect-[16/9] bg-black rounded-2xl shadow-2xl overflow-hidden border border-white/10 relative">
                <iframe
                  ref={iframeRef}
                  srcDoc={shellHtml}
                  className="w-full h-full border-0"
                  title="Presentation Canvas"
                  sandbox="allow-scripts allow-same-origin"
                  onLoad={() => dispatchRender(iframeRef.current)}
                />
              </div>
            </div>

            {/* Bottom Floating Navigation Pill */}
            <div className="h-10 bg-surface/90 backdrop-blur border-t border-[var(--border)] px-4 flex items-center justify-between text-xs shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentSlideIndex <= 0}
                  onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-surface-2 hover:bg-surface border border-[var(--border)] text-foreground font-semibold text-xs transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ← Prev
                </button>
                <button
                  type="button"
                  disabled={currentSlideIndex >= slideSections.length - 1}
                  onClick={() => setCurrentSlideIndex((prev) => Math.min(slideSections.length - 1, prev + 1))}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-surface-2 hover:bg-surface border border-[var(--border)] text-foreground font-semibold text-xs transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>

              <div className="flex items-center gap-1">
                {slideSections.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentSlideIndex(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                      i === currentSlideIndex
                        ? "bg-brand-600 w-5"
                        : "bg-neutral-400 dark:bg-neutral-700 hover:bg-neutral-500"
                    }`}
                    title={`Slide ${i + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold cursor-pointer ${
                    isAutoPlaying
                      ? "bg-amber-500/20 border-amber-500/30 text-amber-400"
                      : "bg-surface-2 border-[var(--border)] text-foreground hover:bg-surface"
                  }`}
                  title="Toggle Auto Advance (A)"
                >
                  <span>{isAutoPlaying ? "⏸️ Pause Auto" : "▶️ Auto Play"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTransformSlide("generate-notes")}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-semibold text-xs cursor-pointer"
                  title="Generate AI Speaker Script"
                >
                  <span>🎙️</span>
                  <span>AI Notes</span>
                </button>
              </div>
            </div>
          </main>
        )}

        {/* 3. RIGHT PANEL: Visual Slide & Element Property Inspector */}
        {viewMode === "studio" && isInspectorOpen && (
          <aside className="w-80 border-l border-[var(--border)] bg-surface flex flex-col shrink-0">
            <div className="p-3 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">📋</span>
                <h4 className="font-bold text-xs text-foreground">
                  {hasActiveSelection ? "Selection Formatting" : `Slide ${currentSlideIndex + 1} Properties`}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsInspectorOpen(false)}
                className="text-[var(--text-tertiary)] hover:text-foreground text-xs p-1 cursor-pointer"
                title="Collapse Inspector"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {/* SECTION A: SELECTED TEXT OR ELEMENT PROPERTIES (Real-time formatting) */}
              {hasActiveSelection ? (
                <div className="p-3 rounded-xl bg-brand-50/50 dark:bg-brand-950/40 border border-brand-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                      🎯 {selectedText ? "Selected Text" : selectedElement?.elType}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedElement(null);
                        setSelectedText(null);
                      }}
                      className="text-[10px] text-[var(--text-tertiary)] hover:text-foreground cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>

                  {/* Text Content Input */}
                  <div>
                    <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block mb-1">
                      Text Value
                    </label>
                    <input
                      type="text"
                      value={activeSelectedSnippet}
                      onChange={(e) => handleApplyFormatting("replace-text", e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-[var(--border)] text-xs text-foreground outline-none focus:border-brand-500 font-medium"
                    />
                  </div>

                  {/* Numeric Font Size (PowerPoint Slider & Dropdown) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                        Font Size: {currentFontSize}px
                      </label>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleApplyFormatting("size", Math.max(12, currentFontSize - 4))}
                          className="px-1.5 py-0.5 rounded bg-background border border-[var(--border)] text-[10px] font-bold cursor-pointer hover:bg-surface-2"
                        >
                          -4
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyFormatting("size", Math.min(96, currentFontSize + 4))}
                          className="px-1.5 py-0.5 rounded bg-background border border-[var(--border)] text-[10px] font-bold cursor-pointer hover:bg-surface-2"
                        >
                          +4
                        </button>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={12}
                      max={96}
                      step={2}
                      value={currentFontSize}
                      onChange={(e) => handleApplyFormatting("size", Number(e.target.value))}
                      className="w-full accent-brand-600 cursor-pointer"
                    />
                    <div className="grid grid-cols-5 gap-1 pt-1">
                      {[16, 24, 32, 48, 64].map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => handleApplyFormatting("size", sz)}
                          className={`py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                            currentFontSize === sz
                              ? "bg-brand-600 text-white border-brand-600"
                              : "bg-background border-[var(--border)] text-foreground hover:bg-surface-2"
                          }`}
                        >
                          {sz}px
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Styles: Bold, Italic, Underline */}
                  <div>
                    <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block mb-1">
                      Font Styling
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        type="button"
                        onClick={() => handleApplyFormatting("bold")}
                        className="py-1 rounded bg-background border border-[var(--border)] hover:bg-surface-2 text-xs font-bold text-foreground cursor-pointer"
                      >
                        Bold
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyFormatting("italic")}
                        className="py-1 rounded bg-background border border-[var(--border)] hover:bg-surface-2 text-xs italic text-foreground cursor-pointer"
                      >
                        Italic
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyFormatting("underline")}
                        className="py-1 rounded bg-background border border-[var(--border)] hover:bg-surface-2 text-xs underline text-foreground cursor-pointer"
                      >
                        Underline
                      </button>
                    </div>
                  </div>

                  {/* Text Colors */}
                  <div>
                    <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block mb-1">
                      Text Color & Highlight
                    </label>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[
                        { name: "White", code: "white", bg: "bg-white" },
                        { name: "Emerald", code: "emerald", bg: "bg-emerald-500" },
                        { name: "Cyan", code: "cyan", bg: "bg-cyan-500" },
                        { name: "Amber", code: "amber", bg: "bg-amber-500" },
                        { name: "Rose", code: "rose", bg: "bg-rose-500" },
                        { name: "Purple", code: "purple", bg: "bg-purple-500" },
                        { name: "Gold", code: "gold", bg: "bg-amber-400" },
                      ].map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => handleApplyFormatting("color", c.code)}
                          className={`w-6 h-6 rounded-lg ${c.bg} border border-black/20 hover:scale-110 transition-transform cursor-pointer shadow-xs`}
                          title={`Color: ${c.name}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Gradient & Styles */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleApplyFormatting("gradient", "sunset")}
                      className="py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold text-[10px] cursor-pointer"
                    >
                      🌈 Sunset Gradient
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyFormatting("gradient", "aurora")}
                      className="py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold text-[10px] cursor-pointer"
                    >
                      🌌 Aurora Gradient
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyFormatting("bg", "amber")}
                      className="py-1.5 rounded-lg bg-amber-500 text-white font-bold text-[10px] cursor-pointer"
                    >
                      ✨ Amber Pill
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyFormatting("bg", "emerald")}
                      className="py-1.5 rounded-lg bg-emerald-500 text-white font-bold text-[10px] cursor-pointer"
                    >
                      🍃 Emerald Pill
                    </button>
                  </div>

                  {/* Alignment */}
                  <div>
                    <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block mb-1">
                      Text Alignment
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        type="button"
                        onClick={() => handleApplyFormatting("align", "left")}
                        className="py-1 rounded bg-background border border-[var(--border)] hover:bg-surface-2 text-xs font-semibold text-foreground cursor-pointer"
                      >
                        Left
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyFormatting("align", "center")}
                        className="py-1 rounded bg-background border border-[var(--border)] hover:bg-surface-2 text-xs font-semibold text-foreground cursor-pointer"
                      >
                        Center
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyFormatting("align", "right")}
                        className="py-1 rounded bg-background border border-[var(--border)] hover:bg-surface-2 text-xs font-semibold text-foreground cursor-pointer"
                      >
                        Right
                      </button>
                    </div>
                  </div>

                  {/* Delete & Clear */}
                  <div className="flex items-center gap-1 pt-1">
                    <button
                      type="button"
                      onClick={() => handleApplyFormatting("clear")}
                      className="flex-1 py-1.5 rounded-lg bg-surface-2 hover:bg-surface text-foreground font-semibold text-xs border border-[var(--border)] cursor-pointer"
                    >
                      Clear Styles
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyFormatting("delete")}
                      className="flex-1 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-600 dark:text-rose-400 font-bold text-xs cursor-pointer transition-colors"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Quick Layout Presets */}
              <div>
                <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block mb-1.5">
                  Change Slide Layout
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {Object.entries(SLIDE_TEMPLATES).map(([k, t]) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => updateActiveSlideMarkdown(t.snippet)}
                      className="p-1.5 rounded-lg border border-[var(--border)] bg-background hover:bg-surface-2 text-left flex items-center gap-1.5 cursor-pointer text-xs"
                    >
                      <span>{t.icon}</span>
                      <span className="font-medium text-[10px] truncate text-foreground">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Slide Background Picker */}
              <div className="border-t border-[var(--border)] pt-3">
                <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block mb-1.5">
                  Slide Background
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { name: "Dark", val: "gradient-dark", bg: "bg-[#1e1b4b]" },
                    { name: "Indigo", val: "gradient-indigo", bg: "bg-indigo-950" },
                    { name: "Sunset", val: "gradient-sunset", bg: "bg-rose-950" },
                    { name: "Aurora", val: "gradient-aurora", bg: "bg-emerald-950" },
                    { name: "Ocean", val: "gradient-ocean", bg: "bg-sky-950" },
                    { name: "Grid", val: "pattern-grid", bg: "bg-neutral-800" },
                    { name: "Default", val: "", bg: "bg-neutral-700" },
                  ].map((b) => (
                    <button
                      key={b.name}
                      type="button"
                      onClick={() => handleApplySlideBackground(b.val)}
                      className={`w-7 h-7 rounded-lg ${b.bg} border border-white/20 hover:scale-110 transition-transform cursor-pointer shadow-xs`}
                      title={`Apply ${b.name}`}
                    />
                  ))}
                  <input
                    type="color"
                    value={customSlideBg}
                    onChange={(e) => {
                      setCustomSlideBg(e.target.value);
                      handleApplySlideBackground(e.target.value);
                    }}
                    className="w-7 h-7 rounded-lg cursor-pointer border border-[var(--border)] bg-transparent p-0"
                    title="Custom Solid Background"
                  />
                </div>
              </div>

              {/* Slide Content Direct Markdown / Form Editor */}
              <div className="border-t border-[var(--border)] pt-3">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                    Slide Content
                  </label>
                  <span className="text-[9px] text-brand-500 font-semibold">Live Synced</span>
                </div>
                <textarea
                  value={activeSlideMarkdown}
                  onChange={(e) => updateActiveSlideMarkdown(e.target.value)}
                  rows={8}
                  className="w-full p-2.5 rounded-xl bg-background border border-[var(--border)] text-xs text-foreground font-mono leading-relaxed outline-none focus:border-brand-500 transition-colors resize-y"
                  placeholder="Write slide markdown or use the toolbar..."
                />
              </div>

              {/* Speaker Notes Script */}
              <div className="border-t border-[var(--border)] pt-3">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1">
                    <span>🎙️</span> Speaker Script
                  </label>
                  <button
                    type="button"
                    onClick={() => handleTransformSlide("generate-notes")}
                    className="text-[9px] text-amber-600 dark:text-amber-400 font-semibold hover:underline cursor-pointer"
                  >
                    Generate AI Script
                  </button>
                </div>
                <textarea
                  value={currentNotes}
                  onChange={(e) => {
                    const notes = e.target.value;
                    let current = activeSlideMarkdown;
                    current = current.replace(/<!--\s*notes?:\s*[\s\S]*?\s*-->/gi, "");
                    if (notes.trim()) {
                      current = `${current.trim()}\n\n<!-- note:\n${notes.trim()}\n-->`;
                    }
                    updateActiveSlideMarkdown(current);
                  }}
                  rows={3}
                  className="w-full p-2.5 rounded-xl bg-background border border-[var(--border)] text-xs text-foreground leading-relaxed outline-none focus:border-amber-500 transition-colors resize-y"
                  placeholder="Private talking points and presenter cues..."
                />
              </div>
            </div>
          </aside>
        )}

        {/* 4. CODE EDITOR: Shown when in "markdown" or "split" mode */}
        {(viewMode === "markdown" || viewMode === "split") && (
          <div className={`${viewMode === "markdown" ? "flex-1" : "w-1/2"} border-r border-[var(--border)] flex flex-col bg-background`}>
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
        )}
      </div>

      {/* ─── AI Generator Modal ─────────────────────────────────────── */}
      {showAiModal && (
        <AiGenerateModal
          isOpen={showAiModal}
          onClose={() => setShowAiModal(false)}
          onApply={handleApplyAiGenerated}
        />
      )}

      {/* ─── Insert Image / Media Modal ─────────────────────────────── */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-surface p-5 shadow-2xl text-foreground space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h3 className="font-bold text-base flex items-center gap-2">
                <span>🖼️</span> Insert Image into Slide
              </h3>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="text-[var(--text-tertiary)] hover:text-foreground text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1">Image URL / Web Link</label>
              <input
                type="url"
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-3 py-2 rounded-xl bg-background border border-[var(--border)] text-xs text-foreground outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold block mb-2">Or Choose from Curated Presentation Stock</label>
              <div className="grid grid-cols-3 gap-2">
                {UNSPLASH_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      handleInsertActiveSlideSnippet(`\n![${p.label}](${p.url})\n`);
                      setShowImageModal(false);
                    }}
                    className="p-2 rounded-xl border border-[var(--border)] bg-background hover:bg-surface-2 text-center text-xs font-medium cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="px-4 py-2 rounded-xl border border-[var(--border)] hover:bg-surface-2 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (customImageUrl.trim()) {
                    handleInsertActiveSlideSnippet(`\n![Image](${customImageUrl.trim()})\n`);
                    setCustomImageUrl("");
                    setShowImageModal(false);
                  }
                }}
                disabled={!customImageUrl.trim()}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-40"
              >
                Insert Image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Slide Grid Overview Modal (G) ─────────────────────────── */}
      {showGridModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col p-6 animate-fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 text-white">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold">🔲 All Slides Grid Overview</span>
              <span className="text-xs px-2 py-0.5 rounded bg-brand-500/30 text-brand-300">
                {slideSections.length} Slides
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowGridModal(false)}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold cursor-pointer"
            >
              ✕ Close (Esc)
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 overflow-y-auto flex-1">
            {slideSections.map((sec, idx) => {
              const titleMatch = sec.match(/^#+\s+(.+)$/m);
              const slideTitle = titleMatch ? titleMatch[1].replace(/\{.*?\}/g, "").trim() : `Slide ${idx + 1}`;
              const isSelected = idx === currentSlideIndex;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setCurrentSlideIndex(idx);
                    setShowGridModal(false);
                  }}
                  className={`aspect-[16/9] rounded-xl p-4 bg-neutral-900 border cursor-pointer transition-all hover:scale-105 flex flex-col justify-between ${
                    isSelected ? "border-brand-500 ring-2 ring-brand-500" : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-white/50">
                    <span className="font-bold">#{idx + 1}</span>
                    {isSelected && <span className="text-[10px] text-brand-400 font-bold">Active</span>}
                  </div>
                  <div className="text-sm font-bold text-white text-center line-clamp-3">
                    {slideTitle}
                  </div>
                  <div className="text-[10px] text-white/40 text-right">Click to Jump</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Keyboard Shortcuts Cheatsheet Modal (?) ──────────────── */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-surface p-5 shadow-2xl text-foreground">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h3 className="font-bold text-base flex items-center gap-2">
                <span>⌨️</span> Keyboard Shortcuts
              </h3>
              <button
                type="button"
                onClick={() => setShowShortcutsModal(false)}
                className="text-[var(--text-tertiary)] hover:text-foreground text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 text-xs">
              {[
                { key: "Space / → / ↓", desc: "Next Slide / Step" },
                { key: "← / ↑", desc: "Previous Slide" },
                { key: "F", desc: "Toggle Fullscreen" },
                { key: "P", desc: "Presenter Pro Cockpit" },
                { key: "G", desc: "Slide Grid Overview" },
                { key: "A", desc: "Toggle Auto Slideshow" },
                { key: "B", desc: "Black Screen Pause" },
                { key: "W", desc: "White Screen Pause" },
                { key: "Home / End", desc: "First / Last Slide" },
                { key: "Esc", desc: "Exit Fullscreen / Modals" },
                { key: "Highlight Text", desc: "Show Mini Formatting Bar" },
                { key: "? / H", desc: "Shortcuts Help" },
              ].map((s) => (
                <div key={s.key} className="flex items-center justify-between p-2 rounded-lg bg-background border border-[var(--border)]">
                  <span className="font-mono font-bold text-brand-600 dark:text-brand-400 bg-surface-2 px-1.5 py-0.5 rounded text-[11px]">
                    {s.key}
                  </span>
                  <span className="text-[var(--text-secondary)]">{s.desc}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => setShowShortcutsModal(false)}
                className="w-full py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
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
                  {currentNotes || "No speaker notes written for this slide. Click 'Write Talking Points' to generate them."}
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
          <div className="absolute top-3 right-3 z-50 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur border transition-all cursor-pointer ${
                isAutoPlaying
                  ? "bg-amber-600 text-white border-amber-400"
                  : "bg-black/60 hover:bg-black text-white border-white/20"
              }`}
            >
              {isAutoPlaying ? "⏸️ Pause Auto" : "▶️ Auto Play (A)"}
            </button>

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
