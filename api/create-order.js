// api/create-order.js — Vercel Serverless Function
// Creates a Razorpay order server-side (KEY_SECRET never exposed to frontend)
// Security: price verification via direct Supabase REST fetch, rate limiting, max cap, CORS
//
// NOTE: We intentionally use native fetch() instead of @supabase/supabase-js here.
// The Supabase JS client initialises WebSocket/realtime on import, which causes a
// "Node.js 20 detected without native WebSocket support" warning in Vercel and
// pollutes logs. A direct REST fetch is lighter and has zero side-effects.

// ── CORS helper ───────────────────────────────────────────────────────────────

function setCorsHeaders(res) {
  const origin = process.env.ALLOWED_ORIGIN ?? "https://gajanangems.com";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

// ── Simple in-memory rate limiter ─────────────────────────────────────────────

const rateMap = new Map();
const RATE_WINDOW_MS = 60_000; // 1 minute
const MAX_PER_WINDOW = 5;      // max 5 order-creates per IP per minute

function isRateLimited(ip) {
  const now = Date.now();
  const history = (rateMap.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (history.length >= MAX_PER_WINDOW) return true;
  rateMap.set(ip, [...history, now]);
  return false;
}

// ── Amount limits ─────────────────────────────────────────────────────────────

const MIN_PAISE = 100;        // ₹1 minimum (Razorpay requirement)
const MAX_PAISE = 10_000_00;  // ₹10,000 maximum per order

// ── Supabase REST helper (no WebSocket, no realtime) ─────────────────────────

async function fetchOrderFromSupabase(supabaseUrl, serviceKey, dbOrderId) {
  const url = `${supabaseUrl}/rest/v1/orders?id=eq.${dbOrderId}&select=total,status&limit=1`;
  const res = await fetch(url, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(`Supabase REST error: ${res.status} ${await res.text()}`);
  }
  const rows = await res.json();
  return rows?.[0] ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // ── Rate limiting ─────────────────────────────────────────────────────────
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ??
    req.socket?.remoteAddress ??
    "unknown";

  if (isRateLimited(ip)) {
    console.warn(`[create-order] Rate limit exceeded for IP: ${ip}`);
    return res.status(429).json({ error: "Too many requests. Please wait a minute and try again." });
  }

  // ── Read credentials ──────────────────────────────────────────────────────
  const KEY_ID     = process.env.RAZORPAY_KEY_ID;
  const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
  const SUPABASE_URL          = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!KEY_ID || !KEY_SECRET) {
    console.error("[create-order] Missing Razorpay credentials — set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Vercel env vars");
    return res.status(500).json({ error: "Payment gateway not configured" });
  }

  const { amount, currency = "INR", receipt } = req.body ?? {};

  // ── Basic amount validation ───────────────────────────────────────────────
  if (!amount || typeof amount !== "number" || !Number.isFinite(amount)) {
    return res.status(400).json({ error: "Invalid amount" });
  }
  if (amount < MIN_PAISE) {
    return res.status(400).json({ error: `Amount must be at least ${MIN_PAISE} paise (₹1).` });
  }
  if (amount > MAX_PAISE) {
    return res.status(400).json({ error: `Order amount exceeds the maximum limit of ₹${MAX_PAISE / 100}.` });
  }

  // ── Server-side price verification (via direct Supabase REST fetch) ───────
  if (SUPABASE_URL && SUPABASE_SERVICE_KEY && receipt) {
    try {
      const dbOrderId = parseInt(receipt.replace("order_", ""), 10);

      if (!isNaN(dbOrderId)) {
        const order = await fetchOrderFromSupabase(SUPABASE_URL, SUPABASE_SERVICE_KEY, dbOrderId);

        if (!order) {
          console.error(`[create-order] Order ${dbOrderId} not found in DB`);
          return res.status(400).json({ error: "Order not found for price verification" });
        }

        if (order.status !== "payment_pending") {
          console.warn(`[create-order] Order ${dbOrderId} status is '${order.status}', expected 'payment_pending'`);
          return res.status(400).json({ error: "This order is no longer eligible for payment" });
        }

        const expectedPaise = Math.round(order.total * 100);
        if (Math.abs(amount - expectedPaise) > 0) {
          console.error(
            `[create-order] PRICE MISMATCH — DB: ${expectedPaise} paise, Request: ${amount} paise, Order: ${dbOrderId}`
          );
          return res.status(400).json({
            error: "Payment amount does not match order total. Please refresh and try again.",
          });
        }
      }
    } catch (verifyErr) {
      console.warn("[create-order] Price verification error:", verifyErr?.message);
      // Don't block checkout — log and continue
    }
  } else {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      console.warn("[create-order] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set — price verification skipped");
    }
  }

  // ── Create Razorpay order ─────────────────────────────────────────────────
  try {
    const credentials = Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64");

    const razorpayRes = await fetch("https://api.razorpay.com/v1/orders", {
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

    const data = await razorpayRes.json();

    if (!razorpayRes.ok) {
      const errMsg = data?.error?.description ?? "Razorpay order creation failed";
      console.error("[create-order] Razorpay API error:", data);
      if (razorpayRes.status === 401) {
        return res.status(401).json({ error: "Payment gateway authentication failed" });
      }
      return res.status(500).json({ error: errMsg });
    }

    return res.status(200).json({
      order_id: data.id,
      amount:   data.amount,
      currency: data.currency,
    });
  } catch (err) {
    console.error("[create-order] Unexpected error:", err);
    return res.status(500).json({ error: "Failed to create payment order. Please try again." });
  }
}
