/**
 * backend/src/routes/products.routes.js
 */

import { Router } from "express";
import { generalLimiter } from "../middleware/rateLimiter.js";
import {
  getProducts,
  searchProducts,
  getProductBySlug,
  getProductById,
  getProductsByCategory,
} from "../controllers/products.controller.js";

const router = Router();

// NOTE: specific routes must be defined before /:slug (param route)
router.get("/", generalLimiter, getProducts);
router.get("/search", generalLimiter, searchProducts);
router.get("/id/:id", generalLimiter, getProductById);
router.get("/category/:categorySlug", generalLimiter, getProductsByCategory);
router.get("/:slug", generalLimiter, getProductBySlug);

export default router;
