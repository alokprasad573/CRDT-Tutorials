import { defineConfig } from "vitest/config";
import dotenv from "dotenv";
import path from "path";

// Load apps/server/.env or root .env
dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export default defineConfig({
  test: {
    include: ["src/tests/**/*.test.ts"],
    environment: "node",
  },
});
