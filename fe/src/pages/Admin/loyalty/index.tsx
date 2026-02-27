import { PageHeader } from "~/components/shared/page-header";
import { Card, CardContent } from "~/components/ui/card";
import { Gift, Star, Trophy, Users, TrendingUp } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { DataTable } from "~/components/shared/data-table";
import type { ColumnDef } from "@tanstack/react-table";

// Mock loyalty data
interface LoyaltyMember {
  id: number;
  name: string;
  email: string;
  tier: string;
  points: number;
  totalSpent: number;
  orders: number;
  joinedAt: string;
}

const mockMembers: LoyaltyMember[] = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    email: "a@email.com",
    tier: "GOLD",
    points: 2500,
    totalSpent: 5000000,
    orders: 45,
    joinedAt: "2023-06-01",
  },
  {
    id: 2,
    name: "Trần Thị B",
    email: "b@email.com",
    tier: "SILVER",
    points: 1200,
    totalSpent: 2500000,
    orders: 28,
    joinedAt: "2023-08-15",
  },
  {
    id: 3,
    name: "Lê Văn C",
    email: "c@email.com",
    tier: "BRONZE",
    points: 500,
    totalSpent: 800000,
    orders: 12,
    joinedAt: "2024-01-10",
  },
];

const getTierBadge = (tier: string) => {
  const styles: Record<string, string> = {
    BRONZE: "bg-orange-100 text-orange-700 border-orange-200",
    SILVER: "bg-gray-100 text-gray-700 border-gray-300",
    GOLD: "bg-yellow-100 text-yellow-700 border-yellow-200",
    PLATINUM: "bg-purple-100 text-purple-700 border-purple-200",
  };
  return (
    <Badge className={`${styles[tier]} font-bold`}>
      {tier === "BRONZE" && "🥉 "}
      {tier === "SILVER" && "🥈 "}
      {tier === "GOLD" && "🥇 "}
      {tier === "PLATINUM" && "💎 "}
      {tier}
    </Badge>
  );
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
};

const columns: ColumnDef<LoyaltyMember>[] = [
  {
    accessorKey: "name",
    header: "Thành viên",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
          {row.original.name[0]}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{row.original.name}</p>
          <p className="text-sm text-gray-500">{row.original.email}</p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "tier",
    header: "Hạng",
    cell: ({ row }) => getTierBadge(row.original.tier),
  },
  {
    accessorKey: "points",
    header: "Điểm",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Star size={16} className="text-yellow-500 fill-yellow-500" />
        <span className="font-bold text-gray-900">
          {row.original.points.toLocaleString()}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "totalSpent",
    header: "Chi tiêu",
    cell: ({ row }) => (
      <span className="font-semibold text-green-600">
        {formatCurrency(row.original.totalSpent)}
      </span>
    ),
  },
  {
    accessorKey: "orders",
    header: "Đơn hàng",
    cell: ({ row }) => (
      <Badge variant="outline" className="bg-gray-50">
        {row.original.orders} đơn
      </Badge>
    ),
  },
  {
    accessorKey: "joinedAt",
    header: "Ngày tham gia",
    cell: ({ row }) => (
      <span className="text-sm text-gray-600">
        {new Date(row.original.joinedAt).toLocaleDateString("vi-VN")}
      </span>
    ),
  },
];

export default function LoyaltyPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Chương trình khách hàng thân thiết"
        description="Quản lý điểm thưởng và hạng thành viên"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Users size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">1,234</p>
                <p className="text-sm text-gray-500">Thành viên</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center">
                <Star size={20} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">45.2K</p>
                <p className="text-sm text-gray-500">Tổng điểm</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <Trophy size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">89</p>
                <p className="text-sm text-gray-500">Hạng Vàng</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <TrendingUp size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">+12%</p>
                <p className="text-sm text-gray-500">Tăng trưởng</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tier Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { tier: "BRONZE", points: "0-999", benefit: "Giảm 5%", color: "bg-orange-50 border-orange-200" },
          { tier: "SILVER", points: "1,000-2,499", benefit: "Giảm 10%", color: "bg-gray-50 border-gray-300" },
          { tier: "GOLD", points: "2,500-4,999", benefit: "Giảm 15%", color: "bg-yellow-50 border-yellow-200" },
          { tier: "PLATINUM", points: "5,000+", benefit: "Giảm 20%", color: "bg-purple-50 border-purple-200" },
        ].map((t) => (
          <Card key={t.tier} className={`border-2 ${t.color}`}>
            <CardContent className="p-4 text-center">
              <p className="font-bold text-lg mb-1">{getTierBadge(t.tier)}</p>
              <p className="text-sm text-gray-600 mb-2">{t.points} điểm</p>
              <p className="font-semibold text-green-600">{t.benefit}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Members Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Danh sách thành viên</h3>
            <Button variant="outline" size="sm">
              <Gift size={16} className="mr-2" />
              Tạo ưu đãi
            </Button>
          </div>
          <DataTable
            columns={columns}
            data={mockMembers}
            emptyMessage="Không có thành viên nào"
          />
        </CardContent>
      </Card>
    </div>
  );
}
