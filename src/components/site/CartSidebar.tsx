import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { Link, useNavigate } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag, X, ArrowRight } from "lucide-react";
import { useEffect } from "react";

export function CartSidebar() {
  const { items, setQty, remove, subtotal, count, getProduct, sidebarOpen, closeSidebar } = useCart();
  const { isLoggedIn, showLoginModal } = useAuth();
  const navigate = useNavigate();

  // Close sidebar on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSidebar();
    };

    if (sidebarOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [sidebarOpen, closeSidebar]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <>
      {/* Overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-sm bg-card border-l border-border shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out transform ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Your Cart
          </h2>
          <button
            onClick={closeSidebar}
            className="p-2 hover:bg-secondary rounded-lg transition"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items list */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-sm font-medium mb-2">Your cart is empty</p>
              <p className="text-xs text-muted-foreground mb-6">Add items to get started</p>
              <button
                onClick={closeSidebar}
                className="text-primary text-sm font-medium hover:underline"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const product = getProduct(item.slug);
                if (!product) return null;

                const itemTotal = product.price * item.qty;

                return (
                  <div
                    key={`${item.slug}-${item.size ?? ""}`}
                    className="bg-secondary/50 rounded-lg p-4 space-y-3"
                  >
                    {/* Product image and details */}
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <img
                          src={product.img}
                          alt={product.name}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          to="/product/$slug"
                          params={{ slug: product.slug }}
                          onClick={closeSidebar}
                          className="font-medium text-sm hover:text-primary line-clamp-2 block"
                        >
                          {product.name}
                        </Link>
                        {item.size && (
                          <div className="text-xs text-muted-foreground mt-1">Size: {item.size}</div>
                        )}
                        <div className="text-sm font-semibold mt-2 text-primary">
                          ₹{itemTotal.toLocaleString()}
                        </div>
                      </div>
                      <button
                        onClick={() => remove(item.slug, item.size)}
                        className="p-1 hover:bg-red-100/20 rounded-lg transition text-muted-foreground hover:text-destructive"
                        aria-label="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Qty</span>
                      <div className="flex items-center border border-border rounded-lg overflow-hidden">
                        <button
                          onClick={() => setQty(item.slug, item.qty - 1, item.size)}
                          className="px-2 py-1 hover:bg-secondary transition"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2.5 py-1 text-sm min-w-[2rem] text-center">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => setQty(item.slug, item.qty + 1, item.size)}
                          className="px-2 py-1 hover:bg-secondary transition"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer with checkout */}
        {items.length > 0 && (
          <div className="border-t border-border p-6 space-y-4">
            {/* Subtotal */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal ({count} items)</span>
                <span className="font-medium">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-green-600">
                <span>Delivery</span>
                <span className="font-medium">Free 🎉</span>
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-border pt-4 flex justify-between font-semibold text-base">
              <span>Total</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>

            {/* Checkout button */}
            {isLoggedIn ? (
              <Link
                to="/checkout"
                onClick={closeSidebar}
                className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground rounded-lg py-3 font-medium hover:bg-primary/90 transition"
              >
                Checkout
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <button
                onClick={() => {
                  closeSidebar();
                  showLoginModal(() => navigate({ to: "/checkout" }));
                }}
                className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground rounded-lg py-3 font-medium hover:bg-primary/90 transition"
              >
                Checkout
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

            {/* Continue shopping button */}
            <button
              onClick={closeSidebar}
              className="w-full py-3 text-sm font-medium border border-border rounded-lg hover:bg-secondary transition"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
