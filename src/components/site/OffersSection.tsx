import { Link } from "@tanstack/react-router";
import { BUNDLES, FREE_GIFTS } from "@/lib/offers";
import { ArrowRight } from "lucide-react";

export function OffersSection() {
  return (
    <section className="py-12 sm:py-16" style={{ backgroundColor: "#F0EBE1" }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-8 sm:mb-10">
          <div>
            <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-primary mb-2">
              Exclusive deals
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold">Special Offers</h2>
          </div>
          <Link
            to="/offers"
            className="hidden sm:flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors"
          >
            All Offers <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Bundle cards — horizontal scroll on mobile */}
        <div className="flex gap-4 overflow-x-auto pb-3 sm:pb-0 sm:grid sm:grid-cols-3 lg:grid-cols-5 sm:gap-4 snap-x snap-mandatory">
          {BUNDLES.map((b) => (
            <Link
              key={b.id}
              to="/offers"
              className="group flex-shrink-0 w-60 sm:w-auto snap-start bg-card rounded-2xl border border-border p-4 sm:p-5
                         hover:shadow-lg hover:-translate-y-0.5 transition-all flex flex-col gap-3"
            >
              {/* Icon + badge row */}
              <div className="flex items-start justify-between">
                <span className="text-3xl">{b.icon}</span>
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: b.badgeBg, color: "#FFFFFF" }}
                >
                  {b.badge}
                </span>
              </div>

              <div>
                <h3 className="text-sm sm:text-base font-semibold leading-tight">{b.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{b.subtitle}</p>
              </div>

              <p
                className="text-xs font-semibold mt-auto"
                style={{ color: "#3F5C45" }}
              >
                {b.saving}
              </p>
            </Link>
          ))}
        </div>

        {/* Free Gift tiers strip */}
        <div
          className="mt-6 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 sm:gap-8 justify-center"
          style={{ backgroundColor: "#3F5C45" }}
        >
          <p className="text-xs sm:text-sm font-semibold text-white uppercase tracking-[0.2em]">
            🎁 Free Gifts
          </p>
          {FREE_GIFTS.map((g) => (
            <div key={g.above} className="flex items-center gap-2 text-white">
              <span className="text-lg">{g.icon}</span>
              <span className="text-xs sm:text-sm">
                Orders above{" "}
                <span className="font-bold text-yellow-300">₹{g.above.toLocaleString()}</span>
                {" → "}
                <span className="font-semibold">{g.gift}</span>
              </span>
            </div>
          ))}
          <Link
            to="/offers"
            className="text-xs font-medium underline underline-offset-2 text-white/80 hover:text-white transition-colors"
          >
            Learn more →
          </Link>
        </div>
      </div>
    </section>
  );
}
