/**
 * server.js — Local development API server
 *
 * Runs the same Razorpay API routes as the Vercel serverless functions
 * so you can use `npm run dev` instead of `vercel dev`.
 *
 * Usage:
 *   node server.js          (runs on port 3001)
 *
 * Vite proxies /api/* → http://localhost:3001 (configured in vite.config.ts)
 */

import http from "http";
import { createHmac, timingSafeEqual } from "crypto";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// ── Load .env manually (no dotenv dependency needed) ─────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dir = dirname(__filename);

function loadEnv() {
  try {
    const envPath = join(__dir, ".env");
    const lines = readFileSync(envPath, "utf8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
    console.log("[dev-api] .env loaded");
  } catch {
    console.warn("[dev-api] No .env file found — using process.env as-is");
  }
}

loadEnv();

const PORT = 3001;

// ── Helper: read full request body as string ──────────────────────────────────

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

// ── Helper: send JSON response ────────────────────────────────────────────────

function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
    "Access-Control-Allow-Origin": "*",
  });
  res.end(payload);
}

// ── Route: POST /api/create-order ─────────────────────────────────────────────

async function createOrder(req, res) {
  const KEY_ID = process.env.RAZORPAY_KEY_ID;
  const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

  if (!KEY_ID || !KEY_SECRET) {
    console.error("[create-order] Missing Razorpay credentials in .env");
    return json(res, 500, { error: "Payment gateway not configured — check .env" });
  }

  let body;
  try {
    body = JSON.parse(await readBody(req));
  } catch {
    return json(res, 400, { error: "Invalid JSON body" });
  }

  const { amount, currency = "INR", receipt } = body;

  if (!amount || typeof amount !== "number" || amount < 100) {
    return json(res, 400, { error: "Invalid amount. Must be at least 100 paise (₹1)." });
  }

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
      console.error("[create-order] Razorpay error:", data);
      return json(res, razorpayRes.status === 401 ? 401 : 500, { error: errMsg });
    }

    console.log(`[create-order] Created Razorpay order: ${data.id}`);
    return json(res, 200, {
      order_id: data.id,
      amount: data.amount,
      currency: data.currency,
    });
  } catch (err) {
    console.error("[create-order] Unexpected error:", err);
    return json(res, 500, { error: "Failed to create payment order. Please try again." });
  }
}

// ── Route: POST /api/verify-payment ──────────────────────────────────────────

async function verifyPayment(req, res) {
  const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

  if (!KEY_SECRET) {
    return json(res, 500, { error: "Payment gateway not configured — check .env" });
  }

  let body;
  try {
    body = JSON.parse(await readBody(req));
  } catch {
    return json(res, 400, { error: "Invalid JSON body" });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

  if (!/^[0-9a-f]{64}$/.test(razorpay_signature)) {
    return json(res, 400, { error: "Invalid signature format" });
  }

  const expectedHex = createHmac("sha256", KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  // Timing-safe comparison
  const expectedBuf = Buffer.from(expectedHex, "hex");
  const receivedBuf = Buffer.from(razorpay_signature, "hex");
  const isValid =
    expectedBuf.length === receivedBuf.length &&
    timingSafeEqual(expectedBuf, receivedBuf);

  if (!isValid) {
    console.warn("[verify-payment] Signature mismatch", { razorpay_order_id });
    return json(res, 400, {
      success: false,
      error: "Payment signature verification failed.",
    });
  }

  console.log(`[verify-payment] ✓ Signature verified for order ${razorpay_order_id}`);
  return json(res, 200, { success: true });
}

// ── Route: POST /api/contact ──────────────────────────────────────────────────

async function contactSubmit(req, res) {
  let body;
  try {
    body = JSON.parse(await readBody(req));
  } catch {
    return json(res, 400, { error: "Invalid JSON body" });
  }

  const { name, email, phone, message, inquiryType } = body;

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return json(res, 400, { error: "Name, email and message are required" });
  }

  if (name.length > 100 || email.length > 200 || message.length > 2000) {
    return json(res, 400, { error: "Input exceeds maximum allowed length" });
  }

  const SUPABASE_URL  = process.env.SUPABASE_URL;
  const SERVICE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SERVICE_KEY) {
    // Fallback to just logging if env vars are missing
    console.log("[contact] Dev mode (No DB credentials) — submission received:", {
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() || null,
      message: message.trim().slice(0, 80) + (message.length > 80 ? "..." : ""),
      inquiryType: inquiryType || undefined,
    });
    return json(res, 200, { success: true });
  }

  try {
    const isSpecialInquiry = inquiryType === "bulk-order" || inquiryType === "customized-bracelet";
    const tableName = isSpecialInquiry ? "special_inquiries" : "contact_submissions";
    
    const requestBody = {
      name:       name.trim(),
      email:      email.trim().toLowerCase(),
      phone:      phone?.trim() || null,
      message:    message.trim(),
      created_at: new Date().toISOString(),
    };

    if (isSpecialInquiry) {
      requestBody.inquiry_type = inquiryType;
    }

    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}`, {
      method: "POST",
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(requestBody),
    });

    if (!insertRes.ok) {
      const errText = await insertRes.text();
      console.error("[contact] Supabase insert error:", insertRes.status, errText);
      return json(res, 500, { error: "Failed to save your message. Please try again." });
    }

    console.log(`[contact] Dev mode — inserted into ${tableName} for ${email.trim()}`);
    return json(res, 200, { success: true });
  } catch (err) {
    console.error("[contact] Unexpected error:", err);
    return json(res, 500, { error: "Something went wrong. Please try again." });
  }
}

// ── HTTP Server ───────────────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  const url = req.url?.split("?")[0];

  // CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    return res.end();
  }

  if (req.method === "POST" && url === "/api/create-order") {
    return createOrder(req, res);
  }

  if (req.method === "POST" && url === "/api/verify-payment") {
    return verifyPayment(req, res);
  }

  if (req.method === "POST" && url === "/api/contact") {
    return contactSubmit(req, res);
  }

  // 404 for unknown routes
  return json(res, 404, { error: `Route not found: ${req.method} ${url}` });
});

server.listen(PORT, () => {
  console.log(`\n🚀 Dev API server running at http://localhost:${PORT}`);
  console.log("   Routes:");
  console.log("   POST /api/create-order");
  console.log("   POST /api/verify-payment");
  console.log("   POST /api/contact\n");
});
