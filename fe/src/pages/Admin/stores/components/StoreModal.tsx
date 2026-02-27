import { useState, useEffect } from "react";
import { Store, MapPin, Phone, Clock, User } from "lucide-react";
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
import { Switch } from "~/components/ui/switch";

interface StoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  store?: any;
  mode: "create" | "edit";
}

export function StoreModal({ isOpen, onClose, store, mode }: StoreModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    openingHours: "07:00 - 21:00",
    managerName: "",
    totalLockers: "20",
    isActive: true,
  });

  useEffect(() => {
    if (store && mode === "edit") {
      setFormData({
        name: store.name || "",
        address: store.address || "",
        phone: store.phone || "",
        email: store.email || "",
        openingHours: store.openingHours || "07:00 - 21:00",
        managerName: store.managerName || "",
        totalLockers: store.totalLockers?.toString() || "20",
        isActive: store.isActive ?? true,
      });
    } else {
      setFormData({
        name: "",
        address: "",
        phone: "",
        email: "",
        openingHours: "07:00 - 21:00",
        managerName: "",
        totalLockers: "20",
        isActive: true,
      });
    }
  }, [store, mode, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: mode === "create" ? "Đang tạo cửa hàng..." : "Đang cập nhật...",
        success: mode === "create" 
          ? "Đã tạo cửa hàng thành công!" 
          : "Đã cập nhật cửa hàng thành công!",
        error: "Có lỗi xảy ra",
      }
    );
    
    setTimeout(() => {
      onClose();
    }, 1600);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store size={20} className="text-blue-600" />
            {mode === "create" ? "Thêm cửa hàng mớii" : "Chỉnh sửa cửa hàng"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên cửa hàng *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ví dụ: Cửa hàng Quận 1"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin size={14} />
              Địa chỉ *
            </Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Lê Lợi, Quận 1, TP.HCM"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone size={14} />
                Số điện thoại *
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0901234567"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="store@laundry.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="managerName" className="flex items-center gap-2">
                <User size={14} />
                Quản lý
              </Label>
              <Input
                id="managerName"
                value={formData.managerName}
                onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                placeholder="Tên ngườii quản lý"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="openingHours" className="flex items-center gap-2">
                <Clock size={14} />
                Giờ mở cửa
              </Label>
              <Input
                id="openingHours"
                value={formData.openingHours}
                onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                placeholder="07:00 - 21:00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalLockers">Số lượng tủ đồ</Label>
            <Input
              id="totalLockers"
              type="number"
              value={formData.totalLockers}
              onChange={(e) => setFormData({ ...formData, totalLockers: e.target.value })}
              placeholder="20"
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
            <Label htmlFor="isActive">Cửa hàng hoạt động</Label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {mode === "create" ? "Tạo cửa hàng" : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
