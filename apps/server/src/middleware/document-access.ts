import { Request, Response, NextFunction } from "express";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "../database/connection";
import { documents, documentMembers } from "../database/schema";
import { DocumentRole } from "@collabnote/shared";

type SessionWithUserId = Request["session"] & { userId?: string };

/**
 * Document access levels.
 */
export type DocumentAccess = "owner" | "editor" | "viewer" | "none";

/**
 * Resolve the authenticated user's effective role for a document.
 * Returns "none" if the user has no access.
 */
export async function resolveDocumentAccess(
  documentId: string,
  userId: string
): Promise<DocumentAccess> {
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

  return member.role as DocumentAccess;
}

/**
 * Middleware: require at least read access to a document.
 * Loads the document and attaches the resolved role to req.documentRole.
 */
export function requireDocumentAccess(
  requiredRole: DocumentAccess = "viewer"
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = req.session as SessionWithUserId;
      const userId = session?.userId;
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

      const documentId = req.params.documentId;
      const docId = Array.isArray(documentId) ? documentId[0] : documentId;
      if (!docId) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Document ID is required.",
          },
        });
        return;
      }

      const access = await resolveDocumentAccess(docId, userId);

      const roleRank: Record<DocumentAccess, number> = {
        none: 0,
        viewer: 1,
        editor: 2,
        owner: 3,
      };

      if (roleRank[access] < roleRank[requiredRole]) {
        res.status(403).json({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "You do not have permission to access this document.",
          },
        });
        return;
      }

      (req as Request & { documentRole?: DocumentAccess }).documentRole =
        access;
      next();
    } catch (err) {
      console.error("[document-access] error:", (err as Error).message);
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Authorization check failed.",
        },
      });
    }
  };
}

/**
 * Middleware: require document ownership.
 */
export function requireDocumentOwner(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const access = (req as Request & { documentRole?: DocumentAccess })
    .documentRole;
  if (access !== "owner") {
    res.status(403).json({
      success: false,
      error: {
        code: "OWNER_ACTION_REQUIRED",
        message: "Document ownership is required for this operation.",
      },
    });
    return;
  }
  next();
}

/**
 * Middleware: require editor or owner (i.e., can edit content).
 */
export function requireDocumentEditAccess(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const access = (req as Request & { documentRole?: DocumentAccess })
    .documentRole;
  if (access !== "owner" && access !== "editor") {
    res.status(403).json({
      success: false,
      error: {
        code: "FORBIDDEN",
        message: "Editor or owner access is required to modify this document.",
      },
    });
    return;
  }
  next();
}
