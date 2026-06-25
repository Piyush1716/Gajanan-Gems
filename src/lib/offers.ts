import type { Product } from "./products";

// ─── Badge Types ───────────────────────────────────────────────────────────────

export type BadgeType =
  | "flash-sale"
  | "new-arrival"
  | "bestseller"
  | "gift-pick"
  | "premium";

export const BADGE_CONFIG: Record<
  BadgeType,
  { label: string; bg: string; text: string }
> = {
  "flash-sale":  { label: "⚡ Flash Sale",  bg: "#DC2626", text: "#FFFFFF" },
  "new-arrival": { label: "✨ New Arrival", bg: "#3F5C45", text: "#FFFFFF" },
  "bestseller":  { label: "⭐ Bestseller",  bg: "#C8A96B", text: "#2E2B26" },
  "gift-pick":   { label: "🎁 Gift Pick",   bg: "#7C3AED", text: "#FFFFFF" },
  "premium":     { label: "💎 Premium",     bg: "#2E2B26", text: "#C8A96B" },
};

/** Priority order — first match wins */
const PRIORITY: BadgeType[] = [
  "flash-sale",
  "new-arrival",
  "bestseller",
  "gift-pick",
  "premium",
];

const GIFT_KEYWORDS = ["gift", "set", "combo", "bundle", "kit"];
const NEW_ARRIVAL_DAYS = 14;
const FLASH_SALE_MIN_DISCOUNT = 40; // %
const PREMIUM_MIN_PRICE = 1500;     // ₹

export function getBadge(product: Product): BadgeType | null {
  const discount = product.old
    ? Math.round(((product.old - product.price) / product.old) * 100)
    : 0;

  const isNew =
    (Date.now() - new Date(product.created_at).getTime()) / 86_400_000 <
    NEW_ARRIVAL_DAYS;

  const isGiftPick =
    GIFT_KEYWORDS.some((kw) => product.name.toLowerCase().includes(kw)) ||
    product.tag?.toLowerCase() === "gift";

  const checks: Record<BadgeType, boolean> = {
    "flash-sale":  discount >= FLASH_SALE_MIN_DISCOUNT,
    "new-arrival": isNew,
    "bestseller":  !!product.bestseller,
    "gift-pick":   isGiftPick,
    "premium":     product.price >= PREMIUM_MIN_PRICE,
  };

  return PRIORITY.find((b) => checks[b]) ?? null;
}

// ─── Social Proof (deterministic per product) ─────────────────────────────────

function seededInt(seed: number, min: number, max: number): number {
  // Simple deterministic pseudo-random from product id
  const x = Math.abs(Math.sin(seed * 9301 + 49297) * 233280);
  return min + Math.floor((x % 1) * (max - min + 1));
}

export function getSocialProof(productId: number) {
  return {
    viewed: seededInt(productId,     12, 53),
    sold:   seededInt(productId + 1,  5, 29),
    left:   seededInt(productId + 2,  2,  9),
  };
}

// ─── Offer Strip items ────────────────────────────────────────────────────────

export const OFFER_STRIP_ITEMS = [
  { icon: "🚚", text: "Free Shipping on any order" },
  { icon: "🎁", text: "Free Gift Above ₹1499" },
  { icon: "💎", text: "100% Natural Crystals" },
  { icon: "🔥", text: "Up To 60% OFF" },
];

// ─── Bundle Deals ─────────────────────────────────────────────────────────────

export type Bundle = {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeBg: string;
  description: string;
  saving: string;
  icon: string;
};

export const BUNDLES: Bundle[] = [
  {
    id: "buy2get1",
    title: "Buy 2 Get 1 FREE",
    subtitle: "On any 2 products",
    badge: "Most Popular",
    badgeBg: "#DC2626",
    description:
      "Add any 3 products to your cart. The cheapest one is on us! Mention 'Buy 2 Get 1' in order notes.",
    saving: "Save up to ₹799",
    icon: "🛍️",
  },
  {
    id: "festival",
    title: "Festival Offer",
    subtitle: "Seasonal special",
    badge: "Limited Time",
    badgeBg: "#D97706",
    description:
      "Celebrate the season with exclusive festival pricing on selected crystals and gems. Add code FESTIVAL at checkout.",
    saving: "Extra 15% OFF",
    icon: "🎉",
  },
  {
    id: "bracelet-bundle",
    title: "Bracelet Bundle",
    subtitle: "Any 3 Bracelets",
    badge: "20% OFF",
    badgeBg: "#3F5C45",
    description:
      "Pick any 3 bracelets from our collection. Mention 'Bracelet Bundle' in your order notes and get 20% off the total.",
    saving: "20% OFF total",
    icon: "📿",
  },
  {
    id: "home-decor",
    title: "Home Decor Bundle",
    subtitle: "Crystal Tree + Lamp",
    badge: "Save ₹500",
    badgeBg: "#7C3AED",
    description:
      "Transform your space — buy a Crystal Tree and a Crystal Lamp together. Mention 'Home Decor Bundle' in order notes.",
    saving: "Save ₹500",
    icon: "🌳",
  },
  {
    id: "gift-bundle",
    title: "Gift Bundle",
    subtitle: "Bottle + Bracelet + Crystal",
    badge: "Save ₹299",
    badgeBg: "#C8A96B",
    description:
      "The perfect gift set — a Crystal Bottle, Bracelet, and Crystal together. Mention 'Gift Bundle' in your order notes.",
    saving: "Save ₹299",
    icon: "🎁",
  },
];

// ─── Quantity Discounts (informational only — no price change) ────────────────

export const QTY_DISCOUNTS = [
  { qty: "1",  label: "1 piece",   discount: null,   note: "Normal price" },
  { qty: "2",  label: "2 pieces",  discount: 10,     note: "10% OFF" },
  { qty: "3",  label: "3 pieces",  discount: 15,     note: "15% OFF" },
  { qty: "5+", label: "5 or more", discount: 20,     note: "20% OFF" },
];

// ─── Free Gift Tiers ──────────────────────────────────────────────────────────

export const FREE_GIFTS = [
  { above: 999,  gift: "Free Tumbled Stone",  icon: "🪨" },
  { above: 1499, gift: "Free Crystal Pouch",  icon: "🔮" },
];

// ─── Flash Sale Config ────────────────────────────────────────────────────────

export const FLASH_SALE_PRODUCTS_COUNT = 6; // how many to show

/** Seconds remaining until next midnight (IST, UTC+5:30) */
export function secondsUntilMidnight(): number {
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 3600 * 1000);
  const midnight = new Date(ist);
  midnight.setUTCHours(24, 0, 0, 0);
  return Math.floor((midnight.getTime() - ist.getTime()) / 1000);
}
