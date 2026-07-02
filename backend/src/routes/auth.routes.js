/**
 * backend/src/routes/auth.routes.js
 */

import { Router } from "express";
import { authLimiter } from "../middleware/rateLimiter.js";
import { login, signup } from "../controllers/auth.controller.js";

const router = Router();

router.post("/login", authLimiter, login);
router.post("/signup", authLimiter, signup);

export default router;
