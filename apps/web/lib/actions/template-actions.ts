"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Template } from "@/lib/types";

export async function getPublicTemplates(): Promise<Template[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .eq("visibility", "public")
    .order("usage_count", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Template[];
}

export async function getUserTemplates(): Promise<Template[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .eq("owner_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Template[];
}

export async function createTemplateFromDeck(
  deckId: string,
  formData: {
    name: string;
    description?: string;
    tags?: string[];
    isPublic?: boolean;
  }
): Promise<Template> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Fetch the source deck
  const { data: deck, error: deckError } = await supabase
    .from("decks")
    .select("*")
    .eq("id", deckId)
    .single();

  if (deckError || !deck) throw new Error("Deck not found");

  const { data: template, error } = await supabase
    .from("templates")
    .insert({
      owner_id: user.id,
      name: formData.name || deck.title,
      description: formData.description || "",
      markdown: deck.markdown,
      theme: deck.theme,
      size: deck.size,
      head_font: deck.head_font,
      body_font: deck.body_font,
      template: deck.template,
      transition: deck.transition,
      visibility: formData.isPublic ? "public" : "private",
      tags: formData.tags || [],
    })
    .select()
    .single();

  if (error) throw error;

  revalidatePath("/templates");
  return template as Template;
}

export async function createDeckFromTemplate(templateId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Fetch template
  const { data: template, error: tmplError } = await supabase
    .from("templates")
    .select("*")
    .eq("id", templateId)
    .single();

  if (tmplError || !template) throw new Error("Template not found");

  // Increment usage count
  await supabase
    .from("templates")
    .update({ usage_count: (template.usage_count || 0) + 1 })
    .eq("id", templateId);

  // Insert new deck
  const { data: deck, error } = await supabase
    .from("decks")
    .insert({
      owner_id: user.id,
      title: `${template.name} (Copy)`,
      markdown: template.markdown,
      theme: template.theme,
      size: template.size,
      head_font: template.head_font,
      body_font: template.body_font,
      template: template.template,
      transition: template.transition,
      visibility: "private",
    })
    .select("id")
    .single();

  if (error) throw error;

  revalidatePath("/dashboard");
  redirect(`/deck/${deck.id}`);
}

export async function deleteTemplate(templateId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("templates")
    .delete()
    .eq("id", templateId);

  if (error) throw error;
  revalidatePath("/templates");
}
