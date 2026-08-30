"use client";

import { useState, useTransition } from "react";
import type { Template } from "@/lib/types";
import { createDeckFromTemplate, deleteTemplate } from "@/lib/actions/template-actions";

export function TemplateGallery({
  publicTemplates,
  userTemplates,
}: {
  publicTemplates: Template[];
  userTemplates: Template[];
}) {
  const [tab, setTab] = useState<"public" | "my">("public");
  const [search, setSearch] = useState("");

  const templates = tab === "public" ? publicTemplates : userTemplates;
  const filtered = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      {/* Search & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2 p-1 bg-surface rounded-xl border border-[var(--border)] w-fit">
          <button
            type="button"
            onClick={() => setTab("public")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              tab === "public"
                ? "bg-brand-600 text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-foreground"
            }`}
          >
            Public Gallery ({publicTemplates.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("my")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              tab === "my"
                ? "bg-brand-600 text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-foreground"
            }`}
          >
            My Templates ({userTemplates.length})
          </button>
        </div>

        <div className="relative max-w-xs w-full">
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-background pl-9 pr-3.5 py-1.5 text-xs text-foreground placeholder:text-[var(--text-tertiary)] focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 outline-none"
          />
          <svg
            className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[var(--text-tertiary)]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center text-sm text-[var(--text-secondary)]">
          No templates found in this section.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {filtered.map((tmpl) => (
            <TemplateCard
              key={tmpl.id}
              template={tmpl}
              isOwner={tab === "my"}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TemplateCard({
  template,
  isOwner,
}: {
  template: Template;
  isOwner: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const slideCount = template.markdown
    .split(/\n[ \t]*---[ \t]*\n/)
    .filter(Boolean).length;

  return (
    <div className="group rounded-xl border border-[var(--border)] bg-background hover:border-[var(--border-hover)] shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between gap-2 mb-2">
          <h3 className="font-semibold text-foreground truncate group-hover:text-brand-600 transition-colors">
            {template.name}
          </h3>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 border border-brand-200 dark:border-brand-800/40 shrink-0">
            {template.theme}
          </span>
        </div>

        <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-4 leading-relaxed">
          {template.description || "A ready-to-use presentation template."}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {template.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] text-[var(--text-tertiary)] bg-surface px-2 py-0.5 rounded-md border border-[var(--border)]"
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)] border-t border-[var(--border)] pt-3">
          <span>{slideCount} slides</span>
          <span>•</span>
          <span>{template.usage_count || 0} uses</span>
        </div>
      </div>

      <div className="bg-surface px-5 py-3 border-t border-[var(--border)] flex items-center justify-between">
        {isOwner && (
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await deleteTemplate(template.id);
              })
            }
            className="text-xs text-red-500 hover:text-red-600 transition-colors cursor-pointer disabled:opacity-50"
          >
            Delete
          </button>
        )}
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await createDeckFromTemplate(template.id);
            })
          }
          className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 px-3.5 py-1.5 rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
        >
          {isPending ? "Creating deck..." : "Use template →"}
        </button>
      </div>
    </div>
  );
}
