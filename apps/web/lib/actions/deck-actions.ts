"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Deck } from "@/lib/types";

/* ─── Queries ────────────────────────────────────────────────────────────── */

export async function getDecksByOwner(): Promise<Deck[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("decks")
    .select("*")
    .eq("owner_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as Deck[];
}

export async function getDeckById(id: string): Promise<Deck | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("decks")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // not found
    throw error;
  }
  return data as Deck;
}

/* ─── Mutations ──────────────────────────────────────────────────────────── */

export async function createDeck(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("decks")
    .insert({
      owner_id: user.id,
      title: "Untitled deck",
      markdown: "# Untitled deck\n\nStart writing your slides here.\n\n---\n\n## Slide 2\n\nAdd more content…\n",
    })
    .select("id")
    .single();

  if (error) throw error;
  revalidatePath("/dashboard");
  redirect(`/deck/${data.id}`);
}

export async function createDeckWithContent(
  title: string,
  markdown: string,
  theme = "nord"
): Promise<{ id: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("decks")
    .insert({
      owner_id: user.id,
      title: title || "AI Generated Presentation",
      markdown,
      theme: theme || "nord",
    })
    .select("id")
    .single();

  if (error) throw error;
  revalidatePath("/dashboard");
  return { id: data.id };
}

export async function updateDeck(
  id: string,
  updates: Partial<Pick<Deck, "title" | "markdown" | "theme" | "size" | "head_font" | "body_font" | "template" | "transition" | "visibility" | "slug">>
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("decks")
    .update(updates)
    .eq("id", id);

  if (error) throw error;
}

export async function deleteDeck(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("decks").delete().eq("id", id);

  if (error) throw error;
  revalidatePath("/dashboard");
}

export async function updateDeckMarkdown(
  id: string,
  markdown: string,
  title?: string
): Promise<void> {
  const supabase = await createClient();
  const updates: Record<string, string> = { markdown };
  if (title !== undefined) updates.title = title;

  const { error } = await supabase
    .from("decks")
    .update(updates)
    .eq("id", id);

  if (error) throw error;
}
