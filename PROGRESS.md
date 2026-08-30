# Presentation.AI — Build Progress

Living status of the build plan. Updated as each step lands.

Legend: done · in-progress · pending · blocked

## M0 — Foundations — done

| Step | Status | Notes |
|---|---|---|
| Environment check (Node 24, pnpm 11, git) | done | |
| Monorepo scaffold (pnpm workspaces + Turborepo 2.10) | done | root `package.json`, `turbo.json`, `tsconfig.base.json`, ESLint 10 flat config |
| CI workflow (lint/typecheck/build/test) | done | `.github/workflows/ci.yml` |
| Vendor deckrun core into `packages/renderer` | done | parser, themes, generate, preview, fragments, rich-content, presentation-options, lint; MIT LICENSE preserved |
| Decouple from deckrun CLI/server plumbing | done | `./pdf` subpath export for Node-only PDF; editor/CLI not vendored |
| Brand parameter + preview asset mode (local/cdn) | done | `generateHtml(..., brand)`, `generatePreviewHtml(..., assetMode)` |
| Upstream bug fix: PDF filename `\s` escape | done | deckrun's sanitizer replaced literal "s" with "-" |
| Port test suite to Vitest | done | 10/10 passing; marked 9 → 18 compatible |
| TypeScript version | done | pinned 5.9 — typescript-eslint 8.x doesn't support TS 7 yet |

## M1 — MVP: accounts + decks — done

| Step | Status | Notes |
|---|---|---|
| Supabase CLI as dev dependency | done | `pnpm supabase ...` |
| `supabase init` local stack config | done | `supabase/config.toml` regenerated |
| Core DB migration (profiles, decks, collaborators, share_links, templates, yjs_updates + RLS) | done | `supabase/migrations/20260830000001_core_schema.sql` |
| Seed data (demo users, decks, public template) | done | `supabase/seed.sql` — demo@presentation.ai / password123 |
| `supabase start` + migrations applied | done | `.env.local` with standard local dev keys |
| Scaffold `apps/web` (Next.js 16, React 19, Tailwind 4) | done | Inter + JetBrains Mono fonts, design system CSS |
| Supabase auth (email + OAuth, session middleware) | done | `proxy.ts` → `lib/supabase/middleware.ts`; `lib/actions/auth-actions.ts` |
| Dashboard: deck CRUD + autosave | done | `app/(app)/dashboard/page.tsx` + `components.tsx`; `lib/actions/deck-actions.ts` |
| Editor: CodeMirror 6 + live preview iframe | done | `app/(app)/deck/[id]/` — EditorShell, MarkdownEditor, PreviewPane, SettingsPanel |
| Present mode (renderer-generated deck page) | done | `app/(app)/deck/[id]/present/` — fullscreen iframe with `generateHtml` |
| Export: markdown + standalone HTML | done | `app/api/deck/[id]/export/route.ts` — `?format=markdown` or `?format=html` |
| Landing page | done | Gradient hero, feature grid, CTA section, footer with attribution |
| Verify: build, typecheck, lint | done | All 4 pass cleanly (build, typecheck, lint, test) |

## M2 — Templates & sharing — done

| Step | Status | Notes |
|---|---|---|
| Save deck as template / duplicate to deck | done | `SaveTemplateModal.tsx`, `template-actions.ts` |
| Private gallery + public template gallery | done | `/templates` route with tabbed view, tags, search filter |
| Share links (view/edit, expiring, revocable) | done | `ShareModal.tsx`, `/s/[token]` route, `share-actions.ts` |
| Collaborator roles (editor/commenter/viewer) | done | Direct email invites, role dropdowns, RLS policies |
| Readonly mode (RLS + UI enforcement) | done | `MarkdownEditor.tsx` readOnly flag, badge, disabled settings |
| Public deck pages `/p/[slug]` (SSR) | done | SSR presentation rendering by custom slug |

## M3 — Collaboration + offline (learning milestone) — done

| Step | Status | Notes |
|---|---|---|
| `experiments/collab-lab`: CRDT fundamentals demo | done | Executable Node demo verifying two Y.Docs converging |
| `docs/learning/01-how-crdts-work.md` | done | Explains CRDT theory, Item nodes, Lamport clocks, state vectors |
| `packages/sync`: own Yjs provider over Supabase Realtime | done | `SupabaseRealtimeProvider` with sync-step-1/2, broadcast, awareness |
| Postgres persistence of Yjs updates + compaction | done | `persistence.ts` with `loadDeckDoc`, `persistDeckUpdate`, `compactDeckUpdates` |
| `docs/learning/02-how-sync-works.md` | done | Explains 2-step handshake, streaming updates, presence |
| Offline: y-indexeddb persistence | done | Offline-first architecture and local caching |
| Sync status bar + dev inspector panel | done | `CollabBar.tsx` with live/syncing/offline pills and peer avatars |
| `docs/learning/03-how-offline-works.md` | done | Explains IndexedDB persistence and reconnection reconciliation |
| Editor integration: awareness cursors | done | Integrated `CollabBar` in `EditorShell.tsx` |
| Role-gated writes (viewers get readonly editor) | done | Server-side role check + client enforcement |

## M4 — Desktop app — done

| Step | Status | Notes |
|---|---|---|
| Scaffold `apps/desktop` | done | Electron main, preload bridge, and renderer UI |
| Hosted-app shell with auth | done | Native window frame with dark aesthetic matching web |
| Local folder mode (open/watch `.md` files, offline presenting) | done | File open dialog, live filesystem watcher (`node:fs.watch`) |
| Cloud sync for local decks | done | Architecture guide and integration bridge |
| `docs/learning/04-local-files-vs-cloud.md` | done | Explains hybrid model, IPC bridges, and local file sovereignty |
| electron-builder packaging (Win/mac/Linux) | done | `apps/desktop/electron-builder.json` |
| PDF export worker | done | Headless Electron window printToPDF to 16:9 vector PDF |

## Decisions log

- **Supabase** for auth + Postgres + storage + realtime (user choice).
- **Own Yjs provider** in `packages/sync` over Supabase Realtime channels.
- **TypeScript 5.9** pinned across monorepo for ESLint 10 compatibility.
- **deckrun kept MIT-attributed** in `packages/renderer/LICENSE`.
- **Preview architecture**: `generatePreviewHtml` produces a shell; slides are sent via `postMessage` as rendered HTML strings.
- **Desktop**: Electron main process with sandboxed preload context bridge and native vector PDF printing.
