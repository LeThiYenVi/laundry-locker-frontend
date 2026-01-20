import React from "react";
import Header from "@/components/layout/Header";
import HeroSection from "@/components/sections/HeroSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import CustomizationSection from "@/components/sections/CustomizationSection";
import AppleStyleLockerSection from "@/components/sections/AppleStyleLockerSection";
import FeedbackSection from "@/components/sections/FeedbackSection";
import AppleCardsSection from "@/components/sections/AppleCardsSection";
import StatsSection from "@/components/sections/StatsSection";
import PricingSection from "@/components/sections/PricingSection";
import TeamSection from "@/components/sections/TeamSection";
import CTASection from "@/components/sections/CTASection";
import VideoHeroSection from "@/components/sections/VideoHeroSection";
import VideoFeatureSection from "@/components/sections/VideoFeatureSection";
import VideoTechSection from "@/components/sections/VideoTechSection";
import TimelineSection from "@/components/sections/TimelineSection";
import FAQSection from "@/components/sections/FAQSection";
import NewsletterSection from "@/components/sections/NewsletterSection";
import TechnologySection from "@/components/sections/TechnologySection";
import PartnersSection from "@/components/sections/PartnersSection";
import SecuritySection from "@/components/sections/SecuritySection";
import ProcessSection from "@/components/sections/ProcessSection";
import ReviewsSection from "@/components/sections/ReviewsSection";
import AppleCardsShowcaseSection from "@/components/sections/AppleCardsShowcaseSection";
import DownloadAppSection from "@/components/sections/DownloadAppSection";

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <Header />

      {/* Section 1: Hero with Lock.R Gradient Text */}
      <HeroSection />

      {/* Section 2: Video Hero - Trải nghiệm tương lai */}
      <VideoHeroSection />

      {/* Section 3: Features/Highlights */}
      <FeaturesSection />

      {/* Section 3.5: Apple Cards Showcase - Giải pháp toàn diện */}
      <AppleCardsShowcaseSection />

      {/* Section 4: Process - How it Works */}
      <ProcessSection />

      {/* Section 5: Customization */}
      <CustomizationSection />

      {/* Section 6: Video Feature - An toàn tuyệt đối */}
      <VideoFeatureSection />

      {/* Section 7: Apple-Style Locker Showcase */}
      <AppleStyleLockerSection />

      {/* Section 8: Stats & Achievements */}
      <StatsSection />

      {/* Section 9: Technology Stack */}
      <TechnologySection />

      {/* Section 10: Video Tech - Sức mạnh công nghệ */}
      <VideoTechSection />

      {/* Section 11: Security & Trust */}
      <SecuritySection />

      {/* Section 12: Pricing Plans */}
      <PricingSection />

      {/* Section 13: Timeline Journey */}
      <TimelineSection />

      {/* Section 14: Reviews & Testimonials */}
      <ReviewsSection />

      {/* Section 15: Feedback with Masonry */}
      <FeedbackSection />

      {/* Section 16: Partners & Integrations */}
      <PartnersSection />

      {/* Section 17: Team & About */}
      <TeamSection />

      {/* Section 18: Apple Cards Carousel */}
      <AppleCardsSection />

      {/* Section 19: FAQ */}
      <FAQSection />

      {/* Section 20: Newsletter Signup */}
      <NewsletterSection />

      {/* Section 21: Download App */}
      <DownloadAppSection />

      {/* Section 22: Call to Action */}
      <CTASection />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-8 md:px-16 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Về chúng tôi</h3>
              <p className="text-gray-400">
                Giải pháp locker thông minh hàng đầu Việt Nam
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Sản phẩm</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Locker thông minh
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Ứng dụng di động
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Dashboard quản lý
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Hỗ trợ</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Trung tâm hỗ trợ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Tài liệu API
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Liên hệ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Theo dõi</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Facebook
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Twitter
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2026 Laundry Locker. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
