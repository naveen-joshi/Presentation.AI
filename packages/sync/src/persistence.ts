import * as Y from "yjs";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function loadDeckDoc(
  supabase: SupabaseClient,
  deckId: string
): Promise<Y.Doc> {
  const doc = new Y.Doc();

  // 1. Fetch incremental updates from yjs_updates table
  const { data: updates, error } = await supabase
    .from("yjs_updates")
    .select("update")
    .eq("deck_id", deckId)
    .order("id", { ascending: true });

  if (!error && updates && updates.length > 0) {
    updates.forEach((row: { update: string | Uint8Array }) => {
      const bytes = typeof row.update === "string"
        ? Buffer.from(row.update.replace(/^\\x/, ""), "hex")
        : row.update;
      Y.applyUpdate(doc, bytes);
    });
  }

  return doc;
}

export async function persistDeckUpdate(
  supabase: SupabaseClient,
  deckId: string,
  update: Uint8Array
): Promise<void> {
  const hex = `\\x${Buffer.from(update).toString("hex")}`;
  await supabase.from("yjs_updates").insert({
    deck_id: deckId,
    update: hex,
  });
}

export async function compactDeckUpdates(
  supabase: SupabaseClient,
  deckId: string,
  doc: Y.Doc
): Promise<void> {
  // 1. Encode complete state snapshot
  const snapshot = Y.encodeStateAsUpdate(doc);
  const hex = `\\x${Buffer.from(snapshot).toString("hex")}`;

  // 2. Delete all existing incremental updates
  await supabase.from("yjs_updates").delete().eq("deck_id", deckId);

  // 3. Insert single consolidated snapshot row
  await supabase.from("yjs_updates").insert({
    deck_id: deckId,
    update: hex,
  });

  // 4. Also update decks.markdown for SSR performance
  const text = doc.getText("content").toString();
  if (text) {
    await supabase
      .from("decks")
      .update({ markdown: text })
      .eq("id", deckId);
  }
}
