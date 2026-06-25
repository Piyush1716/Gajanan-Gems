import { Link, useNavigate } from "@tanstack/react-router";
import { Search, ShoppingBag, Menu, Heart, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { normaliseProductForSearch, type SearchResult } from "@/lib/search";

const nav = [
  { label: "Shop", to: "/" },
  { label: "Palm Analysis", to: "/hand-analysis" },
  { label: "Track Order", to: "/order-tracking" },
  { label: "About Us", to: "/about-us" },
  { label: "Categories", to: "/categories" },
];

const OFFERS_LINK = { label: "Offers", to: "/offers" };

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { count } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { user, isLoggedIn, showLoginModal } = useAuth();

  // Debounced Supabase search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    const timer = setTimeout(async () => {
      try {
        const { data } = await supabase
          .from("products")
          .select("id, title, price, old_price, image_url, slug")
          .ilike("title", `%${searchQuery.trim()}%`)
          .eq("available", true)
          .limit(6);
        setSearchResults((data ?? []).map(normaliseProductForSearch));
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 320);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchOpen(false);
    setMenuOpen(false);
    navigate({ to: "/search", search: { q: searchQuery.trim() } });
    setSearchQuery("");
  };

  const handleResultClick = (slug: string) => {
    setSearchOpen(false);
    setSearchQuery("");
    navigate({ to: "/product/$slug", params: { slug } });
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      {/* Promo bar */}
      <div className="text-center text-xs sm:text-sm py-2 px-4" style={{ backgroundColor: "#3F5C45", color: "#FFFFFF" }}>
        Free Delivery on All Orders 🚚 · Great Prices, Delivered Free
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 flex items-center gap-4 h-16 lg:h-20">
        {/* Mobile menu button */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2" aria-label="Menu">
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Logo */}
        <Link to="/" className="flex items-center flex-shrink-0">
          <span className="text-2xl lg:text-3xl font-display font-semibold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            Gajanan<span className="text-primary">Gems</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-5 ml-6 text-sm font-medium uppercase tracking-wide flex-1">
          {nav.map((n) => (
            <Link key={n.label} to={n.to} className="hover:text-primary transition-colors whitespace-nowrap">
              {n.label}
            </Link>
          ))}
          {/* Offers — highlighted */}
          <Link
            to={OFFERS_LINK.to}
            className="flex items-center gap-1.5 whitespace-nowrap font-semibold transition-colors hover:opacity-80"
            style={{ color: "#DC2626" }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: "#DC2626" }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: "#DC2626" }} />
            </span>
            🔥 {OFFERS_LINK.label}
          </Link>
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {/* Desktop search */}
          <div ref={searchRef} className="relative hidden md:block">
            <form onSubmit={handleSearchSubmit}>
              <div className="flex items-center bg-secondary rounded-full px-4 py-2 w-56 lg:w-64 border border-border focus-within:border-primary transition-colors">
                <input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  className="bg-transparent outline-none flex-1 text-sm"
                  placeholder="Search crystals, bracelets..."
                />
                {searchQuery ? (
                  <button type="button" onClick={() => { setSearchQuery(""); setSearchResults([]); }}>
                    <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </button>
                ) : (
                  <Search className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </form>

            {/* Search dropdown */}
            {searchOpen && searchQuery.trim() && (
              <div className="absolute top-full mt-2 left-0 w-80 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50">
                {searchLoading ? (
                  <div className="p-4 text-sm text-center text-muted-foreground">Searching…</div>
                ) : searchResults.length > 0 ? (
                  <>
                    <ul>
                      {searchResults.map((r) => (
                        <li key={r.slug}>
                          <button
                            onClick={() => handleResultClick(r.slug)}
                            className="flex items-center gap-3 w-full px-4 py-3 hover:bg-secondary transition-colors text-left"
                          >
                            <img
                              src={r.img}
                              alt={r.name}
                              className="h-10 w-10 rounded-lg object-cover flex-shrink-0 bg-secondary"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium line-clamp-1">{r.name}</p>
                              <p className="text-xs text-primary font-semibold">₹{r.price}</p>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={handleSearchSubmit as unknown as React.MouseEventHandler}
                      className="w-full py-2.5 text-xs font-medium text-primary hover:bg-secondary transition-colors border-t border-border"
                    >
                      View all results for "{searchQuery}" →
                    </button>
                  </>
                ) : (
                  <div className="p-4 text-sm text-center text-muted-foreground">
                    No products found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile search icon */}
          <Link to="/search" className="md:hidden p-2" aria-label="Search">
            <Search className="h-5 w-5" />
          </Link>

          {/* Wishlist */}
          <Link to="/wishlist" className="relative p-2 hidden sm:block" aria-label="Wishlist">
            <Heart className="h-5 w-5" />
            {wishlistCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 text-[10px] rounded-full h-4 w-4 flex items-center justify-center"
                style={{ backgroundColor: "#3F5C45", color: "#FFFFFF" }}
              >
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* User account */}
          {isLoggedIn ? (
            <Link
              to="/profile"
              className="p-1 flex items-center gap-1.5"
              aria-label="My Account"
            >
              <span
                className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: "#3F5C45", color: "#FFFFFF" }}
              >
                {(user?.first_name?.[0] || user?.email?.[0] || "U").toUpperCase()}
              </span>
            </Link>
          ) : (
            <button
              onClick={() => showLoginModal()}
              className="p-2 block"
              aria-label="Log in"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          )}

          {/* Cart */}
          <Link to="/cart" className="relative p-2" aria-label="Shopping cart">
            <ShoppingBag className="h-5 w-5" />
            <span
              className="absolute -top-0.5 -right-0.5 text-[10px] rounded-full h-4 w-4 flex items-center justify-center"
              style={{ backgroundColor: "#3F5C45", color: "#FFFFFF" }}
            >
              {count}
            </span>
          </Link>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav className="lg:hidden border-t border-border bg-background px-4 py-4 flex flex-col gap-1">
          {/* Mobile search */}
          <form onSubmit={handleSearchSubmit} className="mb-3">
            <div className="flex items-center bg-secondary rounded-full px-4 py-2.5 border border-border">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none flex-1 text-sm"
                placeholder="Search crystals, bracelets..."
              />
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
          </form>
          {nav.map((n) => (
            <Link
              key={n.label}
              to={n.to}
              onClick={() => setMenuOpen(false)}
              className="py-2.5 px-2 text-sm font-medium uppercase tracking-wide border-b border-border/50 last:border-0 hover:text-primary transition-colors"
            >
              {n.label}
            </Link>
          ))}
          {/* Offers — highlighted in mobile menu */}
          <Link
            to={OFFERS_LINK.to}
            onClick={() => setMenuOpen(false)}
            className="py-2.5 px-2 text-sm font-bold uppercase tracking-wide flex items-center gap-2"
            style={{ color: "#DC2626" }}
          >
            🔥 {OFFERS_LINK.label}
          </Link>
        </nav>
      )}
    </header>
  );
}
