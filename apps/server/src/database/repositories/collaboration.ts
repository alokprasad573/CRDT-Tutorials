import { db } from "../connection";
import { documentUpdates, documentSnapshots } from "../schema";
import { eq, and, desc, asc, gt } from "drizzle-orm";
import * as Y from "yjs";

/**
 * Persistence repository for Yjs collaborative document data.
 *
 * Stores encoded Yjs updates (append-only) and periodic snapshots
 * in Neon PostgreSQL for durable document recovery.
 */
export const collaborationRepository = {
  /**
   * Store an encoded Yjs update for a document.
   * Append-only — updates are never overwritten.
   */
  async saveUpdate(documentId: string, update: Uint8Array): Promise<void> {
    await db.insert(documentUpdates).values({
      documentId,
      updateData: Buffer.from(update),
    });
  },

  /**
   * Store a snapshot of the current Yjs document state.
   */
  async saveSnapshot(
    documentId: string,
    snapshot: Uint8Array,
    stateVector: Uint8Array | null,
    lastUpdateId: number | null
  ): Promise<void> {
    await db.insert(documentSnapshots).values({
      documentId,
      snapshotData: Buffer.from(snapshot),
      stateVector: stateVector ? Buffer.from(stateVector) : null,
      lastUpdateId: lastUpdateId ? BigInt(lastUpdateId) : null,
    });
  },

  /**
   * Load the latest snapshot for a document.
   * Returns the snapshot data, state vector, and last update ID covered.
   */
  async loadLatestSnapshot(documentId: string): Promise<{
    snapshotData: Uint8Array | null;
    stateVector: Uint8Array | null;
    lastUpdateId: bigint | null;
  } | null> {
    const [snapshot] = await db
      .select({
        snapshotData: documentSnapshots.snapshotData,
        stateVector: documentSnapshots.stateVector,
        lastUpdateId: documentSnapshots.lastUpdateId,
      })
      .from(documentSnapshots)
      .where(eq(documentSnapshots.documentId, documentId))
      .orderBy(desc(documentSnapshots.createdAt))
      .limit(1);

    if (!snapshot) {
      return null;
    }

    return {
      snapshotData: snapshot.snapshotData,
      stateVector: snapshot.stateVector,
      lastUpdateId: snapshot.lastUpdateId,
    };
  },

  /**
   * Load all updates after a given update ID for a document.
   * Used during recovery to replay changes after a snapshot.
   */
  async loadUpdatesAfter(
    documentId: string,
    afterUpdateId: bigint | null
  ): Promise<Uint8Array[]> {
    const updates = await db
      .select({ updateData: documentUpdates.updateData })
      .from(documentUpdates)
      .where(
        afterUpdateId
          ? and(
              eq(documentUpdates.documentId, documentId),
              gt(documentUpdates.id, afterUpdateId)
            )
          : eq(documentUpdates.documentId, documentId)
      )
      .orderBy(asc(documentUpdates.id));

    return updates.map((u) => new Uint8Array(u.updateData as Buffer));
  },
};
