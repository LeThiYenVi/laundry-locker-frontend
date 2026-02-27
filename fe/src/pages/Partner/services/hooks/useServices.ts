import { useState, useMemo } from "react";
import { useGetPartnerServicesQuery } from "@/stores/apis/partnerApi";
import type { PartnerService } from "@/types/partner.type";

export interface ServiceStats {
  total: number;
  active: number;
  inactive: number;
  avgPrice: number;
}

export function useServices() {
  const {
    data: services = [],
    isLoading,
    error,
    refetch,
  } = useGetPartnerServicesQuery();

  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Filter services
  const filteredServices = useMemo(() => {
    if (filterCategory === "ALL") return services;
    return services.filter((service) => service.category === filterCategory);
  }, [services, filterCategory]);

  // Stats
  const stats: ServiceStats = useMemo(() => {
    const activeServices = services.filter((s) => s.isActive).length;
    const inactiveServices = services.length - activeServices;
    const avgPrice =
      services.length > 0
        ? services.reduce((sum, s) => sum + s.price, 0) / services.length
        : 0;

    return {
      total: services.length,
      active: activeServices,
      inactive: inactiveServices,
      avgPrice,
    };
  }, [services]);

  return {
    services,
    filteredServices,
    filterCategory,
    setFilterCategory,
    stats,
    isLoading,
    error,
    refetch,
    errorToast,
    setErrorToast,
  };
}
