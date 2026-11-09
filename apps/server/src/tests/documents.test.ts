import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { eq } from "drizzle-orm";
import request from "supertest";
import { db } from "../database/connection";
import { users, documents } from "../database/schema";
import app from "../index";

const TEST_USER = {
  name: "Doc Owner",
  email: "docowner@example.com",
  password: "secure-password-123",
};

const TEST_USER_2 = {
  name: "Doc Collaborator",
  email: "collab@example.com",
  password: "secure-password-123",
};

let authCookieA: string | null = null;
let authCookieB: string | null = null;
let testDocumentId: string | null = null;

async function loginAs(email: string, password: string): Promise<string> {
  const res = await request(app)
    .post("/api/v1/auth/login")
    .send({ email, password })
    .expect("Content-Type", /json/);

  const setCookie = res.headers["set-cookie"];
  const cookieArray = Array.isArray(setCookie) ? setCookie : [setCookie].filter(Boolean);
  const sessionCookie = cookieArray.find((c) => c.startsWith("collabnote.sid="));
  if (!sessionCookie) {
    throw new Error("No session cookie received");
  }
  return sessionCookie.split(";")[0]!;
}

describe("Document CRUD API", () => {
  beforeAll(async () => {
    await db.delete(users).where(eq(users.email, TEST_USER.email));
    await db.delete(users).where(eq(users.email, TEST_USER_2.email));

    await request(app).post("/api/v1/auth/register").send(TEST_USER);
    authCookieA = await loginAs(TEST_USER.email, TEST_USER.password);

    await request(app).post("/api/v1/auth/register").send(TEST_USER_2);
    authCookieB = await loginAs(TEST_USER_2.email, TEST_USER_2.password);
  });

  afterEach(async () => {
    if (testDocumentId) {
      await db.delete(documents).where(eq(documents.id, testDocumentId));
      testDocumentId = null;
    }
  });

  afterAll(async () => {
    await db.delete(users).where(eq(users.email, TEST_USER.email));
    await db.delete(users).where(eq(users.email, TEST_USER_2.email));
  });

  it("should create a document", async () => {
    const res = await request(app)
      .post("/api/v1/documents")
      .set("Cookie", authCookieA as string)
      .send({ title: "Test Document" })
      .expect("Content-Type", /json/)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.document.title).toBe("Test Document");
    expect(res.body.data.document.role).toBe("owner");
    testDocumentId = res.body.data.document.id;
  });

  it("should list documents", async () => {
    const createRes = await request(app)
      .post("/api/v1/documents")
      .set("Cookie", authCookieA as string)
      .send({ title: "List Test Document" })
      .expect(201);
    testDocumentId = createRes.body.data.document.id;

    const res = await request(app)
      .get("/api/v1/documents")
      .set("Cookie", authCookieA as string)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.documents.length).toBeGreaterThan(0);
    expect(
      res.body.data.documents.some((d: { id: string }) => d.id === testDocumentId)
    ).toBe(true);
  });

  it("should get a document", async () => {
    const createRes = await request(app)
      .post("/api/v1/documents")
      .set("Cookie", authCookieA as string)
      .send({ title: "Get Test Document" })
      .expect(201);
    testDocumentId = createRes.body.data.document.id;

    const res = await request(app)
      .get(`/api/v1/documents/${testDocumentId}`)
      .set("Cookie", authCookieA as string)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.document.id).toBe(testDocumentId);
    expect(res.body.data.document.role).toBe("owner");
  });

  it("should rename a document", async () => {
    const createRes = await request(app)
      .post("/api/v1/documents")
      .set("Cookie", authCookieA as string)
      .send({ title: "Rename Test Document" })
      .expect(201);
    testDocumentId = createRes.body.data.document.id;

    const res = await request(app)
      .patch(`/api/v1/documents/${testDocumentId}`)
      .set("Cookie", authCookieA as string)
      .send({ title: "Renamed Document" })
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.document.title).toBe("Renamed Document");
  });

  it("should reject rename by non-editor", async () => {
    const createRes = await request(app)
      .post("/api/v1/documents")
      .set("Cookie", authCookieA as string)
      .send({ title: "Permission Test Document" })
      .expect(201);
    testDocumentId = createRes.body.data.document.id;

    const res = await request(app)
      .patch(`/api/v1/documents/${testDocumentId}`)
      .set("Cookie", authCookieB as string)
      .send({ title: "Unauthorized Rename" })
      .expect("Content-Type", /json/);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("should soft-delete a document", async () => {
    const createRes = await request(app)
      .post("/api/v1/documents")
      .set("Cookie", authCookieA as string)
      .send({ title: "Delete Test Document" })
      .expect(201);
    testDocumentId = createRes.body.data.document.id;

    const res = await request(app)
      .delete(`/api/v1/documents/${testDocumentId}`)
      .set("Cookie", authCookieA as string)
      .expect(204);

    expect(res.body).toEqual({});
  });

  it("should reject delete by non-owner", async () => {
    const createRes = await request(app)
      .post("/api/v1/documents")
      .set("Cookie", authCookieA as string)
      .send({ title: "Delete Permission Test" })
      .expect(201);
    testDocumentId = createRes.body.data.document.id;

    const res = await request(app)
      .delete(`/api/v1/documents/${testDocumentId}`)
      .set("Cookie", authCookieB as string)
      .expect("Content-Type", /json/);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("should reject unauthenticated access", async () => {
    const res = await request(app)
      .get("/api/v1/documents")
      .expect("Content-Type", /json/)
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("UNAUTHENTICATED");
  });
});
