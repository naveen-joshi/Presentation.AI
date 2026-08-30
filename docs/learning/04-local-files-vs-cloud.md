# Local Files vs. Cloud Architecture: The Hybrid Sync Model

The desktop app introduces a powerful duality: **Local Folder Mode** (working with offline `.md` files on your hard drive) vs **Cloud Realtime Mode** (collaborating with your team via Supabase).

---

## 1. Local Folder Mode (Offline & Sovereign)

For developers and privacy-focused speakers, presentations often live as `.md` files in a Git repository:

```
my-talks/
├── 01-intro.md
├── 02-architecture.md
└── assets/
    └── diagram.png
```

### Key Capabilities in Desktop App:
- **Instant Local File Watching**: Uses filesystem watchers (`fs.watch`) so editing in VS Code, Neovim, or Obsidian immediately hot-reloads the slide presentation.
- **Embedded Rendering Engine**: The `@presentation-ai/renderer` runs completely inside the Electron client process without making any HTTP requests or internet connections.
- **Headless PDF Generation**: Uses Electron's built-in Chromium compositor to print slide decks to pixel-perfect vector PDFs at standard 16:9 projector resolutions.

---

## 2. Cloud Sync Bridge

When a user wants to collaborate on a local deck with team members:

```
[Local File on Disk] ──(Desktop Sync Worker)──> [Yjs CRDT Document] ──(Supabase Realtime)──> [Team Cloud]
```

1. **Bi-directional Mapping**: The local Markdown string is parsed into a `Y.Doc` and mapped to a cloud `deck_id`.
2. **Local Priority**: If an internet interruption occurs, the desktop continues saving to the local disk file.
3. **Reconciliation**: On reconnect, any cloud updates made by teammates are merged and written back to the local `.md` file.

---

## 3. Sandboxing & Preload Security

Electron applications must adhere to modern security standards:
- `nodeIntegration: false`
- `contextIsolation: true`
- All filesystem and native dialog actions are strictly gated behind typed IPC channels exposed in `preload/index.ts`.
