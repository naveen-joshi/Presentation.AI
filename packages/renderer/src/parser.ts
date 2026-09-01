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

function parseAttr(args: string | undefined | null, key: string, defaultValue = ""): string {
  if (!args) return defaultValue;
  const regex = new RegExp(`(?:^|[\\s,(])${key}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s,)]+))`, "i");
  const match = args.match(regex);
  if (!match) return defaultValue;
  return (match[1] ?? match[2] ?? match[3] ?? defaultValue).trim();
}

function preprocessDirectives(md: string): string {
  let res = md;

  // 1. Inner Leaves: Cards & Bento Boxes (parse before grids so nested items are rendered cleanly)
  res = res.replace(/(?:^|\n)[ \t]*:::card(?:\((.*?)\))?[ \t]*\n([\s\S]*?)\n[ \t]*:::/g, (_, args: string | undefined, content: string) => {
    const title = parseAttr(args, "title", "");
    const icon = parseAttr(args, "icon", "");
    return `\n<div class="slide-card"><div class="slide-card-header">${icon ? `<span class="slide-card-icon">${icon}</span>` : ""}${title ? `<h4 class="slide-card-title">${title}</h4>` : ""}</div><div class="slide-card-body">\n\n${content}\n\n</div></div>\n`;
  });

  res = res.replace(/(?:^|\n)[ \t]*:::box(?:\((.*?)\))?[ \t]*\n([\s\S]*?)\n[ \t]*:::/g, (_, args: string | undefined, content: string) => {
    const spanVal = parseAttr(args, "span", "1");
    const rowVal = parseAttr(args, "row", "");
    const bgVal = parseAttr(args, "bg", "glass");
    const span = `col-span-${spanVal}`;
    const row = rowVal ? `row-span-${rowVal}` : "";
    const bg = `bento-bg-${bgVal}`;
    return `\n<div class="bento-box ${span} ${row} ${bg}">\n\n${content}\n\n</div>\n`;
  });

  res = res.replace(/(?:^|\n)[ \t]*:::milestone\((.*?)\)[ \t]*\n([\s\S]*?)\n[ \t]*:::/g, (_, args: string, content: string) => {
    const date = parseAttr(args, "date", "Phase");
    const title = parseAttr(args, "title", "");
    const status = parseAttr(args, "status", "upcoming");
    return `\n<div class="timeline-milestone milestone-${status}"><div class="milestone-badge">${date}</div><div class="milestone-body"><h4 class="milestone-title">${title}</h4><div class="milestone-desc">\n\n${content}\n\n</div></div></div>\n`;
  });

  res = res.replace(/(?:^|\n)[ \t]*:::col[ \t]*\n([\s\S]*?)\n[ \t]*:::/g, (_, content: string) => {
    return `\n<div class="slide-layout-col">\n\n${content}\n\n</div>\n`;
  });

  // 2. Outer Containers: Grids, Bento, Timelines, Layouts
  res = res.replace(/(?:^|\n)[ \t]*:::grid(?:\((.*?)\))?[ \t]*\n([\s\S]*?)\n[ \t]*:::/g, (_, args: string | undefined, content: string) => {
    const cols = parseAttr(args, "cols", "2");
    return `\n<div class="slide-grid grid-cols-${cols}">\n\n${content}\n\n</div>\n`;
  });

  res = res.replace(/(?:^|\n)[ \t]*:::bento[ \t]*\n([\s\S]*?)\n[ \t]*:::/g, (_, content: string) => {
    return `\n<div class="slide-bento-grid">\n\n${content}\n\n</div>\n`;
  });

  res = res.replace(/(?:^|\n)[ \t]*:::timeline[ \t]*\n([\s\S]*?)\n[ \t]*:::/g, (_, content: string) => {
    return `\n<div class="slide-timeline">\n\n${content}\n\n</div>\n`;
  });

  res = res.replace(/(?:^|\n)[ \t]*:::layout\((.*?)\)[ \t]*\n([\s\S]*?)\n[ \t]*:::/g, (_, args: string, content: string) => {
    const layout = parseAttr(args, "type", args.replace(/[()]/g, "").trim()) || "split";
    return `\n<div class="slide-layout slide-layout-${layout}">\n\n${content}\n\n</div>\n`;
  });

  // 3. Standalone Block Containers: Charts, Terminal, Callouts
  res = res.replace(/(?:^|\n)[ \t]*:::chart(?:\((.*?)\))?[ \t]*\n([\s\S]*?)\n[ \t]*:::/g, (_, args: string | undefined, content: string) => {
    const type = parseAttr(args, "type", "bar");
    const title = parseAttr(args, "title", "");
    return renderSvgChart(type, title, content);
  });

  res = res.replace(/(?:^|\n)[ \t]*:::callout(?:\((.*?)\))?[ \t]*\n([\s\S]*?)\n[ \t]*:::/g, (_, args: string | undefined, content: string) => {
    const t = parseAttr(args, "type", "tip");
    const icon = t === "warning" ? "⚠️" : t === "important" ? "⚡" : t === "info" ? "ℹ️" : "💡";
    return `\n<div class="slide-callout callout-${t}"><div class="callout-icon">${icon}</div><div class="callout-body">\n\n${content}\n\n</div></div>\n`;
  });

  res = res.replace(/(?:^|\n)[ \t]*:::terminal(?:\((.*?)\))?[ \t]*\n([\s\S]*?)\n[ \t]*:::/g, (_, args: string | undefined, content: string) => {
    const title = parseAttr(args, "title", "terminal");
    return `\n<div class="slide-terminal"><div class="terminal-header"><span class="terminal-dot red"></span><span class="terminal-dot yellow"></span><span class="terminal-dot green"></span><span class="terminal-title">${title}</span></div><div class="terminal-body">\n\n${content}\n\n</div></div>\n`;
  });

  // 4. Inline Components: Badges, Metrics, Header, Footer, Watermark, Dividers
  res = res.replace(/:::badge\((.*?)\)/g, (_, args: string) => {
    const text = parseAttr(args, "text", "Badge");
    const color = parseAttr(args, "color", "brand");
    const isPulse = parseAttr(args, "pulse", "false") === "true";
    return `<span class="slide-badge badge-${color}">${isPulse ? '<span class="badge-pulse-dot"></span>' : ""}${text}</span>`;
  });

  res = res.replace(/:::metric\((.*?)\)/g, (_, args: string) => {
    const val = parseAttr(args, "value", "");
    const lbl = parseAttr(args, "label", "");
    const sub = parseAttr(args, "sub", "");
    return `<div class="slide-metric"><div class="metric-val">${val}</div><div class="metric-label">${lbl}</div>${sub ? `<div class="metric-sub">${sub}</div>` : ""}</div>`;
  });

  res = res.replace(/:::header\((.*?)\)/g, (_, args: string) => {
    const title = parseAttr(args, "title", "");
    const category = parseAttr(args, "category", "");
    const logo = parseAttr(args, "logo", "");
    return `<div class="slide-header-bar"><div class="header-left">${logo ? `<span class="header-logo">${logo}</span>` : ""}<span class="header-title">${title}</span></div>${category ? `<span class="header-category">${category}</span>` : ""}</div>`;
  });

  res = res.replace(/:::footer\((.*?)\)/g, (_, args: string) => {
    const left = parseAttr(args, "left", "");
    const center = parseAttr(args, "center", "");
    const right = parseAttr(args, "right", "");
    return `<div class="slide-footer-bar"><div class="footer-left">${left}</div>${center ? `<div class="footer-center">${center}</div>` : ""}<div class="footer-right">${right}</div></div>`;
  });

  res = res.replace(/:::watermark\((.*?)\)/g, (_, args: string) => {
    const text = parseAttr(args, "text", "CONFIDENTIAL");
    return `<div class="slide-watermark">${text}</div>`;
  });

  res = res.replace(/:::divider(?:\((.*?)\))?/g, (_, args: string | undefined) => {
    const type = parseAttr(args, "type", "gradient");
    return `<div class="slide-divider divider-${type}"></div>`;
  });

  // 5. Dynamic Text Spans & Fragments
  res = res.replace(/\{v?-?click\}/gi, '<span class="slide-fragment" data-fragment="true"></span>');

  res = res.replace(/\{color:([#a-zA-Z0-9_,-]+)\}([\s\S]*?)\{\/color\}/g, (_, color: string, text: string) => {
    const c = color.trim();
    if (c.startsWith("#") || c.startsWith("rgb") || c.startsWith("hsl")) {
      return `<span class="slide-text-color" style="color: ${c}">${text}</span>`;
    }
    return `<span class="slide-text-color text-color-${c}">${text}</span>`;
  });

  res = res.replace(/\{bg:([#a-zA-Z0-9_,-]+)\}([\s\S]*?)\{\/bg\}/g, (_, bg: string, text: string) => {
    const b = bg.trim();
    if (b.startsWith("#") || b.startsWith("rgb") || b.startsWith("hsl")) {
      return `<span class="slide-text-bg" style="background-color: ${b}">${text}</span>`;
    }
    return `<span class="slide-text-bg bg-${b}">${text}</span>`;
  });

  res = res.replace(/\{gradient:([a-zA-Z0-9_-]+)\}([\s\S]*?)\{\/gradient\}/g, (_, grad: string, text: string) => {
    return `<span class="slide-text-gradient gradient-${grad}">${text}</span>`;
  });

  res = res.replace(/\{font:([a-zA-Z0-9_\s-]+)\}([\s\S]*?)\{\/font\}/g, (_, font: string, text: string) => {
    const cleanFont = font.trim();
    return `<span class="slide-custom-font" style="font-family: '${cleanFont}', var(--font-display), sans-serif">${text}</span>`;
  });

  res = res.replace(/\{size:([0-9a-zA-Z._-]+)\}([\s\S]*?)\{\/size\}/g, (_, sizeVal: string, text: string) => {
    const s = sizeVal.trim();
    const cssSize = /^[0-9]+$/.test(s) ? `${s}px` : s;
    return `<span class="slide-custom-size" style="font-size: ${cssSize}; line-height: 1.2;">${text}</span>`;
  });

  res = res.replace(/\{align:(left|center|right|justify)\}([\s\S]*?)\{\/align\}/g, (_, alignVal: string, text: string) => {
    return `<div class="slide-align-${alignVal}" style="text-align: ${alignVal}; width: 100%;">${text}</div>`;
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
      if (bgMatch) {
        const bgVal = bgMatch[1].trim();
        slide.bg = bgVal;
        processedMd = processedMd.replace(bgMatch[0], "");
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
      slide.html = `${watermarkHtml}${parsedHtml}`;

      return slide;
    });
}
