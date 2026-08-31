import pptxgen from "pptxgenjs";
import { parseSlides, type Slide } from "@presentation-ai/renderer";

interface ThemePalette {
  bg: string;
  text: string;
  accent: string;
  cardBg: string;
  cardBorder: string;
  subtext: string;
}

const THEME_PALETTES: Record<string, ThemePalette> = {
  nord: {
    bg: "2E3440",
    text: "ECEFF4",
    accent: "88C0D0",
    cardBg: "3B4252",
    cardBorder: "4C566A",
    subtext: "D8DEE9",
  },
  midnight: {
    bg: "0F172A",
    text: "F8FAFC",
    accent: "6366F1",
    cardBg: "1E293B",
    cardBorder: "334155",
    subtext: "94A3B8",
  },
  neon: {
    bg: "0A0A0A",
    text: "FFFFFF",
    accent: "00F0FF",
    cardBg: "171717",
    cardBorder: "262626",
    subtext: "A3A3A3",
  },
  paper: {
    bg: "FFFFFF",
    text: "0F172A",
    accent: "4F46E5",
    cardBg: "F8FAFC",
    cardBorder: "E2E8F0",
    subtext: "64748B",
  },
  sunset: {
    bg: "1E1035",
    text: "FFF1F2",
    accent: "F43F5E",
    cardBg: "2D184C",
    cardBorder: "4A237A",
    subtext: "FDA4AF",
  },
  dracula: {
    bg: "282A36",
    text: "F8F8F2",
    accent: "BD93F9",
    cardBg: "44475A",
    cardBorder: "6272A4",
    subtext: "6272A4",
  },
};

/**
 * Exports markdown presentations to native Microsoft PowerPoint (.pptx) format.
 */
