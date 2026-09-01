import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { normaliseProductForSearch, type SearchResult } from "@/lib/search";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { Search, ShoppingBag, Heart, SlidersHorizontal } from "lucide-react";
import { z } from "zod";

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/search")({
  validateSearch: z.object({ q: z.string().optional() }),
  head: ({ match }) => ({
    meta: [
      { title: match.search.q ? `Search: "${match.search.q}" — Cambay Crystal` : "Search — Cambay Crystal" },
      { name: "description", content: "Search our collection of healing crystals and gemstone jewellery." },
    ],
  }),
  component: SearchPage,
});

// ─── Sorting options ──────────────────────────────────────────────────────────

type SortKey = "relevance" | "price-asc" | "price-desc" | "name";

function sortResults(results: SearchResult[], sort: SortKey): SearchResult[] {
  const clone = [...results];
  if (sort === "price-asc") return clone.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") return clone.sort((a, b) => b.price - a.price);
  if (sort === "name") return clone.sort((a, b) => a.name.localeCompare(b.name));
  return clone; // "relevance" — keep Supabase order
}

// ─── Product card ─────────────────────────────────────────────────────────────

function ProductCard({ p }: { p: SearchResult }) {
  const { add } = useCart();
  const { toggle, has } = useWishlist();
  const wished = has(p.slug);
  const discount = p.old ? Math.round(((p.old - p.price) / p.old) * 100) : 0;

  return (
    <div className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all">
      <Link to="/product/$slug" params={{ slug: p.slug }} className="block">
        <div className="relative aspect-square overflow-hidden bg-secondary">
          <img
            src={p.img}
            alt={p.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {discount > 0 && (
            <span
              className="absolute top-2 right-2 text-[10px] uppercase tracking-wider px-2 py-1 rounded-full font-semibold"
              style={{ backgroundColor: "#C8A96B", color: "#2E2B26" }}
            >
              {discount}% OFF
            </span>
          )}
          <button
            onClick={(e) => { e.preventDefault(); toggle(p.slug); }}
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute top-2 left-2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm hover:scale-110 transition-transform"
          >
            <Heart className={`h-4 w-4 transition-colors ${wished ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
          </button>
        </div>
        <div className="p-3 sm:p-4">
          <h3 className="text-xs sm:text-sm font-medium line-clamp-2 min-h-[2.5rem]">{p.name}</h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-semibold">₹{p.price.toLocaleString()}</span>
            {p.old && <span className="text-xs text-muted-foreground line-through">₹{p.old.toLocaleString()}</span>}
          </div>
        </div>
      </Link>
      <div className="px-3 sm:px-4 pb-3 sm:pb-4">
        <button
          onClick={() => add(p.slug, 1)}
          className="w-full flex items-center justify-center gap-2 text-[10px] sm:text-xs uppercase tracking-wider font-medium border border-primary text-primary rounded-full py-2 hover:bg-primary hover:text-white transition-colors"
        >
          <ShoppingBag className="h-3 w-3" />
          Add to Cart
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function SearchPage() {
  const { q } = Route.useSearch();
  const navigate = useNavigate();
  const [query, setQuery] = useState(q ?? "");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [sort, setSort] = useState<SortKey>("relevance");

  const doSearch = useCallback(async (term: string) => {
    if (!term.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true);
    setSearched(true);
    try {
      const { data } = await supabase
        .from("products")
        .select("id, title, price, old_price, image_url, slug")
        .ilike("title", `%${term.trim()}%`)
        .eq("available", true)
        .limit(48);
      setResults((data ?? []).map(normaliseProductForSearch));
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Run search when URL param changes
  useEffect(() => {
    if (q) {
      setQuery(q);
      doSearch(q);
    }
  }, [q, doSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/search", search: { q: query.trim() } });
  };

  const sorted = sortResults(results, sort);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-6 py-8 lg:py-12">
        {/* Search bar */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search crystals, bracelets, gemstones..."
              className="w-full bg-card border border-border rounded-full pl-12 pr-6 py-3.5 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-sm"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground rounded-full px-5 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {/* Results header */}
        {searched && !loading && (
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <p className="text-sm text-muted-foreground">
              {results.length > 0 ? (
                <>
                  <span className="text-foreground font-semibold">{results.length}</span> results for{" "}
                  <span className="text-foreground font-semibold">"{q}"</span>
                </>
              ) : (
                <>
                  No results for <span className="text-foreground font-semibold">"{q}"</span>
                </>
              )}
            </p>
            {results.length > 1 && (
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="bg-background border border-border rounded-full px-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="relevance">Sort by relevance</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>
            )}
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border animate-pulse">
                <div className="aspect-square bg-secondary" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-secondary rounded w-3/4" />
                  <div className="h-4 bg-secondary rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results grid */}
        {!loading && searched && sorted.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {sorted.map((p) => <ProductCard key={p.slug} p={p} />)}
          </div>
        )}

        {/* No results */}
        {!loading && searched && sorted.length === 0 && (
          <div className="text-center py-20 border border-dashed border-border rounded-2xl">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No products found</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Try different keywords or browse our categories.
            </p>
            <Link
              to="/"
              className="inline-flex bg-primary text-primary-foreground rounded-full px-6 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Browse All Products
            </Link>
          </div>
        )}

        {/* Initial state */}
        {!searched && (
          <div className="text-center py-20">
            <Search className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-muted-foreground">What are you looking for?</h2>
            <p className="text-sm text-muted-foreground">Search for crystals, bracelets, gemstones and more</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
