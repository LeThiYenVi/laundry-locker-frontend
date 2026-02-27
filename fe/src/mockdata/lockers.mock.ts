import { LockerStatus } from "~/types/admin/enums";

export interface MockLocker {
  id: number;
  code: string;
  name: string;
  address: string;
  storeName: string;
  storeId: number;
  status: LockerStatus;
  totalBoxes: number;
  availableBoxes: number;
  occupiedBoxes: number;
  maintenanceBoxes: number;
  createdAt: string;
}

export const mockLockers: MockLocker[] = [
  {
    id: 1,
    code: "LOCK-Q1-001",
    name: "Tủ đồ Quận 1 - A1",
    address: "123 Lê Lợi, Quận 1, TP.HCM",
    storeName: "Cửa hàng Quận 1",
    storeId: 1,
    status: LockerStatus.ACTIVE,
    totalBoxes: 20,
    availableBoxes: 15,
    occupiedBoxes: 4,
    maintenanceBoxes: 1,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    code: "LOCK-Q1-002",
    name: "Tủ đồ Quận 1 - A2",
    address: "123 Lê Lợi, Quận 1, TP.HCM",
    storeName: "Cửa hàng Quận 1",
    storeId: 1,
    status: LockerStatus.ACTIVE,
    totalBoxes: 20,
    availableBoxes: 8,
    occupiedBoxes: 10,
    maintenanceBoxes: 2,
    createdAt: "2024-01-05T00:00:00Z",
  },
  {
    id: 3,
    code: "LOCK-Q3-001",
    name: "Tủ đồ Quận 3 - B1",
    address: "456 Võ Văn Tần, Quận 3, TP.HCM",
    storeName: "Cửa hàng Quận 3",
    storeId: 2,
    status: LockerStatus.MAINTENANCE,
    totalBoxes: 25,
    availableBoxes: 0,
    occupiedBoxes: 20,
    maintenanceBoxes: 5,
    createdAt: "2024-01-10T00:00:00Z",
  },
  {
    id: 4,
    code: "LOCK-Q7-001",
    name: "Tủ đồ Quận 7 - C1",
    address: "789 Nguyễn Thị Thập, Quận 7, TP.HCM",
    storeName: "Cửa hàng Quận 7",
    storeId: 3,
    status: LockerStatus.ACTIVE,
    totalBoxes: 18,
    availableBoxes: 12,
    occupiedBoxes: 6,
    maintenanceBoxes: 0,
    createdAt: "2024-01-15T00:00:00Z",
  },
  {
    id: 5,
    code: "LOCK-BT-001",
    name: "Tủ đồ Bình Thạnh - D1",
    address: "321 Điện Biên Phủ, Bình Thạnh, TP.HCM",
    storeName: "Cửa hàng Bình Thạnh",
    storeId: 4,
    status: LockerStatus.INACTIVE,
    totalBoxes: 15,
    availableBoxes: 0,
    occupiedBoxes: 0,
    maintenanceBoxes: 15,
    createdAt: "2024-02-01T00:00:00Z",
  },
  {
    id: 6,
    code: "LOCK-GV-001",
    name: "Tủ đồ Gò Vấp - E1",
    address: "654 Phan Văn Trị, Gò Vấp, TP.HCM",
    storeName: "Cửa hàng Gò Vấp",
    storeId: 5,
    status: LockerStatus.ACTIVE,
    totalBoxes: 22,
    availableBoxes: 18,
    occupiedBoxes: 4,
    maintenanceBoxes: 0,
    createdAt: "2024-02-10T00:00:00Z",
  },
];

export const getPaginatedLockers = (page: number, size: number) => {
  const start = page * size;
  const end = start + size;
  const content = mockLockers.slice(start, end);
  
  return {
    content,
    totalElements: mockLockers.length,
    totalPages: Math.ceil(mockLockers.length / size),
    pageNumber: page,
    pageSize: size,
  };
};

export const lockerStatistics = {
  total: mockLockers.length,
  active: mockLockers.filter(l => l.status === LockerStatus.ACTIVE).length,
  inactive: mockLockers.filter(l => l.status === LockerStatus.INACTIVE).length,
  maintenance: mockLockers.filter(l => l.status === LockerStatus.MAINTENANCE).length,
  disconnected: mockLockers.filter(l => l.status === LockerStatus.DISCONNECTED).length,
  totalBoxes: mockLockers.reduce((acc, l) => acc + l.totalBoxes, 0),
  availableBoxes: mockLockers.reduce((acc, l) => acc + l.availableBoxes, 0),
  occupiedBoxes: mockLockers.reduce((acc, l) => acc + l.occupiedBoxes, 0),
};
