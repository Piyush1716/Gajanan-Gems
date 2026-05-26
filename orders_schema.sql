-- ============================================================
--  GajananGems — Orders Schema
--  Run this in your Supabase SQL Editor (Database → SQL Editor)
-- ============================================================

-- 1. ORDERS
-- Stores billing details, payment method, totals, and order status.
create table if not exists public.orders (
  id             bigint generated always as identity primary key,

  -- Billing / shipping
  first_name     text        not null,
  last_name      text        not null,
  email          text        not null,
  phone          text        not null,
  address        text        not null,
  city           text        not null,
  state          text        not null,
  pin            text        not null,
  country        text        not null default 'India',
  notes          text,

  -- Financials
  subtotal       numeric(10,2) not null,
  shipping       numeric(10,2) not null default 0,
  total          numeric(10,2) not null,

  -- Payment
  payment_method text        not null default 'cod',   -- cod | upi | card

  -- Lifecycle
  status         text        not null default 'pending',
  -- pending → confirmed → shipped → delivered → cancelled

  created_at     timestamptz not null default now()
);

-- 2. ORDER ITEMS
-- Each row is one line-item in an order.
create table if not exists public.order_items (
  id          bigint generated always as identity primary key,
  order_id    bigint      not null references public.orders(id) on delete cascade,
  product_id  bigint      references public.products(id) on delete set null,
  slug        text        not null,   -- denormalised for resilience
  title       text        not null,   -- snapshot of name at order time
  price       numeric(10,2) not null, -- unit price at order time
  qty         int         not null check (qty > 0),
  size        text,                   -- nullable (bracelets, etc.)
  created_at  timestamptz not null default now()
);

-- 3. INDEXES
create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists orders_email_idx         on public.orders(email);
create index if not exists orders_status_idx        on public.orders(status);

-- 4. ROW-LEVEL SECURITY
-- Anyone (anon key) can INSERT their own order; only service-role can SELECT/UPDATE.
alter table public.orders     enable row level security;
alter table public.order_items enable row level security;

-- Allow anon to insert orders (checkout runs client-side with the anon key)
create policy "allow anon insert orders"
  on public.orders for insert
  to anon
  with check (true);

create policy "allow anon insert order_items"
  on public.order_items for insert
  to anon
  with check (true);

-- Authenticated users can read their own orders by email (optional — useful for order history)
create policy "users read own orders"
  on public.orders for select
  to authenticated
  using (email = auth.jwt() ->> 'email');

create policy "users read own order_items"
  on public.order_items for select
  to authenticated
  using (
    order_id in (
      select id from public.orders where email = auth.jwt() ->> 'email'
    )
  );
