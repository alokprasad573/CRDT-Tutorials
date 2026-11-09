import { eq, and } from "drizzle-orm";
import { db } from "../connection";
import {
  users,
  documents,
  documentMembers,
  documentUpdates,
  documentSnapshots,
} from "../schema";
import type { DocumentRole } from "@collabnote/shared";
import { collaborationRepository } from "./collaboration";

export const usersRepository = {
  create: (data: {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    avatarUrl?: string | null;
  }) =>
    db.insert(users).values(data).returning(),

  findByEmail: (email: string) =>
    db.select().from(users).where(eq(users.email, email)).limit(1),

  findById: (id: string) =>
    db.select().from(users).where(eq(users.id, id)).limit(1),
};

export const documentsRepository = {
  create: (data: {
    id: string;
    ownerId: string;
    title: string;
  }) =>
    db.insert(documents).values(data).returning(),

  findById: (id: string) =>
    db.select().from(documents).where(eq(documents.id, id)).limit(1),

  findByOwner: (ownerId: string) =>
    db.select().from(documents).where(eq(documents.ownerId, ownerId)),

  updateTitle: (id: string, title: string) =>
    db
      .update(documents)
      .set({ title, updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning(),

  softDelete: (id: string) =>
    db
      .update(documents)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning(),
};

export const membersRepository = {
  add: (data: {
    documentId: string;
    userId: string;
    role: DocumentRole;
  }) =>
    db.insert(documentMembers).values(data).returning(),

  findByDocumentAndUser: (documentId: string, userId: string) =>
    db
      .select()
      .from(documentMembers)
      .where(
        and(
          eq(documentMembers.documentId, documentId),
          eq(documentMembers.userId, userId)
        )
      )
      .limit(1),

  findByDocument: (documentId: string) =>
    db.select().from(documentMembers).where(eq(documentMembers.documentId, documentId)),

  updateRole: (documentId: string, userId: string, role: DocumentRole) =>
    db
      .update(documentMembers)
      .set({ role })
      .where(
        and(
          eq(documentMembers.documentId, documentId),
          eq(documentMembers.userId, userId)
        )
      )
      .returning(),

  remove: (documentId: string, userId: string) =>
    db
      .delete(documentMembers)
      .where(
        and(
          eq(documentMembers.documentId, documentId),
          eq(documentMembers.userId, userId)
        )
      )
      .returning(),
};
