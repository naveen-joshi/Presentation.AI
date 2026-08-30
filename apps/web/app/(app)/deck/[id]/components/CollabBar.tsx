"use client";

import type { UserPresence } from "@presentation-ai/sync";

interface CollabBarProps {
  status: "connected" | "connecting" | "disconnected";
  isSynced: boolean;
  peers?: UserPresence[];
}

export function CollabBar({
  status,
  isSynced,
  peers = [],
}: CollabBarProps) {

  const statusLabel =
    status === "connected"
      ? isSynced
        ? "Live"
        : "Syncing..."
      : "Offline";

  return (
    <div className="flex items-center gap-2">
      {/* Active collaborator avatars */}
      {peers.length > 0 && (
        <div className="flex items-center -space-x-1.5 mr-1">
          {peers.map((peer, idx) => (
            <div
              key={idx}
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-xs border-2 border-background"
              style={{ backgroundColor: peer.color || "#6366f1" }}
              title={`${peer.name} is editing`}
            >
              {(peer.name || "U")[0].toUpperCase()}
            </div>
          ))}
        </div>
      )}

      {/* Status indicator */}
      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface border border-[var(--border)] text-[11px] font-medium">
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            status === "connected" ? "bg-emerald-500 animate-pulse" : "bg-neutral-400"
          }`}
        />
        <span className="text-[var(--text-secondary)]">{statusLabel}</span>
      </div>
    </div>
  );
}
