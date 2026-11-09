import rateLimit from "express-rate-limit";

/**
 * Rate limiter for sensitive, unauthenticated endpoints
 * (registration, login). Protects against brute-force and abuse.
 *
 * Uses an in-memory store, appropriate for the single-instance MVP.
 * For multi-instance production deployments, back this with Redis.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // generous ceiling for development and test runs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests. Please try again later.",
    },
  },
  // Don't count 429 responses themselves; skip successful health checks is
  // handled by mounting this only on sensitive routes.
});

/**
 * Stricter limiter for login to deter brute-force password guessing.
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // login attempts per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many login attempts. Please try again later.",
    },
  },
});
