import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Star, CheckCircle } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const reviews = [
  {
    rating: 5,
    text: "The bracelet quality exceeded my expectations. The stones are genuine and the craftsmanship is outstanding.",
    name: "Priya Mehta",
    city: "Ahmedabad",
    date: "Jan 2025",
  },
  {
    rating: 5,
    text: "Beautiful natural gemstones at very reasonable prices. Packaging was secure and delivery was fast.",
    name: "Rahul Verma",
    city: "Mumbai",
    date: "Feb 2025",
  },
  {
    rating: 5,
    text: "I ordered a custom bracelet and it turned out perfect. The team was very helpful throughout.",
    name: "Anjali Singh",
    city: "Delhi",
    date: "Mar 2025",
  },
  {
    rating: 5,
    text: "Excellent quality agate bracelet. The polishing is flawless and the colors are vibrant.",
    name: "Deepak Patel",
    city: "Surat",
    date: "Apr 2025",
  },
  {
    rating: 5,
    text: "Trusted shop for authentic gemstones. I've been a repeat customer for over 2 years now.",
    name: "Kavita Sharma",
    city: "Jaipur",
    date: "May 2025",
  },
  {
    rating: 5,
    text: "The tiger eye bracelet I received is stunning. Worth every rupee. Highly recommended!",
    name: "Arjun Reddy",
    city: "Hyderabad",
    date: "Jun 2025",
  },
] as const;

export function CustomerReviews() {
  const { ref, isVisible } = useScrollReveal();

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    slidesToScroll: 1,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi],
  );

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    onSelect();

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  return (
    <section className="bg-secondary/40 py-12 sm:py-16">
      <div
        ref={ref}
        className={`max-w-7xl mx-auto px-4 lg:px-6 transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-primary mb-2">
            Testimonials
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold font-display">
            What Our Customers Say
          </h2>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Arrows */}
          <button
            onClick={scrollPrev}
            className="absolute -left-2 sm:-left-4 top-1/2 -translate-y-1/2 z-10 rounded-full p-2 shadow-md transition-colors cursor-pointer"
            style={{ backgroundColor: "rgba(247,244,238,0.80)" }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#F7F4EE")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor =
                "rgba(247,244,238,0.80)")
            }
            aria-label="Previous review"
          >
            <ChevronLeft className="h-5 w-5" style={{ color: "#2E2B26" }} />
          </button>
          <button
            onClick={scrollNext}
            className="absolute -right-2 sm:-right-4 top-1/2 -translate-y-1/2 z-10 rounded-full p-2 shadow-md transition-colors cursor-pointer"
            style={{ backgroundColor: "rgba(247,244,238,0.80)" }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#F7F4EE")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor =
                "rgba(247,244,238,0.80)")
            }
            aria-label="Next review"
          >
            <ChevronRight className="h-5 w-5" style={{ color: "#2E2B26" }} />
          </button>

          {/* Embla viewport */}
          <div className="overflow-hidden mx-6 sm:mx-8" ref={emblaRef}>
            <div className="flex gap-4 sm:gap-6">
              {reviews.map((review) => (
                <div
                  key={review.name}
                  className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_calc(50%-12px)] lg:flex-[0_0_calc(33.333%-16px)]"
                >
                  <div className="bg-card rounded-2xl border border-border p-5 sm:p-6 h-full flex flex-col overflow-hidden relative">
                    {/* Gold top accent stripe */}
                    <div
                      className="absolute top-0 left-0 right-0 h-[3px]"
                      style={{ backgroundColor: "#C8A96B" }}
                    />

                    {/* Stars */}
                    <div className="flex gap-0.5 mb-4 mt-1">
                      {Array.from({ length: review.rating }).map((_, idx) => (
                        <Star
                          key={idx}
                          className="h-4 w-4"
                          fill="#C8A96B"
                          style={{ color: "#C8A96B" }}
                        />
                      ))}
                    </div>

                    {/* Review text */}
                    <p className="text-foreground text-sm sm:text-base leading-relaxed flex-1 mb-5">
                      &ldquo;{review.text}&rdquo;
                    </p>

                    {/* Customer info */}
                    <div>
                      <p className="font-semibold text-foreground">
                        {review.name}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {review.city}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: "#3F5C45",
                            color: "#FFFFFF",
                          }}
                        >
                          <CheckCircle className="h-3 w-3" />
                          Verified Buyer
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {review.date}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {scrollSnaps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => scrollTo(idx)}
              className="h-2 rounded-full transition-all cursor-pointer"
              style={{
                width: selectedIndex === idx ? "2rem" : "0.5rem",
                backgroundColor:
                  selectedIndex === idx ? "#3F5C45" : "rgba(46,43,38,0.35)",
              }}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
