import { useState, useEffect } from "react";
import { X, DollarSign, Clock, Package } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service?: any;
  mode: "create" | "edit";
}

export function ServiceModal({ isOpen, onClose, service, mode }: ServiceModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    basePrice: "",
    unit: "kg",
    estimatedTime: "24",
    isActive: true,
  });

  useEffect(() => {
    if (service && mode === "edit") {
      setFormData({
        name: service.name || "",
        description: service.description || "",
        basePrice: service.basePrice?.toString() || "",
        unit: service.unit || "kg",
        estimatedTime: service.estimatedTime?.toString() || "24",
        isActive: service.isActive ?? true,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        basePrice: "",
        unit: "kg",
        estimatedTime: "24",
        isActive: true,
      });
    }
  }, [service, mode, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: mode === "create" ? "Đang tạo dịch vụ..." : "Đang cập nhật...",
        success: mode === "create" 
          ? "Đã tạo dịch vụ thành công!" 
          : "Đã cập nhật dịch vụ thành công!",
        error: "Có lỗi xảy ra",
      }
    );
    
    setTimeout(() => {
      onClose();
    }, 1600);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package size={20} className="text-blue-600" />
            {mode === "create" ? "Thêm dịch vụ mớii" : "Chỉnh sửa dịch vụ"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên dịch vụ *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ví dụ: Giặt ủi thường"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mô tả chi tiết về dịch vụ"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="basePrice" className="flex items-center gap-2">
                <DollarSign size={14} />
                Giá cơ bản *
              </Label>
              <Input
                id="basePrice"
                type="number"
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                placeholder="25000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Đơn vị</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="kg, cái, bộ..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimatedTime" className="flex items-center gap-2">
              <Clock size={14} />
              Thờii gian ước tính (giờ)
            </Label>
            <Input
              id="estimatedTime"
              type="number"
              value={formData.estimatedTime}
              onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
              placeholder="24"
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isActive: checked })
              }
            />
            <Label htmlFor="isActive">Kích hoạt dịch vụ</Label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {mode === "create" ? "Tạo dịch vụ" : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
