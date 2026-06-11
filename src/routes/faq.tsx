import { createFileRoute } from "@tanstack/react-router";
import { PageBanner } from "@/components/PageBanner";
import { StaticPageLayout } from "@/components/site/StaticPageLayout";

const faqs = [
  { q: "Do you offer COD?", a: "Yes, we offer Cash on Delivery (COD)." },
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
    a: "Products in Mumbai are delivered in 2-3 working days, whereas products outside Mumbai are delivered in 4-6 working days.",
  },
  {
    q: "Whom should I talk to if I have a concern?",
    a: "Feel free to reach us at hello@gajanangems.com and we'll be more than happy to assist you.",
  },
];

const cancellationSteps = [
  "Login to your account on the GajananGems website.",
  'Go to your "Account" tab and click on the "Order" option.',
  'Look for the product order you want and click on the "Cancel request" option.',
  'A form titled "Request Order Cancellation" will appear — enter the reason for your cancellation.',
  'After filling the details, click on "Confirm Cancellation".',
  "A request will then be sent to our team for cancelling your order.",
  "Your request for order cancellation will be processed within 48 hours.",
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
