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

// ─── Professional Clean SVG Icons (Enterprise Standard) ─────────────
function IconPlay({ className = "w-4 h-4" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21" /></svg>;
}
function IconPause({ className = "w-4 h-4" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>;
}
function IconPlus({ className = "w-4 h-4" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
}
function IconMaximize({ className = "w-4 h-4" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" /></svg>;
}
function IconGrid({ className = "w-4 h-4" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></svg>;
}
function IconMic({ className = "w-4 h-4" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>;
}
function IconDownload({ className = "w-4 h-4" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>;
}
function IconSparkles({ className = "w-4 h-4" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>;
}
function IconTrash({ className = "w-4 h-4" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>;
}
function IconImage({ className = "w-4 h-4" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>;
}
function IconLayers({ className = "w-4 h-4" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>;
}
function IconPalette({ className = "w-4 h-4" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor" /><circle cx="17.5" cy="10.5" r=".5" fill="currentColor" /><circle cx="8.5" cy="7.5" r=".5" fill="currentColor" /><circle cx="6.5" cy="12.5" r=".5" fill="currentColor" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" /></svg>;
}
function IconSliders({ className = "w-4 h-4" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" /></svg>;
}
function IconFileText({ className = "w-4 h-4" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>;
}
function IconChevronDown({ className = "w-4 h-4" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>;
}
function IconChart({ className = "w-4 h-4" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
}

const SWATCH_COLORS = [
  { name: "Navy Dark", color: "#0f172a" },
  { name: "White", color: "#ffffff" },
  { name: "Cobalt Blue", color: "#2563eb" },
  { name: "Emerald", color: "#10b981" },
  { name: "Amber", color: "#f59e0b" },
  { name: "Rose", color: "#f43f5e" },
];

// ─── Professional Enterprise Preset Decks (Clean White by default) ──
const PRESET_DECKS: Record<
  string,
  { name: string; subtitle: string; theme: string; markdown: string }
> = {
  corporate: {
    name: "Executive Strategy Pitch",
    subtitle: "Clean Corporate Light",
    theme: "corporate",
    markdown: `# Enterprise Cloud Platform
### Executive Strategy & Annual Operating Plan

:::badge(text="Q3 2026 Strategy", color="blue")

:::footer(left="Acme Corporation", center="Confidential", right="Slide 1 of 5")

---

## 🎯 Strategic Priorities & Market Drivers

:::grid(cols=2)
:::card(title="Key Market Challenges", icon="⚠️")
- Fragmented legacy presentation tooling
- Slow content iteration and high formatting overhead
- Inconsistent branding across enterprise teams
:::
:::card(title="Enterprise Solution", icon="🚀")
- **Markdown-first velocity** with locked design systems
- Sub-second vector PDF and PowerPoint export
- Real-time mobile remote and dual-screen presenter
:::
:::

:::footer(left="Acme Corporation", center="Executive Review", right="Slide 2 of 5")

---

## 📈 Multi-Year ARR Scale & Growth

:::chart(type="bar", title="Annual Recurring Revenue ($M)")
labels: 2023, 2024, 2025, 2026 (Est.)
series: Enterprise [12.4, 28.5, 54.2, 98.6]
series: Mid-Market [6.2, 14.8, 29.4, 48.0]
:::

:::footer(left="Acme Corporation", center="Financial Review", right="Slide 3 of 5")

<!-- note:
Highlight our 148% Net Retention Rate and expansion in Fortune 500 accounts.
-->

---

## 🏛️ Enterprise Architectural Pillars

:::grid(cols=3)
:::card(title="Deterministic Reliability", icon="🛡️")
- 99.99% availability SLA
- Automated multi-region failover
:::
:::card(title="Zero-Trust Security", icon="🔒")
- End-to-end encryption
- SOC2 Type II and ISO 27001 certified
:::
:::card(title="Hardware Speed", icon="⚡")
- Sub-10ms P99 render latency
- Zero stage latency or jank
:::
:::

:::footer(left="Acme Corporation", center="Architecture", right="Slide 4 of 5")

---

# Accelerate Enterprise Delivery

:::badge(text="Ready to Deploy", color="emerald")

:::callout(type="tip")
💡 **Get Started**: Empower your engineering and product teams with automated slide creation.
:::

executive-team@presentation.ai • San Francisco, CA

:::footer(left="Acme Corporation", center="Closing", right="Slide 5 of 5")
`,
  },
  minimal: {
    name: "Minimalist White Deck",
    subtitle: "Pure White & Crisp Typography",
    theme: "minimal",
    markdown: `# Next-Gen Presentation Architecture
Clean, precise, engineered slides with zero clutter.

---

## ⚡ Core Value Metrics

:::grid(cols=3)
:::metric(value="+340%", label="Creation Velocity", sub="vs legacy editors")
:::metric(value="0 ms", label="Merge Conflicts", sub="Automated CRDTs")
:::metric(value="100%", label="Offline Ready", sub="Zero cloud lock-in")
:::

---

## 📊 Market Share Breakdown

:::chart(type="donut", title="Platform Adoption")
Enterprise Engineering: 45
Product & Founders: 35
Design & Strategy: 20
:::

---

# Minimal. Fast. Deterministic.
`,
  },
  dark: {
    name: "Tech Keynote (Dark)",
    subtitle: "High-Contrast Midnight Theme",
    theme: "midnight",
    markdown: `# High-Scale Distributed Systems
:::badge(text="Architecture Deep Dive", color="blue")
Achieving sub-10ms P99 latency with zero runtime jank.

---

## 💻 Developer Quick Start

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
`,
  },
};

const SLIDE_TEMPLATES: Record<string, { label: string; snippet: string }> = {
  cover: {
    label: "Cover / Title Slide",
    snippet: `:::layout(cover)
# Presentation Title
### Executive Subtitle and Department
:::badge(text="Confidential", color="blue")
:::
<!-- note: Welcome the audience and introduce the agenda. -->`,
  },
  split: {
    label: "2-Column Split Layout",
    snippet: `## ⚖️ Strategic Comparison

:::layout(split)
:::col
### 👈 Opportunity A
- High speed execution
- Lower infrastructure costs
:::
:::col
### 👉 Opportunity B
- Dedicated enterprise SLA
- Advanced customization support
:::
:::
<!-- note: Contrast tradeoffs between options. -->`,
  },
  cards: {
    label: "3-Column Strategic Cards",
    snippet: `## 🎯 Strategic Pillars

:::grid(cols=3)
:::card(title="Performance", icon="⚡")
- Sub-10ms response time
- 99.99% reliability SLA
:::
:::card(title="Security", icon="🛡️")
- End-to-end encryption
- Zero-trust access controls
:::
:::card(title="Scalability", icon="📈")
- Multi-region replication
- Elastic compute scaling
:::
:::
<!-- note: Detail each pillar. -->`,
  },
  metric: {
    label: "Big Stat Metric",
    snippet: `## 📈 Explosive Growth Metric

:::metric(value="+340%", label="Annual Scale & Adoption", sub="5-Year Horizon")

Key growth drivers powered by developer adoption and enterprise expansion.
<!-- note: Highlight the key metrics. -->`,
  },
  chart: {
    label: "Multi-Series Chart",
    snippet: `## 📊 Multi-Year Revenue Comparison

:::chart(type="bar", title="Annual Recurring Revenue ($M)")
labels: 2023, 2024, 2025, 2026
series: Enterprise [15, 32, 60, 110]
series: Self-Serve [10, 22, 40, 75]
:::
<!-- note: Walk through year-by-year data. -->`,
  },
  image: {
    label: "Image Showcase",
    snippet: `## 🖼️ Architecture & Infrastructure

![Modern Architecture](https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80)

<!-- note: Detail the architecture image. -->`,
  },
  blank: {
    label: "Standard Slide",
    snippet: `## Section Heading

- First key takeaway and strategic insight
- Second key milestone and deliverables {click}
- Third operational objective {click}

<!-- note: Speaker notes go here. -->`,
  },
};

const UNSPLASH_PRESETS = [
  { label: "Dashboard Analytics", url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80" },
  { label: "Modern Office", url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80" },
  { label: "Architecture", url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80" },
  { label: "Abstract Tech", url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80" },
];

const FONT_SIZES = [14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 96];

const STORAGE_KEY = "presentation_ai_playground_deck";

export function PlaygroundShell() {
  const [markdown, setMarkdown] = useState<string>(PRESET_DECKS.corporate.markdown);

  // Safely restore localStorage on client mount without triggering synchronous setState in effect
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && saved.trim() && saved !== PRESET_DECKS.corporate.markdown) {
        queueMicrotask(() => {
          setMarkdown(saved);
        });
      }
    } catch {}
  }, []);

  // View Mode: "studio" (PowerPoint style), "split" (Side-by-side), "markdown" (Raw code)
  const [viewMode, setViewMode] = useState<"studio" | "split" | "markdown">("studio");
  const [activeRibbonTab, setActiveRibbonTab] = useState<"home" | "elements" | "design" | "media" | "slideshow" | "transitions" | "ai">("home");
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [isNotesDrawerOpen, setIsNotesDrawerOpen] = useState(false);

  // In-Slide Interactive Selection State
  const [selectedElement, setSelectedElement] = useState<{ elType: string; text: string; title: string; value: string; src?: string } | null>(null);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [currentFontSize, setCurrentFontSize] = useState<number>(32);

  // Deck Theme & Styling (Default to corporate light)
  const [theme, setTheme] = useState<string>("corporate");
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
  const [customSlideBg, setCustomSlideBg] = useState("#ffffff");

  // Slide Filmstrip Drag-and-Drop Reordering State
  const [draggedSlideIdx, setDraggedSlideIdx] = useState<number | null>(null);
  const [dragOverSlideIdx, setDragOverSlideIdx] = useState<number | null>(null);

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

  // Timer logic for Presenter Cockpit
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
          src: e.data.src || "",
        });
      } else if (e.data.type === "element-deselected") {
        setSelectedElement(null);
      } else if (e.data.type === "text-selected") {
        setSelectedText(e.data.text || null);
      } else if (e.data.type === "element-text-updated") {
        const { oldText, newText } = e.data;
        if (oldText && newText && oldText !== newText) {
          // Direct in-slide inline text edit handler
          setMarkdown((prev) => {
            const rawSlides = prev.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split(/\n[ \t]*---[ \t]*\n/);
            const activeIdx = Math.max(0, Math.min(rawSlides.length - 1, currentSlideIndex));
            let slideMd = rawSlides[activeIdx] || "";
            if (slideMd.includes(oldText)) {
              slideMd = slideMd.replace(oldText, newText);
            } else {
              const cleanOld = oldText.replace(/[#*_~`]/g, "").trim();
              if (cleanOld && slideMd.includes(cleanOld)) {
                slideMd = slideMd.replace(cleanOld, newText);
              }
            }
            rawSlides[activeIdx] = slideMd;
            const updatedAll = rawSlides.join("\n\n---\n\n");
            editorRef.current?.setValue(updatedAll);
            return updatedAll;
          });
        }
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
  }, [dispatchRender, parsedSlides.length, currentSlideIndex]);

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
    if (bgValue && bgValue !== "white") {
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
    // 1. Dispatch live styling directly to preview iframe for instantaneous visual feedback
    iframeRef.current?.contentWindow?.postMessage({ type: "apply-format", action, param }, "*");

    const target = selectedText || selectedElement?.text || selectedElement?.title || selectedElement?.value || "";
    if (!target && action !== "delete") return;

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
      } else if (target) {
        md = md.replace(target, "");
      }
      setSelectedElement(null);
      setSelectedText(null);
    } else if (target) {
      if (action === "replace-text" && typeof param === "string") {
        md = md.replace(target, param);
        setSelectedElement((prev) => (prev ? { ...prev, text: param } : null));
      } else if (action === "size" && param !== undefined) {
        const numSize = Number(param);
        setCurrentFontSize(numSize);
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
    <div className="flex flex-col h-screen bg-[#090d16] text-slate-100 overflow-hidden select-none font-sans relative antialiased">
      {/* Blank Screen Overlay (B/W shortcut pause) */}
      {blankScreenMode !== "none" && (
        <div
          onClick={() => setBlankScreenMode("none")}
          className={`fixed inset-0 z-50 flex items-center justify-center cursor-pointer ${
            blankScreenMode === "black" ? "bg-black text-slate-400" : "bg-white text-slate-700"
          }`}
        >
          <span className="text-xs font-mono font-medium tracking-wide">Screen paused (Press B/W or Esc to resume)</span>
        </div>
      )}

      {/* ─── Top Enterprise Navigation Bar ─────────────────────────── */}
      <header className="flex items-center justify-between h-13 px-4 border-b border-slate-800 bg-[#0f172a] shrink-0 z-20 gap-3">
        {/* Left: Brand & Presets */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8" />
                <path d="M12 17v4" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white tracking-tight leading-none">
                Presentation<span className="text-blue-400">.AI</span>
              </span>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5">
                Studio Pro
              </span>
            </div>
          </Link>

          <div className="h-5 w-px bg-slate-800" />

          {/* Sample Templates Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPresetsMenu(!showPresetsMenu)}
              className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-all cursor-pointer shadow-xs"
            >
              <IconLayers className="w-3.5 h-3.5 text-blue-400" />
              <span>Presentation Decks</span>
              <IconChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showPresetsMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowPresetsMenu(false)}
                />
                <div className="absolute top-full left-0 mt-2 w-80 rounded-xl border border-slate-700 bg-[#0f172a] p-2 shadow-2xl z-50 animate-fade-in space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 border-b border-slate-800 flex items-center justify-between">
                    <span>Presentation Deck Templates</span>
                    <span className="text-blue-400 font-mono">3 Presets</span>
                  </div>
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
                      className="w-full text-left p-2.5 rounded-lg hover:bg-slate-800 text-xs flex items-center justify-between text-slate-200 cursor-pointer transition-colors border border-transparent hover:border-slate-700"
                    >
                      <div>
                        <div className="font-bold text-white text-xs">{deck.name}</div>
                        <div className="text-[11px] text-slate-400">{deck.subtitle}</div>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                        {deck.theme}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Center: PowerPoint View Mode Switcher */}
        <div className="flex items-center bg-slate-900 rounded-lg border border-slate-800 p-0.5 shadow-inner">
          <button
            type="button"
            onClick={() => setViewMode("studio")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              viewMode === "studio"
                ? "bg-blue-600 text-white shadow-sm font-bold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <IconSliders className="w-3.5 h-3.5" />
            <span>Studio View</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("split")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              viewMode === "split"
                ? "bg-blue-600 text-white shadow-sm font-bold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <IconGrid className="w-3.5 h-3.5" />
            <span>Split View</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("markdown")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              viewMode === "markdown"
                ? "bg-blue-600 text-white shadow-sm font-bold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <IconFileText className="w-3.5 h-3.5" />
            <span>Code (MD)</span>
          </button>
        </div>

        {/* Right: Actions (AI, Presenter, Present, Export, Help) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowShortcutsModal(true)}
            className="w-8 h-8 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            title="Keyboard Shortcuts (?)"
          >
            ?
          </button>

          <button
            type="button"
            onClick={() => setShowAiModal(true)}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer active:scale-95 shrink-0"
          >
            <IconSparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI Presentation</span>
          </button>

          {/* Delivery & Export Grouped Pod */}
          <div className="flex items-center p-0.5 bg-slate-900 rounded-lg border border-slate-800 h-8 shrink-0">
            <button
              type="button"
              onClick={() => setShowPresenterModal(true)}
              className="inline-flex items-center gap-1 h-full px-2.5 rounded-md hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
              title="Dual-Screen Presenter Cockpit (P)"
            >
              <IconMic className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Presenter</span>
            </button>

            <div className="h-4 w-px bg-slate-800 mx-0.5" />

            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="inline-flex items-center gap-1.5 h-full px-2.5 rounded-md bg-blue-950/70 hover:bg-blue-900/80 text-blue-400 text-xs font-bold transition-colors cursor-pointer"
              title="Fullscreen Slide Show (F)"
            >
              <IconMaximize className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Present</span>
            </button>

            <div className="h-4 w-px bg-slate-800 mx-0.5" />

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="inline-flex items-center gap-1 h-full px-2.5 rounded-md hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
              >
                <IconDownload className="w-3.5 h-3.5 text-slate-300" />
                <span>Export</span>
                <IconChevronDown className="w-2.5 h-2.5 text-slate-400" />
              </button>

              {showExportMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowExportMenu(false)}
                  />
                  <div className="absolute top-full right-0 mt-1.5 w-56 rounded-xl border border-slate-700 bg-[#0f172a] p-1.5 shadow-2xl z-50 animate-fade-in space-y-1">
                    <button
                      type="button"
                      onClick={handleDownloadPptx}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-xs flex items-center justify-between text-slate-200 cursor-pointer"
                    >
                      <span>PowerPoint (.pptx)</span>
                      <span className="text-[10px] text-blue-400 font-mono font-bold">Native</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowExportMenu(false);
                        window.print();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-xs flex items-center justify-between text-slate-200 cursor-pointer"
                    >
                      <span>Vector PDF</span>
                      <span className="text-[10px] text-slate-400 font-mono">Print</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadHtml}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-xs flex items-center justify-between text-slate-200 cursor-pointer"
                    >
                      <span>Standalone HTML</span>
                      <span className="text-[10px] text-slate-400 font-mono">Web</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadMarkdown}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-xs flex items-center justify-between text-slate-200 cursor-pointer"
                    >
                      <span>Markdown Source</span>
                      <span className="text-[10px] text-slate-400 font-mono">.md</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ─── PowerPoint Ribbon Strip (Enterprise High Contrast) ─────── */}
      <div className="border-b border-slate-800 bg-[#0b1120] text-xs select-none">
        {/* Ribbon Tabs Row */}
        <div className="flex items-center px-4 gap-1 border-b border-slate-800/80 bg-slate-950/60 h-8">
          {[
            { id: "home", label: "Home", icon: IconSliders },
            { id: "elements", label: "Insert Elements", icon: IconPlus },
            { id: "media", label: "Images & Media", icon: IconImage },
            { id: "design", label: "Design & Themes", icon: IconPalette },
            { id: "slideshow", label: "Slide Show & Auto", icon: IconPlay },
            { id: "transitions", label: "Transitions", icon: IconLayers },
            { id: "ai", label: "AI Copilot", icon: IconSparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveRibbonTab(tab.id as typeof activeRibbonTab)}
                className={`inline-flex items-center gap-1.5 px-3 h-full border-b-2 font-semibold text-xs transition-all cursor-pointer ${
                  activeRibbonTab === tab.id
                    ? "border-blue-500 text-white bg-slate-900/90"
                    : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-blue-400" />
                <span>{tab.label}</span>
              </button>
            );
          })}

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsInspectorOpen(!isInspectorOpen)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border border-slate-700 transition-colors cursor-pointer ${
                isInspectorOpen ? "bg-blue-950/70 text-blue-300 border-blue-700" : "bg-slate-900 text-slate-300 hover:bg-slate-800"
              }`}
            >
              <IconSliders className="w-3 h-3" />
              <span>Inspector</span>
            </button>
          </div>
        </div>

        {/* Ribbon Action Controls Row */}
        <div className="flex flex-wrap items-center px-4 py-2 gap-2.5 min-h-12 bg-[#090d16] border-t border-slate-800/80">
          {/* TAB 1: HOME */}
          {activeRibbonTab === "home" && (
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* + New Slide Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAddSlideMenu(!showAddSlideMenu)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  <IconPlus className="w-3.5 h-3.5" />
                  <span>New Slide</span>
                  <IconChevronDown className="w-3 h-3" />
                </button>

                {showAddSlideMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowAddSlideMenu(false)}
                    />
                    <div className="absolute top-full left-0 mt-1.5 w-64 rounded-xl border border-slate-700 bg-[#0f172a] p-1.5 shadow-2xl z-50 animate-fade-in space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-0.5">
                        Slide Layout Templates
                      </div>
                      {Object.entries(SLIDE_TEMPLATES).map(([k, t]) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => {
                            handleAddSlide(k);
                            setShowAddSlideMenu(false);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-xs flex items-center gap-2 text-slate-200 cursor-pointer"
                        >
                          <span className="font-semibold">{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="h-6 w-px bg-slate-800" />

              {/* Numeric Font Size Selector (PowerPoint Style) */}
              <div className="flex items-center bg-[#0f172a] rounded-lg border border-slate-700 p-1 gap-1">
                <span className="text-[11px] font-semibold text-slate-400 pl-1">Size:</span>
                <select
                  value={currentFontSize}
                  onChange={(e) => handleApplyFormatting("size", Number(e.target.value))}
                  className="bg-[#1e293b] text-xs font-bold text-slate-100 px-2 py-0.5 rounded border border-slate-600 outline-none cursor-pointer focus:border-blue-500"
                  title="Font Size (px)"
                >
                  {FONT_SIZES.map((sz) => (
                    <option key={sz} value={sz} className="bg-slate-900 text-white">{sz}px</option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => handleApplyFormatting("size", Math.min(96, currentFontSize + 4))}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 font-bold text-white text-[11px] cursor-pointer"
                  title="Increase Font Size (A+)"
                >
                  A+
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyFormatting("size", Math.max(12, currentFontSize - 4))}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 font-bold text-white text-[11px] cursor-pointer"
                  title="Decrease Font Size (A-)"
                >
                  A-
                </button>
              </div>

              {/* Bold / Italic / Underline */}
              <div className="flex items-center bg-[#0f172a] rounded-lg border border-slate-700 p-1 gap-1">
                <button
                  type="button"
                  onClick={() => handleApplyFormatting("bold")}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 font-bold text-white text-xs cursor-pointer"
                  title="Bold"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyFormatting("italic")}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 italic text-white text-xs cursor-pointer"
                  title="Italic"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyFormatting("underline")}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 underline text-white text-xs cursor-pointer"
                  title="Underline"
                >
                  U
                </button>
              </div>

              {/* Text Alignment */}
              <div className="flex items-center bg-[#0f172a] rounded-lg border border-slate-700 p-1 gap-1">
                <button
                  type="button"
                  onClick={() => handleApplyFormatting("align", "left")}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs cursor-pointer"
                  title="Align Left"
                >
                  ⇤
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyFormatting("align", "center")}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs cursor-pointer"
                  title="Align Center"
                >
                  ⇥⇤
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyFormatting("align", "right")}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs cursor-pointer"
                  title="Align Right"
                >
                  ⇥
                </button>
              </div>

              {/* Color Swatches */}
              <div className="flex items-center bg-[#0f172a] rounded-lg border border-slate-700 px-2 py-1 gap-1.5">
                <span className="text-[11px] font-semibold text-slate-400">Color:</span>
                {SWATCH_COLORS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => handleApplyFormatting("color", c.color)}
                    className="w-4 h-4 rounded-full border border-slate-600 hover:scale-125 transition-transform cursor-pointer"
                    style={{ backgroundColor: c.color }}
                    title={`Apply ${c.name} color`}
                  />
                ))}
              </div>

              {/* Delete / Clear */}
              <button
                type="button"
                onClick={() => handleApplyFormatting("delete")}
                className="px-2.5 py-1.5 rounded-lg bg-rose-950/70 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-semibold cursor-pointer"
                title="Delete Selected Element"
              >
                Delete
              </button>
            </div>
          )}

          {/* TAB 2: INSERT ELEMENTS */}
          {activeRibbonTab === "elements" && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleInsertActiveSlideSnippet('\n:::card(title="Executive Summary", icon="💡")\n- Critical business insight\n- Strategic objective\n:::\n')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f172a] border border-slate-700 hover:bg-slate-800 text-slate-200 hover:text-white font-medium text-xs cursor-pointer shadow-xs transition-colors"
              >
                <span>Card Container</span>
              </button>

              <button
                type="button"
                onClick={() => handleInsertActiveSlideSnippet('\n:::grid(cols=2)\n:::card(title="Pillar 1")\n- Benefit A\n:::\n:::card(title="Pillar 2")\n- Benefit B\n:::\n:::\n')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f172a] border border-slate-700 hover:bg-slate-800 text-slate-200 hover:text-white font-medium text-xs cursor-pointer shadow-xs transition-colors"
              >
                <span>2-Col Grid</span>
              </button>

              <button
                type="button"
                onClick={() => handleInsertActiveSlideSnippet('\n:::grid(cols=3)\n:::card(title="Point A")\n- Details\n:::\n:::card(title="Point B")\n- Details\n:::\n:::card(title="Point C")\n- Details\n:::\n:::\n')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f172a] border border-slate-700 hover:bg-slate-800 text-slate-200 hover:text-white font-medium text-xs cursor-pointer shadow-xs transition-colors"
              >
                <span>3-Col Grid</span>
              </button>

              <button
                type="button"
                onClick={() => handleInsertActiveSlideSnippet('\n:::chart(type="bar", title="ARR Trajectory ($M)")\nlabels: 2023, 2024, 2025, 2026\nseries: Revenue [12.4, 28.5, 54.2, 98.6]\n:::\n')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f172a] border border-slate-700 hover:bg-slate-800 text-slate-200 hover:text-white font-medium text-xs cursor-pointer shadow-xs transition-colors"
              >
                <IconChart className="w-3.5 h-3.5 text-blue-400" />
                <span>Bar Chart</span>
              </button>

              <button
                type="button"
                onClick={() => handleInsertActiveSlideSnippet('\n:::chart(type="donut", title="Market Share")\nEnterprise: 45\nMid-Market: 35\nSMB: 20\n:::\n')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f172a] border border-slate-700 hover:bg-slate-800 text-slate-200 hover:text-white font-medium text-xs cursor-pointer shadow-xs transition-colors"
              >
                <IconChart className="w-3.5 h-3.5 text-emerald-400" />
                <span>Donut Chart</span>
              </button>

              <button
                type="button"
                onClick={() => handleInsertActiveSlideSnippet('\n:::metric(value="+340%", label="Annual Scale", sub="5-Year Horizon")\n')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f172a] border border-slate-700 hover:bg-slate-800 text-slate-200 hover:text-white font-medium text-xs cursor-pointer shadow-xs transition-colors"
              >
                <span>Metric Stat</span>
              </button>

              <button
                type="button"
                onClick={() => handleInsertActiveSlideSnippet('\n:::callout(type="tip")\n💡 **Key Takeaway**: Strategic summary of the core insight on this slide.\n:::\n')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f172a] border border-slate-700 hover:bg-slate-800 text-slate-200 hover:text-white font-medium text-xs cursor-pointer shadow-xs transition-colors"
              >
                <span>Callout Box</span>
              </button>

              <button
                type="button"
                onClick={() => handleInsertActiveSlideSnippet('\n| Feature | Platform A | Platform B |\n|---|---|---|\n| Enterprise SLA | 99.99% | 99.0% |\n| Latency | <10ms | 150ms |\n')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f172a] border border-slate-700 hover:bg-slate-800 text-slate-200 hover:text-white font-medium text-xs cursor-pointer shadow-xs transition-colors"
              >
                <span>Table</span>
              </button>
            </div>
          )}

          {/* TAB 3: MEDIA & IMAGES */}
          {activeRibbonTab === "media" && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setShowImageModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                <IconImage className="w-3.5 h-3.5" />
                <span>Insert Image</span>
              </button>

              <div className="h-6 w-px bg-slate-800" />

              <span className="text-[11px] font-semibold text-slate-400">Curated Presets:</span>
              {UNSPLASH_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleInsertActiveSlideSnippet(`\n![${p.label}](${p.url})\n`)}
                  className="px-2.5 py-1 rounded-lg bg-[#0f172a] border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-medium cursor-pointer transition-colors"
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
              <div className="flex items-center gap-1.5 bg-[#0f172a] rounded-lg border border-slate-700 px-2.5 py-1">
                <IconPalette className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[11px] font-semibold text-slate-400">Theme:</span>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="bg-[#1e293b] text-xs font-bold text-slate-100 px-2 py-0.5 rounded border border-slate-600 outline-none cursor-pointer focus:border-blue-500 capitalize"
                >
                  {THEME_OPTIONS.map((t) => (
                    <option key={t.id} value={t.id} className="bg-slate-900 text-white">{t.label} ({t.mood})</option>
                  ))}
                </select>
              </div>

              <div className="h-6 w-px bg-slate-800" />

              {/* Plain White / Clean Slide Backgrounds */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-400">Background:</span>
                {[
                  { name: "Plain White", val: "white", bg: "bg-white text-slate-900 border border-slate-300" },
                  { name: "Slate Light", val: "pattern-grid", bg: "bg-slate-200 text-slate-900 border border-slate-400" },
                  { name: "Dark Executive", val: "gradient-dark", bg: "bg-slate-800 text-white border border-slate-600" },
                  { name: "Default", val: "", bg: "bg-slate-700 text-slate-200 border border-slate-600" },
                ].map((b) => (
                  <button
                    key={b.name}
                    type="button"
                    onClick={() => handleApplySlideBackground(b.val)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${b.bg} hover:scale-105 transition-all cursor-pointer shadow-xs`}
                  >
                    {b.name}
                  </button>
                ))}

                {/* Custom Color Input */}
                <div className="flex items-center gap-1 bg-[#0f172a] border border-slate-700 rounded-lg px-2 py-1">
                  <input
                    type="color"
                    value={customSlideBg}
                    onChange={(e) => {
                      setCustomSlideBg(e.target.value);
                      handleApplySlideBackground(e.target.value);
                    }}
                    className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent p-0"
                    title="Pick custom background color"
                  />
                  <span className="text-[10px] text-slate-400 font-mono uppercase">{customSlideBg}</span>
                </div>
              </div>

              <div className="h-6 w-px bg-slate-800" />

              {/* Typography */}
              <div className="flex items-center gap-1.5 bg-[#0f172a] rounded-lg border border-slate-700 px-2 py-1">
                <select
                  value={headFont}
                  onChange={(e) => setHeadFont(e.target.value)}
                  className="bg-[#1e293b] text-xs text-slate-100 font-medium px-2 py-0.5 rounded border border-slate-600 outline-none cursor-pointer focus:border-blue-500"
                  title="Head Font"
                >
                  <option value="" className="bg-slate-900 text-white">Head Font: Default</option>
                  {FONT_OPTIONS.map((f) => (
                    <option key={f.id} value={f.id} className="bg-slate-900 text-white">{f.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-[#0f172a] rounded-lg border border-slate-700 px-2 py-1">
                <select
                  value={bodyFont}
                  onChange={(e) => setBodyFont(e.target.value)}
                  className="bg-[#1e293b] text-xs text-slate-100 font-medium px-2 py-0.5 rounded border border-slate-600 outline-none cursor-pointer focus:border-blue-500"
                  title="Body Font"
                >
                  <option value="" className="bg-slate-900 text-white">Body Font: Default</option>
                  {FONT_OPTIONS.map((f) => (
                    <option key={f.id} value={f.id} className="bg-slate-900 text-white">{f.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-[#0f172a] rounded-lg border border-slate-700 px-2 py-1">
                <select
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  className="bg-[#1e293b] text-xs text-slate-100 font-medium px-2 py-0.5 rounded border border-slate-600 outline-none cursor-pointer focus:border-blue-500 capitalize"
                  title="Layout Template"
                >
                  {TEMPLATE_OPTIONS.map((t) => (
                    <option key={t.id} value={t.id} className="bg-slate-900 text-white">{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-[#0f172a] rounded-lg border border-slate-700 px-2 py-1">
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="bg-[#1e293b] text-xs text-slate-100 font-medium px-2 py-0.5 rounded border border-slate-600 outline-none cursor-pointer focus:border-blue-500 uppercase"
                  title="Scale"
                >
                  {SIZE_OPTIONS.map((s) => (
                    <option key={s.id} value={s.id} className="bg-slate-900 text-white">{s.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* TAB 5: SLIDE SHOW & AUTO ADVANCE */}
          {activeRibbonTab === "slideshow" && (
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  isAutoPlaying
                    ? "bg-amber-600 hover:bg-amber-500 text-white shadow-xs animate-pulse"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
                }`}
              >
                <IconPlay className="w-3.5 h-3.5" />
                <span>{isAutoPlaying ? "Pause Auto Slideshow" : "Start Auto Slideshow"}</span>
              </button>

              <div className="flex items-center gap-1.5 bg-[#0f172a] rounded-lg border border-slate-700 px-2.5 py-1">
                <span className="text-[11px] font-semibold text-slate-400">Interval:</span>
                <select
                  value={autoInterval}
                  onChange={(e) => setAutoInterval(Number(e.target.value))}
                  className="bg-[#1e293b] text-xs font-bold text-slate-100 px-2 py-0.5 rounded border border-slate-600 outline-none cursor-pointer focus:border-blue-500"
                >
                  <option value={3} className="bg-slate-900 text-white">3 Seconds</option>
                  <option value={5} className="bg-slate-900 text-white">5 Seconds</option>
                  <option value={8} className="bg-slate-900 text-white">8 Seconds</option>
                  <option value={10} className="bg-slate-900 text-white">10 Seconds</option>
                  <option value={15} className="bg-slate-900 text-white">15 Seconds</option>
                </select>
              </div>

              <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={autoLoop}
                  onChange={(e) => setAutoLoop(e.target.checked)}
                  className="rounded border-slate-700 text-blue-600 focus:ring-0 cursor-pointer"
                />
                <span>Loop Continuously</span>
              </label>

              <button
                type="button"
                onClick={() => setShowGridModal(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0f172a] border border-slate-700 hover:bg-slate-800 text-white font-semibold text-xs cursor-pointer"
              >
                <IconGrid className="w-3.5 h-3.5 text-blue-400" />
                <span>Overview (G)</span>
              </button>
            </div>
          )}

          {/* TAB 6: TRANSITIONS */}
          {activeRibbonTab === "transitions" && (
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 bg-[#0f172a] rounded-lg border border-slate-700 px-2.5 py-1">
                <span className="text-[11px] font-semibold text-slate-400">Transition:</span>
                <select
                  value={transition}
                  onChange={(e) => setTransition(e.target.value)}
                  className="bg-[#1e293b] text-xs font-bold text-slate-100 px-2 py-0.5 rounded border border-slate-600 outline-none cursor-pointer focus:border-blue-500 capitalize"
                >
                  {TRANSITION_OPTIONS.map((t) => (
                    <option key={t.id} value={t.id} className="bg-slate-900 text-white">{t.label}</option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => handleInsertActiveSlideSnippet(" {click}")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-950/70 text-blue-300 border border-blue-800 hover:bg-blue-900/80 font-semibold text-xs cursor-pointer transition-colors"
              >
                <IconSparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Add Reveal Step ({'{click}'})</span>
              </button>
            </div>
          )}

          {/* TAB 7: AI COPILOT */}
          {activeRibbonTab === "ai" && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setShowAiModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs cursor-pointer transition-colors"
              >
                <IconSparkles className="w-3.5 h-3.5" />
                <span>Generate Full Presentation</span>
              </button>

              <button
                type="button"
                onClick={() => handleTransformSlide("punchy")}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0f172a] border border-slate-700 hover:bg-slate-800 text-white font-semibold text-xs cursor-pointer transition-colors"
              >
                <span>Make Punchier</span>
              </button>

              <button
                type="button"
                onClick={() => handleTransformSlide("generate-notes")}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0f172a] border border-slate-700 hover:bg-slate-800 text-amber-400 font-semibold text-xs cursor-pointer transition-colors"
              >
                <IconMic className="w-3.5 h-3.5" />
                <span>Generate Talking Script</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Main PowerPoint Workspace Layout ──────────────────────── */}
      <div className="flex flex-1 min-h-0 relative">
        {/* 1. LEFT SIDEBAR: Slide Filmstrip Thumbnails */}
        {(viewMode === "studio" || viewMode === "split") && (
          <aside className="w-52 border-r border-slate-800 bg-[#0c101c] flex flex-col shrink-0">
            <div className="p-2.5 border-b border-slate-800 flex items-center justify-between">
              <span suppressHydrationWarning className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Slides ({slideSections.length})
              </span>
              <button
                type="button"
                onClick={() => handleAddSlide("blank")}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-800 font-bold text-xs cursor-pointer"
              >
                <IconPlus className="w-3 h-3" />
                <span>Add</span>
              </button>
            </div>

            {/* Thumbnail Scroll List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {slideSections.map((sec, idx) => {
                const isSelected = idx === currentSlideIndex;
                const isDragging = draggedSlideIdx === idx;
                const isDragOver = dragOverSlideIdx === idx && draggedSlideIdx !== idx;
                const titleMatch = sec.match(/^#+\s+(.+)$/m);
                const slideTitle = titleMatch ? titleMatch[1].replace(/\{.*?\}/g, "").trim() : `Slide ${idx + 1}`;

                return (
                  <div
                    key={idx}
                    draggable={true}
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", String(idx));
                      e.dataTransfer.effectAllowed = "move";
                      setDraggedSlideIdx(idx);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                      if (dragOverSlideIdx !== idx) setDragOverSlideIdx(idx);
                    }}
                    onDragLeave={() => {
                      if (dragOverSlideIdx === idx) setDragOverSlideIdx(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedSlideIdx !== null && draggedSlideIdx !== idx) {
                        handleMoveSlide(draggedSlideIdx, idx);
                      }
                      setDraggedSlideIdx(null);
                      setDragOverSlideIdx(null);
                    }}
                    onDragEnd={() => {
                      setDraggedSlideIdx(null);
                      setDragOverSlideIdx(null);
                    }}
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`group relative rounded-xl border p-2 cursor-grab active:cursor-grabbing transition-all ${
                      isDragging
                        ? "opacity-30 scale-95 border-dashed border-blue-400 bg-blue-950/20"
                        : isDragOver
                        ? "border-blue-400 ring-2 ring-blue-500 bg-blue-950/70 scale-102"
                        : isSelected
                        ? "border-blue-500 bg-blue-950/40 shadow-lg ring-2 ring-blue-500/30"
                        : "border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 hover:text-slate-300 cursor-grab text-[10px] font-mono select-none" title="Drag to rearrange">
                          ⋮⋮
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isSelected ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"}`}>
                          {idx + 1}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 truncate max-w-[105px] font-medium">
                        {slideTitle}
                      </span>
                    </div>

                    <div className="aspect-[16/9] w-full rounded-lg bg-white overflow-hidden border border-slate-200 relative flex items-center justify-center p-2 shadow-sm pointer-events-none">
                      <div className="text-[8px] text-slate-800 text-center font-bold line-clamp-3 leading-tight">
                        {slideTitle}
                      </div>
                    </div>

                    {/* Hover Actions Pill */}
                    <div className="absolute top-1 right-1 hidden group-hover:flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-md p-0.5 shadow-md z-10">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveSlide(idx, idx - 1);
                        }}
                        disabled={idx === 0}
                        className="p-1 hover:bg-slate-800 rounded text-[9px] disabled:opacity-30 cursor-pointer"
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
                        className="p-1 hover:bg-slate-800 rounded text-[9px] disabled:opacity-30 cursor-pointer"
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
                        className="p-1 hover:bg-slate-800 rounded text-[9px] cursor-pointer"
                        title="Duplicate"
                      >
                        <IconLayers className="w-2.5 h-2.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSlide(idx);
                        }}
                        disabled={slideSections.length <= 1}
                        className="p-1 hover:bg-rose-500 hover:text-white rounded text-[9px] disabled:opacity-30 cursor-pointer text-rose-400"
                        title="Delete"
                      >
                        <IconTrash className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        )}

        {/* 2. CENTER STAGE CANVAS: Complete Landing Page Presentation Controls */}
        {viewMode !== "markdown" && (
          <main className="flex-1 min-w-0 bg-[#090d16] flex flex-col relative overflow-hidden">
            {/* Auto Slideshow Progress Bar */}
            {isAutoPlaying && (
              <div className="w-full h-1 bg-slate-800 relative overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-100 ease-linear"
                  style={{ width: `${autoProgress}%` }}
                />
              </div>
            )}

            {/* Top Stage Information Bar */}
            <div className="h-9 bg-[#0b1120] border-b border-slate-800 px-4 flex items-center justify-between text-xs text-slate-400 font-medium shrink-0">
              <div className="flex items-center gap-2">
                <span suppressHydrationWarning className="font-bold text-white">Slide {currentSlideIndex + 1} of {slideSections.length}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">16:9 Widescreen</span>
                {isAutoPlaying && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold animate-pulse flex items-center gap-1">
                    <IconPlay className="w-2.5 h-2.5" /> Auto ({autoInterval}s)
                  </span>
                )}
              </div>

              {/* Floating Contextual Quick Formatting Bar for Selection */}
              {hasActiveSelection ? (
                <div className="flex items-center gap-1.5 bg-slate-900 border border-blue-500/60 px-3 py-1 rounded-lg text-xs animate-fade-in shadow-xl">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider truncate max-w-[90px]">
                    {selectedText ? "Text Selected" : selectedElement?.elType}
                  </span>
                  <div className="h-3.5 w-px bg-slate-700 mx-1" />

                  {/* Font Size Steppers */}
                  <div className="flex items-center bg-[#0f172a] rounded border border-slate-700 p-0.5 gap-0.5">
                    <select
                      value={currentFontSize}
                      onChange={(e) => handleApplyFormatting("size", Number(e.target.value))}
                      className="bg-[#1e293b] text-[11px] font-bold text-slate-100 rounded border border-slate-600 outline-none cursor-pointer px-1 py-0.5"
                    >
                      {FONT_SIZES.map((sz) => (
                        <option key={sz} value={sz} className="bg-slate-900 text-white">{sz}px</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleApplyFormatting("size", Math.min(96, currentFontSize + 4))}
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-200 hover:bg-slate-700 cursor-pointer"
                    >
                      A+
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyFormatting("size", Math.max(12, currentFontSize - 4))}
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-200 hover:bg-slate-700 cursor-pointer"
                    >
                      A-
                    </button>
                  </div>

                  {/* Styles: Bold, Italic, Underline */}
                  <div className="flex items-center bg-[#0f172a] rounded border border-slate-700 p-0.5 gap-0.5">
                    <button
                      type="button"
                      onClick={() => handleApplyFormatting("bold")}
                      className="px-1.5 py-0.5 rounded font-bold text-white text-[10px] hover:bg-slate-700 cursor-pointer"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyFormatting("italic")}
                      className="px-1.5 py-0.5 rounded italic text-white text-[10px] hover:bg-slate-700 cursor-pointer"
                    >
                      I
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyFormatting("underline")}
                      className="px-1.5 py-0.5 rounded underline text-white text-[10px] hover:bg-slate-700 cursor-pointer"
                    >
                      U
                    </button>
                  </div>

                  {/* Color Swatches */}
                  <div className="flex items-center gap-1 pl-1">
                    {[
                      { name: "Navy", code: "#0f172a", bg: "bg-slate-900 border border-slate-600" },
                      { name: "White", code: "#ffffff", bg: "bg-white border border-slate-400" },
                      { name: "Blue", code: "#2563eb", bg: "bg-blue-600" },
                      { name: "Green", code: "#10b981", bg: "bg-emerald-500" },
                      { name: "Amber", code: "#f59e0b", bg: "bg-amber-500" },
                      { name: "Rose", code: "#f43f5e", bg: "bg-rose-500" },
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

                  <button
                    type="button"
                    onClick={() => handleApplyFormatting("reveal")}
                    className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-semibold hover:bg-blue-900 cursor-pointer"
                  >
                    Reveal Step
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyFormatting("delete")}
                    className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-semibold hover:bg-rose-900 cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <span>Highlight any text or click any slide block to format font size, color & style</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFullscreen(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] cursor-pointer shadow-xs"
                >
                  <IconMaximize className="w-3 h-3" />
                  <span>Fullscreen (F)</span>
                </button>
              </div>
            </div>

            {/* 16:9 Canvas Stage Wrapper */}
            <div className="flex-1 flex items-center justify-center p-4 lg:p-8 overflow-hidden relative">
              <div className="w-full max-w-5xl aspect-[16/9] bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-800 relative">
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

            {/* Bottom Complete Landing Page Control Dock */}
            <div className="h-12 bg-[#0b1120] border-t border-slate-800 px-4 flex items-center justify-between text-xs shrink-0 gap-3">
              {/* Left Navigation Steppers */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentSlideIndex <= 0}
                  onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ← Prev
                </button>
                <button
                  type="button"
                  disabled={currentSlideIndex >= slideSections.length - 1}
                  onClick={() => setCurrentSlideIndex((prev) => Math.min(slideSections.length - 1, prev + 1))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>

              {/* Center Slide Scrubber Matrix */}
              <div className="flex items-center gap-1.5">
                {slideSections.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentSlideIndex(i)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      i === currentSlideIndex
                        ? "bg-blue-500 w-6"
                        : "bg-slate-700 hover:bg-slate-500 w-2"
                    }`}
                    title={`Jump to Slide ${i + 1}`}
                  />
                ))}
              </div>

              {/* Right Presentation Delivery Cockpit */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                    isAutoPlaying
                      ? "bg-amber-950/80 border-amber-600 text-amber-300"
                      : "bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800"
                  }`}
                  title="Toggle Auto Advance (A)"
                >
                  {isAutoPlaying ? <IconPause className="w-3 h-3" /> : <IconPlay className="w-3 h-3" />}
                  <span>{isAutoPlaying ? "Pause Auto" : "Auto Play"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsNotesDrawerOpen(!isNotesDrawerOpen)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                    isNotesDrawerOpen
                      ? "bg-amber-950/80 border-amber-600 text-amber-300"
                      : "bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800"
                  }`}
                  title="Toggle Speaker Notes Drawer"
                >
                  <IconMic className="w-3 h-3 text-amber-400" />
                  <span>Notes</span>
                </button>
              </div>
            </div>

            {/* Expandable Speaker Talking Points Drawer */}
            {isNotesDrawerOpen && (
              <div className="border-t border-slate-800 bg-[#0f172a] p-3 text-xs animate-fade-in flex flex-col max-h-40">
                <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-800">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5">
                    <IconMic className="w-3.5 h-3.5" /> Presenter Talking Script
                  </span>
                  <button
                    type="button"
                    onClick={() => handleTransformSlide("generate-notes")}
                    className="text-[11px] text-blue-400 hover:underline cursor-pointer font-medium"
                  >
                    Generate AI Talking Script
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
                  rows={2}
                  className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 outline-none focus:border-blue-500 font-sans resize-none"
                  placeholder="Enter private speaker cues or talking points..."
                />
              </div>
            )}
          </main>
        )}

        {/* 3. RIGHT PANEL: Visual Slide & Element Property Inspector */}
        {viewMode === "studio" && isInspectorOpen && (
          <aside className="w-80 border-l border-slate-800 bg-[#0c101c] flex flex-col shrink-0">
            <div className="p-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconSliders className="w-3.5 h-3.5 text-blue-400" />
                <h4 className="font-bold text-xs text-white">
                  {hasActiveSelection ? "Selection Properties" : `Slide ${currentSlideIndex + 1} Properties`}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsInspectorOpen(false)}
                className="text-slate-400 hover:text-white text-xs p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {/* Active Selection Formatting Box */}
              {hasActiveSelection ? (
                <div className="p-3 rounded-xl bg-slate-900 border border-blue-500/50 space-y-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                      🎯 {selectedText ? "Highlighted Text" : selectedElement?.elType}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedElement(null);
                        setSelectedText(null);
                      }}
                      className="text-[10px] text-slate-400 hover:text-white cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Text Value
                    </label>
                    <input
                      type="text"
                      value={activeSelectedSnippet}
                      onChange={(e) => handleApplyFormatting("replace-text", e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Numeric Font Size Slider */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Font Size: {currentFontSize}px
                      </label>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleApplyFormatting("size", Math.max(12, currentFontSize - 4))}
                          className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-200 cursor-pointer"
                        >
                          -4
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyFormatting("size", Math.min(96, currentFontSize + 4))}
                          className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-200 cursor-pointer"
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
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                  </div>

                  {/* Styles */}
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      type="button"
                      onClick={() => handleApplyFormatting("bold")}
                      className="py-1 rounded bg-slate-950 border border-slate-700 hover:bg-slate-800 text-xs font-bold text-white cursor-pointer"
                    >
                      Bold
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyFormatting("italic")}
                      className="py-1 rounded bg-slate-950 border border-slate-700 hover:bg-slate-800 text-xs italic text-white cursor-pointer"
                    >
                      Italic
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyFormatting("underline")}
                      className="py-1 rounded bg-slate-950 border border-slate-700 hover:bg-slate-800 text-xs underline text-white cursor-pointer"
                    >
                      Underline
                    </button>
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleApplyFormatting("delete")}
                    className="w-full py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold text-xs cursor-pointer transition-colors"
                  >
                    Remove Element from Slide
                  </button>
                </div>
              ) : null}

              {/* Layout Presets */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Change Slide Layout
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {Object.entries(SLIDE_TEMPLATES).map(([k, t]) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => updateActiveSlideMarkdown(t.snippet)}
                      className="p-2 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-left cursor-pointer text-xs"
                    >
                      <span className="font-medium text-[11px] truncate text-slate-200">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Slide Background Presets (White by default) */}
              <div className="border-t border-slate-800 pt-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Slide Canvas Color
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleApplySlideBackground("white")}
                    className="p-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 font-bold text-xs text-center cursor-pointer shadow-xs"
                  >
                    Plain White
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplySlideBackground("gradient-dark")}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold text-xs text-center cursor-pointer"
                  >
                    Dark Slate
                  </button>
                </div>
              </div>

              {/* Direct Markdown Slide Source */}
              <div className="border-t border-slate-800 pt-3">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Slide Markdown Content
                  </label>
                  <span className="text-[9px] text-blue-400 font-semibold font-mono">Live Synced</span>
                </div>
                <textarea
                  value={activeSlideMarkdown}
                  onChange={(e) => updateActiveSlideMarkdown(e.target.value)}
                  rows={8}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono leading-relaxed outline-none focus:border-blue-500 transition-colors resize-y"
                  placeholder="Write slide markdown..."
                />
              </div>
            </div>
          </aside>
        )}

        {/* 4. CODE EDITOR: Shown when in "markdown" or "split" mode */}
        {(viewMode === "markdown" || viewMode === "split") && (
          <div className={`${viewMode === "markdown" ? "flex-1" : "w-1/2"} border-r border-slate-800 flex flex-col bg-[#090d16]`}>
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
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-[#0f172a] p-5 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base flex items-center gap-2">
                <IconImage className="w-4 h-4 text-blue-400" />
                <span>Insert Presentation Image</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="text-slate-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1 text-slate-300">Image Web URL</label>
              <input
                type="url"
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold block mb-2 text-slate-300">Or Select from Presentation Stock</label>
              <div className="grid grid-cols-2 gap-2">
                {UNSPLASH_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      handleInsertActiveSlideSnippet(`\n![${p.label}](${p.url})\n`);
                      setShowImageModal(false);
                    }}
                    className="p-2.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-left text-xs font-medium cursor-pointer text-slate-200"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-300 cursor-pointer"
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
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-40"
              >
                Insert Image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Slide Grid Overview Modal (G) ─────────────────────────── */}
      {showGridModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col p-6 animate-fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-white">
            <div className="flex items-center gap-2">
              <IconGrid className="w-5 h-5 text-blue-400" />
              <span className="text-base font-bold">All Slides Grid Matrix</span>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-mono">
                {slideSections.length} Slides
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowGridModal(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold cursor-pointer"
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
                  className={`aspect-[16/9] rounded-xl p-4 bg-white border cursor-pointer transition-all hover:scale-105 flex flex-col justify-between shadow-md ${
                    isSelected ? "ring-4 ring-blue-500 border-blue-500" : "border-slate-300 hover:border-slate-500"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                    <span>#{idx + 1}</span>
                    {isSelected && <span className="text-[10px] text-blue-600 font-bold uppercase">Active</span>}
                  </div>
                  <div className="text-sm font-bold text-slate-900 text-center line-clamp-3">
                    {slideTitle}
                  </div>
                  <div className="text-[10px] text-slate-400 text-right">Click to Jump</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Keyboard Shortcuts Cheatsheet Modal (?) ──────────────── */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-[#0f172a] p-5 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base flex items-center gap-2">
                <span>⌨️</span> Keyboard Shortcuts
              </h3>
              <button
                type="button"
                onClick={() => setShowShortcutsModal(false)}
                className="text-slate-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 text-xs">
              {[
                { key: "Space / → / ↓", desc: "Next Slide / Step" },
                { key: "← / ↑", desc: "Previous Slide" },
                { key: "F", desc: "Toggle Fullscreen" },
                { key: "P", desc: "Presenter Cockpit" },
                { key: "G", desc: "Slide Grid Overview" },
                { key: "A", desc: "Toggle Auto Slideshow" },
                { key: "B", desc: "Black Screen Pause" },
                { key: "W", desc: "White Screen Pause" },
                { key: "Home / End", desc: "First / Last Slide" },
                { key: "Esc", desc: "Exit Fullscreen / Modals" },
                { key: "Highlight Text", desc: "Mini Formatting Bar" },
                { key: "? / H", desc: "Shortcuts Help" },
              ].map((s) => (
                <div key={s.key} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="font-mono font-bold text-blue-400 bg-slate-950 px-1.5 py-0.5 rounded text-[11px] border border-slate-800">
                    {s.key}
                  </span>
                  <span className="text-slate-300">{s.desc}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => setShowShortcutsModal(false)}
                className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Presenter Pro Cockpit View Modal ──────────────────────── */}
      {showPresenterModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col p-4 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-white">
            <div className="flex items-center gap-3">
              <IconMic className="w-5 h-5 text-amber-400" />
              <span className="text-base font-bold">Presenter Pro Cockpit</span>
              <span className="text-xs px-2.5 py-0.5 rounded bg-blue-950 text-blue-300 font-mono border border-blue-800">
                Slide {currentSlideIndex + 1} of {parsedSlides.length}
              </span>
            </div>

            {/* Stopwatch */}
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 font-mono text-base text-emerald-400 font-bold">
                ⏱️ {formatTime(elapsedSeconds)}
              </div>
              <button
                type="button"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-semibold cursor-pointer"
              >
                {isTimerRunning ? "Pause" : "Start"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsTimerRunning(false);
                  setElapsedSeconds(0);
                }}
                className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-xs text-slate-400 cursor-pointer"
              >
                Reset
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowPresenterModal(false)}
              className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-semibold cursor-pointer"
            >
              ✕ Exit Cockpit
            </button>
          </div>

          {/* Dual Screen Simulator Body */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 pt-4 min-h-0">
            {/* Main Stage Slide Preview */}
            <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-white overflow-hidden relative shadow-2xl">
              <div className="absolute top-2 left-2 z-10 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-blue-600 text-white shadow-sm">
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
              <div className="h-44 rounded-xl border border-slate-800 bg-slate-900/90 p-3 flex flex-col">
                <span className="text-xs font-semibold text-slate-400 mb-2">👁️ Upcoming Slide Preview</span>
                <div className="flex-1 bg-white rounded-lg p-3 overflow-hidden text-xs text-slate-900 shadow-inner">
                  {nextSlideHtml ? (
                    <div dangerouslySetInnerHTML={{ __html: nextSlideHtml }} className="scale-75 origin-top-left" />
                  ) : (
                    <span className="text-slate-400 italic">End of presentation</span>
                  )}
                </div>
              </div>

              {/* Speaker Notes */}
              <div className="flex-1 rounded-xl border border-slate-800 bg-slate-900/90 p-4 flex flex-col overflow-hidden">
                <span className="text-xs font-bold text-amber-400 mb-2 flex items-center gap-1.5">
                  <IconMic className="w-4 h-4" />
                  <span>Speaker Talking Script</span>
                </span>
                <div className="flex-1 overflow-y-auto font-sans text-xs text-slate-200 leading-relaxed whitespace-pre-wrap bg-slate-950 p-3 rounded-lg border border-slate-800">
                  {currentNotes || "No speaker notes written for this slide. Use 'Write Talking Points' to generate them."}
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={currentSlideIndex <= 0}
                  onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                  className="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-30"
                >
                  ← Previous Slide
                </button>
                <button
                  type="button"
                  disabled={currentSlideIndex >= parsedSlides.length - 1}
                  onClick={() => setCurrentSlideIndex((prev) => Math.min(parsedSlides.length - 1, prev + 1))}
                  className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-30"
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
          {/* Top Floating Glass HUD */}
          <div className="absolute top-3 left-3 right-3 z-50 flex items-center justify-between pointer-events-none">
            {/* Left: Keybinding quick badges */}
            <div className="flex items-center gap-2 pointer-events-auto bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-white text-xs">
              <span className="text-[11px] font-bold text-blue-400 font-mono">Shortcuts:</span>
              <span className="text-[10px] text-slate-300 font-mono"><kbd className="bg-white/10 px-1 rounded border border-white/20">L</kbd> Laser</span>
              <span className="text-[10px] text-slate-300 font-mono"><kbd className="bg-white/10 px-1 rounded border border-white/20">D</kbd> Pen/Draw</span>
              <span className="text-[10px] text-slate-300 font-mono"><kbd className="bg-white/10 px-1 rounded border border-white/20">O</kbd> Grid</span>
              <span className="text-[10px] text-slate-300 font-mono"><kbd className="bg-white/10 px-1 rounded border border-white/20">T</kbd> Themes</span>
              <span className="text-[10px] text-slate-300 font-mono"><kbd className="bg-white/10 px-1 rounded border border-white/20">?</kbd> All Help</span>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                type="button"
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur border transition-all cursor-pointer ${
                  isAutoPlaying
                    ? "bg-amber-600 text-white border-amber-400 animate-pulse"
                    : "bg-slate-900/90 hover:bg-slate-800 text-white border-slate-700"
                }`}
              >
                {isAutoPlaying ? "⏸️ Pause Auto" : "▶️ Auto Play (A)"}
              </button>

              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-200 text-xs font-bold backdrop-blur border border-rose-800 transition-all cursor-pointer shadow-lg"
              >
                ✕ Exit Fullscreen (Esc)
              </button>
            </div>
          </div>

          <iframe
            ref={fullscreenIframeRef}
            srcDoc={fullHtml}
            className="w-full h-full border-0"
            title="Fullscreen Presentation"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      )}
    </div>
  );
}
