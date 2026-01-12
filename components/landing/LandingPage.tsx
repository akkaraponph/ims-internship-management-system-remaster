"use client";

import { LandingNav } from "./LandingNav";
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
      <footer className="border-t border-border bg-muted/30 py-8 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © {new Date().getFullYear()} ระบบจัดการการฝึกงาน. สงวนลิขสิทธิ์.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">
                คุณสมบัติ
              </a>
              <a href="#about" className="hover:text-foreground transition-colors">
                เกี่ยวกับ
              </a>
              <a href="#benefits" className="hover:text-foreground transition-colors">
                ข้อดี
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
