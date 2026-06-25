import { getBadge, BADGE_CONFIG } from "@/lib/offers";
import type { Product } from "@/lib/products";

interface Props {
  product: Product;
  /** "card" = compact overlay on image | "page" = larger inline pill */
  variant?: "card" | "page";
}

export function ProductBadge({ product, variant = "card" }: Props) {
  const badge = getBadge(product);
  if (!badge) return null;

  const { label, bg, text } = BADGE_CONFIG[badge];

  if (variant === "card") {
    return (
      <span
        className="absolute top-2 left-2 sm:top-3 sm:left-3 text-[9px] sm:text-[10px]
                   uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold z-10
                   shadow-sm"
        style={{ backgroundColor: bg, color: text }}
      >
        {label}
      </span>
    );
  }

  // "page" variant — inline pill, no absolute positioning
  return (
    <span
      className="inline-flex items-center text-xs uppercase tracking-wider
                 px-3 py-1 rounded-full font-semibold"
      style={{ backgroundColor: bg, color: text }}
    >
      {label}
    </span>
  );
}
