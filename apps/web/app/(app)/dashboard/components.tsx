"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Deck } from "@/lib/types";
import { createDeck, createDeckWithContent } from "@/lib/actions/deck-actions";
import { AiGenerateModal } from "../deck/[id]/components/AiGenerateModal";

export function DashboardActions() {
  const [showAiModal, setShowAiModal] = useState(false);
  const router = useRouter();

  const handleApplyAi = async (markdown: string, theme?: string) => {
    const titleMatch = markdown.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : "AI Generated Deck";
    const res = await createDeckWithContent(title, markdown, theme || "nord");
    router.push(`/deck/${res.id}`);
  };

  return (
    <div className="flex items-center gap-2.5">
      <button
        type="button"
        onClick={() => setShowAiModal(true)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:from-brand-700 hover:to-indigo-700 transition-all cursor-pointer active:scale-[0.98]"
      >
        <span>✨</span> Generate with AI
      </button>

      <form action={createDeck}>
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-surface px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-surface-2 transition-all cursor-pointer active:scale-[0.98]"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Blank deck
        </button>
      </form>

      {showAiModal && (
        <AiGenerateModal
          isOpen={showAiModal}
          onClose={() => setShowAiModal(false)}
          onApply={handleApplyAi}
        />
      )}
    </div>
  );
}

const THEME_COLORS: Record<string, string> = {
  nord: "from-blue-400 to-teal-500",
  midnight: "from-indigo-600 to-purple-700",
  paper: "from-amber-100 to-orange-200",
  neon: "from-green-400 to-cyan-500",
  sunset: "from-orange-500 to-pink-600",
  forest: "from-emerald-600 to-green-800",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function DeckGrid({
  decks,
  deleteDeck,
}: {
  decks: Deck[];
  deleteDeck: (id: string) => Promise<void>;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
      {decks.map((deck) => (
        <DeckCard key={deck.id} deck={deck} deleteDeck={deleteDeck} />
      ))}
    </div>
  );
}

function DeckCard({
  deck,
  deleteDeck,
}: {
  deck: Deck;
  deleteDeck: (id: string) => Promise<void>;
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const gradient =
    THEME_COLORS[deck.theme] ?? "from-slate-400 to-slate-600";

  const slideCount = deck.markdown
    .split(/\n[ \t]*---[ \t]*\n/)
    .filter(Boolean).length;

  return (
    <div className="group relative rounded-xl border border-[var(--border)] bg-background hover:border-[var(--border-hover)] shadow-sm hover:shadow-md transition-all duration-200">
      {/* Theme preview band */}
      <Link
        href={`/deck/${deck.id}`}
        className="block"
      >
        <div
          className={`h-32 rounded-t-xl bg-gradient-to-br ${gradient} flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity`}
        >
          <span className="text-white/80 text-sm font-medium px-4 text-center line-clamp-2 drop-shadow">
            {deck.title}
          </span>
        </div>
      </Link>

      {/* Meta */}
      <div className="p-4">
        <Link href={`/deck/${deck.id}`} className="block">
          <h3 className="font-semibold text-foreground truncate group-hover:text-brand-600 transition-colors">
            {deck.title}
          </h3>
        </Link>
        <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text-tertiary)]">
          <span className="inline-flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8" />
              <path d="M12 17v4" />
            </svg>
            {slideCount} slide{slideCount !== 1 ? "s" : ""}
          </span>
          <span>{deck.theme}</span>
          <span className="ml-auto">{timeAgo(deck.updated_at)}</span>
        </div>

        {/* Actions */}
        <div className="mt-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link
            href={`/deck/${deck.id}/present`}
            className="text-xs font-medium text-brand-600 hover:text-brand-500 transition-colors"
          >
            Present
          </Link>
          <span className="text-[var(--border)]">|</span>
          {!showConfirm ? (
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              className="text-xs font-medium text-[var(--text-tertiary)] hover:text-red-500 transition-colors cursor-pointer"
            >
              Delete
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 animate-fade-in">
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    await deleteDeck(deck.id);
                  })
                }
                className="text-xs font-bold text-red-500 hover:text-red-600 cursor-pointer disabled:opacity-50"
              >
                {isPending ? "Deleting…" : "Confirm"}
              </button>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="text-xs text-[var(--text-tertiary)] hover:text-foreground cursor-pointer"
              >
                Cancel
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
