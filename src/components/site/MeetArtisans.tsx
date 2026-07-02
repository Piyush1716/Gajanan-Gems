import { useScrollReveal } from "@/hooks/useScrollReveal";

interface Artisan {
  name: string;
  specialty: string;
  experience: string;
  image: string;
  description: string;
}

const artisans: readonly Artisan[] = [
  {
    name: "Ramesh Patel",
    specialty: "Gemstone Polishing",
    experience: "18+ years",
    image: "/images/homepage/agate-polishing.png",
    description:
      "With decades of experience, Ramesh transforms raw stones into lustrous gems using traditional polishing techniques passed down through generations.",
  },
  {
    name: "Suresh Sharma",
    specialty: "Bracelet Crafting",
    experience: "15+ years",
    image: "/images/homepage/bracelet-crafting.png",
    description:
      "Suresh meticulously selects, matches, and strings each bead by hand, ensuring every bracelet has perfect symmetry and energy flow.",
  },
  {
    name: "Vikram Joshi",
    specialty: "Quality Inspection",
    experience: "12+ years",
    image: "/images/homepage/quality-inspection.png",
    description:
      "Vikram examines every finished product under magnification, guaranteeing that only flawless pieces reach our customers.",
  },
] as const;

function ArtisanCard({ artisan, index }: { artisan: Artisan; index: number }) {
  const { ref, isVisible } = useScrollReveal();

  return (
    <div
      ref={ref}
      className={`group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300 ${
        isVisible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-8 scale-95"
      }`}
      style={{
        transitionDelay: isVisible ? `${index * 150}ms` : "0ms",
        transitionDuration: "600ms",
        transitionProperty: "opacity, transform, box-shadow",
      }}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={artisan.image}
          alt={artisan.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Experience badge */}
        <span
          className="absolute top-3 left-3 text-[10px] sm:text-xs font-medium uppercase tracking-wider px-3 py-1 rounded-full"
          style={{ backgroundColor: "#3F5C45", color: "#FFFFFF" }}
        >
          {artisan.experience}
        </span>
      </div>

      {/* Text area */}
      <div className="p-5 sm:p-6">
        <h3 className="font-display text-lg sm:text-xl font-bold">
          {artisan.name}
        </h3>
        <p
          className="text-xs sm:text-sm font-medium mt-1"
          style={{ color: "#3F5C45" }}
        >
          {artisan.specialty}
        </p>
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
          {artisan.description}
        </p>
      </div>
    </div>
  );
}

export function MeetArtisans() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal();

  return (
    <section className="bg-background py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        {/* Section header */}
        <div
          ref={headerRef}
          className={`text-center mb-8 sm:mb-12 transition-all duration-600 ${
            headerVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6"
          }`}
        >
          <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-primary mb-2">
            OUR ARTISANS
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold font-display">
            Meet Our Artisans
          </h2>
          <p className="text-muted-foreground mt-3 text-sm sm:text-base max-w-xl mx-auto">
            The skilled craftsmen behind every gemstone piece
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {artisans.map((artisan, index) => (
            <ArtisanCard key={artisan.name} artisan={artisan} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
