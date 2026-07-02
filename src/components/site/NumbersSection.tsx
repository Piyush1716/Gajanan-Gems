import { useEffect, useRef, useState } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const stats = [
  { target: 25, suffix: "+", label: "Years Experience" },
  { target: 150, suffix: "+", label: "Gemstone Types" },
  { target: 15000, suffix: "+", label: "Happy Customers" },
  { target: 98, suffix: "%", label: "Positive Reviews" },
] as const;

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

function useCountUp(target: number, shouldStart: boolean, duration = 2000) {
  const [value, setValue] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!shouldStart || hasAnimated.current) return;
    hasAnimated.current = true;

    let startTime: number | null = null;
    let rafId: number;

    const animate = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);

      setValue(Math.round(easedProgress * target));

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafId);
  }, [shouldStart, target, duration]);

  return value;
}

function StatBlock({
  target,
  suffix,
  label,
  isVisible,
}: {
  target: number;
  suffix: string;
  label: string;
  isVisible: boolean;
}) {
  const count = useCountUp(target, isVisible);

  return (
    <div className="text-center">
      <p
        className="text-4xl sm:text-5xl md:text-6xl font-display font-bold"
        style={{ color: "#3F5C45" }}
      >
        {count.toLocaleString()}
        {suffix}
      </p>
      <div
        className="w-8 h-0.5 mx-auto mt-3 mb-2"
        style={{ backgroundColor: "#C8A96B" }}
      />
      <p className="text-sm sm:text-base text-muted-foreground mt-2">
        {label}
      </p>
    </div>
  );
}

export function NumbersSection() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="bg-background py-12 sm:py-16">
      <div
        ref={ref}
        className={`max-w-7xl mx-auto px-4 lg:px-6 transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">
          {stats.map((stat) => (
            <StatBlock
              key={stat.label}
              target={stat.target}
              suffix={stat.suffix}
              label={stat.label}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
