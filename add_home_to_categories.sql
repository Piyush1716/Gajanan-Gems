-- ============================================================
--  GajananGems — Add 'home' column to categories
--  Run this in your Supabase SQL Editor (Database → SQL Editor)
-- ============================================================

-- 1. Add home boolean column, default false
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS home BOOLEAN DEFAULT false;

-- 2. Update existing available categories to show on home page by default
-- You can manually set home = false for categories you don't want on the home page later
UPDATE public.categories 
SET home = true 
WHERE available = true;
