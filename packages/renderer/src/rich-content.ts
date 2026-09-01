import type { Slide } from "./parser.js";

export interface RichFeatures {
  math: boolean;
  mermaid: boolean;
}

export function richContentFeatures(slides: Slide[]): RichFeatures {
  let math = false;
  let mermaid = false;
  for (const slide of slides) {
    if (!math && (slide.html.includes('class="math-source"') || slide.html.includes("math-source"))) {
      math = true;
    }
    if (
      !mermaid &&
      (slide.html.includes("language-mermaid") ||
        slide.html.includes("lang-mermaid") ||
        slide.html.includes('class="mermaid"'))
    ) {
      mermaid = true;
    }
  }
  return { math, mermaid };
}

export function richContentHead(
  features: RichFeatures,
  source: "local" | "cdn" = "local"
): string {
  const parts: string[] = [];
  if (features.math) {
    if (source === "cdn") {
      parts.push('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.18.4/dist/katex.min.css">');
      parts.push('<script src="https://cdn.jsdelivr.net/npm/katex@0.18.4/dist/katex.min.js"></script>');
    } else {
      parts.push('<link rel="stylesheet" href="/__vendor/katex.min.css">');
      parts.push('<script src="/__vendor/katex.min.js"></script>');
    }
  }
  if (features.mermaid) {
    if (source === "cdn") {
      parts.push('<script src="https://cdn.jsdelivr.net/npm/mermaid@11.17.2/dist/mermaid.min.js"></script>');
    } else {
      parts.push('<script src="/__vendor/mermaid.min.js"></script>');
    }
  }
  return parts.join("\n  ");
}

