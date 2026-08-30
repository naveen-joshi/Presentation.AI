# Presentation.AI

Markdown-native presentations with real-time collaboration, reusable templates, and offline-capable desktop apps.

Rendering engine core vendored from [deckrun](https://github.com/arpitbbhayani/deckrun) (MIT, Copyright (c) 2026 Arpit Bhayani) — see `packages/renderer/LICENSE`.

## Structure

- `packages/renderer` — `@presentation-ai/renderer`: Markdown slide parser, themes, templates, transitions, deck/presenter HTML, preview iframe, lint, PDF export
- `apps/` — web and desktop applications (upcoming)
- `experiments/` — learning sandboxes for CRDT sync and offline editing (upcoming)

## Development

Requires Node.js >= 24 and pnpm >= 11.

```sh
pnpm install
pnpm build
pnpm typecheck
pnpm lint
pnpm test
```
