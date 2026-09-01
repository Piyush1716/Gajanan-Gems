import {
  Mountain,
  Scissors,
  Sparkles,
  Layers,
  CircleDot,
  Package,
  Truck,
} from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import type { LucideIcon } from "lucide-react";

interface TimelineStep {
  label: string;
  icon: LucideIcon;
  image: string;
  description: string;
  detail: string;
}

const steps: TimelineStep[] = [
  {
    label: "Raw Stone Selection",
    icon: Mountain,
    image: "/images/homepage/journey-raw-stone.png",
    description: "Sourcing the Finest",
    detail:
      "We personally source raw gemstones from trusted mines across India — from the agates of Gujarat to the amethysts of Rajasthan. Each stone is handpicked for its natural color, clarity, and energy.",
  },
  {
    label: "Precision Cutting",
    icon: Scissors,
    image: "/images/homepage/journey-cutting.png",
    description: "Shaping with Care",
    detail:
      "Expert lapidaries cut each stone into perfect bead shapes using diamond-tipped tools and water-cooled saws. This step requires years of experience to preserve the stone's natural beauty.",
  },
  {
    label: "Hand Polishing",
    icon: Sparkles,
    image: "/images/homepage/journey-polishing.png",
    description: "Revealing the Lustre",
    detail:
      "Every bead is polished by hand on felt wheels using traditional techniques. Multiple polishing stages bring out the stone's natural shine, patterns, and depth of color.",
  },
  {
    label: "Bead Matching",
    icon: Layers,
    image: "/images/homepage/journey-matching.png",
    description: "Perfectly Paired",
    detail:
      "Our artisans sort and grade thousands of beads by size, color intensity, and pattern. Each bracelet uses beads that complement each other for a harmonious, balanced look.",
  },
  {
    label: "Bracelet Crafting",
    icon: CircleDot,
    image: "/images/homepage/journey-bracelet.png",
    description: "Strung with Intention",
    detail:
      "Beads are carefully threaded onto premium elastic cord with proper tension and spacing. Each bracelet is tied with a secure double knot and tested for durability.",
  },
  {
    label: "Premium Packaging",
    icon: Package,
    image: "/images/homepage/journey-packaging.png",
    description: "Wrapped with Love",
    detail:
      "Every piece is placed in a branded gift box with protective cushioning and a certificate of authenticity. We ensure your gemstone arrives in perfect condition.",
  },
  {
    label: "Delivered to You",
    icon: Truck,
    image: "/images/homepage/journey-delivered.png",
    description: "At Your Doorstep",
    detail:
      "Shipped securely with tracking and insurance across India. From our workshop to your doorstep, every step is handled with care and attention.",
  },
];

