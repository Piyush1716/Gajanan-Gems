/**
 * backend/src/controllers/payments.controller.js
 *
 * Handles Razorpay order creation and signature verification.
 * The KEY_SECRET never leaves the backend.
 */

import { createRazorpayOrder, verifyRazorpaySignature } from "../lib/razorpay.js";
import { supabase } from "../lib/supabase.js";

// ── Create Razorpay Order ─────────────────────────────────────────────────────

/**
 * POST /api/payments/create-order
 * Body: { amount, currency, receipt }
 */
export async function createOrder(req, res, next) {
  try {
    const { amount, currency = "INR", receipt } = req.body; // Client-provided amount is ignored for security

    console.log(`[payments] create-order request: amount=${amount}, currency=${currency}, receipt=${receipt}`);

    // Parse receipt to get order ID (e.g., 'order_123')
    if (!receipt || !receipt.startsWith("order_")) {
       return res.status(400).json({ error: "Invalid receipt format" });
    }

    const orderId = parseInt(receipt.split("_")[1], 10);
    
    // Fetch authoritative order total from the database
    const { data: dbOrder, error: orderError } = await supabase
      .from("orders")
      .select("total")
      .eq("id", orderId)
      .single();

    if (orderError || !dbOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    const serverAmount = Math.round(dbOrder.total * 100); // in paise
    if (serverAmount < 100) {
      return res.status(400).json({ error: "Invalid amount. Must be at least 100 paise (₹1)." });
    }

    console.log(`[payments] Creating Razorpay order with secure amount: ${serverAmount} paise`);
    const order = await createRazorpayOrder(serverAmount, currency, receipt);

    console.log(`[payments] Razorpay order created: ${order.id}`);

    // Determine the next attempt number for this order server-side
    const { data: existingAttempts } = await supabase
      .from("payment_attempts")
      .select("attempt_number")
      .eq("order_id", orderId)
      .order("attempt_number", { ascending: false })
      .limit(1);

    const attemptNumber = (existingAttempts?.[0]?.attempt_number ?? 0) + 1;

    const { error: attemptInsertError } = await supabase.from("payment_attempts").insert({
      order_id: orderId,
      attempt_number: attemptNumber,
      status: "pending",
      razorpay_order_id: order.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (attemptInsertError) {
      console.error("[payments] Failed to log payment attempt:", attemptInsertError);
      return res.status(500).json({ error: "Failed to initialize payment attempt" });
    }

    res.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      attemptNumber,
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

    console.log(`[payments] ✓ Payment verified for Razorpay order: ${razorpay_order_id}`);
    
    // Server-side confirmation:
    // 1. Find the payment attempt using razorpay_order_id
    const { data: attempt, error: attemptError } = await supabase
      .from("payment_attempts")
      .select("order_id, attempt_number")
      .eq("razorpay_order_id", razorpay_order_id)
      .single();

    if (attemptError || !attempt) {
      console.error("[payments] Payment attempt not found for order:", razorpay_order_id);
      return res.status(404).json({ error: "Payment attempt not found" });
    }

    // 2. Update the attempt status to success
    await supabase
      .from("payment_attempts")
      .update({
        status: "success",
        razorpay_payment_id,
        updated_at: new Date().toISOString()
      })
      .eq("order_id", attempt.order_id)
      .eq("attempt_number", attempt.attempt_number);

    // 3. Update the order status to confirmed
    await supabase
      .from("orders")
      .update({
        status: "confirmed",
        razorpay_payment_id
      })
      .eq("id", attempt.order_id);

    console.log(`[payments] ✓ DB updated for order: ${attempt.order_id}`);

    res.json({ success: true, orderId: attempt.order_id });
  } catch (err) {
    console.error("[payments] Error in verifyPayment:", err);
    next(err);
  }
}
