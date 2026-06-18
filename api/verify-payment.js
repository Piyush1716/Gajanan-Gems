// api/verify-payment.js — Vercel Serverless Function
// Verifies Razorpay payment signature using HMAC-SHA256
// KEY_SECRET never exposed to frontend — all verification happens server-side

import { createHmac, timingSafeEqual } from "crypto";

// ── CORS helper ───────────────────────────────────────────────────────────────

function setCorsHeaders(res) {
  const origin = process.env.ALLOWED_ORIGIN ?? "https://gajanangems.com";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

// ─────────────────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  setCorsHeaders(res);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

  if (!KEY_SECRET) {
    console.error("[verify-payment] Missing RAZORPAY_KEY_SECRET in environment");
    return res.status(500).json({ error: "Payment gateway not configured" });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body ?? {};

  // Validate all required fields are present
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({
      error: "Missing required fields: razorpay_order_id, razorpay_payment_id, razorpay_signature",
    });
  }

  // Validate signature is a 64-char hex string to prevent length extension issues
  if (!/^[0-9a-f]{64}$/.test(razorpay_signature)) {
    return res.status(400).json({ error: "Invalid signature format" });
  }

  try {
    // Razorpay signature algorithm:
    // HMAC-SHA256(razorpay_order_id + "|" + razorpay_payment_id, KEY_SECRET)
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedHex = createHmac("sha256", KEY_SECRET)
      .update(body)
      .digest("hex");

    // ✅ Timing-safe comparison — prevents timing side-channel attacks
    // Both buffers must be the same length; we validated razorpay_signature is 64 hex chars
    const expectedBuf = Buffer.from(expectedHex, "hex");
    const receivedBuf = Buffer.from(razorpay_signature, "hex");

    const isValid =
      expectedBuf.length === receivedBuf.length &&
      timingSafeEqual(expectedBuf, receivedBuf);

    if (!isValid) {
      console.warn("[verify-payment] Signature mismatch", {
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
      });
      return res.status(400).json({
        success: false,
        error: "Payment signature verification failed. Order not confirmed.",
      });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("[verify-payment] Unexpected error:", err);
    return res.status(500).json({ error: "Signature verification error" });
  }
}
