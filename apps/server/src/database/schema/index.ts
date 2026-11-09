import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  bigint,
  bigserial,
  pgEnum,
  uniqueIndex,
  customType,
} from "drizzle-orm/pg-core";

// Bytea column type for storing encoded Yjs binary data.
const bytea = customType<{ data: Buffer; driverData: string }>({
  dataType() {
    return "bytea";
  },
  toDriver(value: Buffer) {
    return value.toString("base64");
  },
  fromDriver(value: string) {
    return Buffer.from(value, "base64");
  },
});

export const documentRoleEnum = pgEnum("role", ["owner", "editor", "viewer"]);

// ============================================================================
// users
// ============================================================================

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ============================================================================
// documents
// ============================================================================

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ============================================================================
// document_members
// ============================================================================

export const documentMembers = pgTable(
  "document_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    documentId: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: documentRoleEnum("role").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    uniqueMemberIdx: uniqueIndex("document_members_document_id_user_id_idx").on(
      table.documentId,
      table.userId
    ),
  })
);

// ============================================================================
// document_updates
// ============================================================================

export const documentUpdates = pgTable("document_updates", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  documentId: uuid("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  updateData: bytea("update_data").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ============================================================================
// document_snapshots
// ============================================================================

export const documentSnapshots = pgTable("document_snapshots", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentId: uuid("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  snapshotData: bytea("snapshot_data").notNull(),
  stateVector: bytea("state_vector"),
  lastUpdateId: bigint("last_update_id", { mode: "bigint" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
