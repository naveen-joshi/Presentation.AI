# How Realtime Sync Works: Supabase Broadcast + Yjs Protocol

Rather than relying on proprietary WebSockets or third-party paid services, **Presentation.AI** connects Yjs directly over standard **Supabase Realtime Broadcast Channels**.

---

## 1. The 2-Step Sync Protocol

When a client opens a presentation deck, it must synchronize with other active peers in the channel.

```
Client A (New)                                 Client B (Active Peer)
     │                                                    │
     │────────── 1. SyncStep 1 (StateVector A) ──────────>│
     │                                                    │
     │<───────── 2. SyncStep 2 (Missing Diff A) ──────────│
     │                                                    │
     │────────── 3. SyncStep 2 (Missing Diff B) ─────────>│
     │                                                    │
     ▼                                                    ▼
                 Both Docs are Now Synchronized!
```

### Step 1: Send State Vector (`SyncStep 1`)
Client A sends its current State Vector:
```ts
const sv = Y.encodeStateVector(doc);
channel.send({ type: "broadcast", event: "sync-step-1", payload: sv });
```

### Step 2: Calculate and Return Diffs (`SyncStep 2`)
When Client B receives Client A's state vector, it encodes only the document updates that Client A is missing:
```ts
const diff = Y.encodeStateAsUpdate(doc, svA);
channel.send({ type: "broadcast", event: "sync-step-2", payload: diff });
```
When Client A applies `diff`, it is brought up to date with Client B. Client A simultaneously calculates what Client B is missing and responds with `sync-step-2`.

---

## 2. Live Update Streaming

Once the initial handshake completes, every subsequent keystroke emits an update to the channel:

```ts
doc.on("update", (update: Uint8Array, origin: any) => {
  if (origin !== "remote") {
    channel.send({ type: "broadcast", event: "update", payload: update });
  }
});
```

When receiving a broadcast update:
```ts
channel.on("broadcast", { event: "update" }, ({ payload }) => {
  Y.applyUpdate(doc, payload, "remote");
});
```

---

## 3. Awareness: Cursors & Presence

Yjs includes an `Awareness` protocol that broadcasts transient user states (such as user profile, cursor position, selection range, and activity timestamps):

- Presence messages are sent periodically or on cursor movement.
- When a user disconnects or is idle for >30 seconds, their cursor is automatically pruned from the editor.
- The awareness state is never written to disk or the database.

---

## 4. Postgres Persistence & Compaction

Every 5–10 seconds (or on blur), changes are persisted to the database:
1. Updates are inserted as binary bytea into `yjs_updates`.
2. When `yjs_updates` exceeds 100 entries, a compaction worker merges all rows into a single `Y.encodeStateAsUpdate(doc)` snapshot and deletes the incremental records.
3. The latest Markdown text is extracted from the `Y.Text` type and saved to `decks.markdown` for instant SSR page generation.
