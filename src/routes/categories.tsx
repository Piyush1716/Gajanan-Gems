import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { fetchAllCategories, type Category } from "@/lib/products";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "All Categories — GajananGems" },
      { name: "description", content: "Browse all our healing crystal and gemstone categories." },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllCategories()
      .then(setCats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-4">All Categories</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our complete collection of healing crystals, bracelets, and gemstone jewellery.
            </p>
          </div>

          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-3 animate-pulse">
                  <div className="w-full aspect-square rounded-full bg-secondary" />
                  <div className="h-4 w-24 bg-secondary rounded" />
                </div>
              ))}
            </div>
          )}

          {!loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-10">
              {cats.map((c) => (
                <Link
                  key={c.slug}
                  to="/category/$slug"
                  params={{ slug: c.slug }}
                  className="group flex flex-col items-center gap-4 text-center"
                >
                  <div className="w-full aspect-square rounded-full overflow-hidden bg-secondary border-2 border-border group-hover:border-primary transition-colors">
                    {c.img ? (
                      <img
                        src={c.img}
                        alt={c.name}
                        loading="lazy"
                        className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 ${!c.available ? 'opacity-60 grayscale' : ''}`}
                      />
                    ) : (
                      <div className="w-full h-full bg-secondary" />
                    )}
                  </div>
                  <div>
                    <span className="text-sm sm:text-base font-medium group-hover:text-primary transition-colors block">
                      {c.name}
                    </span>
                    {!c.available && (
                      <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mt-1 block">
                        Currently Unavailable
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
