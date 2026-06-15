import React from "react";
import LockrHeader from "@/components/sections/lockr/LockrHeader";
import LockrHeroSection from "@/components/sections/lockr/LockrHeroSection";
import LockrSolutionsSection from "@/components/sections/lockr/LockrSolutionsSection";
import LockrProcessSection from "@/components/sections/lockr/LockrProcessSection";
import LockrTrustSection from "@/components/sections/lockr/LockrTrustSection";
import LockrTestimonialsSection from "@/components/sections/lockr/LockrTestimonialsSection";
import LockrPricingSection from "@/components/sections/lockr/LockrPricingSection";
import LockrFAQSection from "@/components/sections/lockr/LockrFAQSection";
import LockrFooter from "@/components/sections/lockr/LockrFooter";

const LandingPage: React.FC = () => {
  return (
    <div className="font-display text-lockr-on-surface antialiased flex flex-col min-h-screen bg-lockr-background">
      <LockrHeader />

      <main className="flex-grow">
        <LockrHeroSection />
        <LockrSolutionsSection />
        <LockrProcessSection />
        <LockrTrustSection />
        <LockrTestimonialsSection />
        <LockrPricingSection />
        <LockrFAQSection />
      </main>

      <LockrFooter />
    </div>
  );
};

export default LandingPage;
