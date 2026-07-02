-- ============================================================
-- Migration: Add product_images table for multi-image support
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- 1. Create the product_images table
CREATE TABLE IF NOT EXISTS product_images (
  id          bigint        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id  bigint        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url   text          NOT NULL,   -- filename / path in the "products" storage bucket
  sort_order  integer       NOT NULL DEFAULT 0,  -- 0 = first extra image shown
  created_at  timestamptz   NOT NULL DEFAULT now()
);

-- 2. Index for fast lookups by product
CREATE INDEX IF NOT EXISTS product_images_product_id_idx
  ON product_images (product_id, sort_order);

-- 3. Enable Row-Level Security (same pattern as your other tables)
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- 4. Public read policy (anyone can view images of available products)
CREATE POLICY "Public can read product images"
  ON product_images
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_images.product_id
        AND products.available = true
    )
  );

-- 5. (Optional) Allow authenticated admins to manage images
--    Uncomment if you have an admin role / service-role key setup:
-- CREATE POLICY "Admins can manage product images"
--   ON product_images
--   FOR ALL
--   USING (auth.role() = 'service_role');


-- ============================================================
-- How to add images for a product
-- ============================================================
-- Replace <product_id> with the actual `id` from the products table.
-- image_url should be the filename/path inside your "products" storage bucket
-- (same format as the image_url column in the products table).
-- sort_order controls display order: 0 first, 1 second, etc.

-- Example: add 3 extra images for product id=5
-- INSERT INTO product_images (product_id, image_url, sort_order) VALUES
--   (5, 'dhan-yog-bracelet-2.jpg', 0),
--   (5, 'dhan-yog-bracelet-3.jpg', 1),
--   (5, 'dhan-yog-bracelet-4.jpg', 2);

-- The primary image (products.image_url) is always shown first automatically.
-- You can add 1–3 extra images here (total gallery = 1 primary + up to 3 extra = 4 max).


-- ============================================================
-- Verify
-- ============================================================
-- After inserting, confirm it looks right:
SELECT
  p.title,
  p.image_url    AS primary_image,
  pi.image_url   AS extra_image,
  pi.sort_order
FROM products p
LEFT JOIN product_images pi ON pi.product_id = p.id
ORDER BY p.id, pi.sort_order;
