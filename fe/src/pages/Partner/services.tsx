import * as React from "react";
import {
  Card,
  CardContent,
  Button,
  PageLoading,
  Input,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { PartnerService } from "@/types";

export default function PartnerServicesPage(): React.JSX.Element {
  const [isLoading, setIsLoading] = React.useState(true);
  const [services, setServices] = React.useState<PartnerService[]>([]);
  const [filterCategory, setFilterCategory] = React.useState<string>("ALL");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  // Form state for new service
  const [formData, setFormData] = React.useState({
    name: "",
    category: "",
    basePrice: "",
    pricePerKg: "",
    processingTime: "",
    description: "",
  });

  React.useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 800));

        const mockServices: PartnerService[] = [
          {
            id: 1,
            name: "Giặt thường",
            category: "WASH",
            basePrice: 30000,
            pricePerKg: 15000,
            processingTime: 24,
            isActive: true,
            description: "Dịch vụ giặt quần áo thường ngày",
          },
          {
            id: 2,
            name: "Giặt hấp",
            category: "WASH_IRON",
            basePrice: 50000,
            pricePerKg: 25000,
            processingTime: 36,
            isActive: true,
            description: "Giặt và là ủi đồ",
          },
          {
            id: 3,
            name: "Giặt khô",
            category: "DRY_CLEAN",
            basePrice: 80000,
            pricePerKg: 40000,
            processingTime: 48,
            isActive: true,
            description: "Giặt khô cho đồ cao cấp",
          },
          {
            id: 4,
            name: "Là ủi",
            category: "IRON",
            basePrice: 20000,
            pricePerKg: 10000,
            processingTime: 12,
            isActive: true,
            description: "Chỉ là ủi, không giặt",
          },
          {
            id: 5,
            name: "Giặt chăn màn",
            category: "WASH",
            basePrice: 100000,
            pricePerKg: 30000,
            processingTime: 48,
            isActive: false,
            description: "Giặt chăn gối, màn cửa",
          },
          {
            id: 6,
            name: "Giặt giày dép",
            category: "SPECIAL",
            basePrice: 50000,
            pricePerKg: 0,
            processingTime: 24,
            isActive: true,
            description: "Vệ sinh giày, dép",
          },
        ];

        setServices(mockServices);
      } catch (err) {
        console.error("Lỗi khi tải danh sách dịch vụ:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "WASH":
        return "Giặt";
      case "WASH_IRON":
        return "Giặt hấp";
      case "DRY_CLEAN":
        return "Giặt khô";
      case "IRON":
        return "Là ủi";
      case "SPECIAL":
        return "Đặc biệt";
      default:
        return category;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "WASH":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "WASH_IRON":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "DRY_CLEAN":
        return "bg-pink-100 text-pink-700 border-pink-200";
      case "IRON":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "SPECIAL":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const filteredServices = React.useMemo(() => {
    if (filterCategory === "ALL") return services;
    return services.filter((service) => service.category === filterCategory);
  }, [services, filterCategory]);

  const activeServices = services.filter((s) => s.isActive).length;
  const totalRevenue = services
    .filter((s) => s.isActive)
    .reduce((sum, s) => sum + s.basePrice, 0);

  const handleToggleActive = (serviceId: number) => {
    setServices((prev) =>
      prev.map((service) =>
        service.id === serviceId
          ? { ...service, isActive: !service.isActive }
          : service,
      ),
    );
  };

  const handleAddService = () => {
    const newService: PartnerService = {
      id: services.length + 1,
      name: formData.name,
      category: formData.category as any,
      basePrice: parseFloat(formData.basePrice),
      pricePerKg: parseFloat(formData.pricePerKg),
      processingTime: parseInt(formData.processingTime),
      isActive: true,
      description: formData.description,
    };

    setServices([...services, newService]);
    setIsDialogOpen(false);
    setFormData({
      name: "",
      category: "",
      basePrice: "",
      pricePerKg: "",
      processingTime: "",
      description: "",
    });
  };

  if (isLoading) {
    return <PageLoading message="Đang tải danh sách dịch vụ..." />;
  }

  return (
    <div className="min-h-screen bg-[#FAFCFF] p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#326B9C]">
              Quản lý Dịch vụ
            </h1>
            <p className="text-[#7BAAD1] mt-1">
              Cài đặt và quản lý các dịch vụ giặt ủi
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#326B9C] hover:bg-[#7BAAD1] text-white font-semibold">
                + Thêm dịch vụ
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-white">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-[#326B9C]">
                  Thêm dịch vụ mới
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#7BAAD1] font-medium">
                      Tên dịch vụ
                    </Label>
                    <Input
                      placeholder="VD: Giặt thường"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="border-[#B0C8DA] bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#7BAAD1] font-medium">
                      Loại dịch vụ
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger className="border-[#B0C8DA] bg-white">
                        <SelectValue placeholder="Chọn loại" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-[#E8E9EB]">
                        <SelectItem
                          value="WASH"
                          className="hover:bg-[#FAFCFF] focus:bg-[#FAFCFF]"
                        >
                          Giặt
                        </SelectItem>
                        <SelectItem
                          value="WASH_IRON"
                          className="hover:bg-[#FAFCFF] focus:bg-[#FAFCFF]"
                        >
                          Giặt hấp
                        </SelectItem>
                        <SelectItem
                          value="DRY_CLEAN"
                          className="hover:bg-[#FAFCFF] focus:bg-[#FAFCFF]"
                        >
                          Giặt khô
                        </SelectItem>
                        <SelectItem
                          value="IRON"
                          className="hover:bg-[#FAFCFF] focus:bg-[#FAFCFF]"
                        >
                          Là ủi
                        </SelectItem>
                        <SelectItem
                          value="SPECIAL"
                          className="hover:bg-[#FAFCFF] focus:bg-[#FAFCFF]"
                        >
                          Đặc biệt
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#7BAAD1] font-medium">
                      Giá cơ bản (VNĐ)
                    </Label>
                    <Input
                      type="number"
                      placeholder="30000"
                      value={formData.basePrice}
                      onChange={(e) =>
                        setFormData({ ...formData, basePrice: e.target.value })
                      }
                      className="border-[#B0C8DA] bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#7BAAD1] font-medium">
                      Giá/kg (VNĐ)
                    </Label>
                    <Input
                      type="number"
                      placeholder="15000"
                      value={formData.pricePerKg}
                      onChange={(e) =>
                        setFormData({ ...formData, pricePerKg: e.target.value })
                      }
                      className="border-[#B0C8DA] bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[#7BAAD1] font-medium">
                    Thời gian xử lý (giờ)
                  </Label>
                  <Input
                    type="number"
                    placeholder="24"
                    value={formData.processingTime}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        processingTime: e.target.value,
                      })
                    }
                    className="border-[#B0C8DA] bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#7BAAD1] font-medium">Mô tả</Label>
                  <Input
                    placeholder="Mô tả ngắn về dịch vụ..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="border-[#B0C8DA] bg-white"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => setIsDialogOpen(false)}
                    variant="outline"
                    className="flex-1 border-[#B0C8DA]"
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={handleAddService}
                    className="flex-1 bg-[#326B9C] hover:bg-[#7BAAD1] text-white"
                  >
                    Thêm dịch vụ
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-[#E8E9EB]">
            <CardContent className="p-6">
              <div className="text-sm text-[#7BAAD1] mb-2">Tổng dịch vụ</div>
              <div className="text-3xl font-bold text-[#326B9C]">
                {services.length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E8E9EB]">
            <CardContent className="p-6">
              <div className="text-sm text-[#7BAAD1] mb-2">Đang hoạt động</div>
              <div className="text-3xl font-bold text-green-600">
                {activeServices}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E8E9EB]">
            <CardContent className="p-6">
              <div className="text-sm text-[#7BAAD1] mb-2">Tạm ngưng</div>
              <div className="text-3xl font-bold text-red-600">
                {services.length - activeServices}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E8E9EB]">
            <CardContent className="p-6">
              <div className="text-sm text-[#7BAAD1] mb-2">Tổng giá cơ bản</div>
              <div className="text-2xl font-bold text-[#326B9C]">
                {formatCurrency(totalRevenue)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <Card className="border-[#E8E9EB]">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Label className="text-[#7BAAD1] font-medium whitespace-nowrap">
                Lọc theo loại:
              </Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="max-w-xs border-[#B0C8DA] bg-white">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E8E9EB]">
                  <SelectItem
                    value="ALL"
                    className="hover:bg-[#FAFCFF] focus:bg-[#FAFCFF]"
                  >
                    Tất cả
                  </SelectItem>
                  <SelectItem
                    value="WASH"
                    className="hover:bg-[#FAFCFF] focus:bg-[#FAFCFF]"
                  >
                    Giặt
                  </SelectItem>
                  <SelectItem
                    value="WASH_IRON"
                    className="hover:bg-[#FAFCFF] focus:bg-[#FAFCFF]"
                  >
                    Giặt hấp
                  </SelectItem>
                  <SelectItem
                    value="DRY_CLEAN"
                    className="hover:bg-[#FAFCFF] focus:bg-[#FAFCFF]"
                  >
                    Giặt khô
                  </SelectItem>
                  <SelectItem
                    value="IRON"
                    className="hover:bg-[#FAFCFF] focus:bg-[#FAFCFF]"
                  >
                    Là ủi
                  </SelectItem>
                  <SelectItem
                    value="SPECIAL"
                    className="hover:bg-[#FAFCFF] focus:bg-[#FAFCFF]"
                  >
                    Đặc biệt
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <Card
              key={service.id}
              className="border-[#E8E9EB] hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-[#326B9C] mb-2">
                      {service.name}
                    </h3>
                    <Badge
                      variant="outline"
                      className={getCategoryBadge(service.category)}
                    >
                      {getCategoryLabel(service.category)}
                    </Badge>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      service.isActive
                        ? "bg-green-100 text-green-700 border-green-200"
                        : "bg-gray-100 text-gray-700 border-gray-200"
                    }
                  >
                    {service.isActive ? "Hoạt động" : "Tạm ngưng"}
                  </Badge>
                </div>

                {/* Description */}
                <p className="text-sm text-[#7BAAD1] line-clamp-2">
                  {service.description}
                </p>

                {/* Pricing */}
                <div className="space-y-2 pt-2 border-t border-[#E8E9EB]">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#7BAAD1]">Giá cơ bản:</span>
                    <span className="font-bold text-[#326B9C]">
                      {formatCurrency(service.basePrice)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#7BAAD1]">Giá/kg:</span>
                    <span className="font-bold text-[#326B9C]">
                      {formatCurrency(service.pricePerKg)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#7BAAD1]">
                      Thời gian xử lý:
                    </span>
                    <span className="font-semibold text-[#326B9C]">
                      {service.processingTime}h
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-[#B0C8DA]"
                    onClick={() => alert(`Chỉnh sửa dịch vụ: ${service.name}`)}
                  >
                    Chỉnh sửa
                  </Button>
                  <Button
                    className={`flex-1 ${
                      service.isActive
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-green-500 hover:bg-green-600"
                    } text-white`}
                    onClick={() => handleToggleActive(service.id)}
                  >
                    {service.isActive ? "Tắt" : "Bật"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <Card className="border-[#E8E9EB]">
            <CardContent className="p-12 text-center">
              <p className="text-[#7BAAD1]">Không tìm thấy dịch vụ nào</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
