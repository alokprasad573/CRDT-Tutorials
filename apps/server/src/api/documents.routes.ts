import { Router, Request, Response, NextFunction } from "express";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "../database/connection";
import { documents, documentMembers } from "../database/schema";
import { requireAuth } from "../middleware/authenticate";
import {
  requireDocumentAccess,
  requireDocumentOwner,
  requireDocumentEditAccess,
} from "../middleware/document-access";
import { CreateDocumentRequest, UpdateDocumentRequest } from "@collabnote/shared";

const router = Router();

const MAX_TITLE_LENGTH = 255;

type SessionWithUserId = Request["session"] & { userId?: string };
type AuthedRequest = Request & {
  session: SessionWithUserId;
  documentRole?: string;
};

/**
 * POST /api/v1/documents
 * Create a new document. The authenticated user becomes the owner.
 */
router.post("/", requireAuth, async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHENTICATED",
          message: "Authentication is required.",
        },
      });
      return;
    }

    const { title } = req.body as CreateDocumentRequest;

    if (!title || typeof title !== "string") {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Document title is required.",
        },
      });
      return;
    }

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Document title cannot be empty.",
        },
      });
      return;
    }

    if (trimmedTitle.length > MAX_TITLE_LENGTH) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: `Document title must be at most ${MAX_TITLE_LENGTH} characters.`,
        },
      });
      return;
    }

    const [created] = await db
      .insert(documents)
      .values({
        ownerId: userId,
        title: trimmedTitle,
      })
      .returning({
        id: documents.id,
        title: documents.title,
        ownerId: documents.ownerId,
        createdAt: documents.createdAt,
        updatedAt: documents.updatedAt,
      });

    res.status(201).json({
      success: true,
      data: {
        document: {
          ...created,
          role: "owner",
        },
      },
    });
  } catch (err) {
    console.error("[documents] create error:", (err as Error).message);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create document.",
      },
    });
  }
});

/**
 * GET /api/v1/documents
 * List documents the authenticated user owns or has access to.
 */
router.get("/", requireAuth, async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHENTICATED",
          message: "Authentication is required.",
        },
      });
      return;
    }

    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit as string, 10) || 20)
    );
    const offset = (page - 1) * limit;

    // Owned documents
    const ownedDocs = await db
      .select({
        id: documents.id,
        title: documents.title,
        ownerId: documents.ownerId,
        createdAt: documents.createdAt,
        updatedAt: documents.updatedAt,
        deletedAt: documents.deletedAt,
      })
      .from(documents)
      .where(
        and(
          eq(documents.ownerId, userId),
          isNull(documents.deletedAt)
        )
      )
      .orderBy(documents.updatedAt)
      .limit(limit)
      .offset(offset);

    // Shared documents (members)
    const sharedDocs = await db
      .select({
        id: documents.id,
        title: documents.title,
        ownerId: documents.ownerId,
        createdAt: documents.createdAt,
        updatedAt: documents.updatedAt,
        deletedAt: documents.deletedAt,
        role: documentMembers.role,
      })
      .from(documents)
      .innerJoin(
        documentMembers,
        eq(documentMembers.documentId, documents.id)
      )
      .where(
        and(
          eq(documentMembers.userId, userId),
          isNull(documents.deletedAt)
        )
      )
      .orderBy(documents.updatedAt)
      .limit(limit)
      .offset(offset);

    const allDocs = [
      ...ownedDocs.map((d) => ({ ...d, role: "owner" as const })),
      ...sharedDocs.map((d) => ({ ...d })),
    ];

    // Deduplicate by id (in case owner is also a member)
    const seen = new Set<string>();
    const uniqueDocs = allDocs.filter((d) => {
      if (seen.has(d.id)) return false;
      seen.add(d.id);
      return true;
    });

    res.json({
      success: true,
      data: {
        documents: uniqueDocs,
        pagination: {
          page,
          limit,
          total: uniqueDocs.length,
          totalPages: Math.ceil(uniqueDocs.length / limit),
        },
      },
    });
  } catch (err) {
    console.error("[documents] list error:", (err as Error).message);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to list documents.",
      },
    });
  }
});

