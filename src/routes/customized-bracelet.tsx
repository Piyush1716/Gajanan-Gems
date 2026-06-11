import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { PageBanner } from "@/components/PageBanner";
import { ContactForm } from "@/components/ContactForm";
import { StaticPageLayout } from "@/components/site/StaticPageLayout";

const highlights = [
  "Create Your Own Crystal Bracelet Online",
  "100% Personalized Crystal Bracelet India",
  "Natural & Authentic Healing Crystals",
  "Handmade Customized Bracelet for Men & Women",
];

const faqs = [
  {
    q: "How does the customized bracelet process work?",
    a: "Fill in your basic details, mention your requirements (crystal name(s), bead size and wrist size) in the message box, and submit. Our team will contact you to confirm, then we craft and deliver your bracelet.",
  },
  {
    q: "What details should I write in the message field?",
    a: "Please include crystal bead names, bead size, wrist size (in inches or cm), purpose (optional — like love, protection, wealth) and any design preference. The more details, the better.",
  },
  {
    q: "Can I choose multiple crystals in one bracelet?",
    a: "Yes, you can request multiple crystal beads in a single bracelet as per your need or intention.",
  },
  {
    q: "How do I measure my wrist size?",
    a: "You can use a measuring tape or wrap a thread around your wrist and measure it with a ruler.",
  },
  {
    q: "Will someone guide me before making the bracelet?",
    a: "Yes, after you submit the form our team will contact you to confirm your requirements and suggest the best options if needed.",
  },
  {
    q: "Are the crystals natural and authentic?",
    a: "Yes, we use high-quality natural crystal beads in all customized bracelets.",
  },
  {
    q: "How long does delivery take?",
    a: "Delivery usually takes 3-7 working days after order confirmation.",
  },
  {
    q: "Can I customize a bracelet for gifting?",
    a: "Absolutely! You can mention gifting requirements or special notes in the message field.",
  },
];

export const Route = createFileRoute("/customized-bracelet")({
  head: () => ({
    meta: [
      { title: "Create Your Own Customized Crystal Bracelet — GajananGems" },
      {
        name: "description",
        content:
          "Design your own customized crystal bracelet online in India. Choose natural crystal beads, bead size and wrist size — handmade authentic healing bracelets.",
      },
      { property: "og:title", content: "Customized Crystal Bracelet — GajananGems" },
      { property: "og:url", content: "/customized-bracelet" },
    ],
    links: [{ rel: "canonical", href: "/customized-bracelet" }],
  }),
  component: CustomBraceletPage,
});

function CustomBraceletPage() {
  return (
    <StaticPageLayout>
      <PageBanner
        title="Create Your Own Customized Crystal Bracelet"
        crumb="Customized Crystal Bracelet"
        subtitle="India's first eCommerce platform for customized crystal bracelets."
      />
      <div className="mx-auto max-w-3xl px-4 py-12">
        <article className="prose-policy">
          <p>
            Welcome to GajananGems — India's first platform where you can create your own
            customized crystal bracelet online with complete flexibility.
          </p>
          <p>
            If you are searching for a customized crystal bracelet in India or a personalized crystal
            bracelet online, you're in the right place. We make it easy for you to design a bracelet
            that matches your style, intention, and energy.
          </p>
          <p>
            Unlike ready-made products, our platform lets you fully customize your bracelet by simply
            sharing your requirements. You can choose any natural crystal beads, mention your
            preferred bead size (6mm, 8mm, 10mm, 12mm, etc.), and provide your wrist size for a
            perfect fit.
          </p>
          <p>
            Whether you want a healing crystal bracelet, a bracelet for positivity, protection or
            wealth, or a customized bracelet for gifting, we create it exactly as per your needs.
            Once you submit your details, our team will connect with you to finalize your design.
          </p>
        </article>

        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {highlights.map((h) => (
            <li key={h} className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-3 text-sm font-medium text-foreground">
              <Sparkles size={16} className="text-primary" /> {h}
            </li>
          ))}
        </ul>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-bold text-foreground">Submit Your Custom Bracelet Requirement</h2>
          <ContactForm
            messageLabel="Your Requirements"
            messagePlaceholder="Crystal name(s), bead size (6/8/10/12mm), wrist size, purpose and any design preference."
            submitLabel="Submit Requirement"
          />
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-foreground">Frequently Asked Questions</h2>
          <div className="mt-6 space-y-4">
            {faqs.map((f, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-6">
                <h3 className="font-semibold text-foreground">
                  Q{i + 1}. {f.q}
                </h3>
                <p className="mt-2 text-muted-foreground">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </StaticPageLayout>
  );
}
