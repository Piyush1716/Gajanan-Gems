-- ============================================================
-- GajananGems: Supabase Auth Migration
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- STEP 1: Create public.profiles table

CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid NOT NULL,
  email       text NOT NULL,
  phone       text,
  first_name  text,
  last_name   text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id)
    REFERENCES auth.users (id) ON DELETE CASCADE
);

-- STEP 2: Trigger to auto-populate profiles on new auth signup

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, phone, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'phone',
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- STEP 3: Migrate orders.user_id from BIGINT to UUID

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;

UPDATE public.orders SET user_id = NULL;

ALTER TABLE public.orders ALTER COLUMN user_id TYPE uuid USING NULL;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE SET NULL;

-- STEP 4: Rename old public.users table

ALTER TABLE IF EXISTS public.users RENAME TO users_legacy;

-- STEP 5: Enable Row Level Security

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: read own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles: update own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "orders: read own"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- STEP 6: Grant access to authenticated role

GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.orders TO authenticated;
