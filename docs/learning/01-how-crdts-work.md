# How Conflict-Free Replicated Data Types (CRDTs) Work

In traditional collaborative applications (like Google Docs before CRDTs), systems relied on **Operational Transformation (OT)**. OT requires a central server to sequence and rewrite every single user action before it can be applied to other clients.

**Presentation.AI** uses **CRDTs** (Conflict-Free Replicated Data Types) via **Yjs**, enabling true peer-to-peer and offline-first collaboration without a centralized lock or transformation server.

---

## 1. What is a CRDT?

A CRDT is a data structure that can be replicated across multiple computers over a network, where replicas can be updated independently and concurrently without coordination between the replicas, and with a mathematical guarantee that all replicas will eventually converge to the same state (Strong Eventual Consistency).

### Key Properties:
- **Commutative**: The order in which operations arrive does not matter: `apply(A, apply(B, doc)) === apply(B, apply(A, doc))`.
- **Associative**: Grouping of operations does not affect the outcome.
- **Idempotent**: Applying the same update multiple times produces the identical state.

---

## 2. How Yjs Models Text (Y.Text)

Unlike plain strings or array indices (which shift when earlier text is deleted), Yjs represents text as a **doubly linked list of Item nodes**:

```
[Node A: "Hello "] <-> [Node B: "beautiful "] <-> [Node C: "world!"]
```

Each Item in Yjs is assigned a globally unique ID: `(client_id, clock)`.
- `client_id`: A randomly generated unique integer assigned to the client.
- `clock`: A monotonically increasing logical integer counter (Lamport timestamp).

### Concurrent Insert Example:
Suppose Client 1 and Client 2 both insert a word between "Hello " (Item A) and "world!" (Item C):
- Client 1 inserts `"beautiful "` with ID `(101, 1)` to the right of `A`.
- Client 2 inserts `"awesome "` with ID `(202, 1)` to the right of `A`.

When these updates cross the wire:
1. Both nodes know their left origin is `Item A`.
2. Yjs resolves the ordering deterministically using client IDs (`202 > 101`).
3. Both clients insert the items in the exact same sequence: `"Hello awesome beautiful world!"`.

---

## 3. State Vectors: Knowing What You Know

A **State Vector** is a compact map summarizing the latest clock each client has processed:

```json
{
  "client_101": 42,
  "client_202": 15
}
```

This single compact object allows Client A to ask Client B: *"Give me all updates that have occurred after clock 42 for client 101, and clock 15 for client 202"*.

This forms the basis of the **2-Step Sync Protocol** used in `@presentation-ai/sync`.
