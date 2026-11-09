import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { WebSocketServer } from "ws";
import { sessionMiddleware } from "./auth/session";
import authRoutes from "./api/auth.routes";
import documentRoutes from "./api/documents.routes";
import memberRoutes from "./api/members.routes";
import { hocuspocus } from "./collaboration/hocuspocus";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// CORS configuration — allow the frontend origin with credentials
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());

// Session middleware (must be before auth routes and WebSocket auth)
app.use(sessionMiddleware);

// Health check endpoint
app.get("/api/v1/health", (_req, res) => {
  res.json({
    success: true,
    data: {
      status: "healthy",
      service: "collabnote-server",
    },
  });
});

// Authentication routes
app.use("/api/v1/auth", authRoutes);

// Document routes
app.use("/api/v1/documents", documentRoutes);

// Member routes
app.use("/api/v1/documents", memberRoutes);

// Centralized error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[server] unexpected error:", err.message);
  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected server error occurred.",
    },
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: "The requested resource was not found.",
    },
  });
});

// Only start the server when run directly, not when imported for testing
if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`CollabNote server listening on http://localhost:${PORT}`);
  });

  // WebSocket server for Hocuspocus collaboration
  // Mounted at /collaboration — clients connect via ws://localhost:4000/collaboration
  const wss = new WebSocketServer({
    server,
    path: "/collaboration",
    // Limit message size to prevent abuse
    maxPayload: 16 * 1024 * 1024, // 16 MB
  });

  wss.on("connection", (websocket, request) => {
    // Handle each WebSocket connection through Hocuspocus.
    // Hocuspocus runs authentication (session cookie) and authorization
    // (document access) hooks before establishing the Yjs collaboration session.
    hocuspocus.handleConnection(
      websocket,
      request as unknown as Parameters<typeof hocuspocus.handleConnection>[1]
    );
  });

  console.log(`Collaboration WebSocket available at ws://localhost:${PORT}/collaboration`);
}

export default app;
