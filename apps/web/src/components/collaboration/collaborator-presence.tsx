"use client";

import { Awareness } from "y-protocols/awareness";

interface CollaboratorPresenceProps {
  awareness: Awareness | null;
  localClientId: number;
}

interface AwarenessState {
  user?: {
    name?: string;
    color?: string;
  };
  cursor?: {
    x: number;
    y: number;
  };
}

export function CollaboratorPresence({
  awareness,
  localClientId,
}: CollaboratorPresenceProps) {
  if (!awareness) {
    return null;
  }

  const states = awareness.getStates();
  const collaborators = Array.from(states.entries()).filter(
    ([clientId]) => clientId !== localClientId
  );

  if (collaborators.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500">Collaborators:</span>
      {collaborators.map(([clientId, state]) => {
        const awarenessState = state as AwarenessState;
        const color = awarenessState.user?.color || "#4f46e5";
        const name = awarenessState.user?.name || "Collaborator";

        return (
          <span
            key={clientId}
            className="flex items-center gap-1 px-2 py-1 rounded bg-gray-100 text-xs font-medium border"
            style={{
              borderColor: `${color}40`,
              backgroundColor: `${color}15`,
              color: color,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span>{name}</span>
          </span>
        );
      })}
    </div>
  );
}
