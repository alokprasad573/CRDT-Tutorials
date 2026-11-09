import { Hocuspocus } from "@hocuspocus/server";
import * as Y from "yjs";
import { authenticateWebSocket } from "./authentication";
import {
  documents,
  documentMembers,
  documentUpdates,
} from "../database/schema";
import { eq, and, isNull, desc, asc } from "drizzle-orm";
import { db } from "../database/connection";
import { collaborationRepository } from "../database/repositories/collaboration";

/**
 * Document name prefix for Yjs collaboration sessions.
 *
 * Format: document:<document-id>
 *
 * The document identifier is used for routing and lookup only — it is
 * not proof of authorization. Access is always verified against the
 * database in the onLoadDocument hook.
 */
const DOCUMENT_NAME_PREFIX = "document:";

/**
 * Role ranking for permission checks.
 */
const ROLE_RANK: Record<string, number> = {
  none: 0,
  viewer: 1,
  editor: 2,
  owner: 3,
};

/**
 * Extracts the database document ID from a Hocuspocus document name.
 *
 * @param documentName - e.g. "document:56287dcb-5040-4141-88a8-0701392004a1"
 * @returns the document UUID, or null if the name is malformed
 */
function extractDocumentId(documentName: string): string | null {
  if (!documentName.startsWith(DOCUMENT_NAME_PREFIX)) {
    return null;
  }
  return documentName.slice(DOCUMENT_NAME_PREFIX.length);
}

/**
 * Resolves the authenticated user's effective role for a document.
 * Returns "none" if the user has no access.
 */
async function resolveDocumentRole(
  documentId: string,
  userId: string
): Promise<"owner" | "editor" | "viewer" | "none"> {
  const [doc] = await db
    .select({ id: documents.id, ownerId: documents.ownerId })
    .from(documents)
    .where(
      and(
        eq(documents.id, documentId),
        isNull(documents.deletedAt)
      )
    )
    .limit(1);

  if (!doc) {
    return "none";
  }

  if (doc.ownerId === userId) {
    return "owner";
  }

  const [member] = await db
    .select({ role: documentMembers.role })
    .from(documentMembers)
    .where(
      and(
        eq(documentMembers.documentId, documentId),
        eq(documentMembers.userId, userId)
      )
    )
    .limit(1);

  if (!member) {
    return "none";
  }

  return (member.role as "owner" | "editor" | "viewer") || "none";
}

/**
 * Creates and configures the Hocuspocus collaboration server instance.
 *
 * The Hocuspocus instance is responsible for:
 *   - Authenticating every WebSocket connection (via session cookie)
 *   - Authorizing document-level access (owner/editor/viewer)
 *   - Enforcing read-only access for viewers
 *   - Managing Yjs document lifecycle
 *   - Persisting Yjs updates to PostgreSQL (Phase 8)
 *   - Loading document state on session start for recovery (Phase 8)
 */
