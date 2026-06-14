import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { fetchProducts, type Product } from "./products";

export type CartItem = { slug: string; qty: number; size?: string };

type CartCtx = {
  items: CartItem[];
  add: (slug: string, qty?: number, size?: string) => void;
  remove: (slug: string, size?: string) => void;
  setQty: (slug: string, qty: number, size?: string) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  getProduct: (slug: string) => Product | undefined;
  // NEW: Sidebar management
  sidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  // NEW: Track removed items due to availability
  removedItems: Array<{ name: string; reason: string }>;
  clearRemovedItemsNotification: () => void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "shubh_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [productCache, setProductCache] = useState<Product[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [removedItems, setRemovedItems] = useState<Array<{ name: string; reason: string }>>([]);

  // Hydrate cart from localStorage on mount
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    try {
      if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  // Pre-fetch all products once so cart can resolve slugs → product details
  useEffect(() => {
    fetchProducts()
      .then((products) => {
        setProductCache(products);
        
        // Check for unavailable items in cart
        setItems((prevItems) => {
          const removed: Array<{ name: string; reason: string }> = [];
          const filtered = prevItems.filter((item) => {
            const product = products.find((p) => p.slug === item.slug);
            if (!product) {
              removed.push({ name: item.slug, reason: "Product is no longer available" });
              return false;
            }
            if (!product.available) {
              removed.push({ name: product.name, reason: "Product went out of stock" });
              return false;
            }
            return true;
          });

          if (removed.length > 0) {
            setRemovedItems(removed);
            // Show notification
            removed.forEach((item) => {
              toast.error(`${item.name} - ${item.reason}`, {
                description: "Removed from your cart",
              });
            });
          }

          return filtered;
        });
      })
      .catch((e) => console.error("CartProvider: failed to fetch products", e));
  }, []);

  const getProduct = (slug: string): Product | undefined =>
    productCache.find((p) => p.slug === slug && p.available);

  const add: CartCtx["add"] = (slug, qty = 1, size) => {
    const product = productCache.find((x) => x.slug === slug);
    
    // Check if product is available before adding
    if (!product) {
      toast.error("Product not found");
      return;
    }

    if (!product.available) {
      toast.error(`${product.name} is out of stock`);
      return;
    }

    setItems((prev) => {
      const i = prev.findIndex((x) => x.slug === slug && x.size === size);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], qty: next[i].qty + qty };
        return next;
      }
      return [...prev, { slug, qty, size }];
    });

    toast.success(`${product.name} added to cart`);
    // Auto-open sidebar when item is added
    setSidebarOpen(true);
  };

  const remove: CartCtx["remove"] = (slug, size) =>
    setItems((prev) => prev.filter((x) => !(x.slug === slug && x.size === size)));

  const setQty: CartCtx["setQty"] = (slug, qty, size) => {
    if (qty <= 0) {
      remove(slug, size);
      return;
    }
    setItems((prev) =>
      prev.map((x) => (x.slug === slug && x.size === size ? { ...x, qty: Math.max(1, qty) } : x)),
    );
  };

  const clear = () => setItems([]);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => {
    const p = getProduct(i.slug);
    return s + (p?.price ?? 0) * i.qty;
  }, 0);

  return (
    <Ctx.Provider value={{
      items,
      add,
      remove,
      setQty,
      clear,
      count,
      subtotal,
      getProduct,
      sidebarOpen,
      openSidebar: () => setSidebarOpen(true),
      closeSidebar: () => setSidebarOpen(false),
      removedItems,
      clearRemovedItemsNotification: () => setRemovedItems([]),
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}

/**
 * Helper used by cart/checkout pages to resolve a CartItem → Product.
 * Reads from the cart context's in-memory product cache (backed by Supabase).
 */
export function getProductForItem(item: CartItem, products: Product[]): Product | undefined {
  return products.find((p) => p.slug === item.slug && p.available);
}
