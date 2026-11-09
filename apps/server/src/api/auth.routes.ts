import { Router } from "express";
import { Session } from "express-session";
import { authService } from "../auth/auth.service";
import { requireAuth } from "../middleware/authenticate";
import {
  authRateLimiter,
  loginRateLimiter,
} from "../middleware/rate-limit";
import { SafeUser } from "../auth/auth.service";

type SessionWithUserId = Session & { userId?: string };

const router = Router();

/**
 * POST /api/v1/auth/register
 * Register a new user account.
 * Rate-limited to protect against account creation abuse.
 */
router.post("/register", authRateLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body as {
      name?: string;
      email?: string;
      password?: string;
    };

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Name, email, and password are required.",
        },
      });
      return;
    }

    if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Name, email, and password must be strings.",
        },
      });
      return;
    }

    if (password.length < 12) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Password must be at least 12 characters.",
        },
      });
      return;
    }

    const { user } = await authService.register({ name, email, password });

    // Establish session after registration
    (req.session as SessionWithUserId).userId = user.id;

    res.status(201).json({
      success: true,
      data: { user },
    });
  } catch (err: unknown) {
    const error = err as Error & { code?: string };
    if (error.code === "EMAIL_ALREADY_EXISTS") {
      res.status(409).json({
        success: false,
        error: {
          code: "EMAIL_ALREADY_EXISTS",
          message: "Email is already registered.",
        },
      });
      return;
    }
    console.error("[auth] registration error:", error.message);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Registration failed.",
      },
    });
  }
});

/**
 * POST /api/v1/auth/login
 * Authenticate a user and establish a session.
 * Rate-limited to deter brute-force password guessing.
 */
router.post("/login", loginRateLimiter, async (req, res) => {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Email and password are required.",
        },
      });
      return;
    }

    const { user } = await authService.login({ email, password });

    (req.session as SessionWithUserId).userId = user.id;

    res.json({
      success: true,
      data: { user },
    });
  } catch (err: unknown) {
    const error = err as Error & { code?: string };
    if (error.code === "INVALID_CREDENTIALS") {
      res.status(401).json({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password.",
        },
      });
      return;
    }
    console.error("[auth] login error:", error.message);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Login failed.",
      },
    });
  }
});

/**
 * GET /api/v1/auth/me
 * Retrieve the authenticated user's profile.
 */
router.get("/me", requireAuth, async (req, res) => {
  try {
    const userId = (req.session as SessionWithUserId).userId;
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

    const user = await authService.getUserById(userId);
    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHENTICATED",
          message: "Session user not found.",
        },
      });
      return;
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (err: unknown) {
    console.error("[auth] me error:", (err as Error).message);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve user profile.",
      },
    });
  }
});

/**
 * POST /api/v1/auth/logout
 * Invalidate the current session.
 */
router.post("/logout", requireAuth, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("[auth] logout error:", err.message);
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Logout failed.",
        },
      });
      return;
    }
    res.clearCookie("collabnote.sid");
    res.status(204).send();
  });
});

export default router;
