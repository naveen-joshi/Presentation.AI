"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { CollaboratorRole, ShareLink, Collaborator, DeckRole, Profile } from "@/lib/types";

export async function getDeckAccess(deckId: string): Promise<{
  role: DeckRole;
  isOwner: boolean;
  canEdit: boolean;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { role: "viewer", isOwner: false, canEdit: false };
  }

  // Check if owner
  const { data: deck } = await supabase
    .from("decks")
    .select("owner_id, visibility")
    .eq("id", deckId)
    .single();

  if (!deck) {
    return { role: "viewer", isOwner: false, canEdit: false };
  }

  if (deck.owner_id === user.id) {
    return { role: "owner", isOwner: true, canEdit: true };
  }

  // Check collaborator role
  const { data: collab } = await supabase
    .from("deck_collaborators")
    .select("role")
    .eq("deck_id", deckId)
    .eq("user_id", user.id)
    .single();

  if (collab) {
    const role = collab.role as CollaboratorRole;
    return {
      role,
      isOwner: false,
      canEdit: role === "editor",
    };
  }

  return {
    role: "viewer",
    isOwner: false,
    canEdit: false,
  };
}

/* ─── Share Links ─────────────────────────────────────────────────────────── */

export async function getShareLinks(deckId: string): Promise<ShareLink[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("share_links")
    .select("*")
    .eq("deck_id", deckId)
    .eq("revoked", false)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ShareLink[];
}

export async function createShareLink(
  deckId: string,
  role: CollaboratorRole = "viewer",
  expiresAt: string | null = null
): Promise<ShareLink> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("share_links")
    .insert({
      deck_id: deckId,
      role,
      expires_at: expiresAt,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  revalidatePath(`/deck/${deckId}`);
  return data as ShareLink;
}

export async function revokeShareLink(linkId: string, deckId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("share_links")
    .update({ revoked: true })
    .eq("id", linkId);

  if (error) throw error;
  revalidatePath(`/deck/${deckId}`);
}

/* ─── Collaborators ───────────────────────────────────────────────────────── */

export async function getCollaborators(deckId: string): Promise<Collaborator[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deck_collaborators")
    .select(`
      deck_id,
      user_id,
      role,
      created_at,
      profiles:user_id (
        id,
        email,
        full_name,
        avatar_url
      )
    `)
    .eq("deck_id", deckId);

  if (error) throw error;
  return (data ?? []).map((row) => {
    const r = row as unknown as {
      deck_id: string;
      user_id: string;
      role: string;
      created_at: string;
      profiles: Profile;
    };
    return {
      deck_id: r.deck_id,
      user_id: r.user_id,
      role: r.role as CollaboratorRole,
      created_at: r.created_at,
      profile: r.profiles,
    };
  });
}

export async function addCollaborator(
  deckId: string,
  email: string,
  role: CollaboratorRole = "editor"
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient();
  
  // Find user by email in profiles
  const { data: targetProfile, error: profileErr } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email.trim().toLowerCase())
    .single();

  if (profileErr || !targetProfile) {
    return { error: "User with this email not found." };
  }

  const { error } = await supabase
    .from("deck_collaborators")
    .insert({
      deck_id: deckId,
      user_id: targetProfile.id,
      role,
    });

  if (error) {
    if (error.code === "23505") {
      return { error: "This user is already a collaborator." };
    }
    return { error: error.message };
  }

  revalidatePath(`/deck/${deckId}`);
  return { success: true };
}

export async function removeCollaborator(
  deckId: string,
  userId: string
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("deck_collaborators")
    .delete()
    .eq("deck_id", deckId)
    .eq("user_id", userId);

  if (error) throw error;
  revalidatePath(`/deck/${deckId}`);
}

export async function updateCollaboratorRole(
  deckId: string,
  userId: string,
  role: CollaboratorRole
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("deck_collaborators")
    .update({ role })
    .eq("deck_id", deckId)
    .eq("user_id", userId);

  if (error) throw error;
  revalidatePath(`/deck/${deckId}`);
}
