import session from "express-session";
import dotenv from "dotenv";

dotenv.config();

const SESSION_SECRET = process.env.SESSION_SECRET;

if (!SESSION_SECRET) {
  throw new Error("SESSION_SECRET environment variable is required.");
}

// MemoryStore for development. For production, replace with a
// PostgreSQL-backed store (e.g., connect-pg-simple) per AUTH.md.
export const sessionStore = new session.MemoryStore();

export const sessionMiddleware = session({
  store: sessionStore,
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days idle
  },
  name: "collabnote.sid",
});
