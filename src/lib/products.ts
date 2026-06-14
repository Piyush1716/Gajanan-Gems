import { supabase } from "@/lib/supabase";

// ─── Storage URL helpers ───────────────────────────────────────────────────────

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string).replace(/\/$/, "");
const PRODUCT_BUCKET  = (import.meta.env.VITE_PRODUCT_BUCKET  as string | undefined) ?? "products";
const CATEGORY_BUCKET = (import.meta.env.VITE_CATEGORY_BUCKET as string | undefined) ?? "categories";

export function storageUrl(bucket: string, filePath: string | null | undefined): string {
  if (!filePath) return "";
  if (filePath.startsWith("http")) return filePath;
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${filePath}`;
}

export const productImageUrl  = (path: string | null | undefined) => storageUrl(PRODUCT_BUCKET,  path);
export const categoryImageUrl = (path: string | null | undefined) => storageUrl(CATEGORY_BUCKET, path);

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProductRow = {
  id: number;
  title: string;
  description: string | null;
  price: number;
  old_price: number | null;
  image_url: string | null;
  created_at: string;
  category_id: number | null;
  available: boolean;
  categories?: CategoryRow | null;
  // joined from product_images table
  product_images?: ProductImageRow[];
};

/**
 * Row from the `product_images` table.
 * Each row is one additional image for a product.
 */
export type ProductImageRow = {
  id: number;
  product_id: number;
  image_url: string;   // filename / path in the `products` bucket (same bucket as main image)
  sort_order: number;  // lower = shown first
};

export type CategoryRow = {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;
  created_at: string;
  available?: boolean;  // NEW: Track category availability
};

export type Product = ProductRow & {
  slug: string;
  name: string;
  img: string;           // full public URL for the primary product image
  old?: number;
  shortDescription?: string;

  categorySlug?: string;
  categoryName?: string;

  tag?: string;
  rating?: number;
  reviews?: number;
  stone?: string;
  benefits?: string[];
  sizes?: string[];
  gallery: string[];     // ALL images: primary first, then additional images in sort_order
};

export type Category = {
  id: number;
  slug: string;
  name: string;
  img: string;
  available: boolean;    // NEW: Track category availability
  description?: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

function normaliseProduct(row: ProductRow): Product {
  const title  = row.title as string;
  const joined = row.categories as CategoryRow | null | undefined;

  // Build primary image URL
  const primaryImg = productImageUrl(row.image_url);

  // Build gallery: primary image + additional images sorted by sort_order
  const extraImages: string[] = (row.product_images ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((pi) => productImageUrl(pi.image_url))
    .filter(Boolean);

  // Deduplicate: if extra images happen to include the same URL as primary, skip
  const gallery: string[] = [
    ...(primaryImg ? [primaryImg] : []),
    ...extraImages.filter((url) => url !== primaryImg),
  ];

  return {
    ...row,
    name:             title,
    slug:             titleToSlug(title),
    img:              primaryImg,
    old:              row.old_price ?? undefined,
    shortDescription: row.description  ?? undefined,
    categorySlug:     joined?.slug     ?? undefined,
    categoryName:     joined?.name     ?? undefined,
    gallery,
  };
}

function normaliseCategory(row: CategoryRow): Category {
  return {
    id:          row.id,
    slug:        row.slug,
    name:        row.name,
    img:         categoryImageUrl(row.image_url),
    available:   row.available ?? true,  // NEW: Default to true for backward compatibility
    description: undefined,
  };
}

// ─── Category fetching ────────────────────────────────────────────────────────

/**
 * Fetch all available categories
 * NEW: Filters by available = true
 */
export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("available", true)  // NEW: Only fetch available categories
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(normaliseCategory);
}

/**
 * Fetch all categories including unavailable ones
 * (for admin purposes)
 */
export async function fetchAllCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(normaliseCategory);
}

export async function fetchCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .eq("available", true)  // NEW: Only fetch available categories
    .single();

  if (error) return null;
  return normaliseCategory(data);
}

// ─── Product fetching ─────────────────────────────────────────────────────────

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(*), product_images(*)")
    .eq("available", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(normaliseProduct);
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  // Query by the slug column directly — avoids a full-table scan
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(*), product_images(*)")
    .eq("slug", slug)
    .eq("available", true)
    .single();

  if (error) {
    // Fallback: if slug column doesn't exist yet, do a client-side search
    if (error.code === "PGRST116" || error.message?.includes("slug")) {
      const all = await fetchProducts();
      return all.find((p) => p.slug === slug) ?? null;
    }
    return null;
  }
  return normaliseProduct(data);
}

export async function fetchProductById(id: number): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(*), product_images(*)")
    .eq("id", id)
    .eq("available", true)
    .single();

  if (error) return null;
  return normaliseProduct(data);
}

export async function fetchProductsByCategory(categorySlug: string): Promise<Product[]> {
  const { data: catData, error: catError } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", categorySlug)
    .eq("available", true)  // NEW: Only fetch from available categories
    .single();

  if (catError || !catData) return [];

  const { data, error } = await supabase
    .from("products")
    .select("*, categories(*), product_images(*)")
    .eq("category_id", catData.id)
    .eq("available", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(normaliseProduct);
}
