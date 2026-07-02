/**
 * backend/src/controllers/auth.controller.js
 *
 * Handles user login and signup using Supabase users table.
 * Passwords are stored in plain text in the users table (existing schema).
 */

import { supabase } from "../lib/supabase.js";

// ── Login ─────────────────────────────────────────────────────────────────────

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    console.log(`[auth] Login attempt for: ${email}`);

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const { data, error } = await supabase
      .from("users")
      .select("id, email, phone, first_name, last_name")
      .eq("email", email.trim().toLowerCase())
      .eq("password", password)
      .limit(1)
      .single();

    if (error || !data) {
      console.log(`[auth] Login failed for: ${email} — invalid credentials`);
      return res.status(401).json({ error: "Invalid email or password." });
    }

    console.log(`[auth] Login successful for: ${email} (id: ${data.id})`);
    res.json({ user: data });
  } catch (err) {
    console.error("[auth] Login unexpected error:", err);
    next(err);
  }
}

// ── Signup ────────────────────────────────────────────────────────────────────

export async function signup(req, res, next) {
  try {
    const { email, phone, password, first_name, last_name } = req.body;

    console.log(`[auth] Signup attempt for: ${email}`);

    if (!email || !password || !phone) {
      return res
        .status(400)
        .json({ error: "Email, phone, and password are required" });
    }

    // Check if email already exists
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", email.trim().toLowerCase())
      .limit(1)
      .maybeSingle();

    if (existing) {
      console.log(`[auth] Signup failed — email already exists: ${email}`);
      return res.status(400).json({ error: "Email already exists." });
    }

    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password,
          first_name: first_name || null,
          last_name: last_name || null,
        },
      ])
      .select("id, email, phone, first_name, last_name")
      .single();

    if (error || !data) {
      console.error("[auth] Signup insert error:", error);
      return res.status(500).json({ error: "Failed to create account." });
    }

    console.log(`[auth] Signup successful for: ${email} (id: ${data.id})`);
    res.json({ user: data });
  } catch (err) {
    console.error("[auth] Signup unexpected error:", err);
    next(err);
  }
}
