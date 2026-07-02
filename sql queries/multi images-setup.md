# Multi-Image Gallery — Setup Guide

## What changed

| File | Change |
|------|--------|
| `src/lib/products.ts` | Fetches `product_images(*)` in all queries; builds `gallery[]` array (primary first, extras in sort_order) |
| `src/routes/product.$slug.tsx` | New `ProductGallery` component: swipe on mobile, arrow buttons, dot indicators, thumbnail strip |
| `migration.sql` | Creates `product_images` table in Supabase |

Nothing else was changed. All existing functionality (cart, checkout, categories, orders) is untouched.

---

## Step 1 — Run the SQL migration

1. Go to **Supabase Dashboard → SQL Editor → New query**
2. Paste and run the contents of **`migration.sql`**
3. You should see `CREATE TABLE`, `CREATE INDEX`, and policy messages with no errors

---

## Step 2 — Upload your extra images to Supabase Storage

Your extra images go into the **same bucket** as the main product images (default: `products`).

1. Go to **Storage → products** bucket in your Supabase dashboard
2. Upload the additional photos (e.g. `dhan-yog-bracelet-2.jpg`, `dhan-yog-bracelet-3.jpg`)
3. Keep track of the exact filenames — you'll use them in Step 3

> **Tip:** Use the same naming pattern as your existing product images for consistency.

---

## Step 3 — Insert image rows for your products

Back in **SQL Editor**, insert rows into `product_images`.  
You need the `id` of the product — find it in the `products` table.

```sql
-- Find product IDs
SELECT id, title FROM products ORDER BY title;

-- Then insert images (example for product id = 5)
INSERT INTO product_images (product_id, image_url, sort_order) VALUES
  (5, 'dhan-yog-bracelet-2.jpg', 0),
  (5, 'dhan-yog-bracelet-3.jpg', 1),
  (5, 'dhan-yog-bracelet-4.jpg', 2);
```

Rules:
- `product_id` → the `id` from the `products` table
- `image_url` → filename/path exactly as uploaded to Storage (same format as `products.image_url`)
- `sort_order` → display order of the extra images (0 = first extra, shown as thumbnail #2 after primary)
- Maximum 3 rows per product (primary + 3 extras = 4 total gallery images)

---

## Step 4 — Replace the source files

Copy the two updated files into your project:

```
output/products.ts           →  src/lib/products.ts
output/product.$slug.tsx     →  src/routes/product.$slug.tsx
```

---

## Step 5 — Deploy

```bash
npm run build
# or push to Vercel / Cloudflare as usual
```

No new env vars are needed — it uses the same `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_PRODUCT_BUCKET`.

---

## How it works on the product page

| Screen | Behaviour |
|--------|-----------|
| Mobile | Swipe left/right to change image; dot indicators at bottom; thumbnail strip scrolls horizontally below |
| Desktop | Prev/Next arrow buttons on main image; thumbnail strip below |
| 1 image | No arrows/dots/thumbnails — just the single image (no visual clutter) |
| 2–4 images | Full gallery UI |

The primary `image_url` from the `products` table is always the first image. Extra images from `product_images` follow in `sort_order`.

---

## Managing images going forward

To **add** an image for a product:
```sql
INSERT INTO product_images (product_id, image_url, sort_order)
VALUES (<product_id>, 'new-image.jpg', <next_sort_order>);
```

To **remove** an image:
```sql
DELETE FROM product_images WHERE id = <image_row_id>;
```

To **reorder**:
```sql
UPDATE product_images SET sort_order = 1 WHERE id = <id>;
```
