import { CONTACT_EMAIL, CONTACT_PHONE } from "@/config";
import { createFileRoute, Link } from "@tanstack/react-router";
import DOMPurify from "dompurify";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CheckCircle2, Package, Mail, MessageCircle } from "lucide-react";
import { z } from "zod";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/order-confirmation")({
  validateSearch: z.object({
    // Only the orderId remains in the URL — all other data comes from sessionStorage
    orderId: z.string().optional(),
  }),
  head: () => ({
    meta: [
      { title: "Order Confirmed — GajananGems" },
      { name: "description", content: "Your GajananGems order has been placed successfully." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: OrderConfirmationPage,
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConfirmData {
  orderId: number | string;
  firstName?: string;
  total?: number | string;
  payMethod?: string;
}

// ─────────────────────────────────────────────────────────────────────────────

function OrderConfirmationPage() {
  const { orderId: urlOrderId } = Route.useSearch();
  const [confirmData, setConfirmData] = useState<ConfirmData | null>(null);

  useEffect(() => {
    // Read confirmation data from sessionStorage (written by checkout.tsx)
    try {
      const raw = sessionStorage.getItem("gajanan_order_confirm");
      if (raw) {
        const parsed: ConfirmData = JSON.parse(raw);
        setConfirmData(parsed);
        // Clear after reading — it's a one-time use token
        sessionStorage.removeItem("gajanan_order_confirm");
      } else if (urlOrderId) {
        // Fallback: use URL orderId if sessionStorage is unavailable
        setConfirmData({ orderId: urlOrderId });
      }
    } catch {
      if (urlOrderId) setConfirmData({ orderId: urlOrderId });
    }
  }, [urlOrderId]);

  const orderId   = confirmData?.orderId ?? urlOrderId;
  const firstName = confirmData?.firstName;
  const total     = confirmData?.total;
  const payMethod = confirmData?.payMethod;

  const payLabel =
    payMethod === "razorpay"
      ? "Razorpay (Online)"
      : payMethod
        ? payMethod
        : "Online Payment";

  const displayAmount = total ? parseInt(String(total)).toLocaleString() : "N/A";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full text-center">
          {/* Success icon */}
          <div
            className="mx-auto h-20 w-20 rounded-full flex items-center justify-center mb-6 shadow-lg"
            style={{ backgroundColor: "#3F5C45" }}
          >
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>

          <h1 className="text-3xl font-semibold mb-2">
            {firstName ? `Thank you, ${DOMPurify.sanitize(firstName)}! 🎉` : "Order Confirmed! 🎉"}
          </h1>
          <p className="text-muted-foreground mb-8">
            Your order has been placed successfully. We'll send a confirmation to your email shortly and get started on
            preparing your order.
          </p>

          {/* Order details card */}
          {orderId && (
            <div className="border border-border rounded-2xl bg-card p-6 mb-8 text-left space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-semibold font-mono">#{orderId}</span>
              </div>
              {total && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span className="font-semibold">₹{displayAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-semibold">{payLabel}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estimated Delivery</span>
                <span className="font-semibold">5–7 business days</span>
              </div>
              <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                💡 Save this Order ID for tracking and support inquiries
              </div>
            </div>
          )}

          {/* Next steps */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8 text-left">
            <div className="border border-border rounded-xl p-4 bg-card flex flex-col items-center text-center gap-2">
              <Mail className="h-6 w-6 text-primary" />
              <p className="text-xs font-medium">Check your email</p>
              <p className="text-xs text-muted-foreground">Confirmation and invoice sent to your inbox</p>
            </div>
            <div className="border border-border rounded-xl p-4 bg-card flex flex-col items-center text-center gap-2">
              <Package className="h-6 w-6 text-primary" />
              <p className="text-xs font-medium">Track your order</p>
              <p className="text-xs text-muted-foreground">Use your Order ID &amp; email to track anytime</p>
            </div>
            <div className="border border-border rounded-xl p-4 bg-card flex flex-col items-center text-center gap-2">
              <MessageCircle className="h-6 w-6 text-primary" />
              <p className="text-xs font-medium">Need help?</p>
              <p className="text-xs text-muted-foreground">WhatsApp +91 {CONTACT_PHONE}</p>
            </div>
          </div>

          {/* Order info section */}
          <div className="rounded-xl border border-border bg-card p-5 mb-8 text-left">
            <h3 className="font-semibold text-sm mb-3">What happens next?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary font-bold">1.</span>
                <span>We'll verify your payment and send a confirmation email</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">2.</span>
                <span>Your order will be packed with care within 24 hours</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">3.</span>
                <span>You'll receive shipping updates via WhatsApp &amp; email</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">4.</span>
                <span>Expect delivery within 5–7 business days</span>
              </li>
            </ul>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/order-tracking"
              className="inline-flex items-center justify-center border border-primary text-primary rounded-full px-6 py-2.5 text-sm font-medium hover:bg-primary hover:text-white transition-colors"
            >
              Track My Order
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center bg-primary text-primary-foreground rounded-full px-6 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>

          {/* Support section */}
          <div className="mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground">
            <p className="mb-3">Have questions about your order?</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-primary hover:underline font-medium"
              >
                📧 Email us
              </a>
              <span className="hidden sm:inline text-border">•</span>
              <a
                href={`https://wa.me/91${CONTACT_PHONE}`}
                className="text-primary hover:underline font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                💬 WhatsApp
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}