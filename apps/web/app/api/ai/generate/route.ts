import { NextResponse } from "next/server";
import { generatePresentationWithAi, AI_MODEL_CONFIG } from "@/lib/llm/aiClient";

export async function GET() {
  return NextResponse.json({
    status: "online",
    model: AI_MODEL_CONFIG,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, slideCount, audience, theme, apiKey, provider } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }

    const result = await generatePresentationWithAi({
      prompt,
      slideCount: slideCount ? Number(slideCount) : 5,
      audience,
      theme,
      apiKey: typeof apiKey === "string" ? apiKey : undefined,
      provider: typeof provider === "string" ? (provider as "nvidia" | "openai" | "gemini" | "auto") : undefined,
    });

    return NextResponse.json(result);
  } catch (e: unknown) {
    const err = e as Error;
    return NextResponse.json(
      { error: err?.message || "Failed to generate presentation with AI." },
      { status: 500 }
    );
  }
}
