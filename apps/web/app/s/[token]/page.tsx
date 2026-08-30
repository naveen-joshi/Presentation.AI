import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PresentView } from "@/app/(app)/deck/[id]/present/PresentView";
import type { Deck, ShareLink } from "@/lib/types";

export async function generateMetadata(props: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await props.params;
  const supabase = await createClient();
  const { data: link } = await supabase
    .from("share_links")
    .select("deck_id, decks:deck_id (title)")
    .eq("token", token)
    .eq("revoked", false)
    .single();

  const deck = link?.decks as unknown as { title: string } | undefined;
  return {
    title: deck?.title ? `${deck.title} · Shared Presentation` : "Shared Presentation",
  };
}

export default async function SharedDeckPage(props: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await props.params;
  const supabase = await createClient();

  const { data: link, error: linkErr } = await supabase
    .from("share_links")
    .select("*")
    .eq("token", token)
    .eq("revoked", false)
    .single();

  if (linkErr || !link) notFound();

  const shareLink = link as ShareLink;
  const isExpired = shareLink.expires_at ? shareLink.expires_at < new Date().toISOString() : false;
  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="glass rounded-2xl p-8 max-w-sm text-center">
          <h1 className="text-xl font-bold text-foreground mb-2">Link Expired</h1>
          <p className="text-xs text-[var(--text-secondary)]">
            This share link is no longer valid. Please request a new link from the presentation owner.
          </p>
        </div>
      </div>
    );
  }

  // Fetch the target deck
  const { data: deck, error: deckErr } = await supabase
    .from("decks")
    .select("*")
    .eq("id", shareLink.deck_id)
    .single();

  if (deckErr || !deck) notFound();

  const d = deck as Deck;

  return (
    <div className="relative min-h-screen">
      {/* Top Banner indicating Shared View */}
      <div className="absolute top-3 left-3 z-50 flex items-center gap-2 bg-black/70 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-medium truncate max-w-[200px]">{d.title}</span>
        <span className="text-white/50">•</span>
        <span className="text-white/70 capitalize">{shareLink.role} Access</span>
      </div>

      <PresentView deck={d} />
    </div>
  );
}
