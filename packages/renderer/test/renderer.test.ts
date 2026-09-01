import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, expect, test } from "vitest";
import { parseSlides } from "../src/parser.js";
import {
  findTemplate,
  resolveTemplateName,
  templateSummaries,
  templateListing,
  findTransition,
  resolveTransitionName,
  transitionSummaries,
  transitionListing,
  TEMPLATE_CSS,
  TRANSITION_CSS,
} from "../src/presentation-options.js";
import { richContentFeatures, richContentHead } from "../src/rich-content.js";
import { lintMarkdown } from "../src/lint.js";
import { generateHtml, renderSlide } from "../src/generate.js";
import { generatePreviewHtml } from "../src/preview.js";
import { themeRootCss, themeSwitchableCss } from "../src/themes.js";

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), "fixtures");

describe("parser", () => {
  test("handles slides, notes, images, math, and reveals", () => {
    const md = `# Slide 1
Welcome to deckrun

<!-- notes: Introduction slide notes -->
---
# Slide 2
Here is a list:
- Point A
- Point B {reveal}

{reveal}
> Important quote

$$
E = mc^2
$$

Inline math $a^2 + b^2 = c^2$ here.
`;

    const slides = parseSlides(md);
    expect(slides.length).toBe(2);
    expect(slides[0].notes).toBe("Introduction slide notes");
    expect(slides[1].html).toMatch(/deckrun-fragment-marker/);
    expect(slides[1].html).toMatch(/class="math-source"/);
    expect(slides[1].html).toMatch(/data-display="true"/);
    expect(slides[1].html).toMatch(/data-display="false"/);
  });

  test("parses chart, bento, timeline, and badge directives into rich SVG and HTML components", () => {
    const md = `# Quarterly Review
:::badge(text="Live Beta", color="emerald", pulse=true)

---

## Performance
:::chart(type="bar", title="Quarterly Growth ($M)")
labels: Q1, Q2, Q3, Q4
series: 2025 [25, 45, 70, 95]
:::

---

## Strategy
:::bento
:::box(span=2, bg="gradient")
### Bento Title
:::
:::box(span=1)
### Metric
:::
:::
`;
    const slides = parseSlides(md);
    expect(slides.length).toBe(3);
    // Slide 1 has badge
    expect(slides[0].html).toContain('class="slide-badge badge-emerald"');
    // Slide 2 has rendered chart SVG and NOT a raw pre/code block
    expect(slides[1].html).toContain('class="slide-chart-box"');
    expect(slides[1].html).toContain('class="slide-chart-svg"');
    expect(slides[1].html).toContain('<rect');
    expect(slides[1].html).not.toContain('&lt;svg');
    // Slide 3 has bento grid
    expect(slides[2].html).toContain('class="slide-bento-grid"');
    expect(slides[2].html).toContain('class="bento-box col-span-2');
  });

  test("parses dynamic text colors, background overlays, layout masters, headers, and footers", () => {
    const md = `:::header(title="Company All-Hands", category="Strategic Update", logo="⚡")
<!-- bg: gradient-dark -->
:::watermark(text="CONFIDENTIAL")

# Welcome to {gradient:sunset}The Future of Presentations{/gradient}
Here is {color:emerald}growth in revenue{/color} and a {bg:amber}critical highlight{/bg}.

:::footer(left="© 2026 Presentation.AI", center="Internal Only", right="Slide %slide% of %total%")

---

:::layout(split)
:::col
### Left Column Overview
Detailed operational highlights.
:::
:::col
### Right Column Metric
:::metric(value="+340%", label="Scale")
:::
:::
:::divider(type="glow")
`;
    const slides = parseSlides(md);
    expect(slides.length).toBe(2);

    // Slide 1 checks
    expect(slides[0].html).toContain('class="slide-header-bar"');
    expect(slides[0].html).toContain('class="header-title">Company All-Hands</span>');
    expect(slides[0].bg).toBe("gradient-dark");
    const rendered0 = renderSlide(slides[0], 0);
    expect(rendered0).toContain('class="slide-bg-layer slide-bg-gradient-dark"');
    expect(slides[0].html).toContain('class="slide-watermark">CONFIDENTIAL</div>');
    expect(slides[0].html).toContain('class="slide-text-gradient gradient-sunset">The Future of Presentations</span>');
    expect(slides[0].html).toContain('class="slide-text-color text-color-emerald">growth in revenue</span>');
    expect(slides[0].html).toContain('class="slide-text-bg bg-amber">critical highlight</span>');
    expect(slides[0].html).toContain('class="slide-footer-bar"');
    expect(slides[0].html).toContain('© 2026 Presentation.AI');

    // Slide 2 checks
    expect(slides[1].html).toContain('class="slide-layout slide-layout-split"');
    expect(slides[1].html).toContain('class="slide-layout-col"');
    expect(slides[1].html).toContain('class="slide-divider divider-glow"');
  });

  test("parses custom inline fonts and solid hex color styling", () => {
    const md = `<!-- bg: #0f172a -->
# {font:Syne}Artistic Title{/font}
Here is {color:#38bdf8}Sky Blue Text{/color} and {bg:#22c55e}Green Highlight{/bg}.
`;
    const slides = parseSlides(md);
    expect(slides.length).toBe(1);
    expect(slides[0].bg).toBe("#0f172a");
    const rendered = renderSlide(slides[0], 0);
    expect(rendered).toContain('class="slide-bg-layer" style="background-color: #0f172a"');
    expect(slides[0].html).toContain('class="slide-custom-font" style="font-family: \'Syne\', var(--font-display), sans-serif">Artistic Title</span>');
    expect(slides[0].html).toContain('class="slide-text-color" style="color: #38bdf8">Sky Blue Text</span>');
    expect(slides[0].html).toContain('class="slide-text-bg" style="background-color: #22c55e">Green Highlight</span>');
  });

  test("parses loose unquoted attributes and indented nested cards inside grids", () => {
    const md = `
# Nested Component Showcase

:::grid(cols=2)
  :::card(title=UPI, icon='⚡')
  Unified Payments Interface volume reached 100B.
  :::
  :::card(title='Credit Card', icon="💳")
  Credit Card spending grew 28% YoY.
  :::
:::

:::callout(type=warning)
Security compliance is mandatory for payment gateways.
:::

:::badge(text=FinTech, color=emerald, pulse=true)
`;
    const slides = parseSlides(md);
    expect(slides.length).toBe(1);
    expect(slides[0].html).toContain('class="slide-grid grid-cols-2"');
    expect(slides[0].html).toContain('class="slide-card-title">UPI</h4>');
    expect(slides[0].html).toContain('class="slide-card-title">Credit Card</h4>');
    expect(slides[0].html).toContain('class="slide-callout callout-warning"');
    expect(slides[0].html).toContain('class="slide-badge badge-emerald"');
    expect(slides[0].html).toContain('class="badge-pulse-dot"');
    expect(slides[0].html).not.toContain(":::grid");
    expect(slides[0].html).not.toContain(":::card");
    expect(slides[0].html).not.toContain(":::");
  });

  test("parses the example deck fixture", () => {
    const md = readFileSync(join(fixturesDir, "example-2.md"), "utf8");
    const slides = parseSlides(md);
    expect(slides.length).toBeGreaterThan(5);
    for (const slide of slides) {
      expect(slide.html.length).toBeGreaterThan(0);
    }
  });
});

