/**
 * backend/src/middleware/errorHandler.js
 *
 * Global Express error handler. Must be registered last (4 params).
 */

export function errorHandler(err, req, res, _next) {
  console.error(`[error] ${req.method} ${req.url}:`, err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(status).json({ error: message });
}
