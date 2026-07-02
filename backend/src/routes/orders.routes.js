/**
 * backend/src/routes/orders.routes.js
 */

import { Router } from "express";
import { generalLimiter } from "../middleware/rateLimiter.js";
import {
  createOrder,
  updatePaymentAttempt,
  logPaymentAttempt,
  updateAttemptStatus,
  updateOrderStatus,
  getOrdersByUser,
  trackOrder,
} from "../controllers/orders.controller.js";

const router = Router();

// NOTE: specific routes before /:id param routes
router.get("/track", generalLimiter, trackOrder);
router.get("/user/:userId", generalLimiter, getOrdersByUser);
router.post("/create", generalLimiter, createOrder);
router.patch("/:id/payment-attempt", generalLimiter, updatePaymentAttempt);
router.post("/:id/log-attempt", generalLimiter, logPaymentAttempt);
router.patch("/:id/attempt-status", generalLimiter, updateAttemptStatus);
router.patch("/:id/status", generalLimiter, updateOrderStatus);

export default router;
