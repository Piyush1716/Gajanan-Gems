-- ─────────────────────────────────────────────────────────────────────────────
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Create the products table
CREATE TABLE IF NOT EXISTS products (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title         TEXT        NOT NULL,
  description   TEXT,
  price         NUMERIC     NOT NULL,
  old_price NUMERIC,                          -- original/strikethrough price
  image_url     TEXT        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Enable Row Level Security (good practice — keeps data safe)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 3. Allow anyone to READ products (public catalogue)
CREATE POLICY "Public read access"
  ON products FOR SELECT
  USING (true);

-- 4. Seed with sample data
--    Replace image_url values with your actual hosted image URLs.
--    You can upload images to Supabase Storage and paste the public URLs here.
INSERT INTO products (title, description, price, old_price, image_url) VALUES
(
  'Pyrite Round Beads Bracelet',
  'The Pyrite Round Beads Bracelet is a symbol of wealth, confidence, and powerful protection. Known as Fool''s Gold, pyrite radiates golden energy that attracts prosperity, shields against negative influences, and supports manifestation of success.',
  1099, 1499,
  'https://xxxxxxxxxxxxxxxxxxxx.supabase.co/storage/v1/object/public/products/product-pyrite.jpg'
),
(
  'Amethyst & Rose Quartz Bracelet',
  'A beautiful combination of calming Amethyst and loving Rose Quartz, this bracelet promotes emotional balance and inner peace.',
  899, 1299,
  'https://xxxxxxxxxxxxxxxxxxxx.supabase.co/storage/v1/object/public/products/cat-bracelet.jpg'
),
(
  '7 Chakra Gemstone Tree',
  'Handcrafted gemstone tree with seven different crystals representing each chakra. Perfect for home decor and energy balancing.',
  1499, 1999,
  'https://xxxxxxxxxxxxxxxxxxxx.supabase.co/storage/v1/object/public/products/cat-tree.jpg'
),
(
  'Labradorite Crystal Sphere',
  'A mesmerising labradorite sphere with vivid blue and green flash. Great for meditation and display.',
  2299, 2799,
  'https://xxxxxxxxxxxxxxxxxxxx.supabase.co/storage/v1/object/public/products/cat-sphere.jpg'
),
(
  'Clear Quartz Pyramid',
  'Clear Quartz is the master healer. This hand-polished pyramid amplifies energy and intention.',
  1199, NULL,
  'https://xxxxxxxxxxxxxxxxxxxx.supabase.co/storage/v1/object/public/products/cat-pyramid.jpg'
),
(
  'Amethyst Point Pendant',
  'Natural amethyst point set in silver. Wear it to calm the mind and enhance intuition.',
  749, 999,
  'https://xxxxxxxxxxxxxxxxxxxx.supabase.co/storage/v1/object/public/products/cat-pendant.jpg'
),
(
  'Amethyst Geode Cluster',
  'A stunning natural amethyst geode cluster. Each piece is unique, making it a beautiful statement piece for any space.',
  3499, NULL,
  'https://xxxxxxxxxxxxxxxxxxxx.supabase.co/storage/v1/object/public/products/cat-cluster.jpg'
),
(
  'Citrine Silver Ring',
  'Natural citrine set in 925 sterling silver. Citrine is the stone of abundance and joy.',
  1899, 2399,
  'https://xxxxxxxxxxxxxxxxxxxx.supabase.co/storage/v1/object/public/products/cat-ring.jpg'
);



CREATE TABLE IF NOT EXISTS categories (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  slug        TEXT NOT NULL UNIQUE,
  image_url   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE products
ADD COLUMN category_id BIGINT REFERENCES categories(id);

-- 5. Add an "available" column to track product availability
ALTER TABLE products ADD COLUMN available boolean NOT NULL DEFAULT true;
