import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useCart } from "@/lib/cart";
import { supabase } from "@/lib/supabase";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ShieldCheck, Truck, CreditCard, Lock, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/checkout")({
  validateSearch: z.object({
    retry: z.string().optional(),    // Retry failed payment for order ID
    resume: z.string().optional(),   // Resume abandoned cart for order ID
  }),
  head: () => ({
    meta: [
      { title: "Checkout — GajananGems" },
      { name: "description", content: "Securely complete your order for healing crystals and gemstone jewellery." },
    ],
  }),
  component: CheckoutPage,
});

// ─── Razorpay window type ─────────────────────────────────────────────────────

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id?: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  theme?: { color?: string };
  modal?: {
    ondismiss?: () => void;
    confirm_close?: boolean;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

interface RazorpayInstance {
  open(): void;
  on(event: string, handler: (response: { error: { description: string } }) => void): void;
}

// ─── Load Razorpay script ─────────────────────────────────────────────────────

function useRazorpayScript() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (typeof window.Razorpay !== "undefined") {
      setReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setReady(true);
    script.onerror = () => {
      toast.error("Failed to load payment gateway. Please refresh and try again.");
      setReady(false);
    };
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);
  return ready;
}

// ─── Validation schema ────────────────────────────────────────────────────────

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  address: z.string().min(5, "Please enter your full street address"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pin: z.string().regex(/^\d{6}$/, "PIN code must be 6 digits"),
  country: z.string().default("India"),
  notes: z.string().optional(),
});

type BillingFormData = z.infer<typeof schema>;

// ─── Indian states ────────────────────────────────────────────────────────────

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu & Kashmir",
  "Ladakh",
  "Chandigarh",
  "Puducherry",
];

// ─── Form field wrapper ───────────────────────────────────────────────────────

