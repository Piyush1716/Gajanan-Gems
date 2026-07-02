# Supabase Backend Integration Guide
## Shubhanjali — Dynamic Product Catalogue

---

## What Was Changed

| File | What changed |
|---|---|
| `src/lib/supabase.ts` | **NEW** — Supabase client (reads env vars) |
| `src/lib/products.ts` | **REPLACED** — now fetches live data from Supabase |
| `src/components/site/FeaturedProducts.tsx` | **UPDATED** — async fetch with loading skeletons |
| `src/routes/product.$slug.tsx` | **UPDATED** — async loader from Supabase |
| `.env.example` | **NEW** — env variable template |
| `supabase-setup.sql` | **NEW** — SQL to create and seed your table |

---

## Step 1 — Install the Supabase JS library

Open your terminal in the project folder and run:

```bash
npm install @supabase/supabase-js
```

---

## Step 2 — Create a Supabase project

1. Go to **https://supabase.com** and sign in (free account is fine).
2. Click **"New project"**.
3. Give it a name (e.g. `shubhanjali`), choose a region closest to India (e.g. **Singapore**), set a database password, and click **Create project**.
4. Wait ~1 minute for it to provision.

---

## Step 3 — Create the products table

1. In your Supabase project, go to **SQL Editor** (left sidebar).
2. Click **"New query"**.
3. Open the file `supabase-setup.sql` from this project and paste its contents into the editor.
4. Click **Run**.

You will see the `products` table created and 8 sample rows inserted.

> ⚠️ The `image_url` values in the seed data use placeholder URLs. Update them in Step 5.

---

## Step 4 — Get your API keys

1. In Supabase, go to **Settings → API** (gear icon in the sidebar).
2. Copy two values:
   - **Project URL** — looks like `https://abcdefghij.supabase.co`
   - **anon / public key** — a long JWT string starting with `eyJ...`

---

## Step 5 — Add keys to your project

Create a file called `.env` in the root of your project (same level as `package.json`):

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Replace the placeholder values with what you copied in Step 4.

> ✅ The `.env` file is already in `.gitignore` — your keys won't be pushed to GitHub.

---

## Step 6 — Upload your product images

Your product images are currently local assets. For Supabase, they need to be hosted URLs. Here's how:

1. In Supabase, go to **Storage** (left sidebar).
2. Click **"New bucket"**, name it `products`, and make it **Public**.
3. Upload all your images from `src/assets/` into this bucket.
4. For each image, click the three-dot menu → **"Get URL"** → copy the public URL.
5. Go to **Table Editor → products** in Supabase and update the `image_url` column for each product with the correct URL.

Alternatively, run a SQL update:

```sql
UPDATE products SET image_url = 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/products/product-pyrite.jpg'
WHERE title = 'Pyrite Round Beads Bracelet';
-- Repeat for each product
```

---

## Step 7 — Run the project

```bash
npm run dev
```

Open `http://localhost:3000` — your product grid now loads live from Supabase!

---

## Step 8 — Add or edit products (no code needed!)

Go to **Supabase → Table Editor → products** and you can:
- **Add a row** — click "+ Insert row", fill in the fields, save.
- **Edit a row** — click any cell to edit in place.
- **Delete a row** — hover a row and click the trash icon.

The website will reflect your changes immediately on the next page load.

---

## Product Table Schema Reference

| Column | Type | Required | Notes |
|---|---|---|---|
| `id` | bigint | auto | Auto-increments from 1 |
| `title` | text | ✅ | Becomes the product name and URL slug |
| `description` | text | — | Shown in the Description tab |
| `price` | numeric | ✅ | Selling price in ₹ |
| `old_price` | numeric | — | Original/strikethrough price (leave empty if no discount) |
| `image_url` | text | ✅ | Must be a publicly accessible URL |
| `created_at` | timestamptz | auto | Set automatically |

---

## How the URL slug works

The product URL is generated from the `title` column. For example:

- `"Pyrite Round Beads Bracelet"` → `/product/pyrite-round-beads-bracelet`
- `"7 Chakra Gemstone Tree"` → `/product/7-chakra-gemstone-tree`

So if you rename a product in Supabase, its URL will change. Keep titles consistent.

---

## Troubleshooting

**Products not loading / blank page**
- Check that `.env` exists and has the correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Restart the dev server after editing `.env`.

**"Failed to load products" error**
- Go to Supabase → Authentication → Policies and make sure the `Public read access` policy exists on the `products` table.

**Images not showing**
- Ensure your Supabase Storage bucket is set to **Public**.
- Double check the `image_url` values in the table — they must be full `https://` URLs.

**Product page 404**
- The slug is derived from the title. Make sure the title in Supabase exactly matches what you're linking to.
