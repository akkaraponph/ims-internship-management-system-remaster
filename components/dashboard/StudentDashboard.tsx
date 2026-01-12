"use client";

import {
  UserCircle,
  Building2,
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useSession } from "next-auth/react";

const profileCompletion = {
  personal: false,
  academic: false,
  address: false,
  resume: false,
};

const todoItems = [
  { id: 1, title: "กรอกข้อมูลที่อยู่ปัจจุบัน", completed: false, priority: "high" },
  { id: 2, title: "อัพโหลด Resume", completed: false, priority: "high" },
  { id: 3, title: "ยืนยันข้อมูลการศึกษา", completed: false, priority: "medium" },
  { id: 4, title: "เพิ่มข้อมูลทักษะ", completed: false, priority: "low" },
];

export function StudentDashboard() {
  const { data: session } = useSession();
  const user = session?.user;

  const completedItems = Object.values(profileCompletion).filter(Boolean).length;
  const totalItems = Object.values(profileCompletion).length;
  const completionPercentage = (completedItems / totalItems) * 100;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          สวัสดี, {user?.username || "นักศึกษา"}
        </h2>
        <p className="text-muted-foreground">จัดการข้อมูลการฝึกงานของคุณได้ที่นี่</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-primary" />
              ความสมบูรณ์ของโปรไฟล์
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>ความคืบหน้า</span>
                <span className="font-medium">{Math.round(completionPercentage)}%</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>
            <Separator />
            <div className="space-y-2">
              {Object.entries(profileCompletion).map(([key, completed]) => (
                <div key={key} className="flex items-center gap-2 text-sm">
                  {completed ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  )}
                  <span className={completed ? "text-muted-foreground" : ""}>
                    {key === "personal" && "ข้อมูลส่วนตัว"}
                    {key === "academic" && "ข้อมูลการศึกษา"}
                    {key === "address" && "ข้อมูลที่อยู่"}
                    {key === "resume" && "Resume"}
                  </span>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full" asChild>
              <a href="/profile">แก้ไขโปรไฟล์</a>
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                ข้อมูลการฝึกงาน
              </CardTitle>
              <Badge variant="secondary">ยังไม่มีการฝึกงาน</Badge>
            </div>
            <CardDescription>รายละเอียดสถานประกอบการที่ฝึกงาน</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-8">
              ยังไม่มีข้อมูลการฝึกงาน
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              สิ่งที่ต้องทำ
            </CardTitle>
            <CardDescription>รายการที่ต้องดำเนินการ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todoItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 rounded-lg border p-3 ${
                    item.completed ? "bg-muted/30" : ""
                  }`}
                >
                  {item.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Clock className="h-5 w-5 text-yellow-500" />
                  )}
                  <span
                    className={item.completed ? "text-muted-foreground line-through" : ""}
                  >
                    {item.title}
                  </span>
                  {!item.completed && item.priority === "high" && (
                    <Badge variant="destructive" className="ml-auto">
                      สำคัญ
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>การดำเนินการด่วน</CardTitle>
            <CardDescription>เข้าถึงฟังก์ชันที่ใช้บ่อย</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
              <a href="/profile">
                <UserCircle className="h-6 w-6" />
                <span>แก้ไขข้อมูลส่วนตัว</span>
              </a>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
              <a href="/documents">
                <FileText className="h-6 w-6" />
                <span>อัพโหลด Resume</span>
              </a>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
              <a href="/companies">
                <Building2 className="h-6 w-6" />
                <span>ค้นหาบริษัท</span>
              </a>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
              <a href="/internship">
                <Calendar className="h-6 w-6" />
                <span>ดูกำหนดการ</span>
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
