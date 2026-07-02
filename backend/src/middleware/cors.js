/**
 * backend/src/middleware/cors.js
 *
 * CORS configuration. In development allows all origins.
 * In production set ALLOWED_ORIGIN in env.
 */

import cors from "cors";

const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";

export const corsMiddleware = cors({
  origin: allowedOrigin,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: allowedOrigin !== "*",
});

console.log(`[cors] Allowed origin: ${allowedOrigin}`);
