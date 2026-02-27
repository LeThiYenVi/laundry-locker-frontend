import { PartnerStatus } from "~/types/admin/enums";

export interface MockPartner {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: PartnerStatus;
  businessLicense: string;
  taxCode: string;
  representativeName: string;
  representativePhone: string;
  totalStores: number;
  joinedAt: string;
}

export const mockPartners: MockPartner[] = [
  {
    id: 1,
    name: "Công ty TNHH ABC",
    email: "contact@abc.com",
    phone: "0901234567",
    address: "123 Lê Lợi, Quận 1, TP.HCM",
    status: PartnerStatus.APPROVED,
    businessLicense: "0312345678",
    taxCode: "0312345678",
    representativeName: "Nguyễn Văn A",
    representativePhone: "0901234567",
    totalStores: 3,
    joinedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    name: "Cửa hàng XYZ",
    email: "xyz@store.com",
    phone: "0902345678",
    address: "456 Võ Văn Tần, Quận 3, TP.HCM",
    status: PartnerStatus.PENDING,
    businessLicense: "0312345679",
    taxCode: "0312345679",
    representativeName: "Trần Thị B",
    representativePhone: "0902345678",
    totalStores: 1,
    joinedAt: "2024-01-15T00:00:00Z",
  },
  {
    id: 3,
    name: "Doanh nghiệp DEF",
    email: "def@company.com",
    phone: "0903456789",
    address: "789 Nguyễn Thị Thập, Quận 7, TP.HCM",
    status: PartnerStatus.REJECTED,
    businessLicense: "0312345680",
    taxCode: "0312345680",
    representativeName: "Lê Văn C",
    representativePhone: "0903456789",
    totalStores: 0,
    joinedAt: "2024-02-01T00:00:00Z",
  },
];

export const getPaginatedPartners = (page: number, size: number) => {
  const start = page * size;
  const end = start + size;
  const content = mockPartners.slice(start, end);
  
  return {
    content,
    totalElements: mockPartners.length,
    totalPages: Math.ceil(mockPartners.length / size),
    pageNumber: page,
    pageSize: size,
  };
};

export const partnerStatistics = {
  totalPartners: mockPartners.length,
  pendingApproval: mockPartners.filter(p => p.status === PartnerStatus.PENDING).length,
  approved: mockPartners.filter(p => p.status === PartnerStatus.APPROVED).length,
  rejected: mockPartners.filter(p => p.status === PartnerStatus.REJECTED).length,
  suspended: mockPartners.filter(p => p.status === PartnerStatus.SUSPENDED).length,
  totalStores: mockPartners.reduce((acc, p) => acc + p.totalStores, 0),
};
