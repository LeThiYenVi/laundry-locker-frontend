import { useState } from "react";
import {
  useGetPartnerProfileQuery,
} from "@/stores/apis/partnerApi";

export interface PartnerProfile {
  businessName: string;
  contactPhone: string;
  businessAddress: string;
}

export function useSettings() {
  const {
    data: profileData,
    isLoading,
    error,
    refetch,
  } = useGetPartnerProfileQuery();

  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Map API response to form data
  const profile: PartnerProfile | null = profileData ? {
    businessName: profileData.businessName || "",
    contactPhone: profileData.contactPhone || "",
    businessAddress: profileData.businessAddress || "",
  } : null;

  const handleUpdate = async (data: { businessName: string; phone: string; address: string }) => {
    setIsUpdating(true);
    try {
      // Mock update - would call actual API
      await new Promise(resolve => setTimeout(resolve, 500));
      setSuccessMessage("Cập nhật thành công!");
      setTimeout(() => setSuccessMessage(null), 3000);
      return true;
    } catch (error) {
      console.error("Failed to update profile:", error);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    profile,
    isLoading,
    error,
    refetch,
    handleUpdate,
    isUpdating,
    successMessage,
  };
}
