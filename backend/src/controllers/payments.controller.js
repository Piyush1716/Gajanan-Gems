/**
 * backend/src/controllers/payments.controller.js
 *
 * Handles Razorpay order creation and signature verification.
 * The KEY_SECRET never leaves the backend.
 */

import { createRazorpayOrder, verifyRazorpaySignature } from "../lib/razorpay.js";

// ── Create Razorpay Order ─────────────────────────────────────────────────────

/**
 * POST /api/payments/create-order
 * Body: { amount, currency, receipt }
 */
export async function createOrder(req, res, next) {
  try {
    const { amount, currency = "INR", receipt } = req.body;

    console.log(`[payments] create-order request: amount=${amount}, currency=${currency}, receipt=${receipt}`);

    if (!amount || typeof amount !== "number" || amount < 100) {
      return res.status(400).json({ error: "Invalid amount. Must be at least 100 paise (₹1)." });
    }

    const order = await createRazorpayOrder(amount, currency, receipt);

    console.log(`[payments] Razorpay order created: ${order.id}`);
    res.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.error("[payments] Error in createOrder:", err);
    res.status(500).json({ error: err.message || "Failed to create payment order. Please try again." });
  }
}

// ── Verify Razorpay Signature ─────────────────────────────────────────────────

/**
 * POST /api/payments/verify
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
export async function verifyPayment(req, res, next) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    console.log(`[payments] verify request: order=${razorpay_order_id}, payment=${razorpay_payment_id}`);

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing required payment fields" });
    }

    // Validate signature format
    if (!/^[0-9a-f]{64}$/.test(razorpay_signature)) {
      console.warn("[payments] Invalid signature format received");
      return res.status(400).json({ error: "Invalid signature format" });
    }

    const isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    if (!isValid) {
      console.warn(`[payments] Signature mismatch for order: ${razorpay_order_id}`);
      return res.status(400).json({
        success: false,
        error: "Payment signature verification failed.",
      });
    }

    console.log(`[payments] ✓ Payment verified for order: ${razorpay_order_id}`);
    res.json({ success: true });
  } catch (err) {
    console.error("[payments] Error in verifyPayment:", err);
    next(err);
  }
}
