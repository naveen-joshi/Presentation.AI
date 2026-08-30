import * as Y from "yjs";

/**
 * Presentation.AI — Collab Lab Experiment
 * Demonstrates deterministic CRDT convergence between two disconnected Y.Docs.
 */

console.log("\x1b[36m%s\x1b[0m", "=== 🧪 Presentation.AI Collab Lab (CRDT Convergence Demo) ===");

// 1. Initialize two independent documents representing Client A and Client B
const docA = new Y.Doc({ clientID: 1001 });
const docB = new Y.Doc({ clientID: 2002 });

const textA = docA.getText("content");
const textB = docB.getText("content");

// 2. Initial common state
textA.insert(0, "# Title: AI Presentations\n\n");
const initialUpdate = Y.encodeStateAsUpdate(docA);
Y.applyUpdate(docB, initialUpdate);

console.log("\n1. Initial Shared State:");
console.log("\x1b[32m%s\x1b[0m", textA.toString());

// 3. Concurrent edits while disconnected / offline
console.log("\n2. Simulating Concurrent Edits while Disconnected:");

// Alice (Client A) edits
textA.insert(textA.length, "## Slide 1: Fast Editing (by Alice)\n- Realtime collaboration\n");
console.log("\x1b[35m[Alice's local state]:\x1b[0m\n" + textA.toString());

// Bob (Client B) simultaneously edits
textB.insert(textB.length, "## Slide 2: Offline Ready (by Bob)\n- Works on airplanes\n");
console.log("\x1b[34m[Bob's local state]:\x1b[0m\n" + textB.toString());

// 4. Synchronization Handshake (2-step protocol)
console.log("\n3. Exchanging State Vectors & Synchronizing Diffs:");

// Step 1: Exchange State Vectors
const stateVectorA = Y.encodeStateVector(docA);
const stateVectorB = Y.encodeStateVector(docB);

// Step 2: Compute diffs relative to the other peer's state vector
const diffForB = Y.encodeStateAsUpdate(docA, stateVectorB);
const diffForA = Y.encodeStateAsUpdate(docB, stateVectorA);

// Step 3: Apply the diffs
Y.applyUpdate(docA, diffForA);
Y.applyUpdate(docB, diffForB);

// 5. Verification
const finalA = textA.toString();
const finalB = textB.toString();

console.log("\n4. Converged Results:");
console.log("\x1b[35m[Doc A Result]:\x1b[0m\n" + finalA);
console.log("\x1b[34m[Doc B Result]:\x1b[0m\n" + finalB);

if (finalA === finalB) {
  console.log("\x1b[32m%s\x1b[0m", "\n✅ SUCCESS: Both documents converged to identical byte-for-byte content without conflicts!\n");
} else {
  console.error("\x1b[31m%s\x1b[0m", "\n❌ ERROR: Documents diverged!\n");
  process.exit(1);
}
