"use client";

import { LandingNav } from "./LandingNav";
import { Footer } from "./Footer";
import { HeroSection } from "./HeroSection";
import { FeaturesSection } from "./FeaturesSection";
import { AboutSection } from "./AboutSection";
import { BenefitsSection } from "./BenefitsSection";
import { CTASection } from "./CTASection";

function SectionDivider({ variant = "default" }: { variant?: "default" | "gradient" | "wave" }) {
  if (variant === "gradient") {
    return (
      <div className="relative h-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,hsl(var(--background))_70%)]" />
      </div>
    );
  }
  
  if (variant === "wave") {
    return (
      <div className="relative h-16 overflow-hidden">
        <svg
          className="absolute bottom-0 w-full h-full"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,60 C300,100 600,20 900,60 C1050,80 1150,40 1200,60 L1200,120 L0,120 Z"
            fill="hsl(var(--background))"
            className="opacity-50"
          />
          <path
            d="M0,80 C300,120 600,40 900,80 C1050,100 1150,60 1200,80 L1200,120 L0,120 Z"
            fill="hsl(var(--muted))"
            className="opacity-30"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="relative py-12">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border/50" />
      </div>
      <div className="relative flex justify-center">
        <div className="bg-background px-4">
          <div className="h-2 w-2 rounded-full bg-primary/50" />
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <main>
        <HeroSection />
        <SectionDivider variant="gradient" />
        <FeaturesSection />
        <SectionDivider variant="wave" />
        <AboutSection />
        <SectionDivider variant="gradient" />
        <BenefitsSection />
        <SectionDivider variant="default" />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
