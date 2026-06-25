import { OFFER_STRIP_ITEMS } from "@/lib/offers";
import { Link } from "@tanstack/react-router";

export function OfferStrip() {
  return (
    <div
      className="w-full overflow-x-auto"
      style={{ backgroundColor: "#3F5C45" }}
    >
      {/* Scrollable container — snaps on mobile, centered on desktop */}
      <div className="flex items-stretch min-w-max sm:min-w-0 sm:justify-center">
        {OFFER_STRIP_ITEMS.map((item, idx) => (
          <Link
            key={idx}
            to="/offers"
            className="flex items-center gap-2 px-5 py-3 sm:py-3.5 whitespace-nowrap
                       border-r border-white/20 last:border-r-0
                       hover:bg-white/10 transition-colors cursor-pointer
                       flex-shrink-0 sm:flex-1 sm:justify-center"
          >
            <span className="text-base sm:text-lg" aria-hidden="true">
              {item.icon}
            </span>
            <span
              className="text-xs sm:text-sm font-medium tracking-wide"
              style={{ color: "#F7F4EE" }}
            >
              {item.text}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