export const RICH_CONTENT_CSS = `/* ── Rich Content (Math & Diagrams) ─────────────────────────────────────── */

.math-source {
  font-family: inherit;
}

div.math-source {
  display: flex;
  justify-content: center;
  margin: 1.2em 0;
  overflow-x: auto;
  overflow-y: hidden;
}

span.math-source {
  display: inline;
}

.katex-display {
  margin: 0.8em 0;
  overflow-x: auto;
  overflow-y: hidden;
}

.katex {
  font-size: 1.15em;
  text-rendering: auto;
}

.math-error {
  color: var(--maroon, #f38ba8);
  background: var(--surface0, rgba(255, 0, 0, 0.1));
  padding: 2px 6px;
  border-radius: 4px;
  font-family: var(--font-mono, monospace);
  font-size: 0.85em;
}

.mermaid {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 1.2em auto;
  max-width: 100%;
  overflow: hidden;
}

.mermaid svg {
  max-width: 100%;
  height: auto;
}

.mermaid-error {
  color: var(--maroon, #f38ba8);
  background: var(--surface0, rgba(255, 0, 0, 0.1));
  border: 1px solid var(--maroon, #f38ba8);
  border-radius: 6px;
  padding: 12px 16px;
  font-family: var(--font-mono, monospace);
  font-size: 0.9em;
  white-space: pre-wrap;
  margin: 1em 0;
}

/* ── Smart Layout Containers & Cards ────────────────────────────────────── */

.slide-grid {
  display: grid;
  gap: 1.2em;
  margin: 1.2em 0;
  width: 100%;
}
.slide-grid.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.slide-grid.grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.slide-grid.grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }

.slide-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 1.2em;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(8px);
}
.slide-card-header {
  display: flex;
  align-items: center;
  gap: 0.5em;
  margin-bottom: 0.6em;
}
.slide-card-icon {
  font-size: 1.3em;
}
.slide-card-title {
  margin: 0 !important;
  font-size: 1.05em !important;
  font-weight: 700 !important;
}
.slide-card-body {
  font-size: 0.9em;
  opacity: 0.9;
  line-height: 1.5;
}

.slide-metric {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  padding: 1.2em 1em;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.slide-metric .metric-val {
  font-size: 2.2em;
  font-weight: 800;
  line-height: 1.1;
  background: linear-gradient(135deg, #60a5fa, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.slide-metric .metric-label {
  font-size: 0.85em;
  font-weight: 600;
  margin-top: 0.4em;
  opacity: 0.85;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.slide-metric .metric-sub {
  font-size: 0.75em;
  margin-top: 0.2em;
  opacity: 0.6;
}

.slide-callout {
  display: flex;
  gap: 0.8em;
  padding: 1em 1.2em;
  border-radius: 10px;
  margin: 1.2em 0;
  background: rgba(255, 255, 255, 0.04);
  border-left: 4px solid #3b82f6;
  font-size: 0.95em;
}
.slide-callout.callout-tip { border-left-color: #10b981; background: rgba(16, 185, 129, 0.08); }
.slide-callout.callout-warning { border-left-color: #f59e0b; background: rgba(245, 158, 11, 0.08); }
.slide-callout.callout-important { border-left-color: #ef4444; background: rgba(239, 68, 68, 0.08); }
.slide-callout .callout-icon { font-size: 1.2em; shrink: 0; }
.slide-callout .callout-body { flex: 1; }

.slide-terminal {
  background: #0d1117;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  overflow: hidden;
  margin: 1.2em 0;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}
.slide-terminal .terminal-header {
  background: #161b22;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.slide-terminal .terminal-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}
.slide-terminal .terminal-dot.red { background: #ff5f56; }
.slide-terminal .terminal-dot.yellow { background: #ffbd2e; }
.slide-terminal .terminal-dot.green { background: #27c93f; }
.slide-terminal .terminal-title {
  margin-left: auto;
  margin-right: auto;
  font-family: var(--font-mono, monospace);
  font-size: 0.75em;
  opacity: 0.5;
}
.slide-terminal .terminal-body {
  padding: 1em;
}

/* ── Interactive Charts ─────────────────────────────────────────────────── */
.slide-chart-box {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  padding: 1.2em;
  margin: 1.2em 0;
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}
.slide-chart-box .chart-header {
  margin-bottom: 0.8em;
}
.slide-chart-box .chart-title {
  font-size: 1.1em;
  font-weight: 700;
  margin: 0;
  color: inherit;
}
.slide-chart-svg {
  width: 100%;
  max-height: 260px;
  overflow: visible;
}
.slide-chart-svg .chart-bar {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  transform-origin: bottom;
  cursor: pointer;
}
.slide-chart-svg .chart-bar:hover {
  filter: brightness(1.2) drop-shadow(0 0 8px rgba(99, 102, 241, 0.6));
}
.slide-chart-svg .chart-line {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: chartDrawLine 1.4s ease-out forwards;
}
.slide-chart-svg .chart-slice {
  transition: transform 0.3s ease, filter 0.3s ease;
  cursor: pointer;
}
.slide-chart-svg .chart-slice:hover {
  transform: scale(1.04);
  filter: drop-shadow(0 0 10px rgba(99, 102, 241, 0.5));
}
@keyframes chartDrawLine {
  to { stroke-dashoffset: 0; }
}

/* ── Bento Grid ──────────────────────────────────────────────────────────── */
.slide-bento-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1em;
  margin: 1.2em 0;
}
.bento-box {
  border-radius: 14px;
  padding: 1.2em;
  border: 1px solid rgba(255, 255, 255, 0.12);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.bento-box:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
}
.bento-box.col-span-1 { grid-column: span 1; }
.bento-box.col-span-2 { grid-column: span 2; }
.bento-box.col-span-3 { grid-column: span 3; }
.bento-box.row-span-2 { grid-row: span 2; }
.bento-box.bento-bg-glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
}
.bento-box.bento-bg-gradient {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.1));
  border-color: rgba(99, 102, 241, 0.3);
}
.bento-box.bento-bg-dark {
  background: #090d16;
  border-color: rgba(255, 255, 255, 0.15);
}

/* ── Timeline & Milestones ──────────────────────────────────────────────── */
.slide-timeline {
  display: flex;
  gap: 1.2em;
  margin: 1.5em 0;
  position: relative;
  overflow-x: auto;
  padding-bottom: 0.5em;
}
.slide-timeline::before {
  content: '';
  position: absolute;
  top: 18px;
  left: 20px;
  right: 20px;
  height: 2px;
  background: rgba(255, 255, 255, 0.15);
  z-index: 0;
}
.timeline-milestone {
  flex: 1;
  min-width: 140px;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.timeline-milestone .milestone-badge {
  font-size: 0.75em;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 9999px;
  background: #1e293b;
  border: 2px solid #6366f1;
  color: #fff;
  margin-bottom: 0.8em;
  box-shadow: 0 0 12px rgba(99, 102, 241, 0.4);
}
.timeline-milestone.milestone-completed .milestone-badge {
  border-color: #10b981;
  background: #064e3b;
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.4);
}
.timeline-milestone.milestone-active .milestone-badge {
  border-color: #f59e0b;
  background: #78350f;
  animation: pulse 2s infinite;
}
.timeline-milestone .milestone-body {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 0.8em 1em;
  width: 100%;
}
.timeline-milestone .milestone-title {
  margin: 0 0 0.4em 0;
  font-size: 0.95em;
  font-weight: 700;
}

/* ── Badges ──────────────────────────────────────────────────────────────── */
.slide-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  font-size: 0.75em;
  font-weight: 700;
  padding: 0.25em 0.75em;
  border-radius: 9999px;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  margin: 0.2em 0.4em 0.2em 0;
  vertical-align: middle;
}
.slide-badge.badge-emerald { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
.slide-badge.badge-blue { background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }
.slide-badge.badge-purple { background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3); }
.slide-badge.badge-amber { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
.slide-badge.badge-brand { background: rgba(99, 102, 241, 0.15); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.3); }
.slide-badge .badge-pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  display: inline-block;
  animation: pulse 1.5s infinite;
}

/* ── Stepwise Click Reveals (Fragments) ─────────────────────────────────── */
.slide-fragment {
  display: inline;
}
li:has(.slide-fragment), .slide-fragment-item {
  opacity: 0.15;
  filter: blur(1px);
  transform: translateY(4px);
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
li:has(.slide-fragment).fragment-revealed, .slide-fragment-item.fragment-revealed {
  opacity: 1;
  filter: blur(0);
  transform: translateY(0);
}

/* ── Dynamic Text Colors & Highlights ─────────────────────────────────── */
.slide-text-color {
  display: inline;
}
.text-color-indigo { color: #818cf8 !important; }
.text-color-emerald { color: #34d399 !important; }
.text-color-amber { color: #fbbf24 !important; }
.text-color-rose { color: #fb7185 !important; }
.text-color-cyan { color: #22d3ee !important; }
.text-color-violet { color: #a78bfa !important; }
.text-color-blue { color: #60a5fa !important; }
.text-color-red { color: #f87171 !important; }
.text-color-green { color: #4ade80 !important; }

.slide-text-bg {
  display: inline;
  padding: 0.12em 0.4em;
  border-radius: 4px;
  font-weight: 500;
}
.slide-text-bg.bg-amber { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
.slide-text-bg.bg-indigo { background: rgba(99, 102, 241, 0.2); color: #a5b4fc; }
.slide-text-bg.bg-emerald { background: rgba(16, 185, 129, 0.2); color: #6ee7b7; }
.slide-text-bg.bg-rose { background: rgba(244, 63, 94, 0.2); color: #fda4af; }
.slide-text-bg.bg-cyan { background: rgba(6, 182, 212, 0.2); color: #67e8f9; }

.slide-text-gradient {
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 700;
  display: inline-block;
}
.gradient-sunset { background-image: linear-gradient(135deg, #f43f5e 0%, #fb923c 100%); }
.gradient-aurora { background-image: linear-gradient(135deg, #06b6d4 0%, #10b981 50%, #6366f1 100%); }
.gradient-ocean { background-image: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); }
.gradient-purple { background-image: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); }
.gradient-gold { background-image: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); }

/* ── Custom Slide Background Layers ───────────────────────────────────── */
.slide-bg-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}
.slide.slide--has-custom-bg {
  background: transparent !important;
}
.slide-bg-gradient-dark { background: radial-gradient(circle at 50% 0%, #1e1b4b 0%, #0f172a 70%); }
.slide-bg-gradient-indigo { background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #0f172a 100%); }
.slide-bg-gradient-sunset { background: linear-gradient(135deg, #4c0519 0%, #1f1235 50%, #0f172a 100%); }
.slide-bg-gradient-aurora { background: linear-gradient(135deg, #022c22 0%, #0f172a 50%, #172554 100%); }
.slide-bg-gradient-ocean { background: linear-gradient(135deg, #082f49 0%, #0f172a 100%); }
.slide-bg-pattern-grid {
  background-image: linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px);
  background-size: 32px 32px;
}
.slide-bg-pattern-dots {
  background-image: radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px);
  background-size: 20px 20px;
}

/* ── Reusable Layout Masters ─────────────────────────────────────────── */
.slide-layout {
  position: relative;
  z-index: 1;
}
.slide-layout-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: center;
  width: 100%;
  margin: 0.5rem 0;
}
.slide-layout-cover {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
  min-height: 260px;
  gap: 0.75rem;
}
.slide-layout-quote {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem 2.5rem;
  margin: 1rem 0;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 16px;
  border-left: 4px solid var(--brand-500, #6366f1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  font-size: 1.15em;
}
.slide-layout-showcase {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 2rem;
  align-items: center;
  width: 100%;
}
.slide-layout-col {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* ── Header, Footer, Watermark & Dividers ─────────────────────────────── */
.slide-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-bottom: 0.5rem;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid var(--border, rgba(255, 255, 255, 0.1));
  font-size: 0.8em;
  opacity: 0.8;
  position: relative;
  z-index: 1;
}
.slide-header-bar .header-logo {
  margin-right: 0.4rem;
  font-size: 1.1em;
}
.slide-header-bar .header-category {
  text-transform: uppercase;
  font-weight: 700;
  font-size: 0.75em;
  letter-spacing: 0.08em;
  color: var(--brand-500, #6366f1);
}

.slide-footer-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-top: 0.5rem;
  margin-top: auto;
  border-top: 1px solid var(--border, rgba(255, 255, 255, 0.1));
  font-size: 0.75em;
  opacity: 0.65;
  position: relative;
  z-index: 1;
}

.slide-watermark {
  position: absolute;
  top: 14px;
  right: 20px;
  font-size: 0.65em;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(244, 63, 94, 0.15);
  color: #f43f5e;
  border: 1px solid rgba(244, 63, 94, 0.3);
  pointer-events: none;
  z-index: 10;
}

.slide-divider {
  height: 2px;
  width: 100%;
  margin: 1rem 0;
  position: relative;
  z-index: 1;
}
.slide-divider.divider-gradient {
  background: linear-gradient(90deg, transparent, var(--brand-500, #6366f1), transparent);
}
.slide-divider.divider-glow {
  background: #6366f1;
  box-shadow: 0 0 12px rgba(99, 102, 241, 0.7);
}
.slide-divider.divider-dots {
  border-bottom: 2px dashed rgba(255, 255, 255, 0.2);
  height: 0;
  background: none;
}
`;

