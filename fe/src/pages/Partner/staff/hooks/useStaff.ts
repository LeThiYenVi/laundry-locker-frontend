import { useMemo } from "react";
import { useGetPartnerProfileQuery } from "@/stores/apis/partnerApi";

interface StaffMember {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
}

export function useStaff() {
  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useGetPartnerProfileQuery();

  // Mock staff data based on profile
  const staff: StaffMember[] = useMemo(() => {
    if (!profile) return [];
    return [
      {
        id: 1,
        name: profile.userName || "Admin",
        email: profile.contactEmail || "",
        phoneNumber: profile.contactPhone || "",
        role: "ADMIN",
      },
    ];
  }, [profile]);

  const stats = useMemo(() => {
    return {
      total: staff.length,
      active: staff.length,
    };
  }, [staff]);

  return {
    staff,
    stats,
    isLoading,
    error,
    refetch,
  };
}
