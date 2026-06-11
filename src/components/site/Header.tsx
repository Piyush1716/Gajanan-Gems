import { Link } from "@tanstack/react-router";
import { Search, ShoppingBag, User, Menu, Heart } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";

const nav = [
  { label: "Shop", to: "/" },
  { label: "Palm Analysis", to: "/hand-analysis" },
  // { label: "Custom Bracelet", to: "/customized-bracelet" },
  // { label: "Bulk Order", to: "/bulk-order" },
  // { label: "About", to: "/about-us" },
  // { label: "FAQ", to: "/faq" },
  // { label: "Contact", to: "/contact-us" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="text-center text-xs sm:text-sm py-2 px-4" style={{ backgroundColor: "#3F5C45", color: "#FFFFFF" }}>
        Free Shipping on Purchase of over ₹2000 (Prepaid Orders) · Use <strong>FIRST50</strong> for ₹50 off
      </div>
      <div className="max-w-7xl mx-auto px-4 lg:px-6 flex items-center gap-4 h-20">
        <button onClick={() => setOpen(!open)} className="lg:hidden p-2" aria-label="Menu">
          <Menu className="h-5 w-5" />
        </button>
        <Link to="/" className="flex items-center">
          <span className="text-3xl font-display font-semibold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            Gajanan<span className="text-primary">gems</span>
          </span>
        </Link>
        <nav className="hidden lg:flex items-center gap-6 ml-8 text-sm font-medium uppercase tracking-wide">
          {nav.map((n) => (
            <Link key={n.label} to={n.to} className="hover:text-primary transition-colors">
              {n.label}
            </Link>
          ))}
          {/* <span className="text-xs font-bold text-primary animate-pulse">LIVE</span> */}
        </nav>
        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          <div className="hidden md:flex items-center bg-secondary rounded-full px-4 py-2 w-64 border border-border">
            <input className="bg-transparent outline-none flex-1 text-sm" placeholder="Search crystals, bracelets..." />
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <button className="md:hidden p-2"><Search className="h-5 w-5" /></button>
          <button className="p-2 hidden sm:block"><Heart className="h-5 w-5" /></button>
          <Link to="/order-tracking" className="p-2" aria-label="Order tracking">
            <User className="h-5 w-5" />
          </Link>
          <Link to="/cart" className="relative p-2">
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 text-[10px] rounded-full h-4 w-4 flex items-center justify-center" style={{ backgroundColor: "#3F5C45", color: "#FFFFFF" }}>{count}</span>
          </Link>
        </div>
      </div>
      {open && (
        <nav className="lg:hidden border-t border-border px-4 py-3 flex flex-col gap-3 text-sm uppercase">
          {nav.map((n) => (
            <Link key={n.label} to={n.to} onClick={() => setOpen(false)}>{n.label}</Link>
          ))}
        </nav>
      )}
    </header>
  );
}
