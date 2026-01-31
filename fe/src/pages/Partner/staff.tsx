import * as React from "react";
import { Users, Plus, Search, MoreHorizontal, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  Button,
  Input,
  PageLoading,
  ErrorState,
  EmptyData,
  Badge,
} from "~/components/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { t } from "@/lib/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { 
  useGetPartnerStaffQuery,
  useAddStaffMutation,
  useRemoveStaffMutation,
} from "@/stores/apis/partner";
import type { UserResponse } from "@/schemas/partner.schemas";

export default function PartnerStaffPage(): React.JSX.Element {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [newStaffEmail, setNewStaffEmail] = React.useState("");

  const { 
    data: staffData, 
    isLoading, 
    error,
    refetch 
  } = useGetPartnerStaffQuery();

  const [addStaff] = useAddStaffMutation();
  const [removeStaff] = useRemoveStaffMutation();

  const staff = staffData?.data || [];

  const filteredStaff = staff.filter((member) =>
    member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddStaff = async () => {
    // TODO: Implement search user by email then add
    // For now, this is a placeholder
    console.log("Add staff:", newStaffEmail);
    setIsAddDialogOpen(false);
    setNewStaffEmail("");
  };

  const handleRemoveStaff = async (staffId: number) => {
    if (confirm("Bạn có chắc muốn xóa nhân viên này?")) {
      try {
        await removeStaff(staffId).unwrap();
      } catch (err) {
        console.error("Failed to remove staff:", err);
      }
    }
  };

  if (isLoading) {
    return <PageLoading message="Đang tải danh sách nhân viên..." />;
  }

  if (error) {
    return (
      <ErrorState
        variant="server"
        title="Không thể tải danh sách nhân viên"
        error={error}
        onRetry={refetch}
        onClose={() => window.history.back()}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("partner.staff.title")}</h1>
          <p className="text-gray-600 mt-1">
            {staff.length} {t("partner.dashboard.staff")}
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus size={18} />
              Thêm nhân viên
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("partner.staff.addStaff")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">{t("label.email")}</label>
                <Input
                  placeholder={t("placeholder.email")}
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  User must have an account in the system
                </p>
              </div>
              <Button 
                className="w-full" 
                onClick={handleAddStaff}
                disabled={!newStaffEmail}
              >
                {t("partner.staff.addStaff")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
        <Input
          placeholder={t("partner.staff.search")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 max-w-md"
        />
      </div>

      {/* Staff Table */}
      {filteredStaff.length === 0 ? (
        <EmptyData
          title={t("partner.staff.empty")}
          message="Add staff to manage orders more effectively."
          icon={<Users className="h-16 w-16 text-muted-foreground" />}
        />
      ) : (
        <Card>
          <Table>
            <TableHeader className="bg-blue-950">
              <TableRow>
                <TableHead className="text-amber-100">{t("partner.staff.name")}</TableHead>
                <TableHead className="text-amber-100">{t("partner.staff.email")}</TableHead>
                <TableHead className="text-amber-100">{t("partner.staff.provider")}</TableHead>
                <TableHead className="text-amber-100">{t("partner.staff.status")}</TableHead>
                <TableHead className="text-amber-100 text-right">{t("partner.orders.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        {member.imageUrl ? (
                          <img 
                            src={member.imageUrl} 
                            alt={member.name}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <span className="text-blue-600 font-medium">
                            {member.name?.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-gray-500">ID: {member.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{member.provider}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={member.emailVerified 
                        ? "bg-green-100 text-green-700" 
                        : "bg-yellow-100 text-yellow-700"
                      }
                    >
                      {member.emailVerified ? t("partner.staff.verified") : t("partner.staff.pending")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleRemoveStaff(member.id)}
                        >
                          <Trash2 size={16} className="mr-2" />
                          {t("partner.staff.remove")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
