import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function InternshipsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">จัดการการฝึกงาน</h2>
        <p className="text-muted-foreground">จัดการข้อมูลการฝึกงานทั้งหมด</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>รายการฝึกงาน</CardTitle>
          <CardDescription>จัดการข้อมูลการฝึกงานทั้งหมด</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">หน้าในระหว่างการพัฒนา</p>
        </CardContent>
      </Card>
    </div>
  );
}
