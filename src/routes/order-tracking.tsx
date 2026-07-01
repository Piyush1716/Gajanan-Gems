import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import DOMPurify from "dompurify";
import { PageBanner } from "@/components/PageBanner";
import { StaticPageLayout } from "@/components/site/StaticPageLayout";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { Search, Package, CheckCircle2, Clock, Truck, XCircle, Loader2, AlertCircle, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/order-tracking")({
  head: () => ({
    meta: [
      { title: "Order Tracking — GajananGems" },
      {
        name: "description",
        content:
          "Track your GajananGems order. Enter your Order ID and billing email to check your order status.",
      },
      { property: "og:title", content: "Order Tracking — GajananGems" },
      { property: "og:url", content: "/order-tracking" },
    ],
    links: [{ rel: "canonical", href: "/order-tracking" }],
  }),
  component: OrderTrackingPage,
});

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderStatus = 
  | "cart_abandoned"           // User left checkout without paying
  | "payment_pending"          // Payment being processed (awaiting confirmation)
  | "payment_failed"           // Payment failed (network, card declined, etc.)
  | "payment_cancelled"        // User cancelled payment (dismissed modal)
  | "pending"                  // Order created, awaiting confirmation
  | "confirmed"                // Payment confirmed, order confirmed
  | "processing"               // Order being packed
  | "shipped"                  // Order dispatched
  | "delivered"                // Order delivered
  | "cancelled";               // Order cancelled by admin or user

type OrderItem = {
  id: number;
  title: string;
  qty: number;
  price: number;
  size: string | null;
};

type Order = {
  id: number;
  status: OrderStatus;
  created_at: string;
  first_name: string;
  last_name: string;
  subtotal: number;
  shipping: number;
  total: number;
  payment_method: string;
  payment_error?: string | null;  // Error message if payment failed
  order_items: OrderItem[];
};

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  OrderStatus,
  { 
    label: string
    color: string
    bg: string
    icon: React.ElementType
    description: string
    isTerminal: boolean  // Can't be recovered from
    actionable: boolean  // User can take action (retry, complete, etc)
  }
> = {
  cart_abandoned: {
    label: "Incomplete Checkout",
    color: "text-slate-700",
    bg: "bg-slate-50 border-slate-200",
    icon: AlertCircle,
    description: "You started checkout but didn't complete payment. Your cart items are still saved.",
    isTerminal: false,
    actionable: true,
  },
  payment_pending: {
    label: "Payment Pending",
    color: "text-orange-700",
    bg: "bg-orange-50 border-orange-200",
    icon: Clock,
    description: "Payment is being processed. If you paid, please wait a moment for confirmation. This usually takes 30 seconds.",
    isTerminal: false,
    actionable: false,
  },
  payment_failed: {
    label: "Payment Failed",
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
    icon: XCircle,
    description: "Your payment couldn't be processed. This could be due to insufficient funds, incorrect card details, network issues, or bank restrictions.",
    isTerminal: false,
    actionable: true,
  },
  payment_cancelled: {
    label: "Payment Cancelled",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
    icon: AlertCircle,
    description: "You cancelled the payment. Your order is on hold. Restart payment to complete your order.",
    isTerminal: false,
    actionable: true,
  },
  pending: {
    label: "Pending",
    color: "text-yellow-700",
    bg: "bg-yellow-50 border-yellow-200",
    icon: Clock,
    description: "Your order has been received and is awaiting confirmation from our team.",
    isTerminal: false,
    actionable: false,
  },
  confirmed: {
    label: "Confirmed",
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
    icon: CheckCircle2,
    description: "Your payment is confirmed and your order is being prepared.",
    isTerminal: false,
    actionable: false,
  },
  processing: {
    label: "Processing",
    color: "text-purple-700",
    bg: "bg-purple-50 border-purple-200",
    icon: Package,
    description: "Your order is being packed and prepared for dispatch. Shipping label created.",
    isTerminal: false,
    actionable: false,
  },
  shipped: {
    label: "Shipped",
    color: "text-indigo-700",
    bg: "bg-indigo-50 border-indigo-200",
    icon: Truck,
    description: "Your order is on its way! Expect delivery within 3-5 business days. You'll receive tracking updates.",
    isTerminal: false,
    actionable: false,
  },
  delivered: {
    label: "Delivered",
    color: "text-green-700",
    bg: "bg-green-50 border-green-200",
    icon: CheckCircle2,
    description: "Your order has been delivered. Enjoy your crystals! 💎 If there's any issue, contact us within 48 hours.",
    isTerminal: true,
    actionable: false,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
    icon: XCircle,
    description: "This order has been cancelled. Your payment (if processed) will be refunded within 5-7 business days.",
    isTerminal: true,
    actionable: false,
  },
};

