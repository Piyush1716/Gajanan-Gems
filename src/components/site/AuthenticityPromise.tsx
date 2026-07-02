import { Gem, Eye, Package, BadgeCheck } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const promises = [
  { icon: Gem, value: "100%", label: "Natural Stones" },
  { icon: Eye, value: "Hand", label: "Inspected" },
  { icon: Package, value: "Secure", label: "Packaging" },
  { icon: BadgeCheck, value: "Quality", label: "Checked" },
] as const;

export function AuthenticityPromise() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section
      className="py-16 sm:py-20"
      style={{ backgroundColor: "#24110D", color: "#F8F3EE" }}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        {/* Header */}
        <div ref={ref} className="text-center mb-12 sm:mb-14">
          <p
            className={`text-xs sm:text-sm uppercase tracking-[0.3em] mb-2 transition-all duration-700 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
            style={{ color: "#C8A96B" }}
          >
            Our Promise
          </p>
          <h2
            className={`font-display text-3xl sm:text-4xl md:text-5xl font-semibold transition-all duration-700 delay-100 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            Authenticity Promise
          </h2>
          <p
            className={`mt-4 text-base sm:text-lg max-w-xl mx-auto transition-all duration-700 delay-200 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
            style={{ color: "rgba(248,243,238,0.70)" }}
          >
            Every gemstone comes with our guarantee of authenticity and quality
          </p>
        </div>

        {/* Promise Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {promises.map((item, i) => (
            <div
              key={item.label}
              className={`flex flex-col items-center text-center px-4 py-8 sm:py-10 rounded-2xl transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              }`}
              style={{
                transitionDelay: isVisible ? `${300 + i * 150}ms` : "0ms",
              }}
            >
              {/* Icon Circle */}
              <div
                className="h-14 w-14 rounded-full flex items-center justify-center mb-5"
                style={{ backgroundColor: "rgba(248,243,238,0.10)" }}
              >
                <item.icon
                  className="h-6 w-6"
                  style={{ color: "#C8A96B" }}
                />
              </div>

              {/* Separator */}
              <div
                className="w-8 mb-5"
                style={{
                  height: "1px",
                  backgroundColor: "#C8A96B",
                  opacity: 0.3,
                }}
              />

              {/* Value */}
              <p className="font-display text-2xl sm:text-3xl font-bold mb-1">
                {item.value}
              </p>

              {/* Label */}
              <p
                className="text-sm sm:text-base"
                style={{ color: "rgba(248,243,238,0.70)" }}
              >
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
