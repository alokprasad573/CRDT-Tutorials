import { Request, Response, NextFunction } from "express";
import { SessionData } from "express-session";

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

/**
 * Authentication middleware. Requires a valid authenticated user session.
 * Never trusts client-supplied user IDs; identity comes from the server session.
 */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.session || !req.session.userId) {
    res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHENTICATED",
        message: "Authentication is required.",
      },
    });
    return;
  }

  next();
}
