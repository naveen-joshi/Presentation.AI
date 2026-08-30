import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PresenterView } from "./PresenterView";
import type { Deck } from "@/lib/types";

interface PresenterPageProps {
  params: Promise<{ id: string }>;
}

export default async function PresenterPage({ params }: PresenterPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: deck, error } = await supabase
    .from("decks")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !deck) {
    notFound();
  }

  return <PresenterView deck={deck as Deck} />;
}
