import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export function OurCraftsmanship() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="bg-secondary/40 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div
          ref={ref}
          className={`grid md:grid-cols-2 gap-8 lg:gap-16 items-center transition-all duration-700 ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          {/* Left — Image */}
          <div className="group rounded-2xl overflow-hidden shadow-lg">
            <img
              src="/images/homepage/gemologist-inspecting.png"
              alt="Gemologist carefully inspecting a gemstone"
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* Right — Text */}
          <div>
            <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-primary mb-2">
              CRAFTSMANSHIP
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold font-display">
              Every Stone Has a Journey
            </h2>

            <p className="text-muted-foreground mt-4 sm:mt-6 leading-relaxed text-sm sm:text-base">
              From raw gemstone selection to hand polishing, drilling, bead
              matching, stringing, and final inspection, every product is
              prepared with precision and care.
            </p>
            <p className="text-muted-foreground mt-4 leading-relaxed text-sm sm:text-base">
              Our artisans combine centuries-old techniques with modern quality
              standards, ensuring each piece carries the authentic beauty of
              natural gemstones.
            </p>

            <Link
              to="/about-us"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-medium transition-colors mt-6 sm:mt-8 text-sm sm:text-base"
              style={{ backgroundColor: "#3F5C45", color: "#FFFFFF" }}
              onMouseOver={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = "#334D39";
              }}
              onMouseOut={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = "#3F5C45";
              }}
            >
              Discover the Process
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
