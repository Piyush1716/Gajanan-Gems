// api/contact.js — Vercel Serverless Function
// Receives contact form submissions and inserts them into Supabase
//
// NOTE: Uses native fetch() against the Supabase REST API instead of
// @supabase/supabase-js to avoid the "Node.js 20 WebSocket" warning.

function setCorsHeaders(res) {
  const origin = process.env.ALLOWED_ORIGIN ?? "https://gajanangems.com";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

// Simple rate limiter: max 3 contact submissions per IP per hour
const contactRateMap = new Map();
const CONTACT_WINDOW_MS = 60 * 60_000; // 1 hour
const CONTACT_MAX = 3;

function isContactRateLimited(ip) {
  const now = Date.now();
  const history = (contactRateMap.get(ip) ?? []).filter((t) => now - t < CONTACT_WINDOW_MS);
  if (history.length >= CONTACT_MAX) return true;
  contactRateMap.set(ip, [...history, now]);
  return false;
}

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ??
    req.socket?.remoteAddress ??
    "unknown";

  if (isContactRateLimited(ip)) {
    return res.status(429).json({ error: "Too many submissions. Please try again later." });
  }

  const SUPABASE_URL  = process.env.SUPABASE_URL;
  const SERVICE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error("[contact] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
    return res.status(500).json({ error: "Server configuration error" });
  }

  const { name, email, phone, message, inquiryType } = req.body ?? {};

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ error: "Name, email and message are required" });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  if (name.length > 100 || email.length > 200 || message.length > 2000) {
    return res.status(400).json({ error: "Input exceeds maximum allowed length" });
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

    // Direct Supabase REST API — no client library, no WebSocket overhead
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
      return res.status(500).json({ error: "Failed to save your message. Please try again." });
    }

    console.log(`[contact] New submission from ${email.trim()}`);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("[contact] Unexpected error:", err);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}
