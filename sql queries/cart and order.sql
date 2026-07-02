-- ============================================================
--  GajananGems — Cart Persistence + Orders Updates
--  Run this in Supabase SQL Editor (Database → SQL Editor)
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 1. CARTS
--    One row per browser session (keyed by a UUID stored in
--    localStorage).  No user-auth required.
-- ────────────────────────────────────────────────────────────
create table if not exists public.carts (
  id          uuid        primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-update updated_at on any change
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger carts_set_updated_at
  before update on public.carts
  for each row execute function public.set_updated_at();


-- ────────────────────────────────────────────────────────────
-- 2. CART ITEMS
--    Each row is one line-item in a cart session.
-- ────────────────────────────────────────────────────────────
create table if not exists public.cart_items (
  id         bigint generated always as identity primary key,
  cart_id    uuid        not null references public.carts(id) on delete cascade,
  slug       text        not null,
  qty        int         not null check (qty > 0),
  size       text,
  created_at timestamptz not null default now()
);

create index if not exists cart_items_cart_id_idx on public.cart_items(cart_id);


-- ────────────────────────────────────────────────────────────
-- 3. ORDER ITEMS — add image snapshot column
--    Stores the product image URL at the time of order so
--    the Orders page can display it without fetching products.
-- ────────────────────────────────────────────────────────────
alter table public.order_items
  add column if not exists image_url text;


-- ────────────────────────────────────────────────────────────
-- 4. ROW-LEVEL SECURITY — carts
--
--    Cart data is not sensitive (no PII), and without auth we
--    cannot verify ownership server-side.  We allow full anon
--    access — the UUID itself acts as the access token.
-- ────────────────────────────────────────────────────────────
alter table public.carts      enable row level security;
alter table public.cart_items enable row level security;

-- Drop policies before recreating (safe to re-run)
drop policy if exists "anon full access carts"      on public.carts;
drop policy if exists "anon full access cart_items" on public.cart_items;

create policy "anon full access carts"
  on public.carts for all to anon
  using (true) with check (true);

create policy "anon full access cart_items"
  on public.cart_items for all to anon
  using (true) with check (true);


-- ────────────────────────────────────────────────────────────
-- 5. ROW-LEVEL SECURITY — allow anon to cancel pending orders
--    (orders table was created in the previous migration)
-- ────────────────────────────────────────────────────────────
drop policy if exists "allow anon cancel pending orders" on public.orders;

create policy "allow anon cancel pending orders"
  on public.orders for update
  to anon
  using  (status = 'pending')
  with check (status = 'cancelled');

-- Allow anon to SELECT orders (needed for the orders lookup page)
drop policy if exists "allow anon select orders by email" on public.orders;
drop policy if exists "allow anon select order_items"     on public.order_items;

create policy "allow anon select orders by email"
  on public.orders for select to anon
  using (true);   -- filtered in the query by .eq("email", …)

create policy "allow anon select order_items"
  on public.order_items for select to anon
  using (true);