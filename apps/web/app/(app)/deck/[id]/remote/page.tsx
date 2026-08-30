import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RemoteView } from "./RemoteView";
import type { Deck } from "@/lib/types";

interface RemotePageProps {
  params: Promise<{ id: string }>;
}

export default async function RemotePage({ params }: RemotePageProps) {
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

  return <RemoteView deck={deck as Deck} />;
}