function JourneyStep({
  step,
  index,
  isVisible,
}: {
  step: TimelineStep;
  index: number;
  isVisible: boolean;
}) {
  const Icon = step.icon;
  const delay = 200 + index * 180;
  const isEven = index % 2 === 0;

  return (
    <>
      {/* ── Desktop card (alternating top/bottom) ── */}
      <div className="hidden lg:flex flex-col items-center relative">
        {/* Card — alternates above/below the timeline */}
        <div
          className={`flex flex-col w-full transition-all duration-700 ease-out ${
            isEven ? "order-first mb-6" : "order-last mt-6"
          } ${
            isVisible
              ? "opacity-100 translate-y-0"
              : isEven
                ? "opacity-0 -translate-y-6"
                : "opacity-0 translate-y-6"
          }`}
          style={{ transitionDelay: isVisible ? `${delay + 100}ms` : "0ms" }}
        >
          {/* Image */}
          <div className="rounded-xl overflow-hidden aspect-[4/3] bg-secondary mb-3 group">
            <img
              src={step.image}
              alt={step.label}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            />
          </div>
          {/* Text */}
          <p
            className="text-[11px] uppercase tracking-widest font-medium mb-1"
            style={{ color: "#C8A96B" }}
          >
            {step.description}
          </p>
          <h4 className="font-display text-sm font-semibold text-foreground mb-1.5">
            {step.label}
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
            {step.detail}
          </p>
        </div>

        {/* Circle on the timeline */}
        <div
          className={`h-11 w-11 rounded-full flex items-center justify-center border-2 relative z-10 transition-all duration-600 ease-out shrink-0 ${
            isEven ? "order-last" : "order-first"
          } ${
            isVisible
              ? "bg-primary border-primary shadow-lg"
              : "bg-background border-border"
          }`}
          style={{
            transitionDelay: isVisible ? `${delay}ms` : "0ms",
            boxShadow: isVisible
              ? "0 0 0 4px rgba(63,92,69,0.15)"
              : "none",
          }}
        >
          <Icon
            className={`h-4 w-4 transition-colors duration-500 ${
              isVisible ? "text-white" : "text-muted-foreground"
            }`}
            style={{ transitionDelay: isVisible ? `${delay}ms` : "0ms" }}
          />
        </div>

        {/* Step number badge */}
        <span
          className={`absolute text-[10px] font-bold transition-all duration-500 ${
            isEven ? "bottom-[-22px]" : "top-[-22px]"
          } ${isVisible ? "opacity-60" : "opacity-0"}`}
          style={{
            color: "#C8A96B",
            transitionDelay: isVisible ? `${delay + 200}ms` : "0ms",
          }}
        >
          0{index + 1}
        </span>
      </div>

      {/* ── Tablet card (horizontal layout) ── */}
      <div
        className="hidden sm:flex lg:hidden gap-4 items-start transition-all duration-700 ease-out"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateX(0)" : "translateX(-20px)",
          transitionDelay: isVisible ? `${delay}ms` : "0ms",
        }}
      >
        {/* Circle */}
        <div className="flex flex-col items-center shrink-0 relative">
          <div
            className={`h-12 w-12 rounded-full flex items-center justify-center border-2 z-10 transition-all duration-600 ${
              isVisible
                ? "bg-primary border-primary"
                : "bg-background border-border"
            }`}
            style={{
              transitionDelay: isVisible ? `${delay}ms` : "0ms",
              boxShadow: isVisible ? "0 0 0 4px rgba(63,92,69,0.12)" : "none",
            }}
          >
            <Icon
              className={`h-5 w-5 transition-colors duration-500 ${
                isVisible ? "text-white" : "text-muted-foreground"
              }`}
              style={{ transitionDelay: isVisible ? `${delay}ms` : "0ms" }}
            />
          </div>
          {/* Vertical connector */}
          {index < steps.length - 1 && (
            <div
              className="w-0.5 flex-1 mt-2 bg-border min-h-[40px]"
              style={{
                background: isVisible
                  ? "linear-gradient(to bottom, #3F5C45, #DDD6CB)"
                  : undefined,
              }}
            />
          )}
        </div>

        {/* Content card */}
        <div className="flex-1 pb-8">
          <div className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-shadow duration-300">
            {/* Image */}
            <div className="aspect-[16/9] overflow-hidden group">
              <img
                src={step.image}
                alt={step.label}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            {/* Text */}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className="text-[10px] uppercase tracking-widest font-semibold"
                  style={{ color: "#C8A96B" }}
                >
                  Step {index + 1}
                </span>
                <span
                  className="text-[10px] uppercase tracking-wider font-medium"
                  style={{ color: "#C8A96B" }}
                >
                  — {step.description}
                </span>
              </div>
              <h4 className="font-display text-base font-semibold text-foreground mb-2">
                {step.label}
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.detail}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile card (compact vertical) ── */}
      <div
        className="sm:hidden flex gap-3 items-start transition-all duration-600 ease-out"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(16px)",
          transitionDelay: isVisible ? `${delay}ms` : "0ms",
        }}
      >
        {/* Circle + connector */}
        <div className="flex flex-col items-center shrink-0">
          <div
            className={`h-10 w-10 rounded-full flex items-center justify-center border-2 z-10 transition-all duration-500 ${
              isVisible
                ? "bg-primary border-primary"
                : "bg-background border-border"
            }`}
            style={{
              transitionDelay: isVisible ? `${delay}ms` : "0ms",
              boxShadow: isVisible ? "0 0 0 3px rgba(63,92,69,0.12)" : "none",
            }}
          >
            <Icon
              className={`h-4 w-4 transition-colors duration-500 ${
                isVisible ? "text-white" : "text-muted-foreground"
              }`}
            />
          </div>
          {/* Vertical line */}
          {index < steps.length - 1 && (
            <div
              className="w-0.5 flex-1 mt-1.5 min-h-[20px]"
              style={{
                backgroundColor: isVisible ? "#3F5C45" : "#DDD6CB",
                transition: "background-color 0.5s ease",
                transitionDelay: isVisible ? `${delay + 200}ms` : "0ms",
              }}
            />
          )}
        </div>

        {/* Card */}
        <div className="flex-1 pb-5">
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            {/* Image */}
            <div className="aspect-[2/1] overflow-hidden">
              <img
                src={step.image}
                alt={step.label}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-3">
              <span
                className="text-[9px] uppercase tracking-widest font-semibold"
                style={{ color: "#C8A96B" }}
              >
                Step {index + 1} — {step.description}
              </span>
              <h4 className="font-display text-sm font-semibold text-foreground mt-0.5 mb-1">
                {step.label}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {step.detail}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function CraftsmanshipJourney() {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.05 });

  return (
    <section className="bg-background py-12 sm:py-16 lg:py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        {/* Header */}
        <div
          className={`text-center mb-10 sm:mb-14 transition-all duration-700 ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6"
          }`}
        >
          <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-primary mb-2">
            The Process
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold font-display">
            Journey of a Gemstone
          </h2>
          <p className="text-muted-foreground mt-3 text-sm sm:text-base max-w-2xl mx-auto">
            From deep within the earth to your doorstep — every gemstone passes
            through 7 meticulous stages of craftsmanship before it becomes a
            Cambay Crystal product.
          </p>
        </div>

        {/* Timeline container */}
        <div ref={ref}>
          {/* ── Desktop: Horizontal alternating timeline ── */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Horizontal connecting line (runs through the middle of circles) */}
              <div
                className="absolute left-0 right-0 bg-border"
                style={{
                  height: "2px",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
              {/* Animated fill line */}
              <div
                className="absolute left-0 bg-primary"
                style={{
                  height: "2px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: isVisible ? "100%" : "0%",
                  transition:
                    "width 2.2s cubic-bezier(0.22, 1, 0.36, 1)",
                  transitionDelay: isVisible ? "400ms" : "0ms",
                }}
              />

              {/* Steps grid */}
              <div className="relative grid grid-cols-7 gap-3">
                {steps.map((step, i) => (
                  <JourneyStep
                    key={step.label}
                    step={step}
                    index={i}
                    isVisible={isVisible}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ── Tablet: Vertical cards with timeline ── */}
          <div className="hidden sm:block lg:hidden">
            <div className="max-w-xl mx-auto">
              {steps.map((step, i) => (
                <JourneyStep
                  key={step.label}
                  step={step}
                  index={i}
                  isVisible={isVisible}
                />
              ))}
            </div>
          </div>

          {/* ── Mobile: Compact vertical cards ── */}
          <div className="sm:hidden">
            {steps.map((step, i) => (
              <JourneyStep
                key={step.label}
                step={step}
                index={i}
                isVisible={isVisible}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
