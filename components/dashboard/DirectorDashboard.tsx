"use client";

"use client";

import {
  GraduationCap,
  Building2,
  ClipboardCheck,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnnouncementBanner } from "@/components/announcements/AnnouncementBanner";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export function DirectorDashboard() {
  const { data: session } = useSession();
  const [pendingResumesCount, setPendingResumesCount] = useState(0);
  const [studentsCount, setStudentsCount] = useState(0);
  const [pendingInternshipsCount, setPendingInternshipsCount] = useState(0);
  const [approvedInternshipsCount, setApprovedInternshipsCount] = useState(0);
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    if (session?.user?.role === "director" || session?.user?.role === "admin" || session?.user?.role === "super-admin") {
      fetchDashboardData();
    }
  }, [session]);

  const fetchDashboardData = async () => {
    try {
      // Fetch all data in parallel
      const [resumesRes, studentsRes, internshipsRes] = await Promise.all([
        fetch("/api/students/resumes/pending"),
        fetch("/api/students"),
        fetch("/api/internships"),
      ]);

      // Handle pending resumes
      if (resumesRes.ok) {
        const resumesData = await resumesRes.json();
        setPendingResumesCount(Array.isArray(resumesData) ? resumesData.length : 0);
      }

      // Handle students
      if (studentsRes.ok) {
        const studentsData = await studentsRes.json();
        const studentsArray = Array.isArray(studentsData) ? studentsData : [];
        setStudentsCount(studentsArray.length);
        setStudents(studentsArray.slice(0, 5)); // Show first 5 students
      }

      // Handle internships
      if (internshipsRes.ok) {
        const internshipsData = await internshipsRes.json();
        const internshipsArray = Array.isArray(internshipsData) ? internshipsData : [];
        
        // Count pending internships (isSend="yes" or isSend="1", isConfirm="no" or isConfirm="0")
        const pending = internshipsArray.filter((i: any) => 
          (i.isSend === "yes" || i.isSend === "1" || i.isSend === 1) && 
          (i.isConfirm === "no" || i.isConfirm === "0" || i.isConfirm === 0 || !i.isConfirm)
        );
        setPendingInternshipsCount(pending.length);

        // Count approved internships (isSend="yes" or isSend="1", isConfirm="yes" or isConfirm="1")
        const approved = internshipsArray.filter((i: any) => 
          (i.isSend === "yes" || i.isSend === "1" || i.isSend === 1) && 
          (i.isConfirm === "yes" || i.isConfirm === "1" || i.isConfirm === 1)
        );
        setApprovedInternshipsCount(approved.length);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  return (
    <div className="space-y-8">
      <AnnouncementBanner />
      
      <div className="space-y-2">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
          ยินดีต้อนรับ, อาจารย์ที่ปรึกษา
        </h2>
        <p className="text-lg text-muted-foreground">ภาพรวมนักศึกษาในความดูแล</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 backdrop-blur-sm group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">นักศึกษาในความดูแล</CardTitle>
            <div className="p-3 rounded-xl bg-muted group-hover:scale-110 transition-transform duration-300 shadow-md">
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">{studentsCount}</div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 backdrop-blur-sm group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">การฝึกงานที่รออนุมัติ</CardTitle>
            <div className="p-3 rounded-xl bg-yellow-500/10 group-hover:scale-110 transition-transform duration-300 shadow-md">
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">{pendingInternshipsCount}</div>
            <Link href="/director/internships/pending">
              <Button variant="link" className="p-0 h-auto mt-2 hover:text-primary transition-colors">
                ดูรายการ <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 backdrop-blur-sm group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">การฝึกงานที่อนุมัติ</CardTitle>
            <div className="p-3 rounded-xl bg-green-500/10 group-hover:scale-110 transition-transform duration-300 shadow-md">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">{approvedInternshipsCount}</div>
            <Link href="/director/internships/confirmed">
              <Button variant="link" className="p-0 h-auto mt-2 hover:text-primary transition-colors">
                ดูรายการ <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 backdrop-blur-sm group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resume รอการอนุมัติ</CardTitle>
            <div className="p-3 rounded-xl bg-yellow-500/10 group-hover:scale-110 transition-transform duration-300 shadow-md">
              <FileText className="h-5 w-5 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">{pendingResumesCount}</div>
            <Link href="/director/resumes">
              <Button variant="link" className="p-0 h-auto mt-2 hover:text-primary transition-colors">
                ดูรายการ <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:scale-[1.01] backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">นักศึกษาในความดูแล</CardTitle>
          <CardDescription className="pt-1">รายชื่อนักศึกษาที่อยู่ในความดูแล</CardDescription>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <GraduationCap className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-sm">ยังไม่มีข้อมูลนักศึกษา</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {students.map((student) => (
                  <div key={student.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{student.firstName} {student.lastName}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{student.email}</p>
                        {student.program && (
                          <p className="text-xs text-muted-foreground mt-1">{student.program}</p>
                        )}
                      </div>
                      <Badge variant={student.resumeStatus ? "default" : "secondary"}>
                        {student.resumeStatus ? "Resume อนุมัติแล้ว" : "Resume รออนุมัติ"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              {studentsCount > 5 && (
                <div className="text-center pt-4">
                  <Link href="/students">
                    <Button variant="outline">
                      ดูนักศึกษาทั้งหมด ({studentsCount} คน) <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
