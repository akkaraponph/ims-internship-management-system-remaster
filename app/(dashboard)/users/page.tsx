import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">จัดการผู้ใช้</h2>
        <p className="text-muted-foreground">จัดการข้อมูลผู้ใช้งานระบบทั้งหมด</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>รายชื่อผู้ใช้</CardTitle>
          <CardDescription>จัดการข้อมูลผู้ใช้ทั้งหมด</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">หน้าในระหว่างการพัฒนา</p>
        </CardContent>
      </Card>
    </div>
  );
}
