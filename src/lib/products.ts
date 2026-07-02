/**
 * src/lib/products.ts
 *
 * Product and category data fetching — now calls the Express backend via api.ts
 * instead of querying Supabase directly.
 *
 * Type definitions and client-side helpers remain here so the rest of the
 * frontend codebase (cart, wishlist, search, routes) can import from this file
 * without any changes to their import paths.
 */

import {
  fetchAllProducts,
  fetchProductBySlug as apiFetchProductBySlug,
  fetchProductById as apiFetchProductById,
  fetchProductsByCategory as apiFetchProductsByCategory,
  fetchAllCategories as apiFetchAllCategories,
  fetchHomeCategories as apiFetchHomeCategories,
  fetchCategoryBySlug as apiFetchCategoryBySlug,
  type ApiProduct,
  type ApiCategory,
} from "@/services/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProductImageRow = {
  id: number;
  product_id: number;
  image_url: string;
  sort_order: number;
};

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
  bestseller?: boolean;
  categories?: CategoryRow | null;
  product_images?: ProductImageRow[];
};

export type CategoryRow = {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;
  created_at: string;
  available?: boolean;
  home?: boolean;
};

export type Product = ApiProduct & {
  // Ensure backward-compatible fields for consumers
  name: string;
  slug: string;
  img: string;
  bestseller: boolean;
  old?: number;
  shortDescription?: string;
  categorySlug?: string;
  categoryName?: string;
  gallery: string[];
  // Optional enrichment fields (not returned by API — set to undefined if unused)
  tag?: string;
  rating?: number;
  reviews?: number;
  stone?: string;
  benefits?: string[];
  sizes?: string[];
};

export type Category = {
  id: number;
  slug: string;
  name: string;
  img: string;
  available: boolean;
  home: boolean;
  description?: string;
};

// ─── Slug helper (kept for any client-side slug generation) ──────────────────

export function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

// ─── Adapters ─────────────────────────────────────────────────────────────────

/** Map an ApiProduct (backend response) to the local Product type */
function adaptProduct(p: ApiProduct): Product {
  return {
    ...p,
    name: p.name ?? p.title,
    slug: p.slug,
    img: p.img,
    bestseller: p.bestseller ?? false,
    old: p.old ?? undefined,
    shortDescription: p.shortDescription ?? p.description ?? undefined,
    categorySlug: p.categorySlug,
    categoryName: p.categoryName,
    gallery: p.gallery ?? [],
  };
}

/** Map an ApiCategory (backend response) to the local Category type */
function adaptCategory(c: ApiCategory): Category {
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    img: c.img,
    available: c.available,
    home: c.home,
    description: undefined,
  };
}

// ─── Product fetching ─────────────────────────────────────────────────────────

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await fetchAllProducts();
  if (error || !data) throw new Error(error ?? "Failed to fetch products");
  return data.map(adaptProduct);
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await apiFetchProductBySlug(slug);
  if (error || !data) return null;
  return adaptProduct(data);
}

export async function fetchProductById(id: number): Promise<Product | null> {
  const { data, error } = await apiFetchProductById(id);
  if (error || !data) return null;
  return adaptProduct(data);
}

export async function fetchProductsByCategory(categorySlug: string): Promise<Product[]> {
  const { data, error } = await apiFetchProductsByCategory(categorySlug);
  if (error || !data) return [];
  return data.map(adaptProduct);
}

// ─── Category fetching ────────────────────────────────────────────────────────

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await apiFetchAllCategories();
  if (error || !data) throw new Error(error ?? "Failed to fetch categories");
  return data.map(adaptCategory);
}

export async function fetchHomeCategories(): Promise<Category[]> {
  const { data, error } = await apiFetchHomeCategories();
  if (error || !data) throw new Error(error ?? "Failed to fetch home categories");
  return data.map(adaptCategory);
}

export async function fetchAllCategories(): Promise<Category[]> {
  return fetchCategories();
}

export async function fetchCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await apiFetchCategoryBySlug(slug);
  if (error || !data) return null;
  return adaptCategory(data);
}

// ─── Storage URL helper (kept for any remaining direct usage) ─────────────────

/** @deprecated Backend now returns full URLs. Kept for backward compatibility. */
export function storageUrl(bucket: string, filePath: string | null | undefined): string {
  if (!filePath) return "";
  if (filePath.startsWith("http")) return filePath;
  const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string).replace(/\/$/, "");
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${filePath}`;
}

/** @deprecated Use product.img directly — backend returns full URL. */
export const productImageUrl = (path: string | null | undefined) =>
  storageUrl((import.meta.env.VITE_PRODUCT_BUCKET as string | undefined) ?? "products", path);

/** @deprecated Use category.img directly — backend returns full URL. */
export const categoryImageUrl = (path: string | null | undefined) =>
  storageUrl((import.meta.env.VITE_CATEGORY_BUCKET as string | undefined) ?? "categories", path);
