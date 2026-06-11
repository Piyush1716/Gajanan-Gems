import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, MapPin } from "lucide-react";
import { PageBanner } from "@/components/PageBanner";
import { ContactForm } from "@/components/ContactForm";
import { StaticPageLayout } from "@/components/site/StaticPageLayout";

export const Route = createFileRoute("/contact-us")({
  head: () => ({
    meta: [
      { title: "Contact Us — GajananGems" },
      {
        name: "description",
        content:
          "Get in touch with GajananGems. Email hello@gajanangems.com, call +91 63515 63768, or visit our showroom in Mumbai.",
      },
      { property: "og:title", content: "Contact Us — GajananGems" },
      { property: "og:url", content: "/contact-us" },
    ],
    links: [{ rel: "canonical", href: "/contact-us" }],
  }),
  component: ContactPage,
});

const details = [
  { icon: Mail, label: "Email", value: "hello@gajanangems.com", href: "mailto:hello@gajanangems.com" },
  { icon: Phone, label: "Phone / WhatsApp", value: "+91 63515 63768", href: "tel:+916351563768" },
  { icon: MapPin, label: "Showroom", value: "Khambhat , Gujarat India", href: undefined },
];

function ContactPage() {
  return (
    <StaticPageLayout>
      <PageBanner title="Contact Us" crumb="Contact Us" subtitle="We'd love to hear from you." />
      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 lg:grid-cols-2">
        <div className="space-y-6">
          {details.map((d) => (
            <div key={d.label} className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                <d.icon size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{d.label}</p>
                {d.href ? (
                  <a href={d.href} className="text-foreground hover:text-primary">{d.value}</a>
                ) : (
                  <p className="text-foreground">{d.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-bold text-foreground">Send us a message</h2>
          <ContactForm />
        </div>
      </div>
    </StaticPageLayout>
  );
}
