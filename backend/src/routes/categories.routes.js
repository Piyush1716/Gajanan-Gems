/**
 * backend/src/routes/categories.routes.js
 */

import { Router } from "express";
import { generalLimiter } from "../middleware/rateLimiter.js";
import {
  getCategories,
  getHomeCategories,
  getCategoryBySlug,
} from "../controllers/products.controller.js";

const router = Router();

router.get("/", generalLimiter, getCategories);
router.get("/home", generalLimiter, getHomeCategories);
router.get("/:slug", generalLimiter, getCategoryBySlug);

export default router;