describe("presentation options", () => {
  test("resolve correctly", () => {
    expect(findTemplate("minimal")).toBe("minimal");
    expect(findTemplate("Classic")).toBe("classic");
    expect(findTemplate("non-existent")).toBeNull();
    expect(resolveTemplateName("spotlight")).toBe("spotlight");
    expect(resolveTemplateName("invalid")).toBe("classic");

    expect(findTransition("fade")).toBe("fade");
    expect(findTransition("Zoom")).toBe("zoom");
    expect(findTransition("non-existent")).toBeNull();
    expect(resolveTransitionName("lift")).toBe("lift");
    expect(resolveTransitionName("invalid")).toBe("slide");

    expect(templateSummaries().length).toBe(4);
    expect(transitionSummaries().length).toBe(5);
    expect(templateListing().length).toBe(4);
    expect(transitionListing().length).toBe(5);

    expect(TEMPLATE_CSS).toContain("spotlight");
    expect(TRANSITION_CSS).toContain("lift");
  });
});

describe("rich content", () => {
  test("detection and head tags work", () => {
    const slidesWithoutRich = parseSlides("# Simple\nHello");
    const feat1 = richContentFeatures(slidesWithoutRich);
    expect(feat1.math).toBe(false);
    expect(feat1.mermaid).toBe(false);
    expect(richContentHead(feat1, "local")).toBe("");

    const slidesWithRich = parseSlides(
      "# Math\n$$\nx = y\n$$\n```mermaid\ngraph TD; A-->B;\n```"
    );
    const feat2 = richContentFeatures(slidesWithRich);
    expect(feat2.math).toBe(true);
    expect(feat2.mermaid).toBe(true);

    const localHead = richContentHead(feat2, "local");
    expect(localHead).toContain("/__vendor/katex.min.css");
    expect(localHead).toContain("/__vendor/mermaid.min.js");

    const cdnHead = richContentHead(feat2, "cdn");
    expect(cdnHead).toContain("cdn.jsdelivr.net/npm/katex");
    expect(cdnHead).toContain("cdn.jsdelivr.net/npm/mermaid");
  });
});