export async function exportToPptx(
  markdown: string,
  deckTitle: string = "Presentation",
  themeName: string = "midnight"
): Promise<void> {
  const pres = new pptxgen();

  pres.layout = "LAYOUT_16x9";
  pres.title = deckTitle;
  pres.author = "Presentation.AI";

  const palette = THEME_PALETTES[themeName.toLowerCase()] || THEME_PALETTES.midnight;

  // Split markdown on slide separators
  const rawSections = markdown
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split(/\n[ \t]*---[ \t]*\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const parsedSlides: Slide[] = parseSlides(markdown);

  rawSections.forEach((rawSlide, index) => {
    const slide = pres.addSlide();
    slide.background = { color: palette.bg };

    // Attach speaker notes
    const parsedSlide = parsedSlides[index];
    if (parsedSlide?.notes && parsedSlide.notes.trim()) {
      slide.addNotes(parsedSlide.notes.trim());
    }

    // Custom background override
    if (parsedSlide?.bg) {
      const bg = parsedSlide.bg.toLowerCase();
      if (bg.startsWith("#")) {
        slide.background = { color: bg.replace("#", "") };
      } else if (bg.includes("indigo") || bg.includes("dark")) {
        slide.background = { color: "0F172A" };
      } else if (bg.includes("sunset")) {
        slide.background = { color: "1F1235" };
      } else if (bg.includes("aurora") || bg.includes("ocean")) {
        slide.background = { color: "022C22" };
      }
    }

    // Top Header Bar
    const headerMatch = rawSlide.match(/:::header\((.*?)\)/);
    if (headerMatch) {
      const args = headerMatch[1];
      const tMatch = args.match(/title="([^"]*)"/);
      const cMatch = args.match(/category="([^"]*)"/);
      const hTitle = tMatch ? tMatch[1] : "";
      const hCat = cMatch ? cMatch[1] : "";
      if (hTitle || hCat) {
        slide.addText(`${hTitle} ${hCat ? ` • ${hCat}` : ""}`.trim(), {
          x: 0.8,
          y: 0.25,
          w: 11.5,
          h: 0.35,
          fontSize: 10,
          color: palette.subtext,
          bold: true,
        });
      }
    }

    // Watermark Top-Right Pill
    const watermarkMatch = rawSlide.match(/:::watermark\((.*?)\)/) || rawSlide.match(/<!--\s*watermark:\s*([^>]+?)\s*-->/i);
    if (watermarkMatch) {
      const wText = watermarkMatch[1].includes('"') ? watermarkMatch[1].match(/text="([^"]*)"/)?.[1] || "CONFIDENTIAL" : watermarkMatch[1].trim();
      slide.addText(wText, {
        x: 9.8,
        y: 0.25,
        w: 2.5,
        h: 0.35,
        fontSize: 9,
        color: "F43F5E",
        bold: true,
        align: "center",
        shape: pres.ShapeType.rect,
        fill: { color: "2D1215" },
        line: { color: "F43F5E", width: 1 },
      });
    }

    const lines = rawSlide.split("\n");
    let title = "";
    const bulletItems: Array<{ text: string; options?: pptxgen.TextPropsOptions }> = [];
    const paragraphs: string[] = [];
    const metrics: Array<{ value: string; label: string; sub?: string }> = [];
    let chartInfo: { type: string; title: string; labels: string[]; series: Array<{ name: string; values: number[] }> } | null = null;

    // Check for chart block in raw slide
    const chartMatch = rawSlide.match(/:::chart(?:\((.*?)\))?\n([\s\S]*?)\n:::/);
    if (chartMatch) {
      const a = chartMatch[1] || "";
      const content = chartMatch[2] || "";
      const typeMatch = a.match(/type="([^"]*)"/);
      const titleMatch = a.match(/title="([^"]*)"/);
      const cType = typeMatch ? typeMatch[1] : "bar";
      const cTitle = titleMatch ? titleMatch[1] : "";

      const cLines = content.split("\n").map((l) => l.trim()).filter(Boolean);
      let cLabels: string[] = [];
      const cSeries: Array<{ name: string; values: number[] }> = [];

      for (const cl of cLines) {
        if (cl.toLowerCase().startsWith("labels:")) {
          cLabels = cl.slice(7).split(",").map((s) => s.trim()).filter(Boolean);
        } else if (cl.toLowerCase().startsWith("series:")) {
          const m = cl.slice(7).match(/(.*?)\s*\[(.*?)\]/);
          if (m) {
            const sName = m[1].trim() || `Series ${cSeries.length + 1}`;
            const sData = m[2].split(",").map((v) => parseFloat(v.trim()) || 0);
            cSeries.push({ name: sName, values: sData });
          }
        } else if (cl.includes(":")) {
          const [k, v] = cl.split(":");
          cLabels.push(k.trim());
          const num = parseFloat(v.trim()) || 0;
          if (cSeries.length === 0) cSeries.push({ name: "Value", values: [] });
          cSeries[0].values.push(num);
        }
      }

      if (cSeries.length > 0 && cLabels.length > 0) {
        chartInfo = { type: cType, title: cTitle, labels: cLabels, series: cSeries };
      }
    }

    // Extract title, bullets, and directives
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      // Ignore speaker notes comments
      if (line.startsWith("<!--") || line.startsWith("note:") || line.startsWith("-->")) {
        continue;
      }

      // Title (# or ##)
      if (/^#{1,3}\s+/.test(line)) {
        const cleanTitle = line.replace(/^#{1,3}\s+/, "").replace(/\*\*/g, "");
        if (!title) {
          title = cleanTitle;
          continue;
        }
      }

      // Metric Directive :::metric(value="...", label="...")
      if (line.startsWith(":::metric(")) {
        const valMatch = line.match(/value="([^"]+)"/);
        const labelMatch = line.match(/label="([^"]+)"/);
        const subMatch = line.match(/sub="([^"]+)"/);
        if (valMatch && labelMatch) {
          metrics.push({
            value: valMatch[1],
            label: labelMatch[1],
            sub: subMatch ? subMatch[1] : undefined,
          });
        }
        continue;
      }

      // Ignore structural delimiters
      if (line.startsWith(":::") || line.startsWith("```")) {
        continue;
      }

      // Bullets (- or *)
      if (/^[-*]\s+/.test(line)) {
        const bulletText = line.replace(/^[-*]\s+/, "").replace(/\{v?-?click\}/gi, "").replace(/\*\*/g, "");
        bulletItems.push({
          text: bulletText,
          options: {
            bullet: true,
            color: palette.text,
            fontSize: 16,
            breakLine: true,
          },
        });
        continue;
      }

      // Numbered List (1., 2.)
      if (/^\d+\.\s+/.test(line)) {
        const numText = line.replace(/^\d+\.\s+/, "").replace(/\{v?-?click\}/gi, "").replace(/\*\*/g, "");
        bulletItems.push({
          text: numText,
          options: {
            bullet: { type: "number" },
            color: palette.text,
            fontSize: 16,
            breakLine: true,
          },
        });
        continue;
      }

      // Regular paragraph
      paragraphs.push(line.replace(/\{v?-?click\}/gi, "").replace(/\*\*/g, ""));
    }

    const isTitleSlide = index === 0;

    if (isTitleSlide) {
      // Big Center Hero Title Slide
      slide.addText(title || deckTitle, {
        x: 1.0,
        y: 2.2,
        w: 11.3,
        h: 1.8,
        fontSize: 40,
        bold: true,
        color: palette.accent,
        align: "center",
        valign: "middle",
      });

      if (paragraphs.length > 0) {
        slide.addText(paragraphs.join(" • "), {
          x: 1.5,
          y: 4.2,
          w: 10.3,
          h: 1.0,
          fontSize: 18,
          color: palette.subtext,
          align: "center",
          valign: "top",
        });
      }
    } else {
      // Standard Slide Header
      if (title) {
        slide.addText(title, {
          x: 0.8,
          y: 0.6,
          w: 11.5,
          h: 0.9,
          fontSize: 28,
          bold: true,
          color: palette.accent,
          valign: "middle",
        });
      }

      // Render Native PowerPoint Chart if present
      if (chartInfo) {
        let pptxChartType = pres.ChartType.bar;
        if (chartInfo.type === "line" || chartInfo.type === "area") pptxChartType = pres.ChartType.line;
        else if (chartInfo.type === "donut" || chartInfo.type === "pie") pptxChartType = pres.ChartType.doughnut;

        const pptxData = chartInfo.series.map((s) => ({
          name: s.name,
          labels: chartInfo!.labels,
          values: s.values,
        }));

        try {
          slide.addChart(pptxChartType, pptxData, {
            x: 0.8,
            y: 1.6,
            w: 11.5,
            h: 4.8,
            showTitle: Boolean(chartInfo.title),
            title: chartInfo.title || undefined,
            titleColor: palette.accent,
            titleFontSize: 16,
            showLegend: chartInfo.series.length > 1,
            legendPos: "t",
          });
        } catch {
          // Fallback to text box if chart fails
          slide.addText(`Chart: ${chartInfo.title}\n${chartInfo.labels.join(", ")}`, {
            x: 0.8,
            y: 1.8,
            w: 11.5,
            h: 4.5,
            fontSize: 16,
            color: palette.text,
          });
        }
      } else if (metrics.length > 0) {
        // Render Metrics if any
        const metricWidth = 11.0 / metrics.length;
        metrics.forEach((m, mIdx) => {
          const mX = 0.8 + mIdx * metricWidth;
          slide.addShape(pres.ShapeType.roundRect, {
            x: mX,
            y: 1.8,
            w: metricWidth - 0.3,
            h: 2.2,
            fill: { color: palette.cardBg },
            line: { color: palette.cardBorder, width: 1 },
            rectRadius: 0.1,
          });

          slide.addText(m.value, {
            x: mX + 0.1,
            y: 2.0,
            w: metricWidth - 0.5,
            h: 0.9,
            fontSize: 32,
            bold: true,
            color: palette.accent,
            align: "center",
          });

          slide.addText(m.label, {
            x: mX + 0.1,
            y: 2.9,
            w: metricWidth - 0.5,
            h: 0.5,
            fontSize: 14,
            bold: true,
            color: palette.text,
            align: "center",
          });

          if (m.sub) {
            slide.addText(m.sub, {
              x: mX + 0.1,
              y: 3.4,
              w: metricWidth - 0.5,
              h: 0.4,
              fontSize: 11,
              color: palette.subtext,
              align: "center",
            });
          }
        });
      }

      // Render Bullets / Body Content if no chart
      if (!chartInfo) {
        if (bulletItems.length > 0) {
          const bodyY = metrics.length > 0 ? 4.3 : 1.7;
          const bodyH = metrics.length > 0 ? 2.5 : 5.0;

          slide.addText(bulletItems, {
            x: 0.8,
            y: bodyY,
            w: 11.5,
            h: bodyH,
            valign: "top",
            lineSpacing: 28,
          });
        } else if (paragraphs.length > 0 && metrics.length === 0) {
          slide.addText(paragraphs.join("\n\n"), {
            x: 0.8,
            y: 1.8,
            w: 11.5,
            h: 4.8,
            fontSize: 16,
            color: palette.text,
            valign: "top",
            lineSpacing: 24,
          });
        }
      }
    }

    // Footer & Copyright
    const footerMatch = rawSlide.match(/:::footer\((.*?)\)/);
    let footerText = `Presentation.AI  •  Slide ${index + 1}`;
    if (footerMatch) {
      const args = footerMatch[1];
      const lMatch = args.match(/left="([^"]*)"/);
      const rMatch = args.match(/right="([^"]*)"/);
      const cMatch = args.match(/center="([^"]*)"/);
      const lText = lMatch ? lMatch[1] : "";
      const cText = cMatch ? cMatch[1] : "";
      const rText = rMatch
        ? rMatch[1].replace("%slide%", `${index + 1}`).replace("%total%", `${rawSections.length}`)
        : `Slide ${index + 1}`;
      footerText = [lText, cText, rText].filter(Boolean).join("   •   ");
    }

    slide.addText(footerText, {
      x: 0.8,
      y: 6.8,
      w: 11.5,
      h: 0.4,
      fontSize: 10,
      color: palette.subtext,
      align: "right",
      valign: "bottom",
    });
  });

  const sanitizedFileName = `${(deckTitle || "presentation").toLowerCase().replace(/[^a-z0-9]/g, "-")}.pptx`;
  await pres.writeFile({ fileName: sanitizedFileName });
}
