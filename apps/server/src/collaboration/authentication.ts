import { unsign } from "cookie-signature";
import type { SessionData } from "express-session";
import { sessionStore } from "../auth/session";

/**
 * Extracts and validates the authenticated user from a WebSocket
 * connection's session cookie.
 *
 * The session cookie (`collabnote.sid`) is set by the Express session
 * middleware after a successful login. We read it from the WebSocket
 * handshake headers, unsign it, and look up the session in the session
 * store to obtain the authenticated user ID.
 *
 * Never trusts a user ID supplied by the client. Identity always comes
 * from the server-side session store.
 */
export async function authenticateWebSocket(
  request: { headers?: Record<string, string> | string[][] | undefined }
): Promise<{ userId: string } | null> {
  try {
    const rawHeaders = request.headers;
    let cookieHeader: string | undefined;

    if (Array.isArray(rawHeaders)) {
      const cookieEntry = rawHeaders.find(
        (h) => h.length >= 2 && h[0]?.toLowerCase() === "cookie"
      );
      if (cookieEntry) {
        cookieHeader = cookieEntry[1];
      }
    } else if (rawHeaders && typeof rawHeaders === "object") {
      cookieHeader = String(rawHeaders.cookie);
    }

    if (!cookieHeader) {
      return null;
    }

    // Parse cookies to find collabnote.sid
    const cookies = cookieHeader.split(";").map((c) => c.trim());
    let sidCookie: string | undefined;
    for (const cookie of cookies) {
      const eqIndex = cookie.indexOf("=");
      if (eqIndex === -1) continue;
      const name = cookie.slice(0, eqIndex).trim();
      if (name === "collabnote.sid") {
        sidCookie = cookie.slice(eqIndex + 1).trim();
        break;
      }
    }

    if (!sidCookie) {
      return null;
    }

    // The session cookie value is signed: "s%3A<sessionId>.<signature>"
    const decodedSid = decodeURIComponent(sidCookie);
    const unsignedSid = unsign(decodedSid, process.env.SESSION_SECRET!);

    if (!unsignedSid || !unsignedSid.startsWith("s:")) {
      return null;
    }

    const sessionId = unsignedSid.slice(2);

    // Look up the session in the server-side session store
    const session = await new Promise<SessionData | null>((resolve) => {
      sessionStore.get(sessionId, (err: unknown, sess?: SessionData | null) => {
        if (err || !sess) {
          resolve(null);
        } else {
          resolve(sess);
        }
      });
    });

    if (!session?.userId) {
      return null;
    }

    return { userId: session.userId as string };
  } catch {
    return null;
  }
}
