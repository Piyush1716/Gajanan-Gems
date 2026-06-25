import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchProducts, type Product } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { ShoppingBag, Zap } from "lucide-react";
import { secondsUntilMidnight, FLASH_SALE_PRODUCTS_COUNT } from "@/lib/offers";

function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : secondsUntilMidnight()));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return { h, m, s };
}

function TimerDigit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div
        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center font-mono font-bold text-lg sm:text-xl text-white shadow-lg"
        style={{ backgroundColor: "#DC2626" }}
      >
        {value}
      </div>
      <span className="text-[9px] uppercase tracking-widest text-muted-foreground">{label}</span>
    </div>
  );
}

export function FlashSaleSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { add } = useCart();
  const countdown = useCountdown(secondsUntilMidnight());

  useEffect(() => {
    fetchProducts()
      .then((all) => {
        // Sort by highest discount %, take top N
        const withDiscount = all
          .filter((p) => p.old && p.old > p.price)
          .sort((a, b) => {
            const da = a.old ? ((a.old - a.price) / a.old) * 100 : 0;
            const db = b.old ? ((b.old - b.price) / b.old) * 100 : 0;
            return db - da;
          })
          .slice(0, FLASH_SALE_PRODUCTS_COUNT);
        setProducts(withDiscount);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (!loading && products.length === 0) return null;

  return (
    <section className="py-12 sm:py-16" style={{ backgroundColor: "#1A0A0A" }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 sm:mb-10">
          <div className="flex items-center gap-3">
            <span
              className="flex items-center justify-center w-9 h-9 rounded-full animate-pulse"
              style={{ backgroundColor: "#DC2626" }}
            >
              <Zap className="h-4 w-4 text-white fill-white" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] mb-0.5" style={{ color: "#C8A96B" }}>
                Limited Time
              </p>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white">Flash Sale</h2>
            </div>
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/60 mr-1">Ends in:</span>
            <TimerDigit value={countdown.h} label="hrs" />
            <span className="text-white/40 font-bold text-xl mb-4">:</span>
            <TimerDigit value={countdown.m} label="min" />
            <span className="text-white/40 font-bold text-xl mb-4">:</span>
            <TimerDigit value={countdown.s} label="sec" />
          </div>
        </div>

        {/* Product grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden animate-pulse" style={{ backgroundColor: "#2A1010" }}>
                <div className="aspect-square" style={{ backgroundColor: "#3A1515" }} />
                <div className="p-3 space-y-2">
                  <div className="h-3 rounded w-3/4" style={{ backgroundColor: "#3A1515" }} />
                  <div className="h-3 rounded w-1/2" style={{ backgroundColor: "#3A1515" }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {products.map((p) => {
              const discount = p.old ? Math.round(((p.old - p.price) / p.old) * 100) : 0;
              return (
                <div
                  key={p.id}
                  className="group rounded-2xl overflow-hidden border hover:shadow-2xl transition-all flex flex-col"
                  style={{ backgroundColor: "#1F0A0A", borderColor: "#3A1515" }}
                >
                  <Link to="/product/$slug" params={{ slug: p.slug }} className="block">
                    <div className="relative aspect-square overflow-hidden" style={{ backgroundColor: "#2A1010" }}>
                      <img
                        src={p.img}
                        alt={p.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {discount > 0 && (
                        <span
                          className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: "#DC2626", color: "#FFFFFF" }}
                        >
                          {discount}% OFF
                        </span>
                      )}
                    </div>
                    <div className="p-2 sm:p-3">
                      <h3 className="text-[11px] sm:text-xs font-medium line-clamp-2 min-h-[2rem] text-white/90">{p.name}</h3>
                      <div className="mt-1.5 flex items-baseline gap-1.5">
                        <span className="text-sm sm:text-base font-bold text-white">₹{p.price.toLocaleString()}</span>
                        {p.old && <span className="text-[10px] line-through" style={{ color: "#888" }}>₹{p.old.toLocaleString()}</span>}
                      </div>
                    </div>
                  </Link>
                  <div className="px-2 sm:px-3 pb-2 sm:pb-3 mt-auto">
                    <button
                      onClick={() => add(p.slug, 1)}
                      className="w-full flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-wider font-medium rounded-full py-1.5 transition-colors"
                      style={{ backgroundColor: "#DC2626", color: "#FFFFFF" }}
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

        <div className="mt-6 text-center">
          <Link
            to="/search"
            search={{ q: "" }}
            className="inline-flex items-center gap-2 text-sm font-medium border rounded-full px-5 py-2 transition-colors"
            style={{ borderColor: "#DC2626", color: "#DC2626" }}
          >
            View All Sale Items →
          </Link>
        </div>
      </div>
    </section>
  );
}
