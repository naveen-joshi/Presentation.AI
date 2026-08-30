import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PresentView } from "@/app/(app)/deck/[id]/present/PresentView";
import type { Deck } from "@/lib/types";

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const supabase = await createClient();
  const { data: deck } = await supabase
    .from("decks")
    .select("title")
    .eq("slug", slug)
    .eq("visibility", "public")
    .single();

  return {
    title: deck?.title ? `${deck.title} — Presentation.AI` : "Presentation",
    description: "Built and shared with Presentation.AI",
  };
}

export default async function PublicDeckPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const supabase = await createClient();

  const { data: deck, error } = await supabase
    .from("decks")
    .select("*")
    .eq("slug", slug)
    .eq("visibility", "public")
    .single();

  if (error || !deck) notFound();

  const d = deck as Deck;

  return (
    <div className="relative min-h-screen">
      <PresentView deck={d} />
    </div>
  );
}
