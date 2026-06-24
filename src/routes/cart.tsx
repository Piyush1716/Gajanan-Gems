import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — GajananGems" },
      { name: "description", content: "Review the crystals and bracelets in your cart before checkout." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, setQty, remove, subtotal, count, getProduct } = useCart();
  const { isLoggedIn, showLoginModal } = useAuth();
  const navigate = useNavigate();
  const total = subtotal;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-6 py-8 lg:py-12">
        <nav className="text-sm text-muted-foreground mb-4">
          <Link to="/" className="hover:text-primary">Home</Link> <span className="mx-1">/</span> <span>Cart</span>
        </nav>
        <h1 className="text-3xl lg:text-4xl font-semibold mb-8">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-16 border border-border rounded-xl bg-card">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg mb-2">Your cart is currently empty.</p>
            <p className="text-sm text-muted-foreground mb-6">Discover crystals & bracelets to begin your journey.</p>
            <Link to="/" className="inline-flex items-center bg-primary text-primary-foreground rounded-full px-6 py-3 text-sm font-medium hover:bg-primary/90">
              Return to Shop
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="hidden md:grid grid-cols-[1fr_120px_140px_100px_40px] gap-4 text-xs uppercase tracking-wide text-muted-foreground border-b border-border pb-3">
                <span>Product</span><span>Price</span><span>Quantity</span><span>Subtotal</span><span></span>
              </div>
              {items.map((it) => {
                const p = getProduct(it.slug);
                if (!p) return null;
                return (
                  <div key={`${it.slug}-${it.size ?? ""}`} className="grid grid-cols-[80px_1fr] md:grid-cols-[1fr_120px_140px_100px_40px] gap-4 items-center border-b border-border pb-4">
                    <div className="flex items-center gap-4 md:col-span-1 col-span-2">
                      <img src={p.img} alt={p.name} className="h-20 w-20 rounded-lg object-cover" />
                      <div>
                        <Link to="/product/$slug" params={{ slug: p.slug }} className="font-medium hover:text-primary">{p.name}</Link>
                        {it.size && <div className="text-xs text-muted-foreground mt-1">Size: {it.size}</div>}
                        <div className="md:hidden text-sm mt-1">₹{p.price.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="hidden md:block">₹{p.price.toLocaleString()}</div>
                    <div className="flex items-center border border-border rounded-full w-fit">
                      <button onClick={() => setQty(it.slug, it.qty - 1, it.size)} className="p-2" aria-label="Decrease"><Minus className="h-3 w-3" /></button>
                      <span className="px-3 text-sm">{it.qty}</span>
                      <button onClick={() => setQty(it.slug, it.qty + 1, it.size)} className="p-2" aria-label="Increase"><Plus className="h-3 w-3" /></button>
                    </div>
                    <div className="font-medium">₹{(p.price * it.qty).toLocaleString()}</div>
                    <button onClick={() => remove(it.slug, it.size)} className="p-2 text-muted-foreground hover:text-destructive" aria-label="Remove">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
              <Link to="/" className="inline-block text-sm text-primary hover:underline">← Continue shopping</Link>
            </div>

            <aside className="border border-border rounded-xl p-6 bg-card h-fit space-y-4">
              <h2 className="text-lg font-semibold">Cart Totals</h2>
              <div className="flex justify-between text-sm"><span>Items ({count})</span><span>₹{subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between text-sm">
                <span>Delivery</span>
                <span className="text-green-600 font-semibold">Free 🎉</span>
              </div>
              <div className="border-t border-border pt-4 flex justify-between font-semibold text-lg">
                <span>Total</span><span>₹{total.toLocaleString()}</span>
              </div>
              {isLoggedIn ? (
                <Link to="/checkout" className="block text-center bg-primary text-primary-foreground rounded-full py-3 text-sm font-medium hover:bg-primary/90">
                  Proceed to Checkout
                </Link>
              ) : (
                <button
                  onClick={() => showLoginModal(() => navigate({ to: "/checkout" }))}
                  className="w-full text-center bg-primary text-primary-foreground rounded-full py-3 text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Proceed to Checkout
                </button>
              )}
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
