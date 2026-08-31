import { describe, it, expect } from "vitest";
import { generatePresentationWithAi } from "../../apps/web/lib/llm/aiClient";

describe("AI Presentation Generation Verification", () => {
  it("dynamically deconstructs any comparison query into structured comparison slides", async () => {
    const res = await generatePresentationWithAi({
      prompt: "UPI vs Credit Card YoY comparison for last 5 year",
      slideCount: 5,
      audience: "executives",
      theme: "emerald",
    });

    expect(res.slideCount).toBe(5);
    expect(res.title).toContain("UPI vs Credit Card");
    expect(res.markdown).toContain(":::chart(type=\"bar\"");
    expect(res.markdown).toContain(":::grid(cols=2)");
    expect(res.markdown).toContain(":::timeline");
  });

  it("dynamically generates rich slides for arbitrary technical and business topics", async () => {
    const res = await generatePresentationWithAi({
      prompt: "Quantum Computing Algorithms and Error Correction",
      slideCount: 3,
      audience: "developers",
      theme: "cyberpunk",
    });

    expect(res.slideCount).toBe(3);
    expect(res.title).toContain("Quantum Computing");
    expect(res.markdown).toContain(":::callout");
    expect(res.markdown).toContain(":::metric");
  });
});

