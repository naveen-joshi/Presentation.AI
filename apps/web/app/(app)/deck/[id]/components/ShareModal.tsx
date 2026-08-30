"use client";

import { useState, useEffect, useTransition } from "react";
import type { Deck, ShareLink, Collaborator, CollaboratorRole } from "@/lib/types";
import {
  getShareLinks,
  createShareLink,
  revokeShareLink,
  getCollaborators,
  addCollaborator,
  removeCollaborator,
  updateCollaboratorRole,
} from "@/lib/actions/share-actions";
import { updateDeck } from "@/lib/actions/deck-actions";

interface ShareModalProps {
  deck: Deck;
  onClose: () => void;
  onDeckUpdated?: (updates: Partial<Deck>) => void;
}

export function ShareModal({ deck, onClose, onDeckUpdated }: ShareModalProps) {
  const [visibility, setVisibility] = useState(deck.visibility);
  const [slug, setSlug] = useState(deck.slug ?? "");
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [newCollabEmail, setNewCollabEmail] = useState("");
  const [newCollabRole, setNewCollabRole] = useState<CollaboratorRole>("editor");
  const [collabError, setCollabError] = useState("");
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function loadData() {
      try {
        const [links, collabs] = await Promise.all([
          getShareLinks(deck.id),
          getCollaborators(deck.id),
        ]);
        setShareLinks(links);
        setCollaborators(collabs);
      } catch (e) {
        console.error("Error loading share info", e);
      }
    }
    loadData();
  }, [deck.id]);

  const handleVisibilityChange = async (newVis: Deck["visibility"]) => {
    setVisibility(newVis);
    await updateDeck(deck.id, { visibility: newVis });
    onDeckUpdated?.({ visibility: newVis });
  };

  const handleSlugSave = async () => {
    const formattedSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
    setSlug(formattedSlug);
    await updateDeck(deck.id, { slug: formattedSlug || null });
    onDeckUpdated?.({ slug: formattedSlug || null });
  };

  const handleCreateLink = (role: CollaboratorRole) => {
    startTransition(async () => {
      const link = await createShareLink(deck.id, role);
      setShareLinks([link, ...shareLinks]);
    });
  };

  const handleRevokeLink = (linkId: string) => {
    startTransition(async () => {
      await revokeShareLink(linkId, deck.id);
      setShareLinks(shareLinks.filter((l) => l.id !== linkId));
    });
  };

  const handleAddCollaborator = (e: React.FormEvent) => {
    e.preventDefault();
    setCollabError("");
    startTransition(async () => {
      const res = await addCollaborator(deck.id, newCollabEmail, newCollabRole);
      if (res.error) {
        setCollabError(res.error);
      } else {
        setNewCollabEmail("");
        const collabs = await getCollaborators(deck.id);
        setCollaborators(collabs);
      }
    });
  };

  const handleRemoveCollaborator = (userId: string) => {
    startTransition(async () => {
      await removeCollaborator(deck.id, userId);
      setCollaborators(collaborators.filter((c) => c.user_id !== userId));
    });
  };

  const handleUpdateRole = (userId: string, role: CollaboratorRole) => {
    startTransition(async () => {
      await updateCollaboratorRole(deck.id, userId, role);
      setCollaborators(
        collaborators.map((c) => (c.user_id === userId ? { ...c, role } : c))
      );
    });
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="glass rounded-2xl p-6 shadow-2xl max-w-lg w-full border border-[var(--border)] max-h-[90vh] overflow-y-auto animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-foreground">Share presentation</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--text-tertiary)] hover:text-foreground p-1 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Visibility Setting */}
        <div className="mb-6 p-4 rounded-xl bg-surface border border-[var(--border)]">
          <label className="block text-xs font-semibold text-foreground mb-2">
            Deck Visibility
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["private", "unlisted", "public"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => handleVisibilityChange(v)}
                className={`py-2 px-3 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer border ${
                  visibility === v
                    ? "bg-brand-600 text-white border-brand-600 shadow-xs"
                    : "bg-background text-[var(--text-secondary)] border-[var(--border)] hover:bg-surface-2"
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          {visibility === "public" && (
            <div className="mt-3 pt-3 border-t border-[var(--border)]">
              <label
                htmlFor="deck-slug"
                className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1"
              >
                Public URL Slug
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--text-tertiary)] font-mono">
                  /p/
                </span>
                <input
                  id="deck-slug"
                  type="text"
                  placeholder="custom-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  onBlur={handleSlugSave}
                  className="flex-1 rounded-md border border-[var(--border)] bg-background px-2.5 py-1 text-xs text-foreground font-mono focus:border-brand-500 outline-none"
                />
                <button
                  type="button"
                  onClick={handleSlugSave}
                  className="text-xs px-2.5 py-1 bg-surface-2 hover:bg-[var(--border)] rounded text-foreground font-medium cursor-pointer"
                >
                  Save
                </button>
              </div>
              {deck.slug && (
                <div className="mt-2 flex items-center justify-between text-xs">
                  <a
                    href={`/p/${deck.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-600 hover:underline truncate"
                  >
                    {origin}/p/{deck.slug}
                  </a>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(`${origin}/p/${deck.slug}`, "public-slug")}
                    className="text-[11px] text-[var(--text-tertiary)] hover:text-foreground ml-2 cursor-pointer shrink-0"
                  >
                    {copiedLink === "public-slug" ? "✓ Copied" : "Copy"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Share Links */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-foreground">Share Links</h3>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleCreateLink("viewer")}
                className="text-[11px] font-medium text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 px-2 py-1 rounded transition-colors cursor-pointer"
              >
                + View Link
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleCreateLink("editor")}
                className="text-[11px] font-medium text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 px-2 py-1 rounded transition-colors cursor-pointer"
              >
                + Edit Link
              </button>
            </div>
          </div>

          {shareLinks.length === 0 ? (
            <p className="text-xs text-[var(--text-tertiary)] italic">
              No active share links created.
            </p>
          ) : (
            <div className="space-y-2">
              {shareLinks.map((link) => {
                const url = `${origin}/s/${link.token}`;
                return (
                  <div
                    key={link.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-surface border border-[var(--border)] text-xs"
                  >
                    <div className="min-w-0 flex-1 mr-2">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-semibold text-foreground capitalize">
                          {link.role} link
                        </span>
                        <span className="text-[10px] text-[var(--text-tertiary)] font-mono">
                          ({link.token.slice(0, 8)}...)
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)] font-mono truncate">
                        {url}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(url, link.id)}
                        className="px-2.5 py-1 rounded bg-background hover:bg-surface-2 border border-[var(--border)] font-medium text-[11px] text-foreground cursor-pointer"
                      >
                        {copiedLink === link.id ? "✓ Copied" : "Copy"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRevokeLink(link.id)}
                        className="text-[11px] text-red-500 hover:text-red-600 cursor-pointer"
                      >
                        Revoke
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Collaborators */}
        <div>
          <h3 className="text-xs font-semibold text-foreground mb-2">
            Direct Collaborators
          </h3>

          <form onSubmit={handleAddCollaborator} className="flex gap-2 mb-3">
            <input
              type="email"
              required
              placeholder="colleague@example.com"
              value={newCollabEmail}
              onChange={(e) => setNewCollabEmail(e.target.value)}
              className="flex-1 rounded-lg border border-[var(--border)] bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-[var(--text-tertiary)] focus:border-brand-500 outline-none"
            />
            <select
              value={newCollabRole}
              onChange={(e) => setNewCollabRole(e.target.value as CollaboratorRole)}
              className="rounded-lg border border-[var(--border)] bg-background px-2 py-1.5 text-xs text-foreground outline-none cursor-pointer"
            >
              <option value="editor">Editor</option>
              <option value="commenter">Commenter</option>
              <option value="viewer">Viewer</option>
            </select>
            <button
              type="submit"
              disabled={isPending}
              className="px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 cursor-pointer disabled:opacity-50"
            >
              Invite
            </button>
          </form>

          {collabError && (
            <div className="mb-3 text-xs text-red-500 animate-fade-in">
              {collabError}
            </div>
          )}

          {collaborators.length === 0 ? (
            <p className="text-xs text-[var(--text-tertiary)] italic">
              No individual collaborators invited yet.
            </p>
          ) : (
            <div className="space-y-2">
              {collaborators.map((c) => (
                <div
                  key={c.user_id}
                  className="flex items-center justify-between p-2 rounded-lg bg-surface border border-[var(--border)] text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                      {(c.profile?.full_name ?? c.profile?.email ?? "U")[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {c.profile?.full_name ?? c.profile?.email}
                      </p>
                      {c.profile?.full_name && (
                        <p className="text-[10px] text-[var(--text-tertiary)] truncate">
                          {c.profile.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={c.role}
                      onChange={(e) =>
                        handleUpdateRole(c.user_id, e.target.value as CollaboratorRole)
                      }
                      className="rounded border border-[var(--border)] bg-background px-2 py-0.5 text-[11px] text-foreground outline-none cursor-pointer"
                    >
                      <option value="editor">Editor</option>
                      <option value="commenter">Commenter</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemoveCollaborator(c.user_id)}
                      className="text-red-500 hover:text-red-600 text-xs p-1 cursor-pointer"
                      title="Remove collaborator"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
