/**
 * src/services/api.ts
 *
 * Centralized API layer for all backend HTTP calls.
 *
 * BASE_URL:
 *   - In development: "" (empty) — Vite proxy forwards /api/* → http://localhost:3001
 *   - In production:  set VITE_API_BASE_URL to your deployed backend URL
 *
 * All functions include console.log for debugging.
 */

// ─── Base URL ─────────────────────────────────────────────────────────────────

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:3001";

// ─── Helper ───────────────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<{ data: T | null; error: string | null }> {
  const url = `${BASE_URL}${path}`;

  console.log(`[api] ${options?.method ?? "GET"} ${url}`);

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers ?? {}),
      },
    });

    const contentType = res.headers.get("content-type") ?? "";
    const data = contentType.includes("application/json")
      ? await res.json()
      : null;

    if (!res.ok) {
      const errMsg = data?.error ?? `Request failed: ${res.status} ${res.statusText}`;
      console.error(`[api] ✗ ${options?.method ?? "GET"} ${url} — ${res.status}: ${errMsg}`);
      return { data: null, error: errMsg };
    }

    console.log(`[api] ✓ ${options?.method ?? "GET"} ${url} — 200`);
    return { data, error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Network error";
    console.error(`[api] ✗ ${options?.method ?? "GET"} ${url} — ${msg}`);
    return { data: null, error: msg };
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type ApiUser = {
  id: number;
  email: string;
  phone: string;
  first_name: string | null;
  last_name: string | null;
};

export type ApiProduct = {
  id: number;
  title: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription?: string;
  price: number;
  old_price: number | null;
  old?: number;
  image_url: string | null;
  img: string;
  created_at: string;
  category_id: number | null;
  available: boolean;
  bestseller: boolean;
  gallery: string[];
  categorySlug?: string;
  categoryName?: string;
  categories?: ApiCategory | null;
  product_images?: Array<{ id: number; product_id: number; image_url: string; sort_order: number }>;
};

export type ApiCategory = {
  id: number;
  slug: string;
  name: string;
  img: string;
  image_url: string | null;
  available: boolean;
  home: boolean;
  created_at: string;
};

export type ApiSearchResult = {
  id: number;
  slug: string;
  name: string;
  price: number;
  old?: number;
  img: string;
};

export type ApiOrder = {
  id: number;
  status: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  subtotal: number;
  shipping: number;
  total: number;
  payment_method: string;
  payment_error?: string | null;
  order_items: Array<{
    id: number;
    title: string;
    qty: number;
    price: number;
    size: string | null;
  }>;
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function loginUser(identifier: string, password: string) {
  console.log(`[api/auth] Logging in user: ${identifier}`);
  return apiFetch<{ user: ApiUser }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ identifier, password }),
  });
}

