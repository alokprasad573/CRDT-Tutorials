import { Router, Request, Response, NextFunction } from "express";
import { and, eq } from "drizzle-orm";
import { db } from "../database/connection";
import { users, documentMembers, documents } from "../database/schema";
import { requireAuth } from "../middleware/authenticate";
import {
  requireDocumentAccess,
  requireDocumentOwner,
} from "../middleware/document-access";
import type { DocumentRole } from "@collabnote/shared";

const router = Router();

type SessionWithUserId = Request["session"] & { userId?: string };
type AuthedRequest = Request & {
  session: SessionWithUserId;
  documentRole?: string;
};

/**
 * GET /api/v1/documents/:documentId/members
 * List document members. Requires at least viewer access.
 */
router.get(
  "/:documentId/members",
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

      // Include the owner as a member with role "owner"
      const [doc] = await db
        .select({
          id: documents.id,
          ownerId: documents.ownerId,
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

      const members = await db
        .select({
          userId: documentMembers.userId,
          name: users.name,
          email: users.email,
          role: documentMembers.role,
        })
        .from(documentMembers)
        .innerJoin(users, eq(documentMembers.userId, users.id))
        .where(eq(documentMembers.documentId, documentId));

      const allMembers = [
        {
          userId: doc.ownerId,
          role: "owner" as const,
        },
        ...members.map((m) => ({
          userId: m.userId,
          name: m.name,
          email: m.email,
          role: m.role as DocumentRole,
        })),
      ];

      res.json({
        success: true,
        data: { members: allMembers },
      });
    } catch (err) {
      console.error("[members] list error:", (err as Error).message);
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to list members.",
        },
      });
    }
  }
);

/**
 * POST /api/v1/documents/:documentId/members
 * Add a member to a document. Requires ownership.
 */
router.post(
  "/:documentId/members",
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

      const { email, role } = req.body as {
        email?: string;
        role?: DocumentRole;
      };

      if (!email || !role) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Email and role are required.",
          },
        });
        return;
      }

      if (role !== "editor" && role !== "viewer") {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Role must be 'editor' or 'viewer'.",
          },
        });
        return;
      }

      // Find the user by email
      const [targetUser] = await db
        .select({ id: users.id, name: users.name, email: users.email })
        .from(users)
        .where(eq(users.email, email.trim().toLowerCase()))
        .limit(1);

      if (!targetUser) {
        res.status(404).json({
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "User with this email was not found.",
          },
        });
        return;
      }

      // Check if already a member
      const [existing] = await db
        .select()
        .from(documentMembers)
        .where(
          and(
            eq(documentMembers.documentId, documentId),
            eq(documentMembers.userId, targetUser.id)
          )
        )
        .limit(1);

      if (existing) {
        res.status(409).json({
          success: false,
          error: {
            code: "MEMBER_ALREADY_EXISTS",
            message: "User is already a member of this document.",
          },
        });
        return;
      }

      // Cannot add the owner as a member (they already own it)
      const [doc] = await db
        .select({ ownerId: documents.ownerId })
        .from(documents)
        .where(eq(documents.id, documentId))
        .limit(1);

      if (doc && doc.ownerId === targetUser.id) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "The document owner is already an owner.",
          },
        });
        return;
      }

      const [created] = await db
        .insert(documentMembers)
        .values({
          documentId,
          userId: targetUser.id,
          role,
        })
        .returning({
          userId: documentMembers.userId,
          role: documentMembers.role,
        });

      if (!created) {
        res.status(500).json({
          success: false,
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create member record.",
          },
        });
        return;
      }

      res.status(201).json({
        success: true,
        data: {
          member: {
            userId: created.userId,
            name: targetUser.name,
            email: targetUser.email,
            role: created.role as DocumentRole,
          },
        },
      });
    } catch (err) {
      console.error("[members] add error:", (err as Error).message);
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add member.",
        },
      });
    }
  }
);

/**
 * PATCH /api/v1/documents/:documentId/members/:userId
 * Change a member's role. Requires ownership.
 */
router.patch(
  "/:documentId/members/:userId",
  requireAuth,
  requireDocumentAccess("owner"),
  requireDocumentOwner,
  async (req: AuthedRequest, res: Response) => {
    try {
      const rawDocId = req.params.documentId;
      const documentId = Array.isArray(rawDocId) ? rawDocId[0] : rawDocId;
      const rawUserId = req.params.userId;
      const targetUserId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;

      if (!documentId || !targetUserId) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Document ID and user ID are required.",
          },
        });
        return;
      }

      const { role } = req.body as { role?: DocumentRole };

      if (!role || (role !== "editor" && role !== "viewer")) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Role must be 'editor' or 'viewer'.",
          },
        });
        return;
      }

      const [updated] = await db
        .update(documentMembers)
        .set({ role })
        .where(
          and(
            eq(documentMembers.documentId, documentId),
            eq(documentMembers.userId, targetUserId)
          )
        )
        .returning({
          userId: documentMembers.userId,
          role: documentMembers.role,
        });

      if (!updated) {
        res.status(404).json({
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "User is not a member of this document.",
          },
        });
        return;
      }

      res.json({
        success: true,
        data: {
          member: {
            userId: updated.userId,
            role: updated.role as DocumentRole,
          },
        },
      });
    } catch (err) {
      console.error("[members] update role error:", (err as Error).message);
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update member role.",
        },
      });
    }
  }
);

/**
 * DELETE /api/v1/documents/:documentId/members/:userId
 * Remove a member from a document. Requires ownership.
 */
router.delete(
  "/:documentId/members/:userId",
  requireAuth,
  requireDocumentAccess("owner"),
  requireDocumentOwner,
  async (req: AuthedRequest, res: Response) => {
    try {
      const rawDocId = req.params.documentId;
      const documentId = Array.isArray(rawDocId) ? rawDocId[0] : rawDocId;
      const rawUserId = req.params.userId;
      const targetUserId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;

      if (!documentId || !targetUserId) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Document ID and user ID are required.",
          },
        });
        return;
      }

      const [removed] = await db
        .delete(documentMembers)
        .where(
          and(
            eq(documentMembers.documentId, documentId),
            eq(documentMembers.userId, targetUserId)
          )
        )
        .returning({
          userId: documentMembers.userId,
        });

      if (!removed) {
        res.status(404).json({
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "User is not a member of this document.",
          },
        });
        return;
      }

      res.status(204).send();
    } catch (err) {
      console.error("[members] remove error:", (err as Error).message);
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to remove member.",
        },
      });
    }
  }
);

export default router;
