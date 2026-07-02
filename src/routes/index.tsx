import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { HeroSlider } from "@/components/site/HeroSlider";
import { ValueProps } from "@/components/site/ValueProps";
import { TopCategories } from "@/components/site/TopCategories";
import { FeaturedProducts } from "@/components/site/FeaturedProducts";
import { WhyChooseUs } from "@/components/site/WhyChooseUs";
import { OurStory } from "@/components/site/OurStory";
import { MeetArtisans } from "@/components/site/MeetArtisans";
import { OurCraftsmanship } from "@/components/site/OurCraftsmanship";
import { AuthenticityPromise } from "@/components/site/AuthenticityPromise";
import { CraftsmanshipJourney } from "@/components/site/CraftsmanshipJourney";
import { CustomerReviews } from "@/components/site/CustomerReviews";
import { NumbersSection } from "@/components/site/NumbersSection";
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
        <ValueProps />
        <TopCategories />
        <FeaturedProducts />
        <WhyChooseUs />
        <OurStory />
        <MeetArtisans />
        <OurCraftsmanship />
        <AuthenticityPromise />
        <CraftsmanshipJourney />
        <CustomerReviews />
        <NumbersSection />
      </main>
      <Footer />
    </div>
  );
}
