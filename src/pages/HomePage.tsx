import Navbar from '@/components/layout/Navbar';
import HeroSection from '@/components/features/HeroSection';
import TickerBanner from '@/components/features/TickerBanner';
import PersonasSection from '@/components/features/PersonasSection';
import HowItWorksSection from '@/components/features/HowItWorksSection';
import FeaturesSection from '@/components/features/FeaturesSection';
import IntensitySection from '@/components/features/IntensitySection';
import StatsSection from '@/components/features/StatsSection';
import CTASection from '@/components/features/CTASection';
import Footer from '@/components/layout/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0c0c14]">
      <Navbar />
      <HeroSection />
      <TickerBanner />
      <PersonasSection />
      <HowItWorksSection />
      <FeaturesSection />
      <IntensitySection />
      <StatsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
