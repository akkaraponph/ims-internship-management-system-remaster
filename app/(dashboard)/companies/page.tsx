import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CompaniesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">จัดการบริษัท</h2>
        <p className="text-muted-foreground">
          จัดการข้อมูลบริษัทและสถานประกอบการที่ร่วมโครงการฝึกงาน
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>รายชื่อบริษัท</CardTitle>
          <CardDescription>จัดการข้อมูลบริษัททั้งหมด</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">หน้าในระหว่างการพัฒนา</p>
        </CardContent>
      </Card>
    </div>
  );
}
