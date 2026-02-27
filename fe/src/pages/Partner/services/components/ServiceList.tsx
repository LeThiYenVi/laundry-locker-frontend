import { Card, CardContent, Badge } from "~/components/ui";
import type { PartnerService } from "@/types/partner.type";
import { getCategoryLabel, getCategoryBadge, formatCurrency } from "../utils/service-helpers";

interface ServiceListProps {
  services: PartnerService[];
}

export function ServiceList({ services }: ServiceListProps) {
  if (services.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-gray-500">
          Không có dịch vụ nào
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service) => (
        <Card key={service.id} className={service.isActive ? "" : "opacity-60"}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <Badge variant="outline" className={getCategoryBadge(service.category)}>
                {getCategoryLabel(service.category)}
              </Badge>
              <Badge variant={service.isActive ? "default" : "secondary"}>
                {service.isActive ? "Hoạt động" : "Tạm ngưng"}
              </Badge>
            </div>

            <h3 className="text-lg font-semibold mb-2">{service.name}</h3>
            <p className="text-sm text-gray-500 mb-4">{service.description}</p>

            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <div className="text-sm text-gray-500">Giá</div>
                <div className="text-xl font-bold text-blue-600">
                  {formatCurrency(service.price)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Đơn vị</div>
                <div className="font-medium">{service.unit}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
