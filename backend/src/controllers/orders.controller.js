/**
 * backend/src/controllers/orders.controller.js
 *
 * Handles order creation (with order items), user order history,
 * and order tracking by ID + email.
 */

import { supabase } from "../lib/supabase.js";

// ── Create order + order items ─────────────────────────────────────────────────

/**
 * POST /api/orders/create
 * Body: { userId, billing, items, subtotal, shipping, total }
 */
export async function createOrder(req, res, next) {
  try {
    const { userId, billing, items, subtotal, shipping = 0, total } = req.body;

    console.log(`[orders] Creating order for user_id=${userId}, total=₹${total}`);

    if (!billing || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "billing and items are required" });
    }

    // Insert order row
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          user_id: userId || null,
          first_name: billing.firstName,
          last_name: billing.lastName,
          email: billing.email.toLowerCase(),
          phone: billing.phone,
          address: billing.address,
          city: billing.city,
          state: billing.state,
          pin: billing.pin,
          country: billing.country || "India",
          notes: billing.notes || null,
          subtotal,
          shipping,
          total,
          payment_method: "razorpay",
          status: "payment_pending",
          payment_error: null,
          payment_retry_count: 0,
          last_payment_attempt_at: new Date().toISOString(),
        },
      ])
      .select("id")
      .single();

    if (orderError || !orderData) {
      console.error("[orders] Failed to create order row:", orderError);
      return res.status(500).json({ error: orderError?.message || "Failed to create order" });
    }

    const orderId = orderData.id;
    console.log(`[orders] Order row created: id=${orderId}`);

    // Insert order_items
    const orderItems = items.map((item) => ({
      order_id: orderId,
      product_id: item.productId || null,
      slug: item.slug,
      title: item.title,
      price: item.price,
      qty: item.qty,
      size: item.size || null,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("[orders] Failed to insert order items:", itemsError);
      return res.status(500).json({ error: `Failed to add items to order: ${itemsError.message}` });
    }

    console.log(`[orders] Inserted ${orderItems.length} order items for order ${orderId}`);
    res.json({ orderId });
  } catch (err) {
    console.error("[orders] Unexpected error in createOrder:", err);
    next(err);
  }
}

// ── Update payment retry tracking ─────────────────────────────────────────────

/**
 * PATCH /api/orders/:id/payment-attempt
 * Body: { attemptNumber }
 */
