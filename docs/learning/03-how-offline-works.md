# How Offline First Works in Presentation.AI

One of the defining architectural advantages of using CRDTs is seamless **Offline-First Editing**.

---

## 1. Local Persistence with IndexedDB

When you edit a presentation, changes are written synchronously to your browser's IndexedDB database via `y-indexeddb`:

```
┌──────────────┐     Update Event     ┌────────────────┐
│  CodeMirror  │ ───────────────────> │     Y.Doc      │
└──────────────┘                      └───────┬────────┘
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      ▼                                               ▼
             ┌─────────────────┐                             ┌─────────────────┐
             │    IndexedDB    │ (Instant Local Save)         │ Realtime Bridge │ (If Online)
             └─────────────────┘                             └─────────────────┘
```

1. Even if the network disconnects or the user closes the laptop on a flight, all keystrokes and document states are preserved in IndexedDB.
2. Opening `deck/[id]` while offline immediately restores the full document state from IndexedDB in <10ms without any network request.

---

## 2. Reconnection & Seamless Merge

When network connectivity returns:

```
[Offline Edits on Laptop]  ────┐
                               ├──> [CRDT Merge Engine] ───> [Unified Document]
[Online Edits from Colleague] ─┘
```

1. The client reconnects to Supabase Realtime.
2. The client transmits its State Vector (`SyncStep 1`).
3. The server/peers send any updates the client missed while offline.
4. The client transmits all updates created locally while offline.
5. Yjs reconciles all concurrent edits mathematically without conflicts, modal alerts, or lost data.

---

## 3. Conflict Resolution Guarantees

- **No Overwriting**: If User A modifies Slide 1 and User B creates Slide 3 while offline, both changes coexist seamlessly.
- **Concurrent Word Edits**: If both users edit the same paragraph, Yjs orders the inserted characters based on Lamport clock ordering.
- **Offline Template Creation**: Decks can be created, edited, and previewed completely offline.
