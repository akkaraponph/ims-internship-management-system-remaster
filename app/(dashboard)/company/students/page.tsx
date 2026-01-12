"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { GraduationCap } from "lucide-react";
import { useSession } from "next-auth/react";
import type { Internship, Student } from "@/types";

export default function CompanyStudentsPage() {
  const { data: session } = useSession();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [internshipsRes, studentsRes] = await Promise.all([
        fetch("/api/internships"),
        fetch("/api/students"),
      ]);

      if (internshipsRes.ok) {
        const data = await internshipsRes.json();
        setInternships(Array.isArray(data) ? data : [data]);
      }
      if (studentsRes.ok) {
        const data = await studentsRes.json();
        setStudents(Array.isArray(data) ? data : [data]);
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };

  const getStudentName = (studentId: string | null) => {
    if (!studentId) return "-";
    const student = students.find((s) => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : "-";
  };

  const getStudentEmail = (studentId: string | null) => {
    if (!studentId) return "-";
    const student = students.find((s) => s.id === studentId);
    return student ? student.email : "-";
  };

  // Filter approved internships for this company
  const companyInternships = internships.filter(
    (internship) =>
      internship.companyId === session?.user?.companyId &&
      internship.status === "approved"
  );

  // Get unique students
  const activeStudents = companyInternships
    .map((internship) => {
      const student = students.find((s) => s.id === internship.studentId);
      return student ? { ...student, internship } : null;
    })
    .filter((s) => s !== null);

  if (isLoading) {
    return <div>กำลังโหลด...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">นักศึกษาฝึกงาน</h2>
        <p className="text-muted-foreground">รายชื่อนักศึกษาที่กำลังฝึกงานที่บริษัทของคุณ</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายชื่อนักศึกษา</CardTitle>
          <CardDescription>นักศึกษาทั้งหมดที่กำลังฝึกงาน</CardDescription>
        </CardHeader>
        <CardContent>
          {activeStudents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              ยังไม่มีนักศึกษาฝึกงาน
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่อ-นามสกุล</TableHead>
                  <TableHead>อีเมล</TableHead>
                  <TableHead>โปรแกรม</TableHead>
                  <TableHead>แผนก</TableHead>
                  <TableHead>วันที่เริ่มต้น</TableHead>
                  <TableHead>วันที่สิ้นสุด</TableHead>
                  <TableHead>สถานะ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeStudents.map((studentData) => {
                  const student = studentData as Student & { internship: Internship };
                  return (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.firstName} {student.lastName}
                      </TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.program || "-"}</TableCell>
                      <TableCell>{student.department || "-"}</TableCell>
                      <TableCell>
                        {student.internship.startDate
                          ? new Date(student.internship.startDate).toLocaleDateString("th-TH")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {student.internship.endDate
                          ? new Date(student.internship.endDate).toLocaleDateString("th-TH")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">กำลังฝึกงาน</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
