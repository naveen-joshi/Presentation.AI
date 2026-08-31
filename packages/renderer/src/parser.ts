import { marked } from "marked";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Capture TeX before the regular Markdown tokenizer sees it. This keeps
 * operators such as `*` and `_` inside a formula instead of turning them into
 * emphasis. The browser can then render these deliberately marked nodes with
 * KaTeX after fonts and layout styles are available.
 */
marked.use({
  extensions: [
    {
      name: "deckrunBlockMath",
      level: "block",
      tokenizer(src) {
        const dollars = /^\$\$[ \t]*\n?([\s\S]+?)\n?[ \t]*\$\$(?:[ \t]*(?:\n|$))/.exec(src);
        const brackets = /^\\\[[ \t]*\n?([\s\S]+?)\n?[ \t]*\\\](?:[ \t]*(?:\n|$))/.exec(src);
        const match = dollars ?? brackets;
        if (!match) return;
        return {
          type: "deckrunBlockMath",
          raw: match[0],
          text: match[1].trim(),
          display: true,
        };
      },
      renderer(token) {
        return `<div class="math-source" data-display="true">${escapeHtml(String(token.text))}</div>\n`;
      },
    },
    {
      name: "deckrunInlineMath",
      level: "inline",
      start(src) {
        const dollar = src.indexOf("$");
        const paren = src.indexOf("\\(");
        if (dollar < 0) return paren < 0 ? undefined : paren;
        if (paren < 0) return dollar;
        return Math.min(dollar, paren);
      },
      tokenizer(src) {
        // A closing dollar followed by a digit is treated as currency rather
        // than math, so ordinary prose like "$5 and $10" stays untouched.
        const dollars = /^\$(?!\s|\$)((?:\\.|[^\\$\n])*?[^\\$\s])\$(?!\$|\d)/.exec(src);
        const parens = /^\\\(((?:\\.|[^\\\n])*?)\\\)/.exec(src);
        const match = dollars ?? parens;
        if (!match) return;
        return {
          type: "deckrunInlineMath",
          raw: match[0],
          text: match[1],
          display: false,
        };
      },
      renderer(token) {
        return `<span class="math-source" data-display="false">${escapeHtml(String(token.text))}</span>`;
      },
    },
    {
      name: "deckrunRevealMarker",
      level: "inline",
      start(src) {
        const at = src.indexOf("{reveal}");
        return at < 0 ? undefined : at;
      },
      tokenizer(src) {
        const match = /^\{reveal\}/.exec(src);
        if (!match) return;
        return { type: "deckrunRevealMarker", raw: match[0] };
      },
      renderer() {
        return '<span class="deckrun-fragment-marker" aria-hidden="true"></span>';
      },
    },
  ],
});

export interface PositionedImage {
  src: string;
  alt: string;
  opacity: number;
}

export interface Slide {
  html: string;
  bgImage?: PositionedImage;
  rightImage?: PositionedImage;
  leftImage?: PositionedImage;
  notes?: string;
  bg?: string;
}

type ImagePosition = "inline" | "right" | "left" | "bg";

function parseImageDirective(title: string | undefined | null): {
  position: ImagePosition;
  opacity: number;
} {
  if (!title) return { position: "inline", opacity: 1 };

  const t = title.trim().toLowerCase();
  let position: ImagePosition = "inline";

  if (t.includes("right")) position = "right";
  else if (t.includes("left")) position = "left";
  else if (t.includes("bg")) position = "bg";

  const opacityMatch = t.match(/opacity[=:]?\s*([0-9]*\.?[0-9]+)/);
  const opacity = opacityMatch
    ? Math.min(1, Math.max(0, parseFloat(opacityMatch[1])))
    : 1;

  return { position, opacity };
}

