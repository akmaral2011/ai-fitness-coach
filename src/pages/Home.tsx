import FadeIn from '@/components/FadeIn';
import CTABanner from '@/components/landing/CTABanner';
import FAQ from '@/components/landing/FAQ';
import Features from '@/components/landing/Features';
import Footer from '@/components/landing/Footer';
import Hero from '@/components/landing/Hero';
import HowItWorks from '@/components/landing/HowItWorks';
import Navbar from '@/components/landing/Navbar';
import Pricing from '@/components/landing/Pricing';
import Problem from '@/components/landing/Problem';
import Stats from '@/components/landing/Stats';
import Testimonials from '@/components/landing/Testimonials';
import AuthModal from '@/features/auth/AuthModal';
import { useAuthStore } from '@/features/auth/authStore';

export default function Home() {
  const authModalOpen = useAuthStore(s => s.authModalOpen);

  return (
    <div className="bg-background text-foreground min-h-screen antialiased" id="hero">
      <Navbar />
      <Hero />
      <FadeIn>
        <Stats />
      </FadeIn>
      <FadeIn delay={50}>
        <Problem />
      </FadeIn>
      <FadeIn delay={50}>
        <Features />
      </FadeIn>
      <FadeIn delay={50}>
        <HowItWorks />
      </FadeIn>
      <FadeIn delay={50}>
        <Pricing />
      </FadeIn>
      <FadeIn delay={50}>
        <Testimonials />
      </FadeIn>
      <FadeIn delay={50}>
        <FAQ />
      </FadeIn>
      <FadeIn delay={50}>
        <CTABanner />
      </FadeIn>
      <Footer />
      {authModalOpen && <AuthModal />}
    </div>
  );
}
