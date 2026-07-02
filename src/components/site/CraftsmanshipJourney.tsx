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
}

const steps: TimelineStep[] = [
  { label: "Raw Stone", icon: Mountain },
  { label: "Cutting", icon: Scissors },
  { label: "Polishing", icon: Sparkles },
  { label: "Matching", icon: Layers },
  { label: "Bracelet Making", icon: CircleDot },
  { label: "Packaging", icon: Package },
  { label: "Delivered", icon: Truck },
];

export function CraftsmanshipJourney() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="bg-background py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-14">
          <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-primary mb-2">
            The Process
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold font-display">
            Journey of a Gemstone
          </h2>
        </div>

        {/* Timeline */}
        <div ref={ref}>
          {/* ── Desktop: Horizontal ── */}
          <div className="hidden md:block">
            <div className="relative">
              {/* Background line */}
              <div
                className="absolute top-6 sm:top-7 left-0 right-0 bg-border"
                style={{ height: "2px" }}
              />

              {/* Filled progress line */}
              <div
                className="absolute top-6 sm:top-7 left-0 bg-primary"
                style={{
                  height: "2px",
                  width: isVisible ? "100%" : "0%",
                  transition: "width 1.8s cubic-bezier(0.22, 1, 0.36, 1)",
                  transitionDelay: isVisible ? "300ms" : "0ms",
                }}
              />

              {/* Steps */}
              <div className="relative grid grid-cols-7 gap-2">
                {steps.map((step, i) => {
                  const Icon = step.icon;
                  const delay = 300 + i * 200;

                  return (
                    <div
                      key={step.label}
                      className="flex flex-col items-center"
                    >
                      {/* Circle */}
                      <div
                        className={`h-12 w-12 sm:h-14 sm:w-14 rounded-full flex items-center justify-center border-2 relative z-10 transition-all duration-500 ${
                          isVisible
                            ? "bg-primary border-primary"
                            : "bg-background border-border"
                        }`}
                        style={{
                          transitionDelay: isVisible ? `${delay}ms` : "0ms",
                        }}
                      >
                        <Icon
                          className={`h-5 w-5 transition-colors duration-500 ${
                            isVisible
                              ? "text-white"
                              : "text-muted-foreground"
                          }`}
                          style={{
                            transitionDelay: isVisible
                              ? `${delay}ms`
                              : "0ms",
                          }}
                        />
                      </div>

                      {/* Label */}
                      <p
                        className={`mt-3 text-sm font-medium text-center transition-all duration-500 ${
                          isVisible
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-2"
                        }`}
                        style={{
                          transitionDelay: isVisible
                            ? `${delay + 100}ms`
                            : "0ms",
                        }}
                      >
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Mobile: Vertical ── */}
          <div className="md:hidden">
            <div className="relative pl-10 sm:pl-12">
              {/* Background line */}
              <div
                className="absolute left-5 sm:left-6 top-0 bottom-0 bg-border"
                style={{ width: "2px" }}
              />

              {/* Filled progress line */}
              <div
                className="absolute left-5 sm:left-6 top-0 bg-primary"
                style={{
                  width: "2px",
                  height: isVisible ? "100%" : "0%",
                  transition: "height 1.8s cubic-bezier(0.22, 1, 0.36, 1)",
                  transitionDelay: isVisible ? "300ms" : "0ms",
                }}
              />

              {/* Steps */}
              <div className="flex flex-col gap-8">
                {steps.map((step, i) => {
                  const Icon = step.icon;
                  const delay = 300 + i * 200;

                  return (
                    <div
                      key={step.label}
                      className="relative flex items-center gap-4"
                    >
                      {/* Circle — positioned over the vertical line */}
                      <div
                        className={`absolute -left-10 sm:-left-12 h-12 w-12 sm:h-14 sm:w-14 rounded-full flex items-center justify-center border-2 z-10 transition-all duration-500 ${
                          isVisible
                            ? "bg-primary border-primary"
                            : "bg-background border-border"
                        }`}
                        style={{
                          transitionDelay: isVisible ? `${delay}ms` : "0ms",
                          /* center the circle on the 2px line at left-5 (20px) */
                          transform: "translateX(-50%)",
                          left: "20px",
                        }}
                      >
                        <Icon
                          className={`h-5 w-5 transition-colors duration-500 ${
                            isVisible
                              ? "text-white"
                              : "text-muted-foreground"
                          }`}
                          style={{
                            transitionDelay: isVisible
                              ? `${delay}ms`
                              : "0ms",
                          }}
                        />
                      </div>

                      {/* Label */}
                      <p
                        className={`text-sm font-medium transition-all duration-500 ${
                          isVisible
                            ? "opacity-100 translate-x-0"
                            : "opacity-0 -translate-x-2"
                        }`}
                        style={{
                          transitionDelay: isVisible
                            ? `${delay + 100}ms`
                            : "0ms",
                        }}
                      >
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
