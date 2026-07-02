/**
 * backend/src/controllers/contact.controller.js
 *
 * Handles contact form submissions.
 * Saves to contact_submissions or special_inquiries table in Supabase.
 */

import { supabase } from "../lib/supabase.js";

/**
 * POST /api/contact
 * Body: { name, email, phone, message, inquiryType? }
 */
export async function submitContact(req, res, next) {
  try {
    const { name, email, phone, message, inquiryType } = req.body;

    console.log(`[contact] Submission from: ${email}, inquiryType: ${inquiryType || "general"}`);

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({ error: "Name, email and message are required" });
    }

    if (name.length > 100 || email.length > 200 || message.length > 2000) {
      return res.status(400).json({ error: "Input exceeds maximum allowed length" });
    }

    const isSpecialInquiry =
      inquiryType === "bulk-order" || inquiryType === "customized-bracelet";
    const tableName = isSpecialInquiry ? "special_inquiries" : "contact_submissions";

    const requestBody = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      message: message.trim(),
      created_at: new Date().toISOString(),
    };

    if (isSpecialInquiry) {
      requestBody.inquiry_type = inquiryType;
    }

    console.log(`[contact] Inserting into table: ${tableName}`);

    const { error } = await supabase.from(tableName).insert([requestBody]);

    if (error) {
      console.error("[contact] Supabase insert error:", error);
      return res.status(500).json({ error: "Failed to save your message. Please try again." });
    }

    console.log(`[contact] ✓ Contact saved to ${tableName} for ${email.trim()}`);
    res.json({ success: true });
  } catch (err) {
    console.error("[contact] Unexpected error:", err);
    next(err);
  }
}
