import { useState, useEffect } from "react";
import { Store, MapPin, Phone, Clock } from "lucide-react";
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
import {
  useCreateStoreMutation,
  useUpdateStoreMutation,
} from "@/stores/apis/admin/stores";
import type { AdminStoreResponse } from "~/types/admin/store";

interface StoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  store?: AdminStoreResponse | null;
  mode: "create" | "edit";
}

export function StoreModal({ isOpen, onClose, store, mode }: StoreModalProps) {
  const [createStore, { isLoading: isCreating }] = useCreateStoreMutation();
  const [updateStore, { isLoading: isUpdating }] = useUpdateStoreMutation();
  const isSaving = isCreating || isUpdating;

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    description: "",
    openTime: "",
    closeTime: "",
  });

  useEffect(() => {
    if (store && mode === "edit") {
      setFormData({
        name: store.name || "",
        address: store.address || "",
        phone: store.phone || "",
        description: store.description || "",
        openTime: store.openTime || "",
        closeTime: store.closeTime || "",
      });
    } else {
      setFormData({
        name: "",
        address: "",
        phone: "",
        description: "",
        openTime: "07:00",
        closeTime: "21:00",
      });
    }
  }, [store, mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === "create") {
        await createStore(formData).unwrap();
        toast.success("Đã tạo cửa hàng thành công!");
      } else if (store) {
        await updateStore({ id: store.id, data: formData }).unwrap();
        toast.success("Đã cập nhật cửa hàng thành công!");
      }
      onClose();
    } catch {
      toast.error(
        mode === "create"
          ? "Không thể tạo cửa hàng"
          : "Không thể cập nhật cửa hàng",
      );
    }
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
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
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
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              placeholder="123 Lê Lợi, Quận 1, TP.HCM"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone size={14} />
              Số điện thoại *
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="0901234567"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="openTime" className="flex items-center gap-2">
                <Clock size={14} />
                Giờ mở cửa
              </Label>
              <Input
                id="openTime"
                type="time"
                value={formData.openTime}
                onChange={(e) =>
                  setFormData({ ...formData, openTime: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="closeTime" className="flex items-center gap-2">
                <Clock size={14} />
                Giờ đóng cửa
              </Label>
              <Input
                id="closeTime"
                type="time"
                value={formData.closeTime}
                onChange={(e) =>
                  setFormData({ ...formData, closeTime: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả (tùy chọn)</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Mô tả ngắn về cửa hàng"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving
                ? "Đang lưu..."
                : mode === "create"
                  ? "Tạo cửa hàng"
                  : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
