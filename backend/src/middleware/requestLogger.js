/**
 * backend/src/middleware/requestLogger.js
 *
 * Logs every incoming request with method, URL, IP, and response time.
 */

export function requestLogger(req, res, next) {
  const start = Date.now();
  const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown";

  res.on("finish", () => {
    const ms = Date.now() - start;
    const statusEmoji = res.statusCode < 400 ? "✓" : "✗";
    console.log(
      `[${statusEmoji}] ${req.method} ${req.url} — ${res.statusCode} (${ms}ms) [${ip}]`
    );
  });

  next();
}