export const RICH_CONTENT_RUNTIME = `(function () {
  window.deckrunRenderRichContent = function (root) {
    if (!root) return Promise.resolve();

    // 1. Render KaTeX math
    if (window.katex) {
      var mathNodes = root.querySelectorAll('.math-source:not([data-rendered])');
      for (var i = 0; i < mathNodes.length; i++) {
        var node = mathNodes[i];
        var isDisplay = node.getAttribute('data-display') === 'true';
        try {
          window.katex.render(node.textContent || '', node, {
            displayMode: isDisplay,
            throwOnError: false,
          });
          node.setAttribute('data-rendered', 'true');
        } catch (e) {
          console.error('KaTeX error:', e);
        }
      }
    }

    // 2. Render Mermaid diagrams
    var mermaidPromises = [];
    if (window.mermaid) {
      try {
        window.mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'loose',
        });
      } catch (e) {}

      var codeBlocks = root.querySelectorAll('pre code.language-mermaid, pre code.lang-mermaid, pre.mermaid, div.mermaid:not([data-rendered="true"])');
      for (var j = 0; j < codeBlocks.length; j++) {
        (function (codeEl) {
          var preEl = codeEl.closest('pre') || codeEl;
          if (preEl.getAttribute('data-rendered') === 'true') return;
          preEl.setAttribute('data-rendered', 'true');
          var code = codeEl.textContent ? codeEl.textContent.trim() : '';
          if (!code) return;

          var container = document.createElement('div');
          container.className = 'mermaid';
          preEl.parentNode.insertBefore(container, preEl);
          preEl.style.display = 'none';

          var id = 'mermaid-' + Math.random().toString(36).slice(2, 10);
          try {
            var p = window.mermaid.render(id, code)
              .then(function (res) {
                container.innerHTML = res.svg;
                preEl.remove();
              })
              .catch(function (err) {
                container.className = 'mermaid-error';
                container.textContent = 'Mermaid Error: ' + (err && err.message ? err.message : String(err));
                preEl.remove();
              });
            mermaidPromises.push(p);
          } catch (err) {
            container.className = 'mermaid-error';
            container.textContent = 'Mermaid Error: ' + (err && err.message ? err.message : String(err));
          }
        })(codeBlocks[j]);
      }
    }

    return Promise.all(mermaidPromises).then(function () {});
  };
})();
`;
