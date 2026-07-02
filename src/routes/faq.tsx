import { CONTACT_EMAIL, CONTACT_PHONE } from "@/config";
import { createFileRoute } from "@tanstack/react-router";
import { PageBanner } from "@/components/PageBanner";
import { StaticPageLayout } from "@/components/site/StaticPageLayout";

const faqs = [
  { q: "Do you offer COD?", a: "Currently, we do not offer Cash on Delivery (COD). Please use our available online payment methods to complete your purchase." },
  {
    q: "How will I know that my order is successful?",
    a: "Once we get your order, you will receive an order confirmation email along with the timelines.",
  },
  {
    q: "How do you make sure that the products reach us safe?",
    a: "Our multilayered packaging keeps the item absolutely safe.",
  },
  {
    q: "Can I trust your payment gateway?",
    a: "Absolutely. Our payment gateway is extremely safe and we ensure complete privacy of customer details.",
  },
  {
    q: "What is your delivery time?",
    a: "Products in Gujarat are delivered in 2-3 working days, whereas products outside Gujarat are delivered in 4-6 working days.",
  },
  {
    q: "Whom should I talk to if I have a concern?",
    a: `Feel free to reach us at ${CONTACT_EMAIL} and we'll be more than happy to assist you.`,
  },
];

const cancellationSteps = [
  "Currently, we do not offer self-service order cancellations.",
  "If you wish to cancel your order, please contact our support team as soon as possible.",
  "Our team will review your request and assist you if the order has not yet been processed or shipped.",
  "If the order has already been dispatched, you may refuse to accept the package at the time of delivery.",
  "For any assistance regarding cancellations, please get in touch with our customer support team.",
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — GajananGems" },
      {
        name: "description",
        content:
          "Frequently asked questions about GajananGems: COD, order confirmation, packaging, payment security, delivery times and order cancellation.",
      },
      { property: "og:title", content: "Frequently Asked Questions — GajananGems" },
      { property: "og:url", content: "/faq" },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <StaticPageLayout>
      <PageBanner title="Frequently Asked Questions" crumb="Frequently Asked Questions" />
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="space-y-5">
          {faqs.map((f, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-semibold text-foreground">
                Q{i + 1}. {f.q}
              </h3>
              <p className="mt-2 text-muted-foreground">{f.a}</p>
            </div>
          ))}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-semibold text-foreground">Q7. Order Cancellation</h3>
            <ol className="prose-policy mt-2">
              {cancellationSteps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </StaticPageLayout>
  );
}
