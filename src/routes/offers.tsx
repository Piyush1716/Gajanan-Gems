import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { BUNDLES, QTY_DISCOUNTS, FREE_GIFTS } from "@/lib/offers";
import { ArrowRight, Gift, Tag, Layers, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "Special Offers & Deals — GajananGems" },
      {
        name: "description",
        content:
          "Explore all our exclusive deals — Buy 2 Get 1, bundle discounts, free gifts, and flash sale prices on authentic healing crystals and gemstone jewellery.",
      },
    ],
  }),
  component: OffersPage,
});

function SectionHeading({
  icon,
  label,
  title,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
}) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: "#3F5C45" }}
      >
        <span className="text-white">{icon}</span>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-primary mb-0.5">
          {label}
        </p>
        <h2 className="text-2xl sm:text-3xl font-semibold">{title}</h2>
      </div>
    </div>
  );
}

function OffersPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section
          className="relative overflow-hidden py-16 sm:py-24"
          style={{
            background:
              "linear-gradient(135deg, #3F5C45 0%, #2E2B26 50%, #1A0A0A 100%)",
          }}
        >
          {/* Decorative circles */}
          <div
            className="absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-10"
            style={{ backgroundColor: "#C8A96B" }}
          />
          <div
            className="absolute -bottom-16 -left-16 w-60 h-60 rounded-full opacity-10"
            style={{ backgroundColor: "#C8A96B" }}
          />

          <div className="relative max-w-7xl mx-auto px-4 lg:px-6 text-center text-white">
            <span
              className="inline-block text-xs uppercase tracking-[0.3em] px-4 py-1.5 rounded-full mb-6 font-semibold"
              style={{ backgroundColor: "rgba(200,169,107,0.25)", color: "#C8A96B" }}
            >
              🔥 Exclusive Deals
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold mb-4 leading-tight">
              All Our Special Offers
            </h1>
            <p className="text-lg sm:text-xl text-white/70 max-w-xl mx-auto mb-8">
              Bundles, discounts, and free gifts — handpicked to help you get
              more from every order.
            </p>
            <Link
              to="/search"
              search={{ q: "" }}
              className="inline-flex items-center gap-2 rounded-full px-7 py-3 font-medium transition-colors"
              style={{ backgroundColor: "#C8A96B", color: "#2E2B26" }}
            >
              Shop Now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-12 sm:py-16 space-y-16">
          {/* ── Bundle Deals ────────────────────────────────────────── */}
          <section>
            <SectionHeading
              icon={<Layers className="h-5 w-5" />}
              label="Save more together"
              title="Bundle Deals"
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {BUNDLES.map((b) => (
                <div
                  key={b.id}
                  className="bg-card rounded-2xl border border-border p-5 sm:p-6 flex flex-col gap-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-4xl">{b.icon}</span>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex-shrink-0"
                      style={{ backgroundColor: b.badgeBg, color: "#FFFFFF" }}
                    >
                      {b.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-0.5">{b.title}</h3>
                    <p className="text-xs text-muted-foreground">{b.subtitle}</p>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                    {b.description}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span
                      className="text-sm font-bold"
                      style={{ color: "#3F5C45" }}
                    >
                      {b.saving}
                    </span>
                    <Link
                      to="/search"
                      search={{ q: "" }}
                      className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      Shop now <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Important note */}
            <div
              className="mt-6 rounded-xl p-4 text-sm"
              style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}
            >
              <strong>📝 How to redeem bundles:</strong> Add the qualifying
              products to your cart, then mention the bundle name (e.g.{" "}
              <em>Bracelet Bundle</em>) in the <strong>order notes</strong> at
              checkout. We'll apply the discount before shipping.
            </div>
          </section>

          {/* ── Quantity Discounts ──────────────────────────────────── */}
          <section>
            <SectionHeading
              icon={<Tag className="h-5 w-5" />}
              label="Buy more, save more"
              title="Bracelet Quantity Discounts"
            />
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: "#3F5C45" }}>
                    <th className="py-3 px-5 text-left font-semibold text-white">Quantity</th>
                    <th className="py-3 px-5 text-left font-semibold text-white">Discount</th>
                    <th className="py-3 px-5 text-left font-semibold text-white hidden sm:table-cell">
                      Note
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {QTY_DISCOUNTS.map((row, i) => (
                    <tr
                      key={row.qty}
                      className={i % 2 === 0 ? "bg-background" : "bg-secondary/30"}
                    >
                      <td className="py-3.5 px-5 font-medium">{row.label}</td>
                      <td className="py-3.5 px-5">
                        {row.discount ? (
                          <span
                            className="font-bold"
                            style={{ color: "#3F5C45" }}
                          >
                            {row.note}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">{row.note}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-muted-foreground text-xs hidden sm:table-cell">
                        {row.discount
                          ? "Mention quantity in order notes"
                          : "No action needed"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              * Applicable on bracelets only. Mention your quantity discount in the order notes at checkout.
            </p>
          </section>

          {/* ── Free Gift Tiers ──────────────────────────────────────── */}
          <section>
            <SectionHeading
              icon={<Gift className="h-5 w-5" />}
              label="On us"
              title="Free Gift with Your Order"
            />
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              {FREE_GIFTS.map((g) => (
                <div
                  key={g.above}
                  className="rounded-2xl p-6 sm:p-8 flex items-center gap-5 border"
                  style={{
                    background: "linear-gradient(135deg, #3F5C45 0%, #2E2B26 100%)",
                    borderColor: "#C8A96B",
                  }}
                >
                  <span className="text-5xl flex-shrink-0">{g.icon}</span>
                  <div className="text-white">
                    <p className="text-xs uppercase tracking-[0.3em] mb-1 text-white/60">
                      Free with orders above
                    </p>
                    <p className="text-3xl font-bold mb-1" style={{ color: "#C8A96B" }}>
                      ₹{g.above.toLocaleString()}
                    </p>
                    <p className="text-lg font-semibold">{g.gift}</p>
                    <p className="text-xs text-white/60 mt-1">Added automatically to your order</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
