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
    const { userId, billing, items, subtotal, total } = req.body;
    const shipping = 0; // free delivery — server-authoritative, never trust client value

    console.log(`[orders] Creating order for user_id=${userId}, total=₹${total}`);

    if (!billing || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "billing and items are required" });
    }

    // Validate items before fetching prices
    for (const item of items) {
      if (!item.productId || !Number.isInteger(item.productId) || item.productId <= 0) {
        return res.status(400).json({ error: "Missing or invalid productId" });
      }
      if (!Number.isInteger(item.qty) || item.qty <= 0 || item.qty > 50) {
        return res.status(400).json({ error: `Invalid quantity for item ${item.slug ?? item.productId}` });
      }
    }

    // Fetch authoritative prices from DB
    const productIds = items.map((item) => item.productId).filter(Boolean);
    const { data: dbProducts, error: productsError } = await supabase
      .from("products")
      .select("id, price")
      .in("id", productIds);

    if (productsError) {
      return res.status(500).json({ error: "Failed to fetch product prices" });
    }

    let serverSubtotal = 0;
    const validItems = items.map((item) => {
      const dbProduct = dbProducts.find((p) => p.id === item.productId);
      if (!dbProduct) {
        throw new Error(`Invalid product ID: ${item.productId}`);
      }
      serverSubtotal += dbProduct.price * item.qty;
      return { ...item, price: dbProduct.price };
    });

    const serverTotal = serverSubtotal + Number(shipping);
    console.log(`[orders] Server-computed total: ₹${serverTotal} (client sent: ₹${total})`);

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
          subtotal: serverSubtotal,
          shipping: Number(shipping),
          total: serverTotal,
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
    const orderItems = validItems.map((item) => ({
      order_id: orderId,
      product_id: item.productId,
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



// ── Update payment attempt status ─────────────────────────────────────────────

/**
 * PATCH /api/orders/:id/attempt-status
 * Body: { attemptNumber, status, razorpayPaymentId?, paymentResponse?, errorMessage? }
 */
export async function updateAttemptStatus(req, res, next) {
  try {
    const orderId = parseInt(req.params.id, 10);
    const { attemptNumber, status, razorpayPaymentId, paymentResponse, errorMessage } = req.body;

    // Security check: only allow updating to success from the server
    if (status === "success") {
      return res.status(403).json({ error: "Forbidden: Cannot set status to success via this endpoint" });
    }

    console.log(`[orders] Updating attempt status: orderId=${orderId}, attempt=${attemptNumber}, status=${status}`);

    // Reject if attempt does not exist
    const { data: existingAttempt, error: attemptCheckError } = await supabase
      .from("payment_attempts")
      .select("id")
      .eq("order_id", orderId)
      .eq("attempt_number", attemptNumber)
      .single();

    if (attemptCheckError || !existingAttempt) {
      return res.status(404).json({ error: "Payment attempt not found" });
    }

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

    const CLIENT_ALLOWED_STATUSES = new Set(["payment_failed", "payment_cancelled"]);
    if (!CLIENT_ALLOWED_STATUSES.has(status)) {
      return res.status(403).json({ error: `Forbidden: cannot set status "${status}" via this endpoint` });
    }

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
    const userId = req.params.userId?.trim();

    console.log(`[orders] Fetching orders for user_id=${userId}`);

    if (!userId) {
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
      query = query.eq("user_id", userId.trim());
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
