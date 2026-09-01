import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useWishlist } from "@/lib/wishlist";
import { useCart } from "@/lib/cart";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist — Cambay Crystal" },
      { name: "description", content: "Your saved crystals and gemstone bracelets on Cambay Crystal." },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { items, toggle, getProduct, count } = useWishlist();
  const { add } = useCart();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-6 py-8 lg:py-12">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-semibold">Wishlist</h1>
          {count > 0 && (
            <p className="text-muted-foreground text-sm mt-1">{count} item{count !== 1 ? "s" : ""} saved</p>
          )}
        </div>

        {count === 0 ? (
          <div className="text-center py-24 border border-dashed border-border rounded-2xl">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Save items you love by tapping the heart icon on any product.
            </p>
            <Link
              to="/"
              className="inline-flex bg-primary text-primary-foreground rounded-full px-6 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {items.map((item) => {
              const p = getProduct(item.slug);
              const discount = p?.old ? Math.round(((p.old - p.price) / p.old) * 100) : 0;

              return (
                <div
                  key={item.slug}
                  className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all"
                >
                  <Link to="/product/$slug" params={{ slug: item.slug }} className="block">
                    <div className="relative aspect-square overflow-hidden bg-secondary">
                      {p?.img ? (
                        <img
                          src={p.img}
                          alt={p.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full animate-pulse bg-secondary" />
                      )}
                      {discount > 0 && (
                        <span
                          className="absolute top-2 right-2 text-[10px] uppercase tracking-wider px-2 py-1 rounded-full font-semibold"
                          style={{ backgroundColor: "#C8A96B", color: "#2E2B26" }}
                        >
                          {discount}% OFF
                        </span>
                      )}
                    </div>
                    <div className="p-3 sm:p-4">
                      <h3 className="text-xs sm:text-sm font-medium line-clamp-2 min-h-[2.5rem]">
                        {p?.name ?? item.slug}
                      </h3>
                      {p && (
                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="text-base sm:text-lg font-semibold">₹{p.price.toLocaleString()}</span>
                          {p.old && (
                            <span className="text-xs text-muted-foreground line-through">₹{p.old.toLocaleString()}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="px-3 sm:px-4 pb-3 sm:pb-4 flex gap-2">
                    <button
                      onClick={() => p && add(p.slug, 1)}
                      disabled={!p}
                      className="flex-1 flex items-center justify-center gap-2 text-[10px] sm:text-xs uppercase tracking-wider font-medium border border-primary text-primary rounded-full py-2 hover:bg-primary hover:text-white transition-colors disabled:opacity-50"
                    >
                      <ShoppingBag className="h-3 w-3" />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => toggle(item.slug)}
                      aria-label="Remove from wishlist"
                      className="p-2 border border-border rounded-full hover:border-destructive hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
