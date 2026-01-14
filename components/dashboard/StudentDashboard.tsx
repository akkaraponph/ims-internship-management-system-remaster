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
import { AnnouncementBanner } from "@/components/announcements/AnnouncementBanner";
import { useState, useEffect } from "react";
import { calculateProfileCompletion, getProfileCompletionPercentage } from "@/lib/utils/profile-completion";
import type { Student } from "@/types";
import { Loader2 } from "lucide-react";

const todoItems = [
  { id: 1, title: "กรอกข้อมูลที่อยู่ปัจจุบัน", completed: false, priority: "high" },
  { id: 2, title: "อัพโหลด Resume", completed: false, priority: "high" },
  { id: 3, title: "ยืนยันข้อมูลการศึกษา", completed: false, priority: "medium" },
  { id: 4, title: "เพิ่มข้อมูลทักษะ", completed: false, priority: "low" },
];

export function StudentDashboard() {
  const { data: session } = useSession();
  const user = session?.user;
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.role === "student") {
      fetchStudent();
    }
  }, [session]);

  const fetchStudent = async () => {
    try {
      const response = await fetch("/api/students");
      if (response.ok) {
        const data = await response.json();
        const studentData = Array.isArray(data) ? data[0] : data;
        if (studentData) {
          setStudent(studentData);
        }
      }
    } catch (error) {
      console.error("Error fetching student:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const profileCompletion = calculateProfileCompletion(student);
  const completionPercentage = getProfileCompletionPercentage(profileCompletion);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-muted animate-pulse rounded-md" />
          <div className="h-4 w-96 bg-muted animate-pulse rounded-md" />
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AnnouncementBanner />
      
      <div className="space-y-2">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
          สวัสดี, {user?.username || "นักศึกษา"}
        </h2>
        <p className="text-lg text-muted-foreground">จัดการข้อมูลการฝึกงานของคุณได้ที่นี่</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 rounded-lg bg-primary/10">
                <UserCircle className="h-5 w-5 text-primary" />
              </div>
              ความสมบูรณ์ของโปรไฟล์
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">ความคืบหน้า</span>
                <span className="font-bold text-lg bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  {Math.round(completionPercentage)}%
                </span>
              </div>
              <Progress value={completionPercentage} className="h-3 shadow-inner" />
            </div>
            <Separator className="my-4" />
            <div className="space-y-3">
              {Object.entries(profileCompletion).map(([key, completed]) => (
                <div key={key} className="flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  {completed ? (
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                  )}
                  <span className={completed ? "text-muted-foreground line-through" : "font-medium"}>
                    {key === "personal" && "ข้อมูลส่วนตัว"}
                    {key === "academic" && "ข้อมูลการศึกษา"}
                    {key === "address" && "ข้อมูลที่อยู่"}
                    {key === "resume" && "Resume"}
                  </span>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4 hover:bg-primary hover:text-primary-foreground transition-colors" asChild>
              <a href="/profile">แก้ไขโปรไฟล์</a>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              สถานะ Resume
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {student?.resumeStatus ? (
              <div className="space-y-4 p-4 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">สถานะการอนุมัติ</span>
                  <Badge 
                    variant={student.resumeApproved ? "default" : "secondary"}
                    className={student.resumeApproved ? "bg-green-500 hover:bg-green-600" : "bg-yellow-500 hover:bg-yellow-600"}
                  >
                    {student.resumeApproved ? "อนุมัติแล้ว" : "รอการอนุมัติ"}
                  </Badge>
                </div>
                {student.resumeApproved && student.resumeApprovedAt && (
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    อนุมัติเมื่อ: {new Date(student.resumeApprovedAt).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                )}
                {!student.resumeApproved && (
                  <div className="text-sm text-yellow-600 dark:text-yellow-400 flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>กรุณารอการอนุมัติจากอาจารย์ที่ปรึกษา</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground p-4 rounded-lg bg-muted/30 border border-border/50 text-center">
                ยังไม่อัพโหลด Resume
              </div>
            )}
            <Button variant="outline" className="w-full mt-4 hover:bg-primary hover:text-primary-foreground transition-colors" asChild>
              <a href="/documents">จัดการ Resume</a>
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-2 hover:shadow-xl transition-all duration-300 hover:scale-[1.01] backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                ข้อมูลการฝึกงาน
              </CardTitle>
              {student && (
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  {student.isCoInternship ? "โคออป" : "สหกิจ"}
                </Badge>
              )}
            </div>
            <CardDescription className="pt-1">รายละเอียดสถานประกอบการที่ฝึกงาน</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-12">
              <div className="space-y-4">
                <Building2 className="h-16 w-16 mx-auto text-muted-foreground/30" />
                <p className="text-sm">ยังไม่มีข้อมูลการฝึกงาน</p>
                <Button variant="outline" className="mt-4 hover:bg-primary hover:text-primary-foreground transition-colors" asChild>
                  <a href="/internship">ดูข้อมูลการฝึกงาน</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:scale-[1.01] backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              สิ่งที่ต้องทำ
            </CardTitle>
            <CardDescription className="pt-1">รายการที่ต้องดำเนินการ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todoItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 rounded-lg border-2 p-4 transition-all duration-300 hover:shadow-md hover:scale-[1.02] ${
                    item.completed ? "bg-muted/30 border-border/50" : "border-border hover:border-primary/50"
                  }`}
                >
                  {item.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <Clock className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                  )}
                  <span
                    className={`flex-1 ${item.completed ? "text-muted-foreground line-through" : "font-medium"}`}
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

        <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:scale-[1.01] backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">การดำเนินการด่วน</CardTitle>
            <CardDescription className="pt-1">เข้าถึงฟังก์ชันที่ใช้บ่อย</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Button variant="outline" className="h-auto flex-col gap-3 p-6 hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105" asChild>
              <a href="/profile">
                <UserCircle className="h-7 w-7" />
                <span className="font-medium">แก้ไขข้อมูลส่วนตัว</span>
              </a>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-3 p-6 hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105" asChild>
              <a href="/documents">
                <FileText className="h-7 w-7" />
                <span className="font-medium">อัพโหลด Resume</span>
              </a>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-3 p-6 hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105" asChild>
              <a href="/companies">
                <Building2 className="h-7 w-7" />
                <span className="font-medium">ค้นหาบริษัท</span>
              </a>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-3 p-6 hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105" asChild>
              <a href="/internship">
                <Calendar className="h-7 w-7" />
                <span className="font-medium">ดูกำหนดการ</span>
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
