import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "../lib/password";

describe("Password hashing (unit)", () => {
  it("should hash a password to a value different from the plaintext", async () => {
    const hash = await hashPassword("secure-password-123");

    expect(typeof hash).toBe("string");
    expect(hash.length).toBeGreaterThan(0);
    expect(hash).not.toBe("secure-password-123");
    // bcrypt hashes are prefixed with $2b$ or $2a$
    expect(hash.startsWith("$2")).toBe(true);
  });

  it("should produce a different hash on each call (salted)", async () => {
    const hashA = await hashPassword("same-password");
    const hashB = await hashPassword("same-password");

    expect(hashA).not.toBe(hashB);
  });

  it("should verify a correct password", async () => {
    const hash = await hashPassword("secure-password-123");
    const valid = await verifyPassword("secure-password-123", hash);

    expect(valid).toBe(true);
  });

  it("should reject an incorrect password", async () => {
    const hash = await hashPassword("secure-password-123");
    const valid = await verifyPassword("wrong-password", hash);

    expect(valid).toBe(false);
  });
});
