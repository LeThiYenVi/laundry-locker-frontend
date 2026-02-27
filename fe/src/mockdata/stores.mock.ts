export interface MockStore {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  openingHours: string;
  isActive: boolean;
  totalLockers: number;
  availableLockers: number;
  managerName: string;
  createdAt: string;
}

export const mockStores: MockStore[] = [
  {
    id: 1,
    name: "Cửa hàng Quận 1",
    address: "123 Lê Lợi, Quận 1, TP.HCM",
    phone: "0901234567",
    email: "q1@laundry.com",
    openingHours: "07:00 - 21:00",
    isActive: true,
    totalLockers: 20,
    availableLockers: 15,
    managerName: "Nguyễn Văn A",
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    name: "Cửa hàng Quận 3",
    address: "456 Võ Văn Tần, Quận 3, TP.HCM",
    phone: "0902345678",
    email: "q3@laundry.com",
    openingHours: "07:00 - 22:00",
    isActive: true,
    totalLockers: 25,
    availableLockers: 20,
    managerName: "Trần Thị B",
    createdAt: "2024-01-05T00:00:00Z",
  },
  {
    id: 3,
    name: "Cửa hàng Quận 7",
    address: "789 Nguyễn Thị Thập, Quận 7, TP.HCM",
    phone: "0903456789",
    email: "q7@laundry.com",
    openingHours: "08:00 - 21:00",
    isActive: true,
    totalLockers: 18,
    availableLockers: 8,
    managerName: "Lê Văn C",
    createdAt: "2024-01-10T00:00:00Z",
  },
];

export const getPaginatedStores = (page: number, size: number) => {
  const start = page * size;
  const end = start + size;
  const content = mockStores.slice(start, end);
  
  return {
    content,
    totalElements: mockStores.length,
    totalPages: Math.ceil(mockStores.length / size),
    pageNumber: page,
    pageSize: size,
  };
};
