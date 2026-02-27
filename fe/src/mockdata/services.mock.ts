export interface MockService {
  id: number;
  name: string;
  description: string;
  basePrice: number;
  unit: string;
  estimatedTime: number;
  isActive: boolean;
  createdAt: string;
}

export const mockServices: MockService[] = [
  {
    id: 1,
    name: "Giặt ủi thường",
    description: "Giặt và ủi quần áo thông thường",
    basePrice: 25000,
    unit: "kg",
    estimatedTime: 24,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    name: "Giặt hấp cao cấp",
    description: "Giặt hấp cho vest, áo dài, đầm dạ hội",
    basePrice: 80000,
    unit: "cái",
    estimatedTime: 48,
    isActive: true,
    createdAt: "2024-01-05T00:00:00Z",
  },
  {
    id: 3,
    name: "Giặt chăn ga gối",
    description: "Giặt chăn, ga, gối, nệm",
    basePrice: 50000,
    unit: "bộ",
    estimatedTime: 72,
    isActive: true,
    createdAt: "2024-01-10T00:00:00Z",
  },
  {
    id: 4,
    name: "Giặt giày dép",
    description: "Vệ sinh và giặt giày thể thao, dép",
    basePrice: 35000,
    unit: "đôi",
    estimatedTime: 24,
    isActive: false,
    createdAt: "2024-01-15T00:00:00Z",
  },
  {
    id: 5,
    name: "Giặt túi xách",
    description: "Vệ sinh túi xách, balo các loại",
    basePrice: 60000,
    unit: "cái",
    estimatedTime: 48,
    isActive: true,
    createdAt: "2024-02-01T00:00:00Z",
  },
];

export const getPaginatedServices = (page: number, size: number) => {
  const start = page * size;
  const end = start + size;
  const content = mockServices.slice(start, end);
  
  return {
    content,
    totalElements: mockServices.length,
    totalPages: Math.ceil(mockServices.length / size),
    pageNumber: page,
    pageSize: size,
  };
};