const STATUS_STEPS: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered"];

// ─── Page ─────────────────────────────────────────────────────────────────────

function OrderTrackingPage() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  
  const { user, isLoggedIn, showLoginModal } = useAuth();

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(orderId.trim(), 10);
    if (isNaN(id) || !email.trim()) {
      setError("Please enter a valid Order ID and email address.");
      return;
    }

    setLoading(true);
    setError(null);
    setOrder(null);
    setSubmitted(true);

    try {
      const { data, error: dbError } = await supabase
        .from("orders")
        .select("id, status, created_at, first_name, last_name, subtotal, shipping, total, payment_method, payment_error, order_items(id, title, qty, price, size)")
        .eq("id", id)
        .eq("email", email.trim().toLowerCase())
        .eq("user_id", user?.id)
        .single();

      if (dbError || !data) {
        setError(
          "We couldn't find an order matching those details. Please double-check your Order ID and email address."
        );
        return;
      }

      setOrder(data as unknown as Order);
    } catch {
      setError("Something went wrong. Please try again or contact us at hello@gajanangems.com.");
    } finally {
      setLoading(false);
    }
  };

  const stepIndex = order ? STATUS_STEPS.indexOf(order.status as OrderStatus) : -1;
  const statusCfg = order ? STATUS_CONFIG[order.status] ?? STATUS_CONFIG["pending"] : null;

  // Determine if this is an actionable status that needs special handling
  const isActionableStatus = order && statusCfg && statusCfg.actionable;

  if (!isLoggedIn) {
    return (
      <StaticPageLayout>
        <PageBanner title="Order Tracking" crumb="Order Tracking" />
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <div
            className="mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-6 shadow-md"
            style={{ backgroundColor: "#3F5C45" }}
          >
            <Package className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-semibold mb-3">Track Your Order</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Please log in to your account to track your orders and view their current status.
          </p>
          <button
            onClick={() => showLoginModal()}
            className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-full px-8 py-3 text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Log In
          </button>
        </div>
      </StaticPageLayout>
    );
  }

  return (
    <StaticPageLayout>
      <PageBanner title="Order Tracking" crumb="Order Tracking" />
      <div className="mx-auto max-w-2xl px-4 py-12">
        <p className="text-center text-muted-foreground mb-8">
          Enter your Order ID (from your confirmation email) and the billing email to check your order status.
        </p>

        {/* Form */}
        <form
          onSubmit={handleTrack}
          className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <div>
            <label htmlFor="orderId" className="mb-1.5 block text-sm font-medium text-foreground">
              Order ID
            </label>
            <input
              id="orderId"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              required
              placeholder="e.g. 1042"
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
            />
          </div>
          <div>
            <label htmlFor="billingEmail" className="mb-1.5 block text-sm font-medium text-foreground">
              Billing Email
            </label>
            <input
              id="billingEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Email you used during checkout"
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Tracking…</>
            ) : (
              <><Search className="h-4 w-4" /> Track Order</>
            )}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 p-5 text-center text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Order result */}
        {order && statusCfg && (
          <div className="mt-8 space-y-6">
            {/* Status banner */}
            <div className={`rounded-2xl border p-5 ${statusCfg.bg}`}>
              <div className={`flex items-start gap-3 mb-3 ${statusCfg.color}`}>
                <statusCfg.icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-semibold text-lg block">Order #{order.id} — {statusCfg.label}</span>
                </div>
              </div>
              <p className={`text-sm ${statusCfg.color} opacity-80 mb-3`}>{statusCfg.description}</p>
              
              {/* Show payment error if exists */}
              {order.payment_error && (
                <div className="mt-3 p-3 rounded-lg bg-black/10 text-sm text-foreground">
                  <p className="font-medium text-red-700">Error: {DOMPurify.sanitize(order.payment_error)}</p>
                </div>
              )}
              
              <p className="text-xs text-muted-foreground mt-3">
                Placed on {new Date(order.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>

            {/* Action buttons for actionable statuses */}
            {isActionableStatus && (
              <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                {(order.status === "payment_failed" || order.status === "payment_cancelled") && (
                  <>
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Action Required
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Your payment wasn't completed. Complete your payment to confirm your order.
                    </p>
                    <a
                      href={`/checkout?retry=${order.id}`}
                      className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-full px-6 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Retry Payment
                    </a>
                  </>
                )}
                
                {order.status === "cart_abandoned" && (
                  <>
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Complete Your Order
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Your cart is still saved. Complete checkout to place your order.
                    </p>
                    <a
                      href={`/checkout?resume=${order.id}`}
                      className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-full px-6 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Resume Checkout
                    </a>
                  </>
                )}
              </div>
            )}

            {/* Progress tracker - only show for non-terminal, non-actionable statuses */}
            {order.status !== "cancelled" && 
             order.status !== "cart_abandoned" && 
             order.status !== "payment_failed" && 
             order.status !== "payment_cancelled" && (
              <div className="rounded-2xl border border-border bg-card p-5">
                <h3 className="text-sm font-semibold mb-4">Order Progress</h3>
                <div className="relative flex items-center justify-between">
                  {STATUS_STEPS.map((step, i) => {
                    const cfg = STATUS_CONFIG[step];
                    const done = stepIndex >= i;
                    const active = stepIndex === i;
                    return (
                      <div key={step} className="flex flex-col items-center flex-1 relative">
                        {/* Connector line */}
                        {i < STATUS_STEPS.length - 1 && (
                          <div
                            className="absolute top-4 left-1/2 w-full h-0.5 transition-colors"
                            style={{ backgroundColor: stepIndex > i ? "#3F5C45" : "#e5e7eb" }}
                          />
                        )}
                        {/* Circle */}
                        <div
                          className={`relative z-10 h-8 w-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                            done ? "border-primary bg-primary text-white" : "border-border bg-background text-muted-foreground"
                          } ${active ? "ring-4 ring-primary/20" : ""}`}
                        >
                          <cfg.icon className="h-3.5 w-3.5" />
                        </div>
                        <p className={`mt-2 text-[10px] text-center leading-tight ${done ? "text-primary font-medium" : "text-muted-foreground"}`}>
                          {cfg.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Order items */}
            {order.order_items && order.order_items.length > 0 && (
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                  <h3 className="text-sm font-semibold">Items Ordered</h3>
                </div>
                <ul className="divide-y divide-border">
                  {order.order_items.map((item) => (
                    <li key={item.id} className="flex items-center justify-between px-5 py-3 text-sm">
                      <div>
                        <p className="font-medium line-clamp-1">{DOMPurify.sanitize(item.title)}</p>
                        <p className="text-xs text-muted-foreground">
                          Qty {item.qty}{item.size ? ` · Size ${item.size}` : ""}
                        </p>
                      </div>
                      <span className="font-medium">₹{(item.price * item.qty).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
                <div className="px-5 py-4 border-t border-border space-y-1.5 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span><span>₹{order.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Delivery</span><span className="text-green-600 font-semibold">Free</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-2 border-t border-border text-base">
                    <span>Total</span><span>₹{order.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground pt-1">
                    <span>Payment</span>
                    <span>
                      {order.payment_method === "razorpay" ? "Razorpay (Online)" : order.payment_method}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Help */}
            <p className="text-center text-xs text-muted-foreground">
              Need help? Email{" "}
              <a href="mailto:hello@gajanangems.com" className="text-primary underline">
                hello@gajanangems.com
              </a>{" "}
              or WhatsApp{" "}
              <a href="https://wa.me/919537066979" className="text-primary underline" target="_blank" rel="noopener noreferrer">
                +91 95370 66979
              </a>
            </p>
          </div>
        )}
      </div>
    </StaticPageLayout>
  );
}