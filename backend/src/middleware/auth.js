/**
 * backend/src/middleware/auth.js
 *
 * Verifies Supabase JWT tokens from the Authorization: Bearer <token> header.
 * Uses the SUPABASE_JWT_SECRET env var (Supabase Dashboard → Settings → API → JWT Secret).
 */

import jwt from "jsonwebtoken";

/**
 * requireAuth middleware — attaches the decoded token to req.user.
 * req.user.sub = Supabase user UUID (string)
 * req.user.email = user's email
 */
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: missing token" });
  }

  const token = authHeader.replace("Bearer ", "").trim();

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: empty token" });
  }

  const secret = process.env.SUPABASE_JWT_SECRET;
  if (!secret) {
    console.error("[auth middleware] SUPABASE_JWT_SECRET is not set");
    return res.status(500).json({ error: "Server misconfiguration" });
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // { sub: uuid, email, role, exp, ... }
    next();
  } catch (err) {
    console.warn("[auth middleware] Invalid token:", err.message);
    return res.status(401).json({ error: "Unauthorized: invalid or expired token" });
  }
}
