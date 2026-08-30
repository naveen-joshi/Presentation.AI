import * as Y from "yjs";
import { Awareness } from "y-protocols/awareness";
import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";

export interface UserPresence {
  name: string;
  color: string;
  avatar?: string;
  cursor?: {
    anchor: number;
    head: number;
  } | null;
}

export interface ProviderOptions {
  channelName: string;
  doc: Y.Doc;
  supabase: SupabaseClient;
  user?: UserPresence;
  awareness?: Awareness;
}

export type ConnectionStatus = "connecting" | "connected" | "disconnected";

export class SupabaseRealtimeProvider {
  public doc: Y.Doc;
  public awareness: Awareness;
  public channel: RealtimeChannel;
  public status: ConnectionStatus = "connecting";
  public isSynced = false;

  private statusListeners = new Set<(status: ConnectionStatus) => void>();
  private syncListeners = new Set<(isSynced: boolean) => void>();

  constructor(options: ProviderOptions) {
    this.doc = options.doc;
    this.awareness = options.awareness ?? new Awareness(this.doc);

    // Set initial awareness state if user presence is provided
    if (options.user) {
      this.awareness.setLocalStateField("user", options.user);
    }

    // Create channel
    this.channel = options.supabase.channel(`deck-collab:${options.channelName}`, {
      config: {
        broadcast: { self: false },
        presence: { key: options.user?.name ?? "anonymous" },
      },
    });

    this.setupDocListeners();
    this.setupAwarenessListeners();
    this.setupChannelListeners();
  }

  private setStatus(status: ConnectionStatus) {
    this.status = status;
    this.statusListeners.forEach((fn) => fn(status));
  }

  private setSynced(synced: boolean) {
    this.isSynced = synced;
    this.syncListeners.forEach((fn) => fn(synced));
  }

  public onStatus(listener: (status: ConnectionStatus) => void) {
    this.statusListeners.add(listener);
    listener(this.status);
    return () => this.statusListeners.delete(listener);
  }

  public onSynced(listener: (isSynced: boolean) => void) {
    this.syncListeners.add(listener);
    listener(this.isSynced);
    return () => this.syncListeners.delete(listener);
  }

  private setupDocListeners() {
    this.doc.on("update", (update: Uint8Array, origin: unknown) => {
      if (origin === this) return; // Do not broadcast updates received from remote
      if (this.status !== "connected") return;

      const base64 = fromUint8Array(update);
      this.channel.send({
        type: "broadcast",
        event: "update",
        payload: { update: base64 },
      });
    });
  }

  private setupAwarenessListeners() {
    this.awareness.on("update", ({ added, updated, removed }: { added: number[]; updated: number[]; removed: number[] }) => {
      const changedClients = added.concat(updated, removed);
      const states = this.awareness.getStates();
      const payload: Record<number, unknown> = {};
      changedClients.forEach((clientID) => {
        payload[clientID] = states.get(clientID);
      });

      if (this.status === "connected") {
        this.channel.send({
          type: "broadcast",
          event: "awareness",
          payload,
        });
      }
    });
  }

  private setupChannelListeners() {
    this.channel
      .on("broadcast", { event: "sync-step-1" }, ({ payload }) => {
        if (!payload?.stateVector) return;
        const sv = toUint8Array(payload.stateVector);
        const diff = Y.encodeStateAsUpdate(this.doc, sv);
        if (diff.length > 0) {
          this.channel.send({
            type: "broadcast",
            event: "sync-step-2",
            payload: { update: fromUint8Array(diff) },
          });
        }
      })
      .on("broadcast", { event: "sync-step-2" }, ({ payload }) => {
        if (!payload?.update) return;
        const update = toUint8Array(payload.update);
        Y.applyUpdate(this.doc, update, this);
        this.setSynced(true);
      })
      .on("broadcast", { event: "update" }, ({ payload }) => {
        if (!payload?.update) return;
        const update = toUint8Array(payload.update);
        Y.applyUpdate(this.doc, update, this);
      })
      .on("broadcast", { event: "awareness" }, ({ payload }) => {
        if (!payload) return;
        Object.entries(payload).forEach(([clientID, state]) => {
          const id = parseInt(clientID, 10);
          if (id === this.doc.clientID) return;
          if (state === undefined) {
            this.awareness.getStates().delete(id);
          } else {
            this.awareness.getStates().set(id, state as Record<string, unknown>);
          }
        });
        this.awareness.emit("change", [{ added: [], updated: Object.keys(payload).map(Number), removed: [] }, this]);
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          this.setStatus("connected");
          // Initiate SyncStep 1: Broadcast local state vector
          const sv = Y.encodeStateVector(this.doc);
          this.channel.send({
            type: "broadcast",
            event: "sync-step-1",
            payload: { stateVector: fromUint8Array(sv) },
          });
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          this.setStatus("disconnected");
        }
      });
  }

  public destroy() {
    this.statusListeners.clear();
    this.syncListeners.clear();
    this.awareness.destroy();
    this.channel.unsubscribe();
  }
}

/* ─── Base64 Binary Utilities ─────────────────────────────────────────────── */

function fromUint8Array(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function toUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
