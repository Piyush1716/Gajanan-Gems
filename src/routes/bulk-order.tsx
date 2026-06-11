import { createFileRoute } from "@tanstack/react-router";
import { PageBanner } from "@/components/PageBanner";
import { ContactForm } from "@/components/ContactForm";
import { StaticPageLayout } from "@/components/site/StaticPageLayout";

export const Route = createFileRoute("/bulk-order")({
  head: () => ({
    meta: [
      { title: "Bulk Order — GajananGems" },
      {
        name: "description",
        content:
          "GajananGems accepts bulk orders for wholesalers, retailers and businesses, with customization options for branding and packaging.",
      },
      { property: "og:title", content: "Bulk Order — GajananGems" },
      { property: "og:url", content: "/bulk-order" },
    ],
    links: [{ rel: "canonical", href: "/bulk-order" }],
  }),
  component: BulkOrderPage,
});

function BulkOrderPage() {
  return (
    <StaticPageLayout>
      <PageBanner title="Bulk Order" crumb="Bulk Order" />
      <div className="mx-auto max-w-3xl px-4 py-12">
        <article className="prose-policy">
          <p>
            At GajananGems, we are proud to announce that we accept bulk orders. Whether you are a
            wholesaler, retailer, or business in need of a large quantity of products, we have the
            capacity and expertise to fulfill your requirements.
          </p>
          <p>
            Our streamlined supply chain and production processes ensure efficient handling of bulk
            orders. We have the infrastructure and resources to manage large volumes of products
            without compromising on quality or delivery times. Our experienced team is dedicated to
            meeting your specific requirements.
          </p>
          <p>
            Customization options are also available for bulk orders. If you have specific branding
            or packaging needs, we can work with you to create tailored solutions.
          </p>
          <p>
            By accepting bulk orders, we aim to establish long-term partnerships with our customers.
            We value your trust and loyalty, and we strive to deliver consistent quality and service.
          </p>
        </article>
        <div className="mt-8 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-bold text-foreground">
            To place a Bulk Order, kindly fill out the form below
          </h2>
          <ContactForm
            messageLabel="Requirement Details"
            messagePlaceholder="Tell us the products, quantities and any customization or packaging needs."
            submitLabel="Submit Bulk Order Request"
          />
        </div>
      </div>
    </StaticPageLayout>
  );
}
