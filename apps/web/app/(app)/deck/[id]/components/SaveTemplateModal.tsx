"use client";

import { useState, useTransition } from "react";
import { createTemplateFromDeck } from "@/lib/actions/template-actions";

interface SaveTemplateModalProps {
  deckId: string;
  defaultTitle: string;
  onClose: () => void;
}

export function SaveTemplateModal({
  deckId,
  defaultTitle,
  onClose,
}: SaveTemplateModalProps) {
  const [name, setName] = useState(defaultTitle);
  const [description, setDescription] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(["custom"]);
  const [isPublic, setIsPublic] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter((tag) => tag !== t));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await createTemplateFromDeck(deckId, {
        name,
        description,
        tags,
        isPublic,
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="glass rounded-2xl p-6 shadow-2xl max-w-md w-full border border-[var(--border)] animate-fade-in-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Save as Template</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--text-tertiary)] hover:text-foreground p-1 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center text-emerald-500 font-semibold animate-fade-in">
            ✓ Template saved successfully!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="tmpl-name"
                className="block text-xs font-medium text-[var(--text-secondary)] mb-1"
              >
                Template Name
              </label>
              <input
                id="tmpl-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-background px-3 py-2 text-sm text-foreground focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="tmpl-desc"
                className="block text-xs font-medium text-[var(--text-secondary)] mb-1"
              >
                Description
              </label>
              <textarea
                id="tmpl-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this template best used for?"
                className="w-full rounded-lg border border-[var(--border)] bg-background px-3 py-2 text-sm text-foreground focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 outline-none resize-none"
              />
            </div>

            <div>
              <label
                htmlFor="tmpl-tags"
                className="block text-xs font-medium text-[var(--text-secondary)] mb-1"
              >
                Tags
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="tmpl-tags"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="e.g. pitch, meeting"
                  className="flex-1 rounded-lg border border-[var(--border)] bg-background px-3 py-1.5 text-xs text-foreground focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-surface text-xs font-medium text-foreground hover:bg-surface-2 cursor-pointer"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 text-[11px]"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-red-500 cursor-pointer ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                id="tmpl-public"
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="rounded border-[var(--border)] text-brand-600 focus:ring-brand-500"
              />
              <label htmlFor="tmpl-public" className="text-xs text-foreground font-medium cursor-pointer">
                Publish to Public Template Gallery
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-[var(--text-secondary)] hover:text-foreground transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700 transition-all cursor-pointer disabled:opacity-50"
              >
                {isPending ? "Saving..." : "Save Template"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
