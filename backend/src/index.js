/**
 * backend/src/index.js — Express App Entry Point
 *
 * Start: node --watch src/index.js  (or npm run dev from backend/)
 * Frontend proxy: Vite forwards /api/* → http://localhost:3001
 */

import "dotenv/config";
import express from "express";

import { corsMiddleware } from "./middleware/cors.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { errorHandler } from "./middleware/errorHandler.js";

import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/products.routes.js";
import categoryRoutes from "./routes/categories.routes.js";
import orderRoutes from "./routes/orders.routes.js";
import paymentRoutes from "./routes/payments.routes.js";
import contactRoutes from "./routes/contact.routes.js";

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Global Middleware ────────────────────────────────────────────────────────

app.use(corsMiddleware);
app.use(express.json());
app.use(requestLogger);

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/contact", contactRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── 404 handler ──────────────────────────────────────────────────────────────

app.use((req, res) => {
  console.log(`[404] ${req.method} ${req.url}`);
  res.status(404).json({ error: `Route not found: ${req.method} ${req.url}` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────

app.use(errorHandler);

// ─── Start Server (Local) or Export (Vercel) ────────────────────────────────

// Vercel serverless functions shouldn't listen on a port.
// They just need the Express app exported.
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`\n🚀 GajananGems backend running at http://localhost:${PORT}`);
    console.log("   Endpoints:");
    console.log("   GET  /api/health");
    console.log("   POST /api/auth/login");
    console.log("   POST /api/auth/signup");
    console.log("   GET  /api/products");
    console.log("   GET  /api/products/search?q=...");
    console.log("   GET  /api/products/:slug");
    console.log("   GET  /api/categories");
    console.log("   GET  /api/categories/home");
    console.log("   GET  /api/categories/:slug");
    console.log("   POST /api/orders/create");
    console.log("   GET  /api/orders/user/:userId");
    console.log("   GET  /api/orders/track?orderId=&email=");
    console.log("   POST /api/payments/create-order");
    console.log("   POST /api/payments/verify");
    console.log("   POST /api/payments/failure");
    console.log("   POST /api/payments/cancel");
    console.log("   POST /api/contact\n");
  });
}

// Export for Vercel
export default app;