/**
 * GET /api/v1/documents/:documentId
 * Get document metadata. Requires at least viewer access.
 */
router.get(
  "/:documentId",
  requireAuth,
  requireDocumentAccess("viewer"),
  async (req: AuthedRequest, res: Response) => {
    try {
      const rawId = req.params.documentId;
      const documentId = Array.isArray(rawId) ? rawId[0] : rawId;
      if (!documentId) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Document ID is required.",
          },
        });
        return;
      }
      const access = req.documentRole || "viewer";

      const [doc] = await db
        .select({
          id: documents.id,
          title: documents.title,
          ownerId: documents.ownerId,
          createdAt: documents.createdAt,
          updatedAt: documents.updatedAt,
        })
        .from(documents)
        .where(eq(documents.id, documentId))
        .limit(1);

      if (!doc) {
        res.status(404).json({
          success: false,
          error: {
            code: "DOCUMENT_NOT_FOUND",
            message: "Document not found.",
          },
        });
        return;
      }

      res.json({
        success: true,
        data: {
          document: {
            ...doc,
            role: access,
          },
        },
      });
    } catch (err) {
      console.error("[documents] get error:", (err as Error).message);
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get document.",
        },
      });
    }
  }
);

/**
 * PATCH /api/v1/documents/:documentId
 * Update document title. Requires editor or owner access.
 */
router.patch(
  "/:documentId",
  requireAuth,
  requireDocumentAccess("editor"),
  requireDocumentEditAccess,
  async (req: AuthedRequest, res: Response) => {
    try {
      const rawId = req.params.documentId;
      const documentId = Array.isArray(rawId) ? rawId[0] : rawId;
      if (!documentId) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Document ID is required.",
          },
        });
        return;
      }
      const { title } = req.body as UpdateDocumentRequest;

      if (!title || typeof title !== "string") {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Document title is required.",
          },
        });
        return;
      }

      const trimmedTitle = title.trim();
      if (!trimmedTitle) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Document title cannot be empty.",
          },
        });
        return;
      }

      if (trimmedTitle.length > MAX_TITLE_LENGTH) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: `Document title must be at most ${MAX_TITLE_LENGTH} characters.`,
          },
        });
        return;
      }

      const [updated] = await db
        .update(documents)
        .set({ title: trimmedTitle, updatedAt: new Date() })
        .where(eq(documents.id, documentId))
        .returning({
          id: documents.id,
          title: documents.title,
          updatedAt: documents.updatedAt,
        });

      if (!updated) {
        res.status(404).json({
          success: false,
          error: {
            code: "DOCUMENT_NOT_FOUND",
            message: "Document not found.",
          },
        });
        return;
      }

      res.json({
        success: true,
        data: {
          document: updated,
        },
      });
    } catch (err) {
      console.error("[documents] update error:", (err as Error).message);
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update document.",
        },
      });
    }
  }
);

/**
 * DELETE /api/v1/documents/:documentId
 * Soft-delete a document. Requires ownership.
 */
router.delete(
  "/:documentId",
  requireAuth,
  requireDocumentAccess("owner"),
  requireDocumentOwner,
  async (req: AuthedRequest, res: Response) => {
    try {
      const rawId = req.params.documentId;
      const documentId = Array.isArray(rawId) ? rawId[0] : rawId;
      if (!documentId) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Document ID is required.",
          },
        });
        return;
      }

      const [deleted] = await db
        .update(documents)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(eq(documents.id, documentId))
        .returning({
          id: documents.id,
        });

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: {
            code: "DOCUMENT_NOT_FOUND",
            message: "Document not found.",
          },
        });
        return;
      }

      res.status(204).send();
    } catch (err) {
      console.error("[documents] delete error:", (err as Error).message);
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete document.",
        },
      });
    }
  }
);

export default router;
