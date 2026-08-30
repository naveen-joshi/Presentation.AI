import type { Metadata } from "next";
import { getDecksByOwner, createDeck, deleteDeck } from "@/lib/actions/deck-actions";
import { DeckGrid, DashboardActions } from "./components";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const decks = await getDecksByOwner();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Your decks</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {decks.length === 0
              ? "No decks yet. Create your first one!"
              : `${decks.length} deck${decks.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <DashboardActions />
      </div>

      {/* Deck grid */}
      {decks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 animate-fade-in-up">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900/30 dark:to-brand-800/20 flex items-center justify-center mb-6">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--brand-500)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8" />
              <path d="M12 17v4" />
              <path d="M12 7v6M9 10h6" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            No presentations yet
          </h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-xs text-center mb-6">
            Create your first deck and start writing slides in Markdown.
          </p>
          <form action={createDeck}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-brand-700 transition-all cursor-pointer"
            >
              Create your first deck
            </button>
          </form>
        </div>
      ) : (
        <DeckGrid decks={decks} deleteDeck={deleteDeck} />
      )}
    </div>
  );
}
