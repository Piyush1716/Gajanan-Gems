/**
 * backend/src/lib/razorpay.js
 *
 * Helpers for Razorpay order creation and signature verification.
 * KEY_SECRET never leaves the backend.
 */

import { createHmac, timingSafeEqual } from "crypto";

const KEY_ID = process.env.RAZORPAY_KEY_ID;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

if (!KEY_ID || !KEY_SECRET) {
  console.warn(
    "[razorpay] RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not set — payment routes will fail."
  );
}

/**
 * Create a Razorpay order via the Razorpay REST API.
 * @param {number} amount  — amount in paise (e.g. 50000 for ₹500)
 * @param {string} currency — e.g. "INR"
 * @param {string} receipt  — unique receipt string
 * @returns {Promise<{ id: string, amount: number, currency: string }>}
 */
export async function createRazorpayOrder(amount, currency = "INR", receipt) {
  console.log(`[razorpay] Creating order: amount=${amount}, currency=${currency}, receipt=${receipt}`);

  const credentials = Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64");

  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: Math.round(amount),
      currency,
      receipt: receipt ?? `receipt_${Date.now()}`,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    const errMsg = data?.error?.description ?? "Razorpay order creation failed";
    console.error("[razorpay] Order creation error:", data);
    throw new Error(errMsg);
  }

  console.log(`[razorpay] Order created: ${data.id}`);
  return { id: data.id, amount: data.amount, currency: data.currency };
}

/**
 * Verify Razorpay payment signature using timing-safe comparison.
 * @param {string} orderId     — razorpay_order_id
 * @param {string} paymentId   — razorpay_payment_id
 * @param {string} signature   — razorpay_signature
 * @returns {boolean}
 */
export function verifyRazorpaySignature(orderId, paymentId, signature) {
  console.log(`[razorpay] Verifying signature for order: ${orderId}`);

  const expectedHex = createHmac("sha256", KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const expectedBuf = Buffer.from(expectedHex, "hex");
  const receivedBuf = Buffer.from(signature, "hex");

  const isValid =
    expectedBuf.length === receivedBuf.length &&
    timingSafeEqual(expectedBuf, receivedBuf);

  console.log(`[razorpay] Signature verification: ${isValid ? "✓ valid" : "✗ INVALID"}`);
  return isValid;
}
