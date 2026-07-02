/**
 * backend/src/routes/contact.routes.js
 */

import { Router } from "express";
import { contactLimiter } from "../middleware/rateLimiter.js";
import { submitContact } from "../controllers/contact.controller.js";

const router = Router();

router.post("/", contactLimiter, submitContact);

export default router;
