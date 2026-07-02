import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import DOMPurify from "dompurify";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useAuth } from "@/lib/auth";
import { getOrdersByUser } from "@/services/api";
import {
  User,
  Mail,
  Phone,
  Package,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  AlertCircle,
  LogOut,
  RotateCcw,
  ShoppingBag,
} from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Account — GajananGems" },
      { name: "description", content: "View your profile and order history." },
    ],
  }),
  component: ProfilePage,
});

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderStatus =
  | "cart_abandoned"
  | "payment_pending"
  | "payment_failed"
  | "payment_cancelled"
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

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
  email: string;
  subtotal: number;
  shipping: number;
  total: number;
  payment_method: string;
  payment_error?: string | null;
  order_items: OrderItem[];
};

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    color: string;
    bg: string;
    pillBg: string;
    pillText: string;
    icon: React.ElementType;
    description: string;
    actionable: boolean;
  }
> = {
  cart_abandoned: {
    label: "Incomplete",
    color: "text-slate-700",
    bg: "bg-slate-50 border-slate-200",
    pillBg: "bg-slate-100",
    pillText: "text-slate-700",
    icon: AlertCircle,
    description: "You started checkout but didn't complete payment.",
    actionable: true,
  },
  payment_pending: {
    label: "Payment Pending",
    color: "text-orange-700",
    bg: "bg-orange-50 border-orange-200",
    pillBg: "bg-orange-100",
    pillText: "text-orange-700",
    icon: Clock,
    description: "Payment is being processed. Please wait for confirmation.",
    actionable: false,
  },
  payment_failed: {
    label: "Payment Failed",
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
    pillBg: "bg-red-100",
    pillText: "text-red-700",
    icon: XCircle,
    description: "Your payment couldn't be processed.",
    actionable: true,
  },
  payment_cancelled: {
    label: "Payment Cancelled",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
    pillBg: "bg-amber-100",
    pillText: "text-amber-700",
    icon: AlertCircle,
    description: "You cancelled the payment. Restart to complete your order.",
    actionable: true,
  },
  pending: {
    label: "Pending",
    color: "text-yellow-700",
    bg: "bg-yellow-50 border-yellow-200",
    pillBg: "bg-yellow-100",
    pillText: "text-yellow-700",
    icon: Clock,
    description: "Your order has been received and is awaiting confirmation.",
    actionable: false,
  },
  confirmed: {
    label: "Confirmed",
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
    pillBg: "bg-blue-100",
    pillText: "text-blue-700",
    icon: CheckCircle2,
    description: "Payment confirmed. Your order is being prepared.",
    actionable: false,
  },
  processing: {
    label: "Processing",
    color: "text-purple-700",
    bg: "bg-purple-50 border-purple-200",
    pillBg: "bg-purple-100",
    pillText: "text-purple-700",
    icon: Package,
    description: "Your order is being packed for dispatch.",
    actionable: false,
  },
  shipped: {
    label: "Shipped",
    color: "text-indigo-700",
    bg: "bg-indigo-50 border-indigo-200",
    pillBg: "bg-indigo-100",
    pillText: "text-indigo-700",
    icon: Truck,
    description: "Your order is on its way!",
    actionable: false,
  },
  delivered: {
    label: "Delivered",
    color: "text-green-700",
    bg: "bg-green-50 border-green-200",
    pillBg: "bg-green-100",
    pillText: "text-green-700",
    icon: CheckCircle2,
    description: "Your order has been delivered. Enjoy! 💎",
    actionable: false,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
    pillBg: "bg-red-100",
    pillText: "text-red-700",
    icon: XCircle,
    description: "This order was cancelled. Refund will be processed within 5-7 days.",
    actionable: false,
  },
};

const STATUS_STEPS: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered"];

// ─── Page ─────────────────────────────────────────────────────────────────────

