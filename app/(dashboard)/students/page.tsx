import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function StudentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">จัดการนักศึกษา</h2>
        <p className="text-muted-foreground">จัดการข้อมูลนักศึกษาทั้งหมด</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>รายชื่อนักศึกษา</CardTitle>
          <CardDescription>จัดการข้อมูลนักศึกษาทั้งหมด</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">หน้าในระหว่างการพัฒนา</p>
        </CardContent>
      </Card>
    </div>
  );
}
