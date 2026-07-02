/**
 * backend/src/controllers/products.controller.js
 *
 * Fetches products and categories from Supabase.
 * Normalizes data (builds full image URLs, slug, gallery) before sending.
 */

import { supabase } from "../lib/supabase.js";

// ── Image URL helpers ─────────────────────────────────────────────────────────

const SUPABASE_URL = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
const PRODUCT_BUCKET = process.env.PRODUCT_BUCKET || "products";
const CATEGORY_BUCKET = process.env.CATEGORY_BUCKET || "categories";

function storageUrl(bucket, filePath) {
  if (!filePath) return "";
  if (filePath.startsWith("http")) return filePath;
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${filePath}`;
}

const productImageUrl = (path) => storageUrl(PRODUCT_BUCKET, path);
const categoryImageUrl = (path) => storageUrl(CATEGORY_BUCKET, path);

// ── Slug helper ───────────────────────────────────────────────────────────────

function titleToSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

// ── Normalizers ───────────────────────────────────────────────────────────────

function normaliseProduct(row) {
  const primaryImg = productImageUrl(row.image_url);

  const extraImages = (row.product_images ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((pi) => productImageUrl(pi.image_url))
    .filter(Boolean);

  const gallery = [
    ...(primaryImg ? [primaryImg] : []),
    ...extraImages.filter((url) => url !== primaryImg),
  ];

  const joined = row.categories ?? null;

  return {
    id: row.id,
    title: row.title,
    name: row.title,
    slug: row.slug || titleToSlug(row.title),
    description: row.description,
    shortDescription: row.description ?? undefined,
    price: row.price,
    old_price: row.old_price,
    old: row.old_price ?? undefined,
    image_url: row.image_url,
    img: primaryImg,
    created_at: row.created_at,
    category_id: row.category_id,
    available: row.available,
    bestseller: row.bestseller ?? false,
    gallery,
    categorySlug: joined?.slug ?? undefined,
    categoryName: joined?.name ?? undefined,
    categories: joined,
    product_images: row.product_images,
  };
}

function normaliseCategory(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    img: categoryImageUrl(row.image_url),
    image_url: row.image_url,
    available: row.available ?? true,
    home: row.home ?? true,
    created_at: row.created_at,
  };
}

// ─── Products ─────────────────────────────────────────────────────────────────

/** GET /api/products — all available products */
export async function getProducts(req, res, next) {
  try {
    console.log("[products] Fetching all available products");

    const { data, error } = await supabase
      .from("products")
      .select("*, categories(*), product_images(*)")
      .eq("available", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[products] getProducts error:", error);
      return res.status(500).json({ error: error.message });
    }

    const products = (data ?? []).map(normaliseProduct);
    console.log(`[products] Returning ${products.length} products`);
    res.json(products);
  } catch (err) {
    console.error("[products] Unexpected error in getProducts:", err);
    next(err);
  }
}

/** GET /api/products/search?q=query — search products by title */
export async function searchProducts(req, res, next) {
  try {
    const q = (req.query.q || "").toString().trim();

    console.log(`[products] Search query: "${q}"`);

    if (!q) {
      return res.json([]);
    }

    const { data, error } = await supabase
      .from("products")
      .select("id, title, price, old_price, image_url, slug")
      .eq("available", true)
      .ilike("title", `%${q}%`)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("[products] searchProducts error:", error);
      return res.status(500).json({ error: error.message });
    }

    const results = (data ?? []).map((row) => ({
      id: row.id,
      slug: row.slug || titleToSlug(row.title),
      name: row.title,
      price: row.price,
      old: row.old_price ?? undefined,
      img: productImageUrl(row.image_url),
    }));

    console.log(`[products] Search "${q}" returned ${results.length} results`);
    res.json(results);
  } catch (err) {
    console.error("[products] Unexpected error in searchProducts:", err);
    next(err);
  }
}

/** GET /api/products/:slug — single product by slug */
export async function getProductBySlug(req, res, next) {
  try {
    const { slug } = req.params;

    console.log(`[products] Fetching product by slug: ${slug}`);

    const { data, error } = await supabase
      .from("products")
      .select("*, categories(*), product_images(*)")
      .eq("slug", slug)
      .eq("available", true)
      .single();

    if (error || !data) {
      // Fallback: search by generated slug from title
      console.log(`[products] Slug column miss — falling back to title search for: ${slug}`);
      const { data: allData, error: allError } = await supabase
        .from("products")
        .select("*, categories(*), product_images(*)")
        .eq("available", true);

      if (allError) {
        return res.status(500).json({ error: allError.message });
      }

      const found = (allData ?? []).find(
        (p) => titleToSlug(p.title) === slug
      );

      if (!found) {
        console.log(`[products] Product not found for slug: ${slug}`);
        return res.status(404).json({ error: "Product not found" });
      }

      return res.json(normaliseProduct(found));
    }

    console.log(`[products] Found product: ${data.title} (id: ${data.id})`);
    res.json(normaliseProduct(data));
  } catch (err) {
    console.error("[products] Unexpected error in getProductBySlug:", err);
    next(err);
  }
}

/** GET /api/products/id/:id — single product by numeric id */
export async function getProductById(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);

    console.log(`[products] Fetching product by id: ${id}`);

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const { data, error } = await supabase
      .from("products")
      .select("*, categories(*), product_images(*)")
      .eq("id", id)
      .eq("available", true)
      .single();

    if (error || !data) {
      console.log(`[products] Product id ${id} not found`);
      return res.status(404).json({ error: "Product not found" });
    }

    console.log(`[products] Found product by id ${id}: ${data.title}`);
    res.json(normaliseProduct(data));
  } catch (err) {
    console.error("[products] Unexpected error in getProductById:", err);
    next(err);
  }
}

/** GET /api/products/category/:categorySlug — products in a category */
export async function getProductsByCategory(req, res, next) {
  try {
    const { categorySlug } = req.params;

    console.log(`[products] Fetching products for category: ${categorySlug}`);

    const { data: catData, error: catError } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .eq("available", true)
      .single();

    if (catError || !catData) {
      console.log(`[products] Category not found: ${categorySlug}`);
      return res.json([]);
    }

    const { data, error } = await supabase
      .from("products")
      .select("*, categories(*), product_images(*)")
      .eq("category_id", catData.id)
      .eq("available", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[products] getProductsByCategory error:", error);
      return res.status(500).json({ error: error.message });
    }

    const products = (data ?? []).map(normaliseProduct);
    console.log(`[products] Category "${categorySlug}" has ${products.length} products`);
    res.json(products);
  } catch (err) {
    console.error("[products] Unexpected error in getProductsByCategory:", err);
    next(err);
  }
}

// ─── Categories ───────────────────────────────────────────────────────────────

/** GET /api/categories — all available categories */
export async function getCategories(req, res, next) {
  try {
    console.log("[categories] Fetching all available categories");

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("available", true)
      .order("name", { ascending: true });

    if (error) {
      console.error("[categories] getCategories error:", error);
      return res.status(500).json({ error: error.message });
    }

    const categories = (data ?? []).map(normaliseCategory);
    console.log(`[categories] Returning ${categories.length} categories`);
    res.json(categories);
  } catch (err) {
    console.error("[categories] Unexpected error in getCategories:", err);
    next(err);
  }
}

/** GET /api/categories/home — categories shown on home page */
export async function getHomeCategories(req, res, next) {
  try {
    console.log("[categories] Fetching home page categories");

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("available", true)
      .eq("home", true)
      .order("name", { ascending: true });

    if (error) {
      console.error("[categories] getHomeCategories error:", error);
      return res.status(500).json({ error: error.message });
    }

    const categories = (data ?? []).map(normaliseCategory);
    console.log(`[categories] Returning ${categories.length} home categories`);
    res.json(categories);
  } catch (err) {
    console.error("[categories] Unexpected error in getHomeCategories:", err);
    next(err);
  }
}

/** GET /api/categories/:slug — category by slug */
export async function getCategoryBySlug(req, res, next) {
  try {
    const { slug } = req.params;

    console.log(`[categories] Fetching category by slug: ${slug}`);

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .eq("available", true)
      .single();

    if (error || !data) {
      console.log(`[categories] Category not found: ${slug}`);
      return res.status(404).json({ error: "Category not found" });
    }

    console.log(`[categories] Found category: ${data.name}`);
    res.json(normaliseCategory(data));
  } catch (err) {
    console.error("[categories] Unexpected error in getCategoryBySlug:", err);
    next(err);
  }
}
