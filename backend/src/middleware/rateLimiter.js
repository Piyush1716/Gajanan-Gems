/**
 * backend/src/middleware/rateLimiter.js
 *
 * Named rate limiter instances for each route group.
 * Uses express-rate-limit.
 */

import rateLimit from "express-rate-limit";

/** Auth routes: 5 attempts per 15 minutes */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Too many attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

/** Contact form: 3 submissions per hour */
export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { error: "Too many submissions. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

/** Create order: 5 per minute */
export const createOrderLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: "Too many requests. Please wait a minute and try again." },
  standardHeaders: true,
  legacyHeaders: false,
});

/** Payment verify: 10 per minute */
export const verifyPaymentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

/** General API limiter: 100 req per minute */
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: "Too many requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});
