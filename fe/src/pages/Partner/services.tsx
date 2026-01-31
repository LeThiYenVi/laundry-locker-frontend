import * as React from "react";
import { Briefcase, Clock, DollarSign, Info } from "lucide-react";
import { t } from "@/lib/i18n";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  EmptyData,
} from "~/components/ui";

// Mock services data - Partner can view but not manage services
// Services are managed by Admin
const DEFAULT_SERVICES = [
  {
    id: 1,
    name: "Giặt thường",
    category: "WASH",
    pricePerKg: 15000,
    processingTime: 24,
    description: "Dịch vụ giặt quần áo thường ngày",
  },
  {
    id: 2,
    name: "Giặt hấp",
    category: "WASH_IRON",
    pricePerKg: 25000,
    processingTime: 36,
    description: "Giặt và là ủi đồ",
  },
  {
    id: 3,
    name: "Giặt khô",
    category: "DRY_CLEAN",
    pricePerKg: 40000,
    processingTime: 48,
    description: "Giặt khô cho đồ cao cấp",
  },
  {
    id: 4,
    name: "Là ủi",
    category: "IRON",
    pricePerKg: 10000,
    processingTime: 12,
    description: "Chỉ là ủi, không giặt",
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  WASH: "Giặt thường",
  WASH_IRON: "Giặt hấp",
  DRY_CLEAN: "Giặt khô",
  IRON: "Là ủi",
  STORAGE: "Lưu trữ",
};

export default function PartnerServicesPage(): React.JSX.Element {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">{t("partner.services.title")}</h1>
        <p className="text-gray-600 mt-1">
          List of available laundry services
        </p>
      </div>

      {/* Info Alert */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="text-blue-600 mt-0.5" size={20} />
        <div>
          <p className="text-sm text-blue-800 font-medium">
            Service Information
          </p>
          <p className="text-sm text-blue-600 mt-1">
            {t("partner.services.info")}
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DEFAULT_SERVICES.map((service) => (
          <Card key={service.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{service.name}</CardTitle>
                <Badge variant="outline">
                  {CATEGORY_LABELS[service.category] || service.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">{service.description}</p>
              
              <div className="flex items-center gap-2 text-sm">
                <DollarSign size={16} className="text-green-600" />
                <span className="text-gray-600">Price:</span>
                <span className="font-medium">
                  {service.pricePerKg.toLocaleString()}đ/kg
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Clock size={16} className="text-blue-600" />
                <span className="text-gray-600">Processing time:</span>
                <span className="font-medium">{service.processingTime} hours</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Info */}
      <Card className="bg-gray-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Briefcase className="text-gray-600 mt-0.5" size={20} />
            <div>
              <h3 className="font-medium text-gray-900">Service Notes</h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-600 list-disc list-inside">
                <li>Prices are indicative and may vary per order</li>
                <li>Processing time may extend during holidays or weekends</li>
                <li>Premium items or special handling may incur additional fees</li>
                <li>Contact Admin if you need new services</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
