import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { eq } from "drizzle-orm";
import request from "supertest";
import { db } from "../database/connection";
import { users } from "../database/schema";
import app from "../index";

const TEST_USER = {
  name: "Test User",
  email: "test@example.com",
  password: "secure-password-123",
};

describe("Authentication API", () => {
  beforeAll(async () => {
    await db.delete(users).where(eq(users.email, TEST_USER.email));
  });

  afterAll(async () => {
    await db.delete(users).where(eq(users.email, TEST_USER.email));
  });

  beforeEach(async () => {
    await db.delete(users).where(eq(users.email, TEST_USER.email));
  });

  it("should register a new user", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send(TEST_USER)
      .expect("Content-Type", /json/);

    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(TEST_USER.email);
    expect(res.body.data.user.name).toBe(TEST_USER.name);
    expect(res.body.data.user.passwordHash).toBeUndefined();
    expect(res.status).toBe(201);
  });

  it("should reject duplicate email", async () => {
    await request(app).post("/api/v1/auth/register").send(TEST_USER);

    const res = await request(app)
      .post("/api/v1/auth/register")
      .send(TEST_USER)
      .expect("Content-Type", /json/);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("EMAIL_ALREADY_EXISTS");
    expect(res.status).toBe(409);
  });

  it("should reject invalid registration data", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ name: "", email: "", password: "short" })
      .expect("Content-Type", /json/);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.status).toBe(400);
  });

  it("should login with valid credentials", async () => {
    await request(app).post("/api/v1/auth/register").send(TEST_USER);

    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: TEST_USER.email, password: TEST_USER.password })
      .expect("Content-Type", /json/);

    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(TEST_USER.email);
    expect(res.status).toBe(200);
  });

  it("should reject invalid credentials", async () => {
    await request(app).post("/api/v1/auth/register").send(TEST_USER);

    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: TEST_USER.email, password: "wrong-password" })
      .expect("Content-Type", /json/);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
    expect(res.status).toBe(401);
  });

  it("should reject unknown email", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "nonexistent@example.com", password: TEST_USER.password })
      .expect("Content-Type", /json/);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
    expect(res.status).toBe(401);
  });
});

describe("Health API", () => {
  it("should return healthy status", async () => {
    const res = await request(app)
      .get("/api/v1/health")
      .expect("Content-Type", /json/);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("healthy");
  });
});

describe("404 handling", () => {
  it("should return 404 for unknown routes", async () => {
    const res = await request(app)
      .get("/api/v1/nonexistent")
      .expect("Content-Type", /json/);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
