import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { eq } from "drizzle-orm";
import request, { type Response } from "supertest";
import { db } from "../database/connection";
import { users } from "../database/schema";
import app from "../index";

const USER = {
  name: "Session User",
  email: "session-user@example.com",
  password: "secure-password-123",
};

let authCookie: string | null = null;

async function extractSessionCookie(res: Response): Promise<string> {
  const setCookie = res.headers["set-cookie"];
  const cookieArray = Array.isArray(setCookie) ? setCookie : [setCookie].filter(Boolean);
  const sessionCookie = cookieArray.find((c) => c.startsWith("collabnote.sid="));
  if (!sessionCookie) {
    throw new Error("No session cookie received");
  }
  return sessionCookie.split(";")[0]!;
}

describe("Authentication Sessions API", () => {
  beforeAll(async () => {
    await db.delete(users).where(eq(users.email, USER.email));
    await request(app).post("/api/v1/auth/register").send(USER);

    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: USER.email, password: USER.password })
      .expect("Content-Type", /json/)
      .expect(200);

    authCookie = await extractSessionCookie(loginRes);
  });

  afterAll(async () => {
    await db.delete(users).where(eq(users.email, USER.email));
  });

  it("should retrieve the current user when authenticated", async () => {
    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Cookie", authCookie as string)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(USER.email);
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  it("should reject /me when unauthenticated", async () => {
    const res = await request(app)
      .get("/api/v1/auth/me")
      .expect("Content-Type", /json/)
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("UNAUTHENTICATED");
  });

  it("should log out and invalidate the session", async () => {
    const res = await request(app)
      .post("/api/v1/auth/logout")
      .set("Cookie", authCookie as string)
      .expect(204);

    expect(res.body).toEqual({});

    // Session should now be invalid
    const meRes = await request(app)
      .get("/api/v1/auth/me")
      .set("Cookie", authCookie as string)
      .expect("Content-Type", /json/)
      .expect(401);

    expect(meRes.body.error.code).toBe("UNAUTHENTICATED");
  });

  it("should reject logout when unauthenticated", async () => {
    const res = await request(app)
      .post("/api/v1/auth/logout")
      .expect("Content-Type", /json/)
      .expect(401);

    expect(res.body.error.code).toBe("UNAUTHENTICATED");
  });
});
