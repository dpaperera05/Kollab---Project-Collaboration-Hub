import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import Steps from "@/components/sections/Steps";
import Features from "@/components/sections/Features";
import Mentors from "@/components/sections/Mentors";
import PortfolioProof from "@/components/sections/PortfolioProof";
import Simulations from "@/components/sections/Simulations";
import Testimonials from "@/components/sections/Testimonials";
import FinalCTA from "@/components/sections/FinalCTA";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Steps />
        <Features />
        <Mentors />
        <PortfolioProof />
        <Simulations />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
