import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchHomeCategories, type Category } from "@/lib/products";

export function TopCategories() {
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeCategories()
      .then(setCats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="text-center mb-8 sm:mb-12">
          <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-primary mb-2">Browse by type</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold">Top Categories</h2>
        </div>

        {loading && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3 sm:gap-6">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-3 animate-pulse">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-secondary" />
                <div className="h-3 w-16 bg-secondary rounded" />
              </div>
            ))}
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3 sm:gap-6">
            {cats.map((c) => (
              <Link
                key={c.slug}
                to="/category/$slug"
                params={{ slug: c.slug }}
                className="group flex flex-col items-center gap-3 text-center"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-secondary border-2 border-border group-hover:border-primary transition-colors">
                  {c.img ? (
                    <img
                      src={c.img}
                      alt={c.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-secondary" />
                  )}
                </div>
                <span className="text-xs sm:text-sm font-medium group-hover:text-primary transition-colors">
                  {c.name}
                </span>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-10 sm:mt-12 text-center">
          <Link
            to="/categories"
            className="inline-flex items-center justify-center gap-2 border border-border bg-card hover:bg-secondary text-sm font-medium px-6 py-3 rounded-full transition-colors"
          >
            View All Categories
          </Link>
        </div>
      </div>
    </section>
  );
}
