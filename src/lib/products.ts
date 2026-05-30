import { supabase } from "@/lib/supabase";

// ─── Storage URL helpers ───────────────────────────────────────────────────────
// Images are stored in Supabase Storage.
// Bucket names come from env vars; fall back to the names you configured.

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string).replace(/\/$/, "");
const PRODUCT_BUCKET  = (import.meta.env.VITE_PRODUCT_BUCKET  as string | undefined) ?? "products";
const CATEGORY_BUCKET = (import.meta.env.VITE_CATEGORY_BUCKET as string | undefined) ?? "categories";

/**
 * Build the public URL for a file in a Supabase Storage bucket.
 * `filePath` is whatever value is stored in the DB column (e.g. "pyrite.jpg"
 * or "bracelets/pyrite.jpg").  If the DB already stores a full https:// URL
 * (old data), it is returned as-is.
 */
export function storageUrl(bucket: string, filePath: string | null | undefined): string {
  if (!filePath) return "";
  if (filePath.startsWith("http")) return filePath; // already absolute
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${filePath}`;
}

export const productImageUrl  = (path: string | null | undefined) => storageUrl(PRODUCT_BUCKET,  path);
export const categoryImageUrl = (path: string | null | undefined) => storageUrl(CATEGORY_BUCKET, path);

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Raw row shape from the `products` Supabase table.
 * Columns: id, title, description, price, old_price, image_url,
 *          created_at, category_id
 */
export type ProductRow = {
  id: number;
  title: string;
  description: string | null;
  price: number;
  old_price: number | null;
  image_url: string | null;        // filename / path in the `products` bucket
  created_at: string;
  category_id: number | null;
  available: boolean;
  // joined via select("*, categories(*)") — optional
  categories?: CategoryRow | null;
};

/**
 * Raw row shape from the `categories` Supabase table.
 * Columns: id, name, slug, image_url, created_at
 */
export type CategoryRow = {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;        // filename / path in the `categories` bucket
  created_at: string;
};

/**
 * Enriched product shape used throughout the UI.
 * All fields from ProductRow are present, plus UI-friendly aliases.
 */
export type Product = ProductRow & {
  // UI aliases
  slug: string;           // derived from title via titleToSlug()
  name: string;           // alias for title
  img: string;            // full public URL for the product image
  old?: number;           // alias for old_price (shown as strikethrough)
  shortDescription?: string; // alias for description

  // Optional extras (not in DB — populated from joined category or left undefined)
  categorySlug?: string;
  categoryName?: string;

  // These can be stored as JSONB columns or left undefined
  tag?: string;
  rating?: number;
  reviews?: number;
  stone?: string;
  benefits?: string[];
  sizes?: string[];
  gallery?: string[];     // additional image paths in the products bucket
};

/**
 * Category shape used throughout the UI.
 */
export type Category = {
  id: number;
  slug: string;
  name: string;
  img: string;            // full public URL for the category image
  description?: string;   // not in DB — you can add a `description` column later
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** "Pyrite Round Beads Bracelet" → "pyrite-round-beads-bracelet" */
export function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

/** Convert a raw ProductRow (+ optional joined category) into a Product */
function normaliseProduct(row: ProductRow): Product {
  const title  = row.title as string;
  const joined = row.categories as CategoryRow | null | undefined;

  return {
    ...row,
    name:             title,
    slug:             titleToSlug(title),
    img:              productImageUrl(row.image_url),
    old:              row.old_price ?? undefined,
    shortDescription: row.description  ?? undefined,
    categorySlug:     joined?.slug     ?? undefined,
    categoryName:     joined?.name     ?? undefined,
  };
}

/** Convert a raw CategoryRow into a Category */
function normaliseCategory(row: CategoryRow): Category {
  return {
    id:          row.id,
    slug:        row.slug,
    name:        row.name,
    img:         categoryImageUrl(row.image_url),
    description: undefined, // add a `description` column to the DB to populate this
  };
}

// ─── Category fetching ────────────────────────────────────────────────────────

/** Fetch all categories ordered by name */
export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(normaliseCategory);
}

/** Fetch a single category by slug */
export async function fetchCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return normaliseCategory(data);
}

// ─── Product fetching ─────────────────────────────────────────────────────────

/**
 * Fetch all products, joining category data so we get the category slug.
 * The join uses the `category_id` FK on the products table.
 */
export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(*)")
    .eq("available", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(normaliseProduct);
}

/** Fetch a single product by its slug (derived from title) */
export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  // We can't query by slug directly (no slug column), so fetch all & filter.
  // For large catalogs, add a generated `slug` column in Supabase instead.
  const all = await fetchProducts();
  return all.find((p) => p.slug === slug) ?? null;
}

/** Fetch a single product by its numeric id */
export async function fetchProductById(id: number): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(*)")
    .eq("id", id)
    .eq("available", true)
    .single();

  if (error) return null;
  return normaliseProduct(data);
}

/**
 * Fetch all products for a given category slug.
 * Joins through the `category_id` FK → categories.slug.
 */
export async function fetchProductsByCategory(categorySlug: string): Promise<Product[]> {
  // First resolve slug → id
  const { data: catData, error: catError } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", categorySlug)
    .single();

  if (catError || !catData) return [];

  const { data, error } = await supabase
    .from("products")
    .select("*, categories(*)")
    .eq("category_id", catData.id)
    .eq("available", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(normaliseProduct);
}
