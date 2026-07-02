-- ============================================================
--  GajananGems — Connect Users and Orders
--  Run this in your Supabase SQL Editor (Database → SQL Editor)
-- ============================================================

-- 1. Add user_id to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES public.users(id) ON DELETE SET NULL;

-- 2. Optional: Index the new column for faster queries on the profile page
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON public.orders(user_id);
