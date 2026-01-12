"use client";

import { LandingNav } from "./LandingNav";
import { Footer } from "./Footer";
import { HeroSection } from "./HeroSection";
import { FeaturesSection } from "./FeaturesSection";
import { AboutSection } from "./AboutSection";
import { BenefitsSection } from "./BenefitsSection";
import { CTASection } from "./CTASection";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <main>
        <HeroSection />
        <FeaturesSection />
        <AboutSection />
        <BenefitsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
