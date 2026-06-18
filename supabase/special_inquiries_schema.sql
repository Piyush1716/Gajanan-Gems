-- ============================================================
--  GajananGems — Special Inquiries Schema
--  Run this in your Supabase SQL Editor (Database → SQL Editor)
-- ============================================================

-- 1. SPECIAL INQUIRIES
-- Stores form submissions from Bulk Orders and Customized Bracelet pages.
create table if not exists public.special_inquiries (
  id           uuid default gen_random_uuid() primary key,
  name         text not null,
  email        text not null,
  phone        text,
  message      text not null,
  inquiry_type text not null, -- 'bulk-order' or 'customized-bracelet'
  created_at   timestamptz not null default now()
);

-- 2. INDEXES
create index if not exists special_inquiries_email_idx on public.special_inquiries(email);
create index if not exists special_inquiries_type_idx  on public.special_inquiries(inquiry_type);

-- 3. ROW-LEVEL SECURITY
-- Only service-role can INSERT/SELECT/UPDATE by default since the API route uses service key.
-- Alternatively, if client inserts directly, we would enable anon insert. 
-- Since we are inserting from the serverless function using service_role, we don't strictly need RLS policies for anon.
alter table public.special_inquiries enable row level security;

-- If you ever decide to insert directly from the frontend using anon key, uncomment below:
/*
create policy "allow anon insert special_inquiries"
  on public.special_inquiries for insert
  to anon
  with check (true);
*/
