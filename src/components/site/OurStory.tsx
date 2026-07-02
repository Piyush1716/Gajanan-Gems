import { Link } from "@tanstack/react-router";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export function OurStory() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="bg-secondary/40 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div
          ref={ref}
          className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center"
        >
          {/* Left side — image with gold accent frame */}
          <div
            className="relative transition-all duration-700"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateX(0)" : "translateX(-40px)",
            }}
          >
            {/* Decorative gold border offset behind the image */}
            <div
              className="absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 w-full h-full rounded-2xl pointer-events-none"
              style={{ border: "2px solid #C8A96B" }}
            />
            <div className="relative rounded-2xl overflow-hidden shadow-lg">
              <img
                src="/images/homepage/artisan-workshop.png"
                alt="Artisan workshop — traditional Indian gemstone craftsmanship"
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right side — story text */}
          <div
            className="transition-all duration-700"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateX(0)" : "translateX(40px)",
            }}
          >
            <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-primary mb-2">
              Our Story
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold font-display mb-6">
              From the Heart of India
            </h2>

            <p className="text-sm sm:text-base leading-relaxed text-muted-foreground mb-4">
              Natural gemstones have been part of India's heritage for centuries.
              At Gajanan Gems, every gemstone is carefully selected, polished,
              and crafted with attention to quality and authenticity.
            </p>
            <p className="text-sm sm:text-base leading-relaxed text-muted-foreground mb-8">
              Our goal is simple—to bring beautiful natural gemstones and
              handcrafted spiritual products to customers around the world while
              preserving traditional craftsmanship.
            </p>

            <Link
              to="/about-us"
              className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-medium transition-colors cursor-pointer border"
              style={{
                borderColor: "#3F5C45",
                color: "#3F5C45",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#3F5C45";
                e.currentTarget.style.color = "#FFFFFF";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#3F5C45";
              }}
            >
              Learn More →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
