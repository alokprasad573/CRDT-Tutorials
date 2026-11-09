import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { eq } from "drizzle-orm";
import request from "supertest";
import { db } from "../database/connection";
import { users, documents, documentMembers } from "../database/schema";
import app from "../index";

const OWNER = {
  name: "Doc Owner",
  email: "member-owner@example.com",
  password: "secure-password-123",
};

const MEMBER = {
  name: "Doc Member",
  email: "member-user@example.com",
  password: "secure-password-123",
};

const STRANGER = {
  name: "Doc Stranger",
  email: "member-stranger@example.com",
  password: "secure-password-123",
};

let ownerCookie: string | null = null;
let memberCookie: string | null = null;
let strangerCookie: string | null = null;
let memberId: string | null = null;
let testDocumentId: string | null = null;

async function registerAndLogin(user: {
  name: string;
  email: string;
  password: string;
}) {
  await request(app).post("/api/v1/auth/register").send(user);
  const res = await request(app)
    .post("/api/v1/auth/login")
    .send({ email: user.email, password: user.password })
    .expect("Content-Type", /json/);

  const setCookie = res.headers["set-cookie"];
  const cookieArray = Array.isArray(setCookie)
    ? setCookie
    : [setCookie].filter(Boolean);
  const sessionCookie = cookieArray.find((c) => c.startsWith("collabnote.sid="));
  return sessionCookie.split(";")[0]!;
}

async function getUserId(email: string): Promise<string> {
  const [row] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (!row) throw new Error(`User not found: ${email}`);
  return row.id;
}

/** Add MEMBER to the test document with the given role. */
async function addMember(role: "editor" | "viewer") {
  return request(app)
    .post(`/api/v1/documents/${testDocumentId}/members`)
    .set("Cookie", ownerCookie as string)
    .send({ email: MEMBER.email, role });
}

/** Remove MEMBER from the test document (as owner). */
async function removeMember() {
  if (!memberId || !testDocumentId) return;
  await request(app)
    .delete(`/api/v1/documents/${testDocumentId}/members/${memberId}`)
    .set("Cookie", ownerCookie as string);
}

describe("Document Members API", () => {
  beforeAll(async () => {
    for (const u of [OWNER, MEMBER, STRANGER]) {
      await db.delete(users).where(eq(users.email, u.email));
    }

    ownerCookie = await registerAndLogin(OWNER);
    memberCookie = await registerAndLogin(MEMBER);
    strangerCookie = await registerAndLogin(STRANGER);

    memberId = await getUserId(MEMBER.email);

    // Owner creates a document
    const createRes = await request(app)
      .post("/api/v1/documents")
      .set("Cookie", ownerCookie as string)
      .send({ title: "Members Test Document" })
      .expect(201);
    testDocumentId = createRes.body.data.document.id;
  });

  afterAll(async () => {
    // Clean up membership (cascades on document delete) and users
    if (testDocumentId) {
      await db.delete(documents).where(eq(documents.id, testDocumentId));
    }
    for (const u of [OWNER, MEMBER, STRANGER]) {
      await db.delete(users).where(eq(users.email, u.email));
    }
  });

  it("should reject unauthenticated access to members list", async () => {
    const res = await request(app)
      .get(`/api/v1/documents/${testDocumentId}/members`)
      .expect("Content-Type", /json/);

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHENTICATED");
  });

  it("should list members (owner)", async () => {
    const res = await request(app)
      .get(`/api/v1/documents/${testDocumentId}/members`)
      .set("Cookie", ownerCookie as string)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body.success).toBe(true);
    const roles = res.body.data.members.map((m: { role: string }) => m.role);
    expect(roles).toContain("owner");
  });

  it("should add a member as editor", async () => {
    const res = await addMember("editor");
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.member.email).toBe(MEMBER.email);
    expect(res.body.data.member.role).toBe("editor");
    await removeMember();
  });

  it("should reject adding a member who already exists", async () => {
    await addMember("editor"); // first add succeeds
    const res = await request(app)
      .post(`/api/v1/documents/${testDocumentId}/members`)
      .set("Cookie", ownerCookie as string)
      .send({ email: MEMBER.email, role: "viewer" })
      .expect("Content-Type", /json/);

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("MEMBER_ALREADY_EXISTS");
    await removeMember();
  });

  it("should reject adding a non-existent user", async () => {
    const res = await request(app)
      .post(`/api/v1/documents/${testDocumentId}/members`)
      .set("Cookie", ownerCookie as string)
      .send({ email: "nobody@example.com", role: "viewer" })
      .expect("Content-Type", /json/);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("USER_NOT_FOUND");
  });

  it("should reject member management by a non-owner", async () => {
    const res = await request(app)
      .post(`/api/v1/documents/${testDocumentId}/members`)
      .set("Cookie", memberCookie as string)
      .send({ email: STRANGER.email, role: "viewer" })
      .expect("Content-Type", /json/);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("should change a member's role", async () => {
    await addMember("editor");
    const res = await request(app)
      .patch(`/api/v1/documents/${testDocumentId}/members/${memberId}`)
      .set("Cookie", ownerCookie as string)
      .send({ role: "viewer" })
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.member.role).toBe("viewer");
    await removeMember();
  });

  it("should reject role change by a non-owner", async () => {
    await addMember("editor");
    const res = await request(app)
      .patch(`/api/v1/documents/${testDocumentId}/members/${memberId}`)
      .set("Cookie", memberCookie as string)
      .send({ role: "editor" })
      .expect("Content-Type", /json/);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
    await removeMember();
  });

  it("should remove a member", async () => {
    await addMember("editor");
    const res = await request(app)
      .delete(`/api/v1/documents/${testDocumentId}/members/${memberId}`)
      .set("Cookie", ownerCookie as string)
      .expect(204);

    expect(res.body).toEqual({});
  });

  it("should reject member removal by a non-owner", async () => {
    await addMember("editor");
    const res = await request(app)
      .delete(`/api/v1/documents/${testDocumentId}/members/${memberId}`)
      .set("Cookie", memberCookie as string)
      .expect("Content-Type", /json/);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
    await removeMember();
  });
});
