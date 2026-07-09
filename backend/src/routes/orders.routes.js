/**
 * backend/src/routes/orders.routes.js
 */

import { Router } from "express";
import { generalLimiter } from "../middleware/rateLimiter.js";
import { requireAuth } from "../middleware/auth.js";
import {
  createOrder,
  updateAttemptStatus,
  updateOrderStatus,
  getOrdersByUser,
  trackOrder,
} from "../controllers/orders.controller.js";

const router = Router();

// NOTE: specific routes before /:id param routes
router.get("/track", generalLimiter, trackOrder);
// Protected: user must be authenticated to view their own orders
router.get("/user/:userId", generalLimiter, requireAuth, getOrdersByUser);
router.post("/create", generalLimiter, createOrder);
router.patch("/:id/attempt-status", generalLimiter, updateAttemptStatus);
router.patch("/:id/status", generalLimiter, updateOrderStatus);

export default router;
