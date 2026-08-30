import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  generateHtml,
  parseSlides,
  type ThemeName,
  type SizeName,
  type TemplateName,
  type TransitionName,
} from "@presentation-ai/renderer";
import type { Deck } from "@/lib/types";

export async function GET(
  request: Request,
  ctx: RouteContext<"/api/deck/[id]/export">
) {
  const { id } = await ctx.params;
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") ?? "markdown";

  const supabase = await createClient();
  const { data: deck, error } = await supabase
    .from("decks")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !deck) {
    return NextResponse.json({ error: "Deck not found" }, { status: 404 });
  }

  const d = deck as Deck;
  const filename = d.title.replace(/[^a-zA-Z0-9_-]/g, "-").toLowerCase();

  if (format === "html") {
    const slides = parseSlides(d.markdown);
    const html = generateHtml(
      slides,
      d.title,
      false,
      d.theme as ThemeName,
      d.size as SizeName,
      { head: d.head_font || undefined, body: d.body_font || undefined },
      { template: d.template as TemplateName, transition: d.transition as TransitionName }
    );

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}.html"`,
      },
    });
  }

  // Default: markdown
  return new Response(d.markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}.md"`,
    },
  });
}