export async function signupUser(data: {
  email: string;
  phone: string;
  password: string;
  first_name?: string | null;
  last_name?: string | null;
}) {
  console.log(`[api/auth] Signing up user: ${data.email}`);
  return apiFetch<{ user: ApiUser }>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function fetchAllProducts() {
  console.log("[api/products] Fetching all products");
  return apiFetch<ApiProduct[]>("/api/products");
}

export async function searchProducts(q: string) {
  console.log(`[api/products] Searching: "${q}"`);
  return apiFetch<ApiSearchResult[]>(`/api/products/search?q=${encodeURIComponent(q)}`);
}

export async function fetchProductBySlug(slug: string) {
  console.log(`[api/products] Fetching product by slug: ${slug}`);
  return apiFetch<ApiProduct>(`/api/products/${encodeURIComponent(slug)}`);
}

export async function fetchProductById(id: number) {
  console.log(`[api/products] Fetching product by id: ${id}`);
  return apiFetch<ApiProduct>(`/api/products/id/${id}`);
}

export async function fetchProductsByCategory(categorySlug: string) {
  console.log(`[api/products] Fetching products for category: ${categorySlug}`);
  return apiFetch<ApiProduct[]>(`/api/products/category/${encodeURIComponent(categorySlug)}`);
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function fetchAllCategories() {
  console.log("[api/categories] Fetching all categories");
  return apiFetch<ApiCategory[]>("/api/categories");
}

export async function fetchHomeCategories() {
  console.log("[api/categories] Fetching home categories");
  return apiFetch<ApiCategory[]>("/api/categories/home");
}

export async function fetchCategoryBySlug(slug: string) {
  console.log(`[api/categories] Fetching category by slug: ${slug}`);
  return apiFetch<ApiCategory>(`/api/categories/${encodeURIComponent(slug)}`);
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function createOrder(payload: {
  userId?: number | null;
  billing: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pin: string;
    country: string;
    notes?: string | null;
  };
  items: Array<{
    productId?: number | null;
    slug: string;
    title: string;
    price: number;
    qty: number;
    size?: string | null;
  }>;
  subtotal: number;
  shipping: number;
  total: number;
}) {
  console.log(`[api/orders] Creating order for user: ${payload.userId}, total: ₹${payload.total}`);
  return apiFetch<{ orderId: number }>("/api/orders/create", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function logPaymentAttempt(orderId: number, attemptNumber: number, razorpayOrderId: string) {
  console.log(`[api/orders] Logging payment attempt: orderId=${orderId}, attempt=${attemptNumber}`);
  return apiFetch<{ success: boolean }>(`/api/orders/${orderId}/log-attempt`, {
    method: "POST",
    body: JSON.stringify({ attemptNumber, razorpayOrderId }),
  });
}

export async function updatePaymentAttempt(orderId: number, attemptNumber: number) {
  console.log(`[api/orders] Updating payment retry tracking: orderId=${orderId}, attempt=${attemptNumber}`);
  return apiFetch<{ success: boolean }>(`/api/orders/${orderId}/payment-attempt`, {
    method: "PATCH",
    body: JSON.stringify({ attemptNumber }),
  });
}

export async function updateAttemptStatus(
  orderId: number,
  attemptNumber: number,
  status: string,
  options?: {
    razorpayPaymentId?: string;
    paymentResponse?: Record<string, unknown>;
    errorMessage?: string;
  }
) {
  console.log(`[api/orders] Updating attempt status: orderId=${orderId}, attempt=${attemptNumber}, status=${status}`);
  return apiFetch<{ success: boolean }>(`/api/orders/${orderId}/attempt-status`, {
    method: "PATCH",
    body: JSON.stringify({
      attemptNumber,
      status,
      ...options,
    }),
  });
}

export async function updateOrderStatus(
  orderId: number,
  status: string,
  options?: {
    razorpayPaymentId?: string;
    paymentError?: string | null;
  }
) {
  console.log(`[api/orders] Updating order status: orderId=${orderId}, status=${status}`);
  return apiFetch<{ success: boolean }>(`/api/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, ...options }),
  });
}

export async function getOrdersByUser(userId: number) {
  console.log(`[api/orders] Fetching orders for user: ${userId}`);
  return apiFetch<ApiOrder[]>(`/api/orders/user/${userId}`);
}

export async function trackOrder(orderId: number, email: string, userId?: number) {
  const params = new URLSearchParams({
    orderId: String(orderId),
    email,
    ...(userId ? { userId: String(userId) } : {}),
  });
  console.log(`[api/orders] Tracking order: ${orderId}, email: ${email}`);
  return apiFetch<ApiOrder>(`/api/orders/track?${params.toString()}`);
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export async function createRazorpayOrder(amount: number, currency = "INR", receipt: string) {
  console.log(`[api/payments] Creating Razorpay order: amount=${amount}, receipt=${receipt}`);
  return apiFetch<{ order_id: string; amount: number; currency: string }>(
    "/api/payments/create-order",
    {
      method: "POST",
      body: JSON.stringify({ amount, currency, receipt }),
    }
  );
}

export async function verifyPayment(data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  console.log(`[api/payments] Verifying payment: ${data.razorpay_order_id}`);
  return apiFetch<{ success: boolean }>("/api/payments/verify", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ─── Contact ──────────────────────────────────────────────────────────────────

export async function submitContact(data: {
  name: string;
  email: string;
  phone?: string;
  message: string;
  inquiryType?: string;
}) {
  console.log(`[api/contact] Submitting contact from: ${data.email}`);
  return apiFetch<{ success: boolean }>("/api/contact", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