function renderSvgChart(type: string, title: string, content: string): string {
  const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);
  const colors = [
    "#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#3b82f6"
  ];

  let labels: string[] = [];
  const series: Array<{ name: string; data: number[] }> = [];

  // Check if series/labels format
  for (const line of lines) {
    if (line.toLowerCase().startsWith("labels:")) {
      labels = line.slice(7).split(",").map((s) => s.trim()).filter(Boolean);
    } else if (line.toLowerCase().startsWith("series:")) {
      const match = line.slice(7).match(/(.*?)\s*\[(.*?)\]/);
      if (match) {
        const name = match[1].trim() || `Series ${series.length + 1}`;
        const data = match[2].split(",").map((v) => parseFloat(v.trim()) || 0);
        series.push({ name, data });
      }
    } else if (line.includes(":")) {
      // Simple key: value format
      const [k, v] = line.split(":");
      labels.push(k.trim());
      const num = parseFloat(v.trim()) || 0;
      if (series.length === 0) series.push({ name: "Value", data: [] });
      series[0].data.push(num);
    }
  }

  if (series.length === 0 || labels.length === 0) {
    return `<div class="slide-chart-box"><div class="chart-title">${title || "Chart"}</div><div class="chart-empty">No chart data provided</div></div>`;
  }

  const chartType = (type || "bar").toLowerCase();
  let svgInner: string;
  const svgWidth = 500;
  const svgHeight = 220;
  const padding = { top: 30, right: 30, bottom: 40, left: 50 };
  const plotW = svgWidth - padding.left - padding.right;
  const plotH = svgHeight - padding.top - padding.bottom;

  if (chartType === "donut" || chartType === "pie") {
    const data = series[0].data;
    const total = data.reduce((a, b) => a + b, 0) || 1;
    const cx = svgWidth / 2 - 60;
    const cy = svgHeight / 2 + 10;
    const radius = 70;
    const innerRadius = chartType === "donut" ? 42 : 0;
    let currentAngle = -Math.PI / 2;

    const slices = data.map((val, idx) => {
      const sliceAngle = (val / total) * 2 * Math.PI;
      const x1 = cx + radius * Math.cos(currentAngle);
      const y1 = cy + radius * Math.sin(currentAngle);
      const x2 = cx + radius * Math.cos(currentAngle + sliceAngle);
      const y2 = cy + radius * Math.sin(currentAngle + sliceAngle);

      const ix1 = cx + innerRadius * Math.cos(currentAngle + sliceAngle);
      const iy1 = cy + innerRadius * Math.sin(currentAngle + sliceAngle);
      const ix2 = cx + innerRadius * Math.cos(currentAngle);
      const iy2 = cy + innerRadius * Math.sin(currentAngle);

      const largeArc = sliceAngle > Math.PI ? 1 : 0;
      const pathData = innerRadius > 0
        ? `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix2} ${iy2} Z`
        : `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

      currentAngle += sliceAngle;
      const color = colors[idx % colors.length];
      return `<path d="${pathData}" fill="${color}" opacity="0.9" class="chart-slice" data-label="${labels[idx] || ""}" data-value="${val}" />`;
    });

    const legend = labels.map((l, i) => {
      const color = colors[i % colors.length];
      const val = data[i] || 0;
      const pct = Math.round((val / total) * 100);
      return `<g transform="translate(340, ${40 + i * 24})"><rect width="12" height="12" rx="3" fill="${color}"/><text x="18" y="10" font-size="11" fill="currentColor" opacity="0.85">${l} (${pct}%)</text></g>`;
    }).join("");

    svgInner = `${slices.join("")}${legend}`;
  } else if (chartType === "line" || chartType === "area") {
    // Line & Area Chart
    const allVals = series.flatMap((s) => s.data);
    const maxVal = Math.max(...allVals, 10);
    const stepX = plotW / Math.max(labels.length - 1, 1);

    // Grid lines
    const grid = [0, 0.5, 1].map((pct) => {
      const y = padding.top + plotH * (1 - pct);
      const val = Math.round(maxVal * pct);
      return `<line x1="${padding.left}" y1="${y}" x2="${svgWidth - padding.right}" y2="${y}" stroke="currentColor" stroke-opacity="0.1" stroke-dasharray="3,3"/><text x="${padding.left - 8}" y="${y + 4}" font-size="9" text-anchor="end" fill="currentColor" opacity="0.5">${val}</text>`;
    }).join("");

    // Lines & Area paths
    const linesSvg = series.map((s, sIdx) => {
      const color = colors[sIdx % colors.length];
      const points = s.data.map((val, idx) => {
        const x = padding.left + idx * stepX;
        const y = padding.top + plotH - (val / maxVal) * plotH;
        return { x, y, val };
      });

      const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");
      const areaPath = `M ${points[0].x} ${padding.top + plotH} L ${polyline} L ${points[points.length - 1].x} ${padding.top + plotH} Z`;
      const dots = points.map((p, pIdx) => `<circle cx="${p.x}" cy="${p.y}" r="4" fill="${color}" stroke="#fff" stroke-width="1.5" class="chart-dot"><title>${labels[pIdx]}: ${p.val}</title></circle>`).join("");

      return `${chartType === "area" ? `<path d="${areaPath}" fill="${color}" fill-opacity="0.18"/>` : ""}<polyline fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="${polyline}" class="chart-line"/>${dots}`;
    }).join("");

    // X axis labels
    const xLabels = labels.map((l, i) => {
      const x = padding.left + i * stepX;
      return `<text x="${x}" y="${svgHeight - 12}" font-size="10" text-anchor="middle" fill="currentColor" opacity="0.75">${l}</text>`;
    }).join("");

    svgInner = `${grid}${linesSvg}${xLabels}`;
  } else {
    // Default: Multi-bar / Single-bar chart
    const allVals = series.flatMap((s) => s.data);
    const maxVal = Math.max(...allVals, 10);
    const groupW = plotW / labels.length;
    const barW = Math.min((groupW * 0.7) / series.length, 28);

    // Grid lines
    const grid = [0, 0.5, 1].map((pct) => {
      const y = padding.top + plotH * (1 - pct);
      const val = Math.round(maxVal * pct);
      return `<line x1="${padding.left}" y1="${y}" x2="${svgWidth - padding.right}" y2="${y}" stroke="currentColor" stroke-opacity="0.1" stroke-dasharray="3,3"/><text x="${padding.left - 8}" y="${y + 4}" font-size="9" text-anchor="end" fill="currentColor" opacity="0.5">${val}</text>`;
    }).join("");

    // Bars
    const bars = labels.map((lbl, lIdx) => {
      const groupX = padding.left + lIdx * groupW + (groupW - barW * series.length) / 2;
      const seriesBars = series.map((s, sIdx) => {
        const val = s.data[lIdx] || 0;
        const barH = (val / maxVal) * plotH;
        const x = groupX + sIdx * barW;
        const y = padding.top + plotH - barH;
        const color = colors[sIdx % colors.length];
        return `<rect x="${x}" y="${y}" width="${Math.max(barW - 3, 2)}" height="${barH}" rx="3" fill="${color}" class="chart-bar"><title>${lbl} (${s.name}): ${val}</title></rect>`;
      }).join("");

      const labelX = padding.left + lIdx * groupW + groupW / 2;
      const labelText = `<text x="${labelX}" y="${svgHeight - 12}" font-size="10" text-anchor="middle" fill="currentColor" opacity="0.75">${lbl}</text>`;
      return `${seriesBars}${labelText}`;
    }).join("");

    // Legend if multiple series
    const legend = series.length > 1 ? series.map((s, i) => {
      const color = colors[i % colors.length];
      return `<g transform="translate(${svgWidth - padding.right - (series.length - i) * 80}, 16)"><rect width="8" height="8" rx="2" fill="${color}"/><text x="12" y="8" font-size="9" fill="currentColor" opacity="0.8">${s.name}</text></g>`;
    }).join("") : "";

    svgInner = `${grid}${bars}${legend}`;
  }

  return `<div class="slide-chart-box">${title ? `<div class="chart-header"><h4 class="chart-title">${title}</h4></div>` : ""}<div class="chart-svg-wrap"><svg viewBox="0 0 ${svgWidth} ${svgHeight}" class="slide-chart-svg" preserveAspectRatio="xMidYMid meet">${svgInner}</svg></div></div>`;
}

function preprocessDirectives(md: string): string {
  let res = md;

  // 1. Interactive Charts: :::chart(type="bar|line|donut|area", title="...") ... :::
  res = res.replace(/:::chart(?:\((.*?)\))?[ \t]*\n([\s\S]*?)\n[ \t]*:::/g, (_, args: string | undefined, content: string) => {
    const a = args || "";
    const typeMatch = a.match(/type="([^"]*)"/);
    const titleMatch = a.match(/title="([^"]*)"/);
    const type = typeMatch ? typeMatch[1] : "bar";
    const title = titleMatch ? titleMatch[1] : "";
    return renderSvgChart(type, title, content);
  });

  // 2. Bento Grid: :::bento ... ::: and :::box(span=2, row=2, bg="gradient") ... :::
  res = res.replace(/:::bento[ \t]*\n([\s\S]*?)\n[ \t]*:::/g, (_, content: string) => {
    return `<div class="slide-bento-grid">\n\n${content}\n\n</div>`;
  });

  res = res.replace(/:::box(?:\((.*?)\))?[ \t]*\n([\s\S]*?)\n[ \t]*:::/g, (_, args: string | undefined, content: string) => {
    const a = args || "";
    const spanMatch = a.match(/span=([1234])/);
    const rowMatch = a.match(/row=([1234])/);
    const bgMatch = a.match(/bg="([^"]*)"/);
    const span = spanMatch ? `col-span-${spanMatch[1]}` : "col-span-1";
    const row = rowMatch ? `row-span-${rowMatch[1]}` : "";
    const bg = bgMatch ? `bento-bg-${bgMatch[1]}` : "bento-bg-glass";
    return `<div class="bento-box ${span} ${row} ${bg}">\n\n${content}\n\n</div>`;
  });

  // 3. Interactive Timeline & Milestones: :::timeline ... :::
  res = res.replace(/:::timeline[ \t]*\n([\s\S]*?)\n[ \t]*:::/g, (_, content: string) => {
    return `<div class="slide-timeline">\n\n${content}\n\n</div>`;
  });

  res = res.replace(/:::milestone\((.*?)\)[ \t]*\n([\s\S]*?)\n[ \t]*:::/g, (_, args: string, content: string) => {
    const dateMatch = args.match(/date="([^"]*)"/);
    const titleMatch = args.match(/title="([^"]*)"/);
    const statusMatch = args.match(/status="([^"]*)"/);
    const date = dateMatch ? dateMatch[1] : "Phase";
    const title = titleMatch ? titleMatch[1] : "";
    const status = statusMatch ? statusMatch[1] : "upcoming";
    return `<div class="timeline-milestone milestone-${status}"><div class="milestone-badge">${date}</div><div class="milestone-body"><h4 class="milestone-title">${title}</h4><div class="milestone-desc">\n\n${content}\n\n</div></div></div>`;
  });

  // 4. Badges: :::badge(text="Live", color="emerald", pulse=true)
  res = res.replace(/:::badge\((.*?)\)/g, (_, args: string) => {
    const textMatch = args.match(/text="([^"]*)"/);
    const colorMatch = args.match(/color="([^"]*)"/);
    const pulseMatch = args.match(/pulse=(true|false)/);
    const text = textMatch ? textMatch[1] : "Badge";
    const color = colorMatch ? colorMatch[1] : "brand";
    const isPulse = pulseMatch && pulseMatch[1] === "true";
    return `<span class="slide-badge badge-${color}">${isPulse ? '<span class="badge-pulse-dot"></span>' : ""}${text}</span>`;
  });

  // 5. Metric: :::metric(value="+340%", label="Growth", sub="vs Q3")
  res = res.replace(/:::metric\((.*?)\)/g, (_, args: string) => {
    const valueMatch = args.match(/value="([^"]*)"/);
    const labelMatch = args.match(/label="([^"]*)"/);
    const subMatch = args.match(/sub="([^"]*)"/);
    const val = valueMatch ? valueMatch[1] : "";
    const lbl = labelMatch ? labelMatch[1] : "";
    const sub = subMatch ? subMatch[1] : "";
    return `<div class="slide-metric"><div class="metric-val">${val}</div><div class="metric-label">${lbl}</div>${sub ? `<div class="metric-sub">${sub}</div>` : ""}</div>`;
  });

  // 6. Callout: :::callout(type="tip") ... :::
  res = res.replace(/:::callout(?:\((?:type="([^"]*)")?\))?[ \t]*\n([\s\S]*?)\n[ \t]*:::/g, (_, type: string | undefined, content: string) => {
    const t = type || "tip";
    const icon = t === "warning" ? "⚠️" : t === "important" ? "⚡" : t === "info" ? "ℹ️" : "💡";
    return `<div class="slide-callout callout-${t}"><div class="callout-icon">${icon}</div><div class="callout-body">\n\n${content}\n\n</div></div>`;
  });

  // 7. Card: :::card(title="Title", icon="Icon") ... :::
  res = res.replace(/:::card\((.*?)\)[ \t]*\n([\s\S]*?)\n[ \t]*:::/g, (_, args: string, content: string) => {
    const titleMatch = args.match(/title="([^"]*)"/);
    const iconMatch = args.match(/icon="([^"]*)"/);
    const title = titleMatch ? titleMatch[1] : "";
    const icon = iconMatch ? iconMatch[1] : "";
    return `<div class="slide-card"><div class="slide-card-header">${icon ? `<span class="slide-card-icon">${icon}</span>` : ""}${title ? `<h4 class="slide-card-title">${title}</h4>` : ""}</div><div class="slide-card-body">\n\n${content}\n\n</div></div>`;
  });

  // 8. Grid: :::grid(cols=3) ... :::
  res = res.replace(/:::grid(?:\((?:cols=([234]))?\))?[ \t]*\n([\s\S]*?)\n[ \t]*:::/g, (_, cols: string | undefined, content: string) => {
    const c = cols || "2";
    return `<div class="slide-grid grid-cols-${c}">\n\n${content}\n\n</div>`;
  });

  // 9. Terminal: :::terminal(title="bash") ... :::
  res = res.replace(/:::terminal(?:\((?:title="([^"]*)")?\))?[ \t]*\n([\s\S]*?)\n[ \t]*:::/g, (_, title: string | undefined, content: string) => {
    return `<div class="slide-terminal"><div class="terminal-header"><span class="terminal-dot red"></span><span class="terminal-dot yellow"></span><span class="terminal-dot green"></span><span class="terminal-title">${title || "terminal"}</span></div><div class="terminal-body">\n\n${content}\n\n</div></div>`;
  });

  // 10. Stepwise Reveal Fragments ({click} / {v-click})
  res = res.replace(/\{v?-?click\}/gi, '<span class="slide-fragment" data-fragment="true"></span>');

  // 11. Dynamic Text Colors, Backgrounds, and Gradients
  res = res.replace(/\{color:([#a-zA-Z0-9_-]+)\}([\s\S]*?)\{\/color\}/g, (_, color: string, text: string) => {
    if (color.startsWith("#") || color.startsWith("rgb")) {
      return `<span class="slide-text-color" style="color: ${color}">${text}</span>`;
    }
    return `<span class="slide-text-color text-color-${color}">${text}</span>`;
  });

  res = res.replace(/\{bg:([#a-zA-Z0-9_-]+)\}([\s\S]*?)\{\/bg\}/g, (_, bg: string, text: string) => {
    if (bg.startsWith("#") || bg.startsWith("rgb")) {
      return `<span class="slide-text-bg" style="background-color: ${bg}">${text}</span>`;
    }
    return `<span class="slide-text-bg bg-${bg}">${text}</span>`;
  });

  res = res.replace(/\{gradient:([a-zA-Z0-9_-]+)\}([\s\S]*?)\{\/gradient\}/g, (_, grad: string, text: string) => {
    return `<span class="slide-text-gradient gradient-${grad}">${text}</span>`;
  });

  res = res.replace(/\{font:([a-zA-Z0-9_\s-]+)\}([\s\S]*?)\{\/font\}/g, (_, font: string, text: string) => {
    const cleanFont = font.trim();
    return `<span class="slide-custom-font" style="font-family: '${cleanFont}', var(--font-display), sans-serif">${text}</span>`;
  });

  // 12. Reusable Layout Masters: :::layout(split|cover|quote|showcase) ... ::: & :::col ... :::
  res = res.replace(/:::layout\((split|cover|quote|showcase)\)[ \t]*\n([\s\S]*?)\n[ \t]*:::/g, (_, layout: string, content: string) => {
    return `<div class="slide-layout slide-layout-${layout}">\n\n${content}\n\n</div>`;
  });

  res = res.replace(/:::col[ \t]*\n([\s\S]*?)\n[ \t]*:::/g, (_, content: string) => {
    return `<div class="slide-layout-col">\n\n${content}\n\n</div>`;
  });

  // 13. Header Bar: :::header(title="...", category="...", logo="...")
  res = res.replace(/:::header\((.*?)\)/g, (_, args: string) => {
    const titleMatch = args.match(/title="([^"]*)"/);
    const catMatch = args.match(/category="([^"]*)"/);
    const logoMatch = args.match(/logo="([^"]*)"/);
    const title = titleMatch ? titleMatch[1] : "";
    const category = catMatch ? catMatch[1] : "";
    const logo = logoMatch ? logoMatch[1] : "";
    return `<div class="slide-header-bar"><div class="header-left">${logo ? `<span class="header-logo">${logo}</span>` : ""}<span class="header-title">${title}</span></div>${category ? `<span class="header-category">${category}</span>` : ""}</div>`;
  });

  // 14. Footer Bar & Copyright: :::footer(left="...", center="...", right="...")
  res = res.replace(/:::footer\((.*?)\)/g, (_, args: string) => {
    const leftMatch = args.match(/left="([^"]*)"/);
    const centerMatch = args.match(/center="([^"]*)"/);
    const rightMatch = args.match(/right="([^"]*)"/);
    const left = leftMatch ? leftMatch[1] : "";
    const center = centerMatch ? centerMatch[1] : "";
    const right = rightMatch ? rightMatch[1] : "";
    return `<div class="slide-footer-bar"><div class="footer-left">${left}</div>${center ? `<div class="footer-center">${center}</div>` : ""}<div class="footer-right">${right}</div></div>`;
  });

  // 15. Slide Watermark: :::watermark(text="CONFIDENTIAL")
  res = res.replace(/:::watermark\((.*?)\)/g, (_, args: string) => {
    const textMatch = args.match(/text="([^"]*)"/);
    const text = textMatch ? textMatch[1] : "CONFIDENTIAL";
    return `<div class="slide-watermark">${text}</div>`;
  });

  // 16. Visual Dividers: :::divider(type="gradient|solid|glow|dots")
  res = res.replace(/:::divider(?:\((.*?)\))?/g, (_, args: string | undefined) => {
    const typeMatch = (args || "").match(/type="([^"]*)"/);
    const type = typeMatch ? typeMatch[1] : "gradient";
    return `<div class="slide-divider divider-${type}"></div>`;
  });

  return res;
}

export function parseSlides(markdown: string): Slide[] {
  // Normalize line endings
  const normalized = markdown.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Split on slide separator: "---" on its own line (with optional surrounding blank lines)
  const rawSlides = normalized.split(/\n[ \t]*---[ \t]*\n/);

  return rawSlides
    .map((raw) => raw.trim())
    .filter((raw) => raw.length > 0)
    .map((raw) => {
      const slide: Slide = { html: "" };

      // Extract speaker notes (<!-- notes: ... --> at end)
      const notesMatch = raw.match(/<!--\s*notes?:\s*([\s\S]*?)\s*-->/i);
      if (notesMatch) {
        slide.notes = notesMatch[1].trim();
      }
      let processedMd = raw.replace(/<!--\s*notes?:\s*[\s\S]*?\s*-->/gi, "");

      // Extract slide background directive: <!-- bg: ... -->
      const bgMatch = processedMd.match(/<!--\s*bg:\s*([^>]+?)\s*-->/i);
      let customBgHtml = "";
      if (bgMatch) {
        const bgVal = bgMatch[1].trim();
        slide.bg = bgVal;
        processedMd = processedMd.replace(bgMatch[0], "");
        if (bgVal.startsWith("gradient-") || bgVal.startsWith("pattern-")) {
          customBgHtml = `<div class="slide-bg-layer slide-bg-${bgVal}"></div>`;
        } else if (bgVal.startsWith("#") || bgVal.startsWith("rgb") || bgVal.startsWith("linear-") || bgVal.startsWith("radial-")) {
          const style = bgVal.includes("gradient") ? `background: ${bgVal}` : `background-color: ${bgVal}`;
          customBgHtml = `<div class="slide-bg-layer" style="${style}"></div>`;
        }
      }

      // Extract slide watermark directive: <!-- watermark: ... -->
      const wmMatch = processedMd.match(/<!--\s*watermark:\s*([^>]+?)\s*-->/i);
      let watermarkHtml = "";
      if (wmMatch) {
        const wmText = wmMatch[1].trim();
        watermarkHtml = `<div class="slide-watermark">${wmText}</div>`;
        processedMd = processedMd.replace(wmMatch[0], "");
      }

      // Find positioned images via title attribute: ![alt](src "right opacity:0.7")
      const imgRegex =
        /!\[([^\]]*)\]\(([^\s)]+)(?:\s+"([^"]*)")?\)/g;
      const toRemove: string[] = [];
      let match: RegExpExecArray | null;

      // Reset lastIndex before use since we're reusing the regex
      imgRegex.lastIndex = 0;

      while ((match = imgRegex.exec(raw)) !== null) {
        const [full, alt, src, titleAttr] = match;
        const { position, opacity } = parseImageDirective(titleAttr);

        if (position === "bg") {
          slide.bgImage = { src, alt, opacity };
          toRemove.push(full);
        } else if (position === "right") {
          slide.rightImage = { src, alt, opacity };
          toRemove.push(full);
        } else if (position === "left") {
          slide.leftImage = { src, alt, opacity };
          toRemove.push(full);
        }
      }

      for (const item of toRemove) {
        // Replace only first occurrence (the matched image)
        processedMd = processedMd.replace(item, "");
      }

      // Preprocess rich layout directives (grid, card, metric, callout, terminal, layouts, colors)
      const preprocessed = preprocessDirectives(processedMd.trim());

      // Render remaining markdown to HTML
      const parsedHtml = marked.parse(preprocessed) as string;
      slide.html = `${customBgHtml}${watermarkHtml}${parsedHtml}`;

      return slide;
    });
}
