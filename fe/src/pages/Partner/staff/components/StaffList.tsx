import { Card, CardContent, Badge, Button } from "~/components/ui";
import { User, Key } from "lucide-react";

interface StaffMember {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
}

interface StaffListProps {
  staff: StaffMember[];
  onGenerateCode?: (staff: StaffMember) => void;
}

export function StaffList({ staff, onGenerateCode }: StaffListProps) {
  if (staff.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-gray-500">
          Chưa có nhân viên nào
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {staff.map((member) => (
        <Card key={member.id}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold">{member.name}</h3>
                <p className="text-sm text-gray-500">{member.phoneNumber}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <Badge>{member.role}</Badge>
              {onGenerateCode && (
                <Button size="sm" variant="outline" onClick={() => onGenerateCode(member)}>
                  <Key size={14} className="mr-1" />
                  Cấp mã
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
