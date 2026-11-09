import { db } from "../database/connection";
import { users } from "../database/schema";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "../lib/password";
import { AuthErrorCode } from "./auth.types";

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

/**
 * Authentication service. Handles registration, login, and user lookup.
 * All operations are server-side; passwords are hashed with bcrypt and never
 * stored or returned in plaintext.
 */
export class AuthService {
  /**
   * Register a new user. Hashes the password before storage.
   */
  async register(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<{ user: SafeUser }> {
    const normalizedEmail = data.email.trim().toLowerCase();

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existing.length > 0) {
      const error = new Error("Email already registered") as Error & {
        code?: AuthErrorCode;
      };
      error.code = AuthErrorCode.EMAIL_ALREADY_EXISTS;
      throw error;
    }

    const passwordHash = await hashPassword(data.password);

    const [created] = await db
      .insert(users)
      .values({
        name: data.name.trim(),
        email: normalizedEmail,
        passwordHash,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        avatarUrl: users.avatarUrl,
      });

    if (!created) {
      throw new Error("Failed to create user");
    }

    return {
      user: {
        id: created.id,
        name: created.name,
        email: created.email,
        avatarUrl: created.avatarUrl,
      },
    };
  }

  /**
   * Verify login credentials. Returns the user on success.
   * Always returns the same generic error for invalid credentials to prevent
   * account enumeration.
   */
  async login(data: {
    email: string;
    password: string;
  }): Promise<{ user: SafeUser }> {
    const normalizedEmail = data.email.trim().toLowerCase();

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (!user) {
      const error = new Error("Invalid credentials") as Error & {
        code?: AuthErrorCode;
      };
      error.code = AuthErrorCode.INVALID_CREDENTIALS;
      throw error;
    }

    const passwordValid = await verifyPassword(data.password, user.passwordHash);

    if (!passwordValid) {
      const error = new Error("Invalid credentials") as Error & {
        code?: AuthErrorCode;
      };
      error.code = AuthErrorCode.INVALID_CREDENTIALS;
      throw error;
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  /**
   * Retrieve a safe user profile by ID (no password hash).
   */
  async getUserById(id: string): Promise<SafeUser | null> {
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return user ?? null;
  }
}

export const authService = new AuthService();
