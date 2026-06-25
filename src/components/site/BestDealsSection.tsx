import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchProducts, type Product } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { ShoppingBag } from "lucide-react";

const BEST_DEAL_MIN_DISCOUNT = 20; // %

export function BestDealsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { add } = useCart();

  useEffect(() => {
    fetchProducts()
      .then((all) => {
        const deals = all
          .filter((p) => {
            if (!p.old || p.old <= p.price) return false;
            const disc = ((p.old - p.price) / p.old) * 100;
            return disc >= BEST_DEAL_MIN_DISCOUNT;
          })
          .sort((a, b) => {
            const da = a.old ? ((a.old - a.price) / a.old) * 100 : 0;
            const db = b.old ? ((b.old - b.price) / b.old) * 100 : 0;
            return db - da;
          })
          .slice(0, 8);
        setProducts(deals);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (!loading && products.length === 0) return null;

  return (
    <section className="py-12 sm:py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-8 sm:mb-10">
          <div>
            <p
              className="text-xs sm:text-sm uppercase tracking-[0.3em] mb-2 font-semibold"
              style={{ color: "#C8A96B" }}
            >
              Handpicked for you
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold">
              Today's Best Deals
            </h2>
          </div>
          <Link
            to="/search"
            search={{ q: "" }}
            className="hidden sm:inline text-sm font-medium hover:text-primary transition-colors"
          >
            View all →
          </Link>
        </div>

        {loading ? (
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
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {products.map((p) => {
              const discount = p.old
                ? Math.round(((p.old - p.price) / p.old) * 100)
                : 0;
              return (
                <div
                  key={p.id}
                  className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all flex flex-col"
                >
                  <Link to="/product/$slug" params={{ slug: p.slug }} className="block">
                    <div className="relative aspect-square overflow-hidden bg-secondary">
                      <img
                        src={p.img}
                        alt={p.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Large prominent discount badge */}
                      {discount > 0 && (
                        <div
                          className="absolute top-0 right-0 px-3 py-2 rounded-bl-2xl font-bold text-sm sm:text-base leading-tight text-right"
                          style={{ backgroundColor: "#3F5C45", color: "#FFFFFF" }}
                        >
                          <div>{discount}%</div>
                          <div className="text-[10px] font-semibold tracking-wider">OFF</div>
                        </div>
                      )}
                    </div>

                    <div className="p-3 sm:p-4">
                      <h3 className="text-xs sm:text-sm font-medium line-clamp-2 min-h-[2.5rem]">{p.name}</h3>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-base sm:text-lg font-semibold text-foreground">
                          ₹{p.price.toLocaleString()}
                        </span>
                        {p.old && (
                          <span className="text-xs text-muted-foreground line-through">
                            ₹{p.old.toLocaleString()}
                          </span>
                        )}
                        {p.old && (
                          <span
                            className="text-xs font-semibold"
                            style={{ color: "#3F5C45" }}
                          >
                            Save ₹{(p.old - p.price).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>

                  <div className="px-3 sm:px-4 pb-3 sm:pb-4 mt-auto">
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
