import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import bracelets from "@/assets/hero-bracelets.jpg";
import tree from "@/assets/hero-tree.jpg";
import spheres from "@/assets/hero-spheres.jpg";

const slides = [
  { img: bracelets, title: "Bracelets", subtitle: "Best way to absorb the energy of crystals", cta: "Shop Bracelets", link: "/category/crystal-bracelets" },
  { img: tree, title: "Gemstone Trees", subtitle: "Bring prosperity & positivity home", cta: "Shop Trees", link: "/category/crystal-trees" },
  { img: spheres, title: "Crystal Spheres", subtitle: "Harmony in every facet", cta: "Shop Spheres", link: "/category/tumbled-stones" },
];

export function HeroSlider() {
  const navigate = useNavigate();
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative w-full overflow-hidden" style={{ backgroundColor: "#EFE8DC" }}>
      <div className="relative h-[420px] sm:h-[520px] md:h-[600px]">
        {slides.map((s, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-700 ${i === idx ? 'pointer-events-auto' : 'pointer-events-none'}`}
            style={{ opacity: i === idx ? 1 : 0 }}
            aria-hidden={i !== idx}
          >
            <img
              src={s.img}
              alt={s.title}
              className="absolute inset-0 w-full h-full object-cover"
              loading={idx === 0 ? "eager" : "lazy"}
            />
            <div className="absolute inset-0 md:via-transparent" style={{ background: "linear-gradient(to right, rgba(247,244,238,0.45) 0%, transparent 60%)" }} />
            <div className="relative max-w-7xl mx-auto h-full px-6 lg:px-12 flex items-center justify-end">
              <div className="max-w-md text-right md:text-left">
                <h1 className="text-5xl md:text-7xl font-semibold mb-4" style={{ color: "#2E2B26" }}>{s.title}</h1>
                <p className="text-lg md:text-xl mb-6" style={{ color: "rgba(46,43,38,0.80)" }}>{s.subtitle}</p>
                <button
                  onClick={() => navigate({ to: s.link })}
                  className="px-7 py-3 rounded-full font-medium transition-colors cursor-pointer"
                  style={{ backgroundColor: "#3F5C45", color: "#FFFFFF" }}
                  onMouseOver={e => (e.currentTarget.style.backgroundColor = "#56785D")}
                  onMouseOut={e => (e.currentTarget.style.backgroundColor = "#3F5C45")}
                >
                  {s.cta} →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setI((i - 1 + slides.length) % slides.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full p-2 shadow-md transition-colors"
        style={{ backgroundColor: "rgba(247,244,238,0.80)" }}
        onMouseOver={e => (e.currentTarget.style.backgroundColor = "#F7F4EE")}
        onMouseOut={e => (e.currentTarget.style.backgroundColor = "rgba(247,244,238,0.80)")}
        aria-label="Previous"
      >
        <ChevronLeft className="h-6 w-6" style={{ color: "#2E2B26" }} />
      </button>
      <button
        onClick={() => setI((i + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-2 shadow-md transition-colors"
        style={{ backgroundColor: "rgba(247,244,238,0.80)" }}
        onMouseOver={e => (e.currentTarget.style.backgroundColor = "#F7F4EE")}
        onMouseOut={e => (e.currentTarget.style.backgroundColor = "rgba(247,244,238,0.80)")}
        aria-label="Next"
      >
        <ChevronRight className="h-6 w-6" style={{ color: "#2E2B26" }} />
      </button>

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            className="h-2 rounded-full transition-all"
            style={{
              width: i === idx ? "2rem" : "0.5rem",
              backgroundColor: i === idx ? "#3F5C45" : "rgba(46,43,38,0.35)",
            }}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
