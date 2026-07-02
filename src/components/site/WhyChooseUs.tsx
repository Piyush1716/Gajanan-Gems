import { Link } from "@tanstack/react-router";
import { CheckCircle } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const features = [
  "100% Natural Gemstones",
  "Carefully Handpicked",
  "Premium Quality Finish",
  "Secure Packaging",
  "Trusted by Thousands",
  "Affordable Pricing",
  "Fast Shipping",
  "Expert Customer Support",
] as const;

const images = [
  { src: "/images/homepage/gemologist-inspecting.png", alt: "Gemologist inspecting a gemstone" },
  { src: "/images/homepage/bracelet-crafting.png", alt: "Artisan crafting a bracelet" },
  { src: "/images/homepage/agate-polishing.png", alt: "Agate stone being polished" },
  { src: "/images/homepage/stone-cutting.png", alt: "Precision stone cutting" },
] as const;

function FeatureItem({ text, index }: { text: string; index: number }) {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });

  return (
    <div
      ref={ref}
      className="flex items-center gap-3 transition-all duration-500"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(12px)",
        transitionDelay: `${index * 80}ms`,
      }}
    >
      <CheckCircle
        className="h-5 w-5 shrink-0"
        style={{ color: "#3F5C45" }}
      />
      <span className="text-sm sm:text-base font-medium text-foreground">
        {text}
      </span>
    </div>
  );
}

export function WhyChooseUs() {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollReveal();

  return (
    <section className="bg-background py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div
          ref={sectionRef}
          className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center"
        >
          {/* Left column — text */}
          <div
            className="transition-all duration-700"
            style={{
              opacity: sectionVisible ? 1 : 0,
              transform: sectionVisible ? "translateX(0)" : "translateX(-30px)",
            }}
          >
            <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-primary mb-2">
              Why Choose Us
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold font-display mb-6 sm:mb-8">
              Why Choose Gajanan Gems?
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((f, i) => (
                <FeatureItem key={f} text={f} index={i} />
              ))}
            </div>

            <div className="mt-8 sm:mt-10">
              <Link
                to="/categories"
                className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-medium transition-colors cursor-pointer"
                style={{ backgroundColor: "#3F5C45", color: "#FFFFFF" }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#56785D")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "#3F5C45")
                }
              >
                Explore Collection →
              </Link>
            </div>
          </div>

          {/* Right column — 2×2 image grid */}
          <div
            className="grid grid-cols-2 gap-3 transition-all duration-700"
            style={{
              opacity: sectionVisible ? 1 : 0,
              transform: sectionVisible ? "translateX(0)" : "translateX(30px)",
            }}
          >
            {images.map((img) => (
              <div
                key={img.src}
                className="group aspect-square rounded-xl overflow-hidden"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
