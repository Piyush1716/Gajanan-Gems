import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import {
  fetchCategoryBySlug,
  fetchCategories,
  fetchProductsByCategory,
  type Category,
  type Product,
} from "@/lib/products";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { ChevronRight, SlidersHorizontal, ShoppingBag, Heart, X } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/category/$slug")({
  loader: async ({ params }) => {
    const [category, allCategories, products] = await Promise.all([
      fetchCategoryBySlug(params.slug),
      fetchCategories(),
      fetchProductsByCategory(params.slug),
    ]);
    if (!category) throw notFound();
    return { category, allCategories, products };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.category.name ?? "Category"} — GajananGems` },
      { name: "description", content: loaderData?.category.description ?? "Shop healing crystals and gemstone jewellery." },
    ],
  }),
  component: CategoryPage,
  notFoundComponent: () => (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Category not found</h1>
          <Link to="/" className="text-primary underline">Back to home</Link>
        </div>
      </div>
      <Footer />
    </div>
  ),
});

function CategoryPage() {
  const { category, allCategories, products } = Route.useLoaderData() as {
    category: Category;
    allCategories: Category[];
    products: Product[];
  };
  const [sort, setSort] = useState("popularity");
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const { add } = useCart();
  const { toggle, has } = useWishlist();

  const sorted = [...products].sort((a, b) => {
    if (sort === "price-asc")  return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    if (sort === "name")       return a.name.localeCompare(b.name);
    return 0;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero banner */}
        <div className="bg-secondary/60 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8 sm:py-12">
            <nav className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground mb-3">
              <Link to="/" className="hover:text-primary">Home</Link>
              <ChevronRight className="h-3 w-3" />
              <span>Jewellery</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground font-medium">{category.name}</span>
            </nav>
            <div className="flex items-center gap-6">
              {category.img && (
                <img
                  src={category.img}
                  alt={category.name}
                  className="h-20 w-20 rounded-2xl object-cover hidden sm:block"
                />
              )}
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold">{category.name}</h1>
                {category.description && (
                  <p className="mt-3 max-w-2xl text-sm sm:text-base text-muted-foreground">
                    {category.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8 lg:py-12">
          {/* Product grid */}
          <div>
            <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
              <button
                onClick={() => setCategoryModalOpen(true)}
                className="inline-flex items-center gap-2 text-sm border border-border rounded-full px-5 py-2.5 hover:bg-secondary transition-colors"
              >
                <SlidersHorizontal className="h-4 w-4" /> Browse Categories
              </button>
              <p className="text-sm text-muted-foreground">
                Showing <span className="text-foreground font-medium">{sorted.length}</span> products
              </p>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="ml-auto bg-background border border-border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="popularity">Sort by popularity</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>

            {sorted.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-border rounded-2xl">
                <p className="text-muted-foreground">No products in this category yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
                {sorted.map((p) => {
                  const wished = has(p.slug);
                  const discount = p.old ? Math.round(((p.old - p.price) / p.old) * 100) : 0;
                  return (
                    <div
                      key={p.id}
                      className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all"
                    >
                      <Link to="/product/$slug" params={{ slug: p.slug }} className="block">
                        <div className="relative aspect-square overflow-hidden bg-secondary">
                          <img
                            src={p.img}
                            alt={p.name}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {p.tag && (
                            <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-primary text-primary-foreground text-[10px] uppercase tracking-wider px-2 py-1 rounded-full">
                              {p.tag}
                            </span>
                          )}
                          {discount > 0 && (
                            <span
                              className="absolute top-2 right-2 sm:top-3 sm:right-3 text-[10px] uppercase tracking-wider px-2 py-1 rounded-full font-semibold"
                              style={{ backgroundColor: "#C8A96B", color: "#2E2B26" }}
                            >
                              {discount}% OFF
                            </span>
                          )}
                          <button
                            onClick={(e) => { e.preventDefault(); toggle(p.slug); }}
                            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
                            className={`absolute bottom-2 right-2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:scale-110 ${wished ? "opacity-100 sm:opacity-100" : ""}`}
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
                })}
              </div>
            )}
          </div>
        </div>

        {/* Categories Modal */}
        {categoryModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border overflow-hidden flex flex-col max-h-[80vh]">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-lg">Select Category</h3>
                <button onClick={() => setCategoryModalOpen(false)} className="p-2 hover:bg-secondary rounded-full transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="overflow-y-auto p-4 flex-1">
                <ul className="space-y-2">
                  {allCategories.map((c) => (
                    <li key={c.slug}>
                      <Link
                        to="/category/$slug"
                        params={{ slug: c.slug }}
                        onClick={() => setCategoryModalOpen(false)}
                        className={`flex items-center gap-4 p-3 rounded-xl hover:bg-secondary transition-colors ${
                          c.slug === category.slug ? "bg-secondary border-primary/20 border" : "border border-transparent"
                        }`}
                      >
                        {c.img && (
                          <img src={c.img} alt={c.name} className="h-10 w-10 rounded-lg object-cover" />
                        )}
                        <span className={c.slug === category.slug ? "font-semibold text-primary" : "font-medium"}>{c.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
