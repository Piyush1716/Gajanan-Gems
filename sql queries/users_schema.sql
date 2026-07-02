-- ============================================================
--  GajananGems — Users Schema
--  Run this in your Supabase SQL Editor (Database → SQL Editor)
-- ============================================================

-- 1. USERS TABLE
-- Stores user credentials and contact info.
-- Passwords stored as plain text (development only).
CREATE TABLE IF NOT EXISTS public.users (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  phone         TEXT NOT NULL,
  password      TEXT NOT NULL,           -- plain text (dev only — NOT for production)
  first_name    TEXT,
  last_name     TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. INDEXES
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);

-- 3. ROW-LEVEL SECURITY
-- Allow anon key full access (dev mode — tighten for production)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon insert users" ON public.users;
DROP POLICY IF EXISTS "anon select users" ON public.users;
DROP POLICY IF EXISTS "anon update users" ON public.users;

CREATE POLICY "anon insert users"
  ON public.users FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "anon select users"
  ON public.users FOR SELECT TO anon
  USING (true);

CREATE POLICY "anon update users"
  ON public.users FOR UPDATE TO anon
  USING (true);