export async function updatePaymentAttempt(req, res, next) {
  try {
    const orderId = parseInt(req.params.id, 10);
    const { attemptNumber } = req.body;

    console.log(`[orders] Updating payment attempt tracking: orderId=${orderId}, attempt=${attemptNumber}`);

    const { error } = await supabase
      .from("orders")
      .update({
        payment_retry_count: attemptNumber,
        last_payment_attempt_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (error) {
      console.error("[orders] updatePaymentAttempt error:", error);
      return res.status(500).json({ error: error.message });
    }

    console.log(`[orders] Payment attempt ${attemptNumber} tracked for order ${orderId}`);
    res.json({ success: true });
  } catch (err) {
    console.error("[orders] Unexpected error in updatePaymentAttempt:", err);
    next(err);
  }
}

// ── Log a new payment attempt row ─────────────────────────────────────────────

/**
 * POST /api/orders/:id/log-attempt
 * Body: { attemptNumber, razorpayOrderId }
 */
export async function logPaymentAttempt(req, res, next) {
  try {
    const orderId = parseInt(req.params.id, 10);
    const { attemptNumber, razorpayOrderId } = req.body;

    console.log(`[orders] Logging payment attempt: orderId=${orderId}, attempt=${attemptNumber}, rzpOrder=${razorpayOrderId}`);

    const { error } = await supabase.from("payment_attempts").insert({
      order_id: orderId,
      attempt_number: attemptNumber,
      status: "pending",
      razorpay_order_id: razorpayOrderId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("[orders] logPaymentAttempt error:", error);
      return res.status(500).json({ error: error.message });
    }

    console.log(`[orders] Payment attempt logged: order ${orderId}, attempt ${attemptNumber}`);
    res.json({ success: true });
  } catch (err) {
    console.error("[orders] Unexpected error in logPaymentAttempt:", err);
    next(err);
  }
}

// ── Update payment attempt status ─────────────────────────────────────────────

/**
 * PATCH /api/orders/:id/attempt-status
 * Body: { attemptNumber, status, razorpayPaymentId?, paymentResponse?, errorMessage? }
 */
export async function updateAttemptStatus(req, res, next) {
  try {
    const orderId = parseInt(req.params.id, 10);
    const { attemptNumber, status, razorpayPaymentId, paymentResponse, errorMessage } = req.body;

    console.log(`[orders] Updating attempt status: orderId=${orderId}, attempt=${attemptNumber}, status=${status}`);

    const updatePayload = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (razorpayPaymentId) updatePayload.razorpay_payment_id = razorpayPaymentId;
    if (paymentResponse) updatePayload.payment_response = paymentResponse;
    if (errorMessage) updatePayload.error_message = errorMessage;

    const { error } = await supabase
      .from("payment_attempts")
      .update(updatePayload)
      .eq("order_id", orderId)
      .eq("attempt_number", attemptNumber);

    if (error) {
      console.error("[orders] updateAttemptStatus error:", error);
      return res.status(500).json({ error: error.message });
    }

    console.log(`[orders] Attempt status updated to "${status}" for order ${orderId}`);
    res.json({ success: true });
  } catch (err) {
    console.error("[orders] Unexpected error in updateAttemptStatus:", err);
    next(err);
  }
}

// ── Update order status ───────────────────────────────────────────────────────

/**
 * PATCH /api/orders/:id/status
 * Body: { status, razorpayPaymentId?, paymentError? }
 */
export async function updateOrderStatus(req, res, next) {
  try {
    const orderId = parseInt(req.params.id, 10);
    const { status, razorpayPaymentId, paymentError } = req.body;

    console.log(`[orders] Updating order status: orderId=${orderId}, status=${status}`);

    const updatePayload = { status };
    if (razorpayPaymentId !== undefined) updatePayload.razorpay_payment_id = razorpayPaymentId;
    if (paymentError !== undefined) updatePayload.payment_error = paymentError;

    const { error } = await supabase
      .from("orders")
      .update(updatePayload)
      .eq("id", orderId);

    if (error) {
      console.error("[orders] updateOrderStatus error:", error);
      return res.status(500).json({ error: error.message });
    }

    console.log(`[orders] Order ${orderId} status updated to: ${status}`);
    res.json({ success: true });
  } catch (err) {
    console.error("[orders] Unexpected error in updateOrderStatus:", err);
    next(err);
  }
}

// ── Get orders by user ────────────────────────────────────────────────────────

/**
 * GET /api/orders/user/:userId
 */
export async function getOrdersByUser(req, res, next) {
  try {
    const userId = parseInt(req.params.userId, 10);

    console.log(`[orders] Fetching orders for user_id=${userId}`);

    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const { data, error } = await supabase
      .from("orders")
      .select(
        "id, status, created_at, first_name, last_name, email, subtotal, shipping, total, payment_method, payment_error, order_items(id, title, qty, price, size)"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[orders] getOrdersByUser error:", error);
      return res.status(500).json({ error: error.message });
    }

    console.log(`[orders] Found ${(data ?? []).length} orders for user ${userId}`);
    res.json(data ?? []);
  } catch (err) {
    console.error("[orders] Unexpected error in getOrdersByUser:", err);
    next(err);
  }
}

// ── Track order by ID + email ─────────────────────────────────────────────────

/**
 * GET /api/orders/track?orderId=&email=&userId=
 */
export async function trackOrder(req, res, next) {
  try {
    const { orderId, email, userId } = req.query;
    const id = parseInt(orderId, 10);

    console.log(`[orders] Tracking order id=${orderId}, email=${email}, userId=${userId}`);

    if (isNaN(id) || !email) {
      return res.status(400).json({ error: "Valid orderId and email are required" });
    }

    let query = supabase
      .from("orders")
      .select(
        "id, status, created_at, first_name, last_name, subtotal, shipping, total, payment_method, payment_error, order_items(id, title, qty, price, size)"
      )
      .eq("id", id)
      .eq("email", email.trim().toLowerCase());

    if (userId) {
      query = query.eq("user_id", parseInt(userId, 10));
    }

    const { data, error } = await query.single();

    if (error || !data) {
      console.log(`[orders] Order not found: id=${id}, email=${email}`);
      return res.status(404).json({
        error: "We couldn't find an order matching those details. Please double-check your Order ID and email address.",
      });
    }

    console.log(`[orders] Found order ${id} — status: ${data.status}`);
    res.json(data);
  } catch (err) {
    console.error("[orders] Unexpected error in trackOrder:", err);
    next(err);
  }
}
