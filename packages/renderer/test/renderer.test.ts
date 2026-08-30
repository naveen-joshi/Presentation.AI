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
import { generateHtml } from "../src/generate.js";
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
