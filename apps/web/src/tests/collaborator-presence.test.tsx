import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Awareness } from "y-protocols/awareness";
import { CollaboratorPresence } from "@/components/collaboration/collaborator-presence";

/// <reference types="@testing-library/jest-dom" />

type MockState = {
  user?: {
    name?: string;
    color?: string;
  };
  cursor?: {
    x: number;
    y: number;
  };
};

describe("CollaboratorPresence", () => {
  const createMockAwareness = (states: Map<number, MockState>): Awareness =>
    ({
      getStates: () => states,
      getLocalState: () => ({ clientID: 1 }),
      destroy: () => {},
      setLocalStateField: () => {},
      on: () => {},
    }) as unknown as Awareness;

  it("renders nothing when no collaborators exist", () => {
    const states = new Map<number, MockState>();
    states.set(1, { user: { name: "Local User", color: "#4f46e5" } });

    render(<CollaboratorPresence awareness={createMockAwareness(states)} localClientId={1} />);

    expect(screen.queryByText("Collaborators:")).not.toBeInTheDocument();
    expect(screen.queryByText("Local User")).not.toBeInTheDocument();
  });

  it("renders remote collaborators", () => {
    const states = new Map<number, MockState>();
    states.set(1, { user: { name: "Local User", color: "#4f46e5" } });
    states.set(2, { user: { name: "Remote User", color: "#dc2626" } });

    render(<CollaboratorPresence awareness={createMockAwareness(states)} localClientId={1} />);

    expect(screen.getByText("Collaborators:")).toBeInTheDocument();
    expect(screen.getByText("Remote User")).toBeInTheDocument();
  });

  it("filters out local client from collaborator list", () => {
    const states = new Map<number, MockState>();
    states.set(1, { user: { name: "Local User", color: "#4f46e5" } });
    states.set(2, { user: { name: "Remote User", color: "#dc2626" } });

    render(<CollaboratorPresence awareness={createMockAwareness(states)} localClientId={1} />);

    expect(screen.getByText("Remote User")).toBeInTheDocument();
    expect(screen.queryByText("Local User")).not.toBeInTheDocument();
  });
});
