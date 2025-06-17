import HeroSection from "@/components/hero-section";
import BestSellingBooks from "@/components/best-selling-books";
import TrendingProducts from "@/components/trending-products";
import NewArrivals from "@/components/new-arrivals";
import Testimonials from "@/components/testimonials";
import ContactUs from "@/components/contact-us";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <BestSellingBooks />
      <TrendingProducts />
      <NewArrivals />
      <Testimonials />
      <ContactUs />
      <Footer />
    </div>
  );
}