function ProfilePage() {
  const { user, isLoggedIn, logout, showLoginModal } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Fetch orders when user is available
  useEffect(() => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      try {
        console.log(`[profile] Fetching orders for user ${user.id}`);
        const { data, error } = await getOrdersByUser(user.id);

        if (error) {
          console.error("[profile] Failed to fetch orders:", error);
          setOrders([]);
        } else {
          console.log(`[profile] Loaded ${(data ?? []).length} orders`);
          setOrders((data as unknown as Order[]) ?? []);
        }
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user?.email]);

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const formatShortDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  // ── Auth gate ─────────────────────────────────────────────────────────────

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full text-center">
            <div
              className="mx-auto h-20 w-20 rounded-full flex items-center justify-center mb-6 shadow-lg"
              style={{ backgroundColor: "#3F5C45" }}
            >
              <User className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-2xl font-semibold mb-2">Sign in to your account</h1>
            <p className="text-muted-foreground text-sm mb-8">
              Log in to view your profile, track orders, and manage your account.
            </p>
            <button
              onClick={() => showLoginModal()}
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-full px-8 py-3 text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Log In
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── User initials ───────────────────────────────────────────────────────

  // user is guaranteed non-null here — the !isLoggedIn guard above returns early
  const u = user!;
  const initial = (u.first_name?.[0] ?? u.email[0] ?? "U").toUpperCase();
  const rawFullName = [u.first_name, u.last_name].filter(Boolean).join(" ") || "Customer";
  const fullName = DOMPurify.sanitize(rawFullName);

  // ── Main layout ─────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 lg:px-6 py-8 lg:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-8">
          <Link to="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">My Account</span>
        </nav>

        {/* User Info Card */}
        <div className="bg-card border border-border rounded-2xl p-6 lg:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div
              className="h-16 w-16 lg:h-20 lg:w-20 rounded-full flex items-center justify-center text-white text-2xl lg:text-3xl font-bold shadow-md flex-shrink-0"
              style={{ backgroundColor: "#3F5C45" }}
            >
              {initial}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl lg:text-2xl font-semibold truncate">{fullName}</h1>
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">{u.email}</span>
                </div>
                {u.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{u.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-destructive border border-border rounded-full px-4 py-2 hover:border-destructive transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </button>
          </div>
        </div>

        {/* Order History */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Package className="h-5 w-5 text-primary" />
            <h2 className="text-lg lg:text-xl font-semibold">Order History</h2>
          </div>

          {/* Loading skeletons */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-card border border-border rounded-2xl p-5 animate-pulse"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-4 w-28 bg-secondary rounded" />
                      <div className="h-3 w-40 bg-secondary rounded" />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-6 w-20 bg-secondary rounded-full" />
                      <div className="h-4 w-20 bg-secondary rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && orders.length === 0 && (
            <div className="text-center py-20 border border-dashed border-border rounded-2xl">
              <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
              <p className="text-muted-foreground text-sm mb-6">
                When you place an order, it will appear here with tracking details.
              </p>
              <Link
                to="/"
                className="inline-flex bg-primary text-primary-foreground rounded-full px-6 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          )}

          {/* Order list */}
          {!loading && orders.length > 0 && (
            <div className="space-y-4">
              {orders.map((order) => {
                const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG["pending"];
                const isExpanded = expandedId === order.id;
                const stepIndex = STATUS_STEPS.indexOf(order.status);
                const isNormalFlow =
                  order.status !== "cancelled" &&
                  order.status !== "cart_abandoned" &&
                  order.status !== "payment_failed" &&
                  order.status !== "payment_cancelled";

                return (
                  <div
                    key={order.id}
                    className="bg-card border border-border rounded-2xl overflow-hidden transition-shadow hover:shadow-md"
                  >
                    {/* Order header — clickable */}
                    <button
                      onClick={() => toggleExpand(order.id)}
                      className="w-full text-left px-5 py-4 lg:px-6 lg:py-5"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-semibold text-sm lg:text-base font-mono">
                              #{order.id}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full ${cfg.pillBg} ${cfg.pillText}`}
                            >
                              <cfg.icon className="h-3 w-3" />
                              {cfg.label}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatShortDate(order.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold text-sm lg:text-base">
                            ₹{order.total.toLocaleString()}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="border-t border-border">
                        {/* Status description */}
                        <div className={`mx-5 lg:mx-6 mt-4 rounded-xl border p-4 ${cfg.bg}`}>
                          <div className={`flex items-start gap-2.5 ${cfg.color}`}>
                            <cfg.icon className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">{cfg.label}</p>
                              <p className="text-xs mt-0.5 opacity-80">{cfg.description}</p>
                            </div>
                          </div>
                          {order.payment_error && (
                            <p className="text-xs text-red-700 mt-2 pl-6.5">
                              Error: {DOMPurify.sanitize(order.payment_error)}
                            </p>
                          )}
                        </div>

                        {/* Progress tracker — only for normal flow statuses */}
                        {isNormalFlow && (
                          <div className="mx-5 lg:mx-6 mt-4 rounded-xl border border-border bg-background p-4">
                            <p className="text-xs font-medium text-muted-foreground mb-3">
                              Order Progress
                            </p>
                            <div className="relative flex items-center justify-between">
                              {STATUS_STEPS.map((step, i) => {
                                const sCfg = STATUS_CONFIG[step];
                                const done = stepIndex >= i;
                                const active = stepIndex === i;
                                return (
                                  <div
                                    key={step}
                                    className="flex flex-col items-center flex-1 relative"
                                  >
                                    {/* Connector */}
                                    {i < STATUS_STEPS.length - 1 && (
                                      <div
                                        className="absolute top-3.5 left-1/2 w-full h-0.5 transition-colors"
                                        style={{
                                          backgroundColor: stepIndex > i ? "#3F5C45" : "#e5e7eb",
                                        }}
                                      />
                                    )}
                                    {/* Circle */}
                                    <div
                                      className={`relative z-10 h-7 w-7 rounded-full flex items-center justify-center border-2 transition-colors ${
                                        done
                                          ? "border-primary bg-primary text-white"
                                          : "border-border bg-background text-muted-foreground"
                                      } ${active ? "ring-4 ring-primary/20" : ""}`}
                                    >
                                      <sCfg.icon className="h-3 w-3" />
                                    </div>
                                    <p
                                      className={`mt-1.5 text-[9px] lg:text-[10px] text-center leading-tight ${
                                        done ? "text-primary font-medium" : "text-muted-foreground"
                                      }`}
                                    >
                                      {sCfg.label}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Retry / Resume button for actionable statuses */}
                        {cfg.actionable &&
                          (order.status === "payment_failed" ||
                            order.status === "payment_cancelled") && (
                            <div className="mx-5 lg:mx-6 mt-4">
                              <Link
                                to="/checkout"
                                search={{ retry: String(order.id) }}
                                className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-5 py-2 text-xs font-medium hover:bg-primary/90 transition-colors"
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                                Retry Payment
                              </Link>
                            </div>
                          )}

                        {cfg.actionable && order.status === "cart_abandoned" && (
                          <div className="mx-5 lg:mx-6 mt-4">
                            <Link
                              to="/checkout"
                              search={{ resume: String(order.id) }}
                              className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-5 py-2 text-xs font-medium hover:bg-primary/90 transition-colors"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              Resume Checkout
                            </Link>
                          </div>
                        )}

                        {/* Order items */}
                        {order.order_items && order.order_items.length > 0 && (
                          <div className="mx-5 lg:mx-6 mt-4 rounded-xl border border-border overflow-hidden">
                            <div className="px-4 py-3 border-b border-border bg-secondary/30">
                              <p className="text-xs font-semibold">
                                Items ({order.order_items.length})
                              </p>
                            </div>
                            <ul className="divide-y divide-border">
                              {order.order_items.map((item) => (
                                <li
                                  key={item.id}
                                  className="flex items-center justify-between px-4 py-3 text-sm"
                                >
                                  <div className="min-w-0 flex-1">
                                    <p className="font-medium text-sm line-clamp-1">
                                      {DOMPurify.sanitize(item.title)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Qty {item.qty}
                                      {item.size ? ` · Size ${item.size}` : ""}
                                    </p>
                                  </div>
                                  <span className="font-medium text-sm ml-4">
                                    ₹{(item.price * item.qty).toLocaleString()}
                                  </span>
                                </li>
                              ))}
                            </ul>
                            {/* Totals */}
                            <div className="px-4 py-3 border-t border-border space-y-1.5 text-sm bg-secondary/10">
                              <div className="flex justify-between text-muted-foreground text-xs">
                                <span>Subtotal</span>
                                <span>₹{order.subtotal.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span>Delivery</span>
                                <span className="text-green-600 font-semibold">Free</span>
                              </div>
                              <div className="flex justify-between font-semibold pt-2 border-t border-border text-sm">
                                <span>Total</span>
                                <span>₹{order.total.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-[11px] text-muted-foreground pt-1">
                                <span>Payment</span>
                                <span>
                                  {order.payment_method === "razorpay"
                                    ? "Razorpay (Online)"
                                    : order.payment_method}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Footer with date & tracking link */}
                        <div className="flex items-center justify-between px-5 lg:px-6 py-4 mt-2 text-xs text-muted-foreground">
                          <span>Placed on {formatDate(order.created_at)}</span>
                          <Link
                            to="/order-tracking"
                            className="text-primary hover:underline font-medium"
                          >
                            Track Order →
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Help */}
        <div className="mt-12 text-center text-xs text-muted-foreground">
          <p>
            Need help? Email{" "}
            <a href="mailto:hello@gajanangems.com" className="text-primary underline">
              hello@gajanangems.com
            </a>{" "}
            or WhatsApp{" "}
            <a
              href="https://wa.me/919537066979"
              className="text-primary underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              +91 95370 66979
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
