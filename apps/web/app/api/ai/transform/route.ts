import { NextResponse } from "next/server";
import { transformSlideWithAi } from "@/lib/llm/aiClient";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { markdown, action, targetLanguage } = body;

    if (!markdown || typeof markdown !== "string") {
      return NextResponse.json({ error: "Markdown content is required." }, { status: 400 });
    }

    if (!action || !["punchy", "summarize", "expand", "generate-notes", "translate"].includes(action)) {
      return NextResponse.json({ error: "Invalid transformation action." }, { status: 400 });
    }

    const transformed = await transformSlideWithAi({
      markdown,
      action,
      targetLanguage,
    });

    return NextResponse.json({ result: transformed });
  } catch (e: unknown) {
    const err = e as Error;
    return NextResponse.json(
      { error: err?.message || "Failed to transform slide with AI." },
      { status: 500 }
    );
  }
}
