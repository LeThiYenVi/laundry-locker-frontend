import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "~/components/ui";

export function ChartsSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Doanh thu 7 ngày qua</CardTitle>
          <CardDescription>Biểu đồ doanh thu theo ngày</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gray-100 rounded-lg">
            <p className="text-gray-500">Chart sẽ được thêm sau</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trạng thái đơn hàng</CardTitle>
          <CardDescription>Phân bố theo trạng thái</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gray-100 rounded-lg">
            <p className="text-gray-500">Chart sẽ được thêm sau</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
