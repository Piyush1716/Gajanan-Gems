import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchProducts, type Product } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { ShoppingBag, Heart } from "lucide-react";

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { add } = useCart();
  const { toggle, has } = useWishlist();

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="bg-secondary/40 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex items-end justify-between mb-8 sm:mb-10">
          <div>
            <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-primary mb-2">Curated for you</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold">Bestsellers</h2>
          </div>
          <Link to="/search" search={{ q: "" }} className="hidden sm:inline text-sm font-medium hover:text-primary transition-colors">
            View all →
          </Link>
        </div>

        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border animate-pulse">
                <div className="aspect-square bg-secondary" />
                <div className="p-3 sm:p-4 space-y-2">
                  <div className="h-4 bg-secondary rounded w-3/4" />
                  <div className="h-4 bg-secondary rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <p className="text-destructive text-sm py-8 text-center">
            Failed to load products: {error}
          </p>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {products.filter(p => p.bestseller).slice(0, 12).map((p) => {
              const wished = has(p.slug);
              const discount = p.old ? Math.round(((p.old - p.price) / p.old) * 100) : 0;
              return (
                <div
                  key={p.id}
                  className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all"
                >
                  <Link to="/product/$slug" params={{ slug: p.slug }} className="block">
                    <div className="relative aspect-square overflow-hidden bg-secondary">
                      <img
                        src={p.img}
                        alt={p.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {p.tag && (
                        <span
                          className="absolute top-2 left-2 sm:top-3 sm:left-3 text-[10px] uppercase tracking-wider px-2 py-1 rounded-full"
                          style={{ backgroundColor: "#3F5C45", color: "#FFFFFF" }}
                        >
                          {p.tag}
                        </span>
                      )}
                      {discount > 0 && (
                        <span
                          className="absolute top-2 right-2 sm:top-3 sm:right-3 text-[10px] uppercase tracking-wider px-2 py-1 rounded-full font-semibold"
                          style={{ backgroundColor: "#C8A96B", color: "#2E2B26" }}
                        >
                          {discount}% OFF
                        </span>
                      )}
                      <button
                        onClick={(e) => { e.preventDefault(); toggle(p.slug); }}
                        aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
                        className={`absolute bottom-2 right-2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:scale-110 ${
                          wished ? "opacity-100 sm:opacity-100" : ""
                        }`}
                      >
                        <Heart
                          className={`h-4 w-4 transition-colors ${wished ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
                        />
                      </button>
                    </div>
                    <div className="p-3 sm:p-4">
                      <h3 className="text-xs sm:text-sm font-medium line-clamp-2 min-h-[2.5rem]">{p.name}</h3>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-base sm:text-lg font-semibold text-foreground">₹{p.price.toLocaleString()}</span>
                        {p.old && <span className="text-xs text-muted-foreground line-through">₹{p.old.toLocaleString()}</span>}
                      </div>
                    </div>
                  </Link>
                  <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                    <button
                      onClick={() => add(p.slug, 1)}
                      className="w-full flex items-center justify-center gap-2 text-[10px] sm:text-xs uppercase tracking-wider font-medium rounded-full py-2 transition-colors border border-primary text-primary hover:bg-primary hover:text-white"
                    >
                      <ShoppingBag className="h-3 w-3" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