describe("lint", () => {
  test("catches errors and warnings properly", () => {
    const emptyRes = lintMarkdown("   ");
    expect(emptyRes.errors).toBe(1);
    expect(emptyRes.issues[0].rule).toBe("empty-deck");

    const validMd = `# Clean Slide
- Item 1
- Item 2
`;
    const validRes = lintMarkdown(validMd);
    expect(validRes.errors).toBe(0);
    expect(validRes.warnings).toBe(0);

    const unclosedMd = `# Slide
\`\`\`
unclosed code
`;
    const unclosedRes = lintMarkdown(unclosedMd);
    expect(unclosedRes.issues.some((i) => i.rule === "untagged-code-fence")).toBe(true);
    expect(unclosedRes.issues.some((i) => i.rule === "unclosed-code-fence")).toBe(true);
    expect(unclosedRes.errors).toBe(1);

    const badImgMd = `# Slide
![](pic.png "opacity=2.5")
`;
    const badImgRes = lintMarkdown(badImgMd);
    expect(badImgRes.issues.some((i) => i.rule === "missing-image-alt")).toBe(true);
    expect(badImgRes.issues.some((i) => i.rule === "invalid-image-opacity")).toBe(true);
  });
});

describe("generateHtml", () => {
  test("produces valid complete document with templates and transitions", () => {
    const slides = parseSlides("# Slide 1\nHello\n<!-- notes: Test note -->");
    const html = generateHtml(
      slides,
      "My Test Deck",
      false,
      "nord",
      "l",
      { head: null, body: null },
      { template: "editorial", transition: "fade" }
    );

    expect(html).toContain('data-theme="nord"');
    expect(html).toContain('data-template="editorial"');
    expect(html).toContain('data-transition="fade"');
    expect(html).toContain('data-size="l"');
    expect(html).toContain("Test note");
  });

  test("appends the brand suffix only when provided", () => {
    const slides = parseSlides("# Slide 1\nHello");

    const unbranded = generateHtml(slides, "My Deck");
    expect(unbranded).toContain("<title>My Deck</title>");

    const branded = generateHtml(
      slides,
      "My Deck",
      false,
      "nord",
      "m",
      {},
      {},
      "Presentation.AI"
    );
    expect(branded).toContain("<title>My Deck · Presentation.AI</title>");

    const alreadyBranded = generateHtml(
      slides,
      "My Deck · Presentation.AI",
      false,
      "nord",
      "m",
      {},
      {},
      "Presentation.AI"
    );
    expect(alreadyBranded).toContain("<title>My Deck · Presentation.AI</title>");
  });

  test("theme-dependent text selection highlight is configured", () => {
    const nordCss = themeRootCss("nord");
    expect(nordCss).toContain("--selection-bg:");
    expect(nordCss).toContain("--selection-text:");

    const switchableCss = themeSwitchableCss();
    expect(switchableCss).toContain("--selection-bg:");

    const slides = parseSlides("# Test\nSelection styling");
    const html = generateHtml(slides, "Test Deck", false, "nord", "m");
    expect(html).toContain("::selection");
    expect(html).toContain("var(--selection-bg");
  });
});

describe("generatePreviewHtml", () => {
  test("produces valid preview structure", () => {
    const html = generatePreviewHtml("gruvbox", "m", {}, "minimal", "zoom");
    expect(html).toContain('data-theme="gruvbox"');
    expect(html).toContain('data-template="minimal"');
    expect(html).toContain('data-transition="zoom"');
    expect(html).toContain('id="presentation"');
  });

  test("asset mode switches between local vendor routes and CDN", () => {
    const local = generatePreviewHtml("nord", "m", {}, "classic", "slide", "local");
    expect(local).toContain("/__vendor/katex.min.css");

    const cdn = generatePreviewHtml("nord", "m", {}, "classic", "slide", "cdn");
    expect(cdn).toContain("cdn.jsdelivr.net/npm/katex");
    expect(cdn).not.toContain("/__vendor/");
  });
});
