"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, GraduationCap, Building2, ClipboardCheck } from "lucide-react";

interface Statistics {
  totalUsers: number;
  totalStudents: number;
  totalCompanies: number;
  totalInternships: number;
  pendingInternships: number;
  approvedInternships: number;
  rejectedInternships: number;
  usersByRole: {
    "super-admin": number;
    admin: number;
    director: number;
    student: number;
  };
  studentsByUniversity: Array<{
    universityId: string;
    universityName: string;
    count: number;
  }>;
}

export default function ReportsPage() {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const [usersRes, studentsRes, companiesRes, internshipsRes, universitiesRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/students"),
        fetch("/api/companies"),
        fetch("/api/internships"),
        fetch("/api/universities"),
      ]);

      const users = usersRes.ok ? await usersRes.json() : [];
      const students = studentsRes.ok ? await studentsRes.json() : [];
      const companies = companiesRes.ok ? await companiesRes.json() : [];
      const internships = internshipsRes.ok ? await internshipsRes.json() : [];
      const universities = universitiesRes.ok ? await universitiesRes.json() : [];

      // Calculate statistics
      const usersByRole = {
        "super-admin": 0,
        admin: 0,
        director: 0,
        student: 0,
      };

      users.forEach((user: any) => {
        if (user.role in usersByRole) {
          usersByRole[user.role as keyof typeof usersByRole]++;
        }
      });

      const pendingInternships = internships.filter((i: any) => i.status === "pending").length;
      const approvedInternships = internships.filter((i: any) => i.status === "approved").length;
      const rejectedInternships = internships.filter((i: any) => i.status === "rejected").length;

      // Group students by university
      const studentsByUniversityMap = new Map<string, { universityId: string; count: number }>();
      students.forEach((student: any) => {
        const universityId = student.universityId;
        if (universityId) {
          const current = studentsByUniversityMap.get(universityId) || { universityId, count: 0 };
          current.count++;
          studentsByUniversityMap.set(universityId, current);
        }
      });

      const studentsByUniversity = Array.from(studentsByUniversityMap.values()).map((item) => {
        const university = universities.find((u: any) => u.id === item.universityId);
        return {
          universityId: item.universityId,
          universityName: university ? university.name : "ไม่ระบุ",
          count: item.count,
        };
      });

      setStatistics({
        totalUsers: users.length,
        totalStudents: Array.isArray(students) ? students.length : (students ? 1 : 0),
        totalCompanies: Array.isArray(companies) ? companies.length : (companies ? 1 : 0),
        totalInternships: Array.isArray(internships) ? internships.length : (internships ? 1 : 0),
        pendingInternships,
        approvedInternships,
        rejectedInternships,
        usersByRole,
        studentsByUniversity,
      });
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>กำลังโหลด...</div>;
  }

  if (!statistics) {
    return <div>ไม่สามารถโหลดข้อมูลได้</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">รายงาน</h2>
        <p className="text-muted-foreground">ภาพรวมสถิติและข้อมูลของระบบ</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ผู้ใช้งานทั้งหมด</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalUsers}</div>
            <p className="text-xs text-muted-foreground">ผู้ใช้ในระบบ</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">นักศึกษาทั้งหมด</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalStudents}</div>
            <p className="text-xs text-muted-foreground">นักศึกษาที่ลงทะเบียน</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">บริษัททั้งหมด</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalCompanies}</div>
            <p className="text-xs text-muted-foreground">บริษัทที่ร่วมโครงการ</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">การฝึกงานทั้งหมด</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalInternships}</div>
            <p className="text-xs text-muted-foreground">รายการฝึกงาน</p>
          </CardContent>
        </Card>
      </div>

      {/* Internship Status */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>สถานะการฝึกงาน</CardTitle>
            <CardDescription>ภาพรวมสถานะการฝึกงานทั้งหมด</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <span className="text-sm">รอดำเนินการ</span>
                </div>
                <span className="font-medium">{statistics.pendingInternships}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-sm">อนุมัติแล้ว</span>
                </div>
                <span className="font-medium">{statistics.approvedInternships}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="text-sm">ปฏิเสธ</span>
                </div>
                <span className="font-medium">{statistics.rejectedInternships}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ผู้ใช้ตามบทบาท</CardTitle>
            <CardDescription>จำนวนผู้ใช้แยกตามบทบาท</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">ผู้ดูแลระบบหลัก</span>
                <span className="font-medium">{statistics.usersByRole["super-admin"]}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">ผู้ดูแลระบบ</span>
                <span className="font-medium">{statistics.usersByRole.admin}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">อาจารย์ที่ปรึกษา</span>
                <span className="font-medium">{statistics.usersByRole.director}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">นักศึกษา</span>
                <span className="font-medium">{statistics.usersByRole.student}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students by University */}
      {statistics.studentsByUniversity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>นักศึกษาตามมหาวิทยาลัย</CardTitle>
            <CardDescription>จำนวนนักศึกษาแยกตามมหาวิทยาลัย</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statistics.studentsByUniversity.map((item) => (
                <div key={item.universityId} className="flex items-center justify-between">
                  <span className="text-sm">{item.universityName}</span>
                  <span className="font-medium">{item.count} คน</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