function Field({
  label,
  error,
  required,
  className = "",
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium mb-1.5">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function CheckoutPage() {
  const { items, subtotal, clear, getProduct } = useCart();
  const navigate = useNavigate();
  const { retry, resume } = Route.useSearch();
  const razorpayReady = useRazorpayScript();
  const [placing, setPlacing] = useState(false);
  const [paymentAttemptError, setPaymentAttemptError] = useState<string | null>(null);
  const pendingOrderId = useRef<number | null>(null);
  const paymentRetryCount = useRef(0);

  const total = subtotal; // Free delivery

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<BillingFormData>({
    resolver: zodResolver(schema),
    defaultValues: { country: "India" },
  });

  // ── Handle payment success ──────────────────────────────────────────────────

  const handlePaymentSuccess = async (
    orderId: number,
    billing: BillingFormData,
    response: RazorpayResponse
  ) => {
    try {
      // Update order status to confirmed
      const { error } = await supabase
        .from("orders")
        .update({
          status: "confirmed",
          razorpay_payment_id: response.razorpay_payment_id,
          payment_error: null, // Clear any previous error
        })
        .eq("id", orderId);

      if (error) {
        throw new Error(`Failed to confirm order: ${error.message}`);
      }

      clear();
      toast.success("Payment successful! Your order is confirmed.");
      navigate({
        to: "/order-confirmation",
        search: {
          orderId: String(orderId),
          firstName: billing.firstName,
          total: String(total),
          payMethod: "razorpay",
        },
      });
    } catch (err) {
      console.error("Error confirming order:", err);
      toast.error("Payment received but order confirmation failed. Contact support with Order ID #" + orderId);
      // Still navigate to confirmation since payment was received
      navigate({
        to: "/order-confirmation",
        search: {
          orderId: String(orderId),
          firstName: billing.firstName,
          total: String(total),
          payMethod: "razorpay",
        },
      });
    }
  };

  // ── Handle payment failure ──────────────────────────────────────────────────

  const handlePaymentFailure = async (orderId: number, errorMessage: string) => {
    try {
      // Update order status to payment_failed with error message
      await supabase
        .from("orders")
        .update({
          status: "payment_failed",
          payment_error: errorMessage,
        })
        .eq("id", orderId);

      setPaymentAttemptError(errorMessage);
      toast.error(`Payment failed: ${errorMessage}`);
      pendingOrderId.current = orderId;
    } catch (err) {
      console.error("Error recording payment failure:", err);
      toast.error("Payment failed and we couldn't record the error. Please contact support.");
    }
  };

  // ── Handle payment cancellation ────────────────────────────────────────────

  const handlePaymentCancelled = async (orderId: number) => {
    try {
      // Update order status to payment_cancelled
      await supabase
        .from("orders")
        .update({
          status: "payment_cancelled",
          payment_error: "User cancelled the payment",
        })
        .eq("id", orderId);

      setPaymentAttemptError("You cancelled the payment. Your order is on hold. You can retry payment anytime.");
      toast.info("Payment cancelled. You can retry anytime.");
      pendingOrderId.current = orderId;
    } catch (err) {
      console.error("Error recording payment cancellation:", err);
      toast.error("Payment cancelled but we couldn't record it. Please contact support.");
    }
  };

  // ── Open Razorpay overlay ──────────────────────────────────────────────────

  const openRazorpay = async (orderId: number, billing: BillingFormData) => {
    const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined;

    if (!RAZORPAY_KEY) {
      toast.error("Payment gateway is not configured. Please contact support.");
      setPlacing(false);
      return;
    }

    const options: RazorpayOptions = {
      key: RAZORPAY_KEY,
      amount: total * 100, // paise
      currency: "INR",
      name: "GajananGems",
      description: `Order #${orderId} — Healing Crystals & Jewellery`,
      handler: async (response: RazorpayResponse) => {
        await handlePaymentSuccess(orderId, billing, response);
      },
      prefill: {
        name: `${billing.firstName} ${billing.lastName}`,
        email: billing.email,
        contact: billing.phone,
      },
      notes: {
        orderId: String(orderId),
      },
      theme: { color: "#3F5C45" },
      modal: {
        ondismiss: () => {
          handlePaymentCancelled(orderId);
          setPlacing(false);
        },
        confirm_close: true,
      },
    };

    try {
      const rzp = new window.Razorpay(options);

      // Handle errors during payment processing
      rzp.on("payment.failed", async (response) => {
        const errorMsg = response.error?.description || "Payment failed. Please try again.";
        await handlePaymentFailure(orderId, errorMsg);
        setPlacing(false);
      });

      rzp.open();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to open payment gateway";
      toast.error(errorMsg);
      await handlePaymentFailure(orderId, errorMsg);
      setPlacing(false);
    }
  };

  // ── Create order and initiate payment ───────────────────────────────────────

  const onSubmit = async (billing: BillingFormData) => {
    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    setPlacing(true);
    setPaymentAttemptError(null);

    try {
      // Create order in database with "payment_pending" status
      const { data, error: createError } = await supabase
        .from("orders")
        .insert([
          {
            first_name: billing.firstName,
            last_name: billing.lastName,
            email: billing.email.toLowerCase(),
            phone: billing.phone,
            address: billing.address,
            city: billing.city,
            state: billing.state,
            pin: billing.pin,
            country: billing.country,
            notes: billing.notes || null,
            subtotal,
            shipping: 0, // Free delivery
            total,
            payment_method: "razorpay",
            status: "payment_pending", // Initially pending payment
            payment_error: null,
          },
        ])
        .select("id")
        .single();

      if (createError || !data) {
        throw new Error(createError?.message || "Failed to create order");
      }

      const orderId = data.id;

      // Create order items
      const orderItems = items.map((item) => {
        const product = getProduct(item.slug);
        return {
          order_id:   orderId,
          product_id: product?.id ?? null,
          slug:       item.slug,
          title:      product?.name ?? item.slug,
          price:      product?.price ?? 0,
          qty:        item.qty,
          size:       item.size ?? null,
        };
      });

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

      if (itemsError) {
        throw new Error(`Failed to add items to order: ${itemsError.message}`);
      }

      // Open Razorpay payment modal
      openRazorpay(orderId, billing);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      console.error("Checkout error:", err);
      toast.error(errorMsg);
      setPlacing(false);
      setPaymentAttemptError(
        "Failed to create order. Please check your connection and try again, or contact hello@gajanangems.com"
      );
    }
  };

  const inputCls =
    "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-8 md:py-12">
        <div className="mx-auto max-w-6xl">
          <nav className="text-sm text-muted-foreground mb-4 flex items-center gap-1">
            <Link to="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span className="mx-1">/</span>
            <Link to="/cart" className="hover:text-primary transition-colors">
              Cart
            </Link>
            <span className="mx-1">/</span>
            <span>Checkout</span>
          </nav>
          <h1 className="text-3xl lg:text-4xl font-semibold mb-8">Checkout</h1>

          {items.length === 0 ? (
            <div className="text-center py-16 border border-border rounded-xl bg-card">
              <p className="mb-4 text-muted-foreground">Your cart is empty.</p>
              <Link
                to="/"
                className="inline-flex bg-primary text-primary-foreground rounded-full px-6 py-3 text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Shop now
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="grid lg:grid-cols-3 gap-8">
              {/* ── Left: Billing details ───────────────────────────────────── */}
              <div className="lg:col-span-2 space-y-6">
                {/* Payment error alert */}
                {paymentAttemptError && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-900">Payment Issue</p>
                      <p className="text-sm text-amber-800 mt-1">{paymentAttemptError}</p>
                      {pendingOrderId.current && (
                        <p className="text-xs text-amber-700 mt-2">Order ID: #{pendingOrderId.current}</p>
                      )}
                    </div>
                  </div>
                )}

                <section className="border border-border rounded-xl p-6 bg-card">
                  <h2 className="text-lg font-semibold mb-5">Billing Details</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="First name" required error={errors.firstName?.message}>
                      <input {...register("firstName")} className={inputCls} placeholder="Raj" />
                    </Field>
                    <Field label="Last name" required error={errors.lastName?.message}>
                      <input {...register("lastName")} className={inputCls} placeholder="Sharma" />
                    </Field>
                    <Field label="Email" required error={errors.email?.message} className="sm:col-span-2">
                      <input
                        {...register("email")}
                        type="email"
                        className={inputCls}
                        placeholder="raj@example.com"
                      />
                    </Field>
                    <Field label="Phone" required error={errors.phone?.message} className="sm:col-span-2">
                      <div className="flex">
                        <span className="border border-input border-r-0 rounded-l-lg px-3 py-2.5 bg-secondary text-sm text-muted-foreground select-none">
                          +91
                        </span>
                        <input
                          {...register("phone")}
                          type="tel"
                          className={`${inputCls} rounded-l-none`}
                          placeholder="9876543210"
                          maxLength={10}
                        />
                      </div>
                    </Field>
                    <Field label="Street address" required error={errors.address?.message} className="sm:col-span-2">
                      <input
                        {...register("address")}
                        className={inputCls}
                        placeholder="House no., street, area"
                      />
                    </Field>
                    <Field label="Town / City" required error={errors.city?.message}>
                      <input {...register("city")} className={inputCls} placeholder="Mumbai" />
                    </Field>
                    <Field label="State" required error={errors.state?.message}>
                      <select {...register("state")} className={inputCls}>
                        <option value="">Select state</option>
                        {INDIAN_STATES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="PIN Code" required error={errors.pin?.message}>
                      <input
                        {...register("pin")}
                        className={inputCls}
                        placeholder="400001"
                        maxLength={6}
                      />
                    </Field>
                    <Field label="Country" error={errors.country?.message}>
                      <input {...register("country")} className={inputCls} readOnly />
                    </Field>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-1.5">
                      Order notes <span className="text-muted-foreground font-normal">(optional)</span>
                    </label>
                    <textarea
                      {...register("notes")}
                      rows={3}
                      placeholder="Mention your wrist size, special instructions, etc."
                      className={`${inputCls} resize-none`}
                    />
                  </div>
                </section>

                {/* ── Payment info banner ───────────────────────────────────── */}
                <section className="border border-border rounded-xl p-6 bg-card">
                  <h2 className="text-lg font-semibold mb-4">Payment</h2>
                  <div className="flex items-start gap-4 p-4 rounded-xl border border-primary/20 bg-primary/5">
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "#3F5C45", color: "#FFFFFF" }}
                    >
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-1">Secure Online Payment via Razorpay</p>
                      <p className="text-xs text-muted-foreground">
                        Pay safely with Credit/Debit Card, UPI, Net Banking, or Wallets. You'll be redirected to
                        Razorpay's secure checkout after clicking "Pay Now".
                      </p>
                      <div className="mt-3 flex items-center gap-3 flex-wrap">
                        {["Visa", "Mastercard", "UPI", "PhonePe", "GPay", "Paytm"].map((m) => (
                          <span key={m} className="text-[10px] border border-border rounded px-2 py-0.5 font-medium bg-background">
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <Lock className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>256-bit SSL encrypted. Your payment info is never stored on our servers.</span>
                  </div>
                </section>
              </div>

              {/* ── Right: Order summary ────────────────────────────────────── */}
              <aside className="border border-border rounded-xl p-6 bg-card h-fit space-y-4 lg:sticky lg:top-28">
                <h2 className="text-lg font-semibold">Your Order</h2>

                {/* Items */}
                <div className="space-y-3 max-h-72 overflow-auto pr-1">
                  {items.map((it) => {
                    const p = getProduct(it.slug);
                    if (!p) return null;
                    return (
                      <div key={`${it.slug}-${it.size ?? ""}`} className="flex gap-3 text-sm">
                        <img
                          src={p.img}
                          alt={p.name}
                          className="h-14 w-14 rounded-lg object-cover flex-shrink-0 bg-secondary"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium line-clamp-1">{p.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Qty {it.qty}
                            {it.size ? ` · ${it.size}mm` : ""}
                          </div>
                        </div>
                        <div className="font-medium">₹{(p.price * it.qty).toLocaleString()}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Totals */}
                <div className="border-t border-border pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery</span>
                    <span className="text-green-600 font-semibold">Free 🎉</span>
                  </div>
                  <div className="flex justify-between font-semibold text-base pt-2 border-t border-border">
                    <span>Total</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                </div>

                {/* CTA */}
                <button
                  type="submit"
                  disabled={placing || !razorpayReady}
                  className="w-full bg-primary text-primary-foreground rounded-full py-3.5 text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
                >
                  {placing ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing…
                    </>
                  ) : !razorpayReady ? (
                    "Loading payment gateway…"
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Pay ₹{total.toLocaleString()} Securely
                    </>
                  )}
                </button>

                {/* Trust badges */}
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-1">
                  <span className="flex items-center gap-1">
                    <Truck className="h-3 w-3" /> Free delivery
                  </span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> Secure payment
                  </span>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Powered by <strong>Razorpay</strong> — India's most trusted payment gateway
                </p>
              </aside>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}