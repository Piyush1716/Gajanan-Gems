/**
 * backend/src/routes/payments.routes.js
 */

import { Router } from "express";
import { createOrderLimiter, verifyPaymentLimiter } from "../middleware/rateLimiter.js";
import { createOrder, verifyPayment } from "../controllers/payments.controller.js";

const router = Router();

router.post("/create-order", createOrderLimiter, createOrder);
router.post("/verify", verifyPaymentLimiter, verifyPayment);

export default router;