export const hocuspocus = new Hocuspocus({
  /**
   * Authenticate every WebSocket connection.
   *
   * Reads the session cookie, validates it against the server-side
   * session store, and identifies the user. Rejects unauthenticated
   * connections.
   */
  async onAuthenticate({ context, requestHeaders, connectionConfig }) {
    const cookieHeader = requestHeaders.get("cookie");

    const fakeRequest = {
      headers: cookieHeader ? { cookie: cookieHeader } : undefined,
    };

    const auth = await authenticateWebSocket(fakeRequest);
    if (!auth) {
      throw new Error("Authentication required");
    }

    context.userId = auth.userId;
    connectionConfig.isAuthenticated = true;
  },

  /**
   * Load or create a Yjs document when a client requests it.
   *
   * Verifies that the authenticated user has access to the requested
   * document. Sets readOnly=true for viewers so they cannot submit
   * Yjs updates. Rejects unauthorized access.
   *
   * Phase 8: Loads the latest snapshot and subsequent Yjs updates
   * from PostgreSQL and applies them to the Y.Doc before serving
   * it to the client, enabling recovery after server restarts.
   */
  async onLoadDocument({ context, documentName, connectionConfig }) {
    const userId = context.userId as string | undefined;
    if (!userId) {
      throw new Error("Authentication required");
    }

    const documentId = extractDocumentId(documentName);
    if (!documentId) {
      throw new Error("Invalid document name");
    }

    const role = await resolveDocumentRole(documentId, userId);

    if (role === "none") {
      throw new Error("Access denied to this document");
    }

    // Enforce read-only for viewers at the collaboration server level.
    if (role === "viewer") {
      connectionConfig.readOnly = true;
    }

    context.role = role;
    context.documentId = documentId;

    // Phase 8: Load persisted state for recovery
    // 1. Load latest snapshot
    const snapshot = await collaborationRepository.loadLatestSnapshot(
      documentId
    );

    // 2. Load updates after the snapshot
    const updates = await collaborationRepository.loadUpdatesAfter(
      documentId,
      snapshot?.lastUpdateId ?? null
    );

    // 3. Apply snapshot and updates to the Y.Doc that Hocuspocus will serve
    // Hocuspocus passes the Y.Doc via context; we apply stored state to it.
    // The document is already created by Hocuspocus; we get it from context.
    // Note: Hocuspocus v4 creates the Y.Doc internally. We apply the state
    // by encoding it as an update and applying it.
    if (snapshot?.snapshotData) {
      try {
        // Apply the snapshot state to the document
        const ydoc = context.document as Y.Doc | undefined;
        if (ydoc) {
          Y.applyUpdate(ydoc, snapshot.snapshotData);
        }
      } catch (err) {
        console.error(
          `[persistence] Failed to apply snapshot for document ${documentId}:`,
          (err as Error).message
        );
      }
    }

    // 4. Apply subsequent updates
    for (const update of updates) {
      try {
        const ydoc = context.document as Y.Doc | undefined;
        if (ydoc) {
          Y.applyUpdate(ydoc, update);
        }
      } catch (err) {
        console.error(
          `[persistence] Failed to apply update for document ${documentId}:`,
          (err as Error).message
        );
      }
    }
  },

  /**
   * Handle Yjs document updates.
   *
   * This hook fires when a client sends a Yjs update. We enforce
   * read-only here as a defense-in-depth measure: viewers should
   * never be able to submit updates.
   *
   * Phase 8: Persist the Yjs update to document_updates table.
   */
  async onChange({ context, connection }) {
    const role = context.role as string | undefined;
    if (role === "viewer" || role === "none") {
      throw new Error("Viewers cannot submit document updates");
    }

    const documentId = context.documentId as string | undefined;
    if (!documentId) {
      throw new Error("Document ID not found in context");
    }

    // Phase 8: Persist the Yjs update
    // The `connection` parameter provides access to the Y.Doc and the update.
    // We use Y.encodeStateAsUpdate to get the update and store it.
    try {
      const ydoc = (connection as { document: Y.Doc }).document;
      const update = Y.encodeStateAsUpdate(ydoc);
      await collaborationRepository.saveUpdate(documentId, update);
    } catch (err) {
      console.error(
        `[persistence] Failed to persist update for document ${documentId}:`,
        (err as Error).message
      );
      // Don't throw — the update was already applied to the shared doc.
      // Persistence failure should not break collaboration.
    }
  },

  /**
   * Handle document store (persistence) events.
   *
   * Phase 8: Store a snapshot of the Yjs document state when Hocuspocus
   * determines it's time to compact (e.g., periodically or on unload).
   */
  async onStoreDocument({ document }) {
    try {
      const documentName = document.name as string;
      const documentId = extractDocumentId(documentName);
      if (!documentId) return;

      const ydoc = document as Y.Doc;
      const snapshot = Y.encodeStateAsUpdate(ydoc);
      const stateVector = Y.encodeStateVector(ydoc);

      // Get the last update ID for reference
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
    } catch (err) {
      console.error(
        `[persistence] Failed to store document snapshot:`,
        (err as Error).message
      );
    }
  },

  /**
   * Handle client disconnection.
   *
   * Awareness state (presence, cursors) is ephemeral and is cleaned up
   * automatically by Yjs when the client disconnects.
   */
  async onDisconnect({ context, documentName }) {
    // No cleanup needed for Phase 8. Awareness is handled by Yjs/Hocuspocus.
  },
});

export { DOCUMENT_NAME_PREFIX };
