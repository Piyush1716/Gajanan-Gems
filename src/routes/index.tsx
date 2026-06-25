import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { HeroSlider } from "@/components/site/HeroSlider";
import { OfferStrip } from "@/components/site/OfferStrip";
import { ValueProps } from "@/components/site/ValueProps";
import { TopCategories } from "@/components/site/TopCategories";
import { OffersSection } from "@/components/site/OffersSection";
import { FlashSaleSection } from "@/components/site/FlashSaleSection";
import { FeaturedProducts } from "@/components/site/FeaturedProducts";
import { BestDealsSection } from "@/components/site/BestDealsSection";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main>
        <HeroSlider />
        <OfferStrip />
        <ValueProps />
        <TopCategories />
        <OffersSection />
        <FlashSaleSection />
        <FeaturedProducts />
        <BestDealsSection />
      </main>
      <Footer />
    </div>
  );
}
