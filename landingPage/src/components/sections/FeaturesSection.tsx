import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import {
  FiLock,
  FiShield,
  FiZap,
  FiCloud,
  FiSmartphone,
  FiTrendingUp,
} from "react-icons/fi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    icon: FiLock,
    title: "Bảo mật cao cấp",
    description: "Công nghệ khóa điện tử thông minh với mã hóa AES-256",
    color: "text-blue-500",
  },
  {
    icon: FiShield,
    title: "An toàn tuyệt đối",
    description: "Camera giám sát 24/7 và cảnh báo xâm nhập",
    color: "text-green-500",
  },
  {
    icon: FiZap,
    title: "Tự động hóa AI",
    description: "Quản lý thông minh với AI và IoT tiên tiến",
    color: "text-yellow-500",
  },
  {
    icon: FiCloud,
    title: "Đám mây tích hợp",
    description: "Đồng bộ dữ liệu real-time qua cloud",
    color: "text-purple-500",
  },
  {
    icon: FiSmartphone,
    title: "App di động",
    description: "Điều khiển mọi lúc, mọi nơi qua smartphone",
    color: "text-pink-500",
  },
  {
    icon: FiTrendingUp,
    title: "Báo cáo chi tiết",
    description: "Phân tích dữ liệu và tối ưu hiệu suất",
    color: "text-orange-500",
  },
];

const FeaturesSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const cards = sectionRef.current.querySelectorAll(".feature-card");

    gsap.fromTo(
      cards,
      {
        opacity: 0,
        y: 50,
        scale: 0.9,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
      },
    );
  }, []);

  return (
    <section ref={sectionRef} className="py-20 px-8 md:px-16 lg:px-24">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl p-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Điểm nổi bật
          </h2>
          <p className="text-lg text-gray-600">
            Những tính năng vượt trội của hệ thống Lock.R
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="feature-card border-2 hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-xl bg-gray-100 ${feature.color}`}
                  >
                    <feature.icon size={28} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
