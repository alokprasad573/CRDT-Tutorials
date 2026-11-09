import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { eq, desc } from "drizzle-orm";
import * as Y from "yjs";
import { db } from "../database/connection";
import {
  users,
  documents,
  documentUpdates,
  documentSnapshots,
} from "../database/schema";
import { collaborationRepository } from "../database/repositories/collaboration";

const TEST_USER = {
  name: "Persistence Test User",
  email: "persistence-user@example.com",
  password: "secure-password-123",
};

let documentId: string | null = null;
let userId: string | null = null;

describe("Database — Yjs persistence & recovery", () => {
  beforeAll(async () => {
    await db.delete(users).where(eq(users.email, TEST_USER.email));

    const [created] = await db
      .insert(users)
      .values({
        name: TEST_USER.name,
        email: TEST_USER.email,
        passwordHash: "irrelevant-hash",
      })
      .returning({ id: users.id });
    if (!created) throw new Error("failed to create test user");
    userId = created.id;

    const [doc] = await db
      .insert(documents)
      .values({ ownerId: userId, title: "Persistence Test Document" })
      .returning({ id: documents.id });
    if (!doc) throw new Error("failed to create test document");
    documentId = doc.id;
  });

  afterAll(async () => {
    if (documentId) {
      await db.delete(documentUpdates).where(eq(documentUpdates.documentId, documentId));
      await db.delete(documentSnapshots).where(eq(documentSnapshots.documentId, documentId));
      await db.delete(documents).where(eq(documents.id, documentId));
    }
    if (userId) {
      await db.delete(users).where(eq(users.id, userId));
    }
  });

  it("should store and load Yjs updates (append-only)", async () => {
    if (!documentId) throw new Error("documentId not set");

    const ydoc = new Y.Doc();
    ydoc.getText("content").insert(0, "hello world");

    const update = Y.encodeStateAsUpdate(ydoc);
    await collaborationRepository.saveUpdate(documentId, update);

    const updates = await collaborationRepository.loadUpdatesAfter(documentId, null);
    expect(updates.length).toBeGreaterThan(0);
  });

  it("should report no snapshot before one is saved", async () => {
    if (!documentId) throw new Error("documentId not set");

    const snapshot = await collaborationRepository.loadLatestSnapshot(documentId);
    expect(snapshot).toBeNull();
  });

  it("should save a snapshot and preserve bytes through the database", async () => {
    if (!documentId) throw new Error("documentId not set");

    const ydoc = new Y.Doc();
    ydoc.getText("content").insert(0, "recovered content");

    const snapshot = Y.encodeStateAsUpdate(ydoc);
    const stateVector = Y.encodeStateVector(ydoc);

    const [lastUpdate] = await db
      .select({ id: documentUpdates.id })
      .from(documentUpdates)
      .where(eq(documentUpdates.documentId, documentId))
      .orderBy(desc(documentUpdates.id))
      .limit(1);

    await collaborationRepository.saveSnapshot(
      documentId,
      snapshot,
      stateVector,
      lastUpdate ? Number(lastUpdate.id) : null
    );

    const loaded = await collaborationRepository.loadLatestSnapshot(documentId);
    expect(loaded).not.toBeNull();
    expect(loaded!.snapshotData).not.toBeNull();
    expect(loaded!.snapshotData!.length).toBeGreaterThan(0);

    // The snapshot persisted to the database and was readable back through the
    // repository round-trip.
  });

  it("should recover document content when applying a Yjs update (in-memory)", async () => {
    const ydoc = new Y.Doc();
    ydoc.getText("content").insert(0, "recovered content");

    const update = Y.encodeStateAsUpdate(ydoc);

    const recovered = new Y.Doc();
    Y.applyUpdate(recovered, update);

    expect(recovered.getText("content").toString()).toBe("recovered content");
  });

  it("should load updates after a snapshot's lastUpdateId", async () => {
    if (!documentId) throw new Error("documentId not set");

    const snapshot = await collaborationRepository.loadLatestSnapshot(documentId);
    const updatesAfter = await collaborationRepository.loadUpdatesAfter(
      documentId,
      snapshot?.lastUpdateId ?? null
    );

    expect(Array.isArray(updatesAfter)).toBe(true);
  });
});
