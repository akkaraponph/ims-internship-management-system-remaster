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
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle, XCircle, Eye } from "lucide-react";
import { useSession } from "next-auth/react";
import type { Internship, Student, JobPosition } from "@/types";

export default function CompanyApplicationsPage() {
  const { data: session } = useSession();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [jobPositions, setJobPositions] = useState<JobPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [internshipsRes, studentsRes, jobPositionsRes] = await Promise.all([
        fetch("/api/internships"),
        fetch("/api/students"),
        fetch("/api/job-positions"),
      ]);

      if (internshipsRes.ok) {
        const data = await internshipsRes.json();
        setInternships(Array.isArray(data) ? data : [data]);
      }
      if (studentsRes.ok) {
        const data = await studentsRes.json();
        setStudents(Array.isArray(data) ? data : [data]);
      }
      if (jobPositionsRes.ok) {
        const data = await jobPositionsRes.json();
        setJobPositions(Array.isArray(data) ? data : [data]);
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

  const getJobPositionTitle = (jobPositionId: string | null) => {
    if (!jobPositionId) return "-";
    const jobPosition = jobPositions.find((jp) => jp.id === jobPositionId);
    return jobPosition ? jobPosition.title : "-";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "รอดำเนินการ",
      approved: "อนุมัติแล้ว",
      rejected: "ปฏิเสธ",
    };
    return labels[status] || status;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "default";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const handleStatusChange = async (internshipId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/internships/${internshipId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success("อัปเดตสถานะสำเร็จ");
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  // Filter internships for this company
  const companyInternships = internships.filter(
    (internship) => internship.companyId === session?.user?.companyId
  );

  if (isLoading) {
    return <div>กำลังโหลด...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">ผู้สมัคร</h2>
        <p className="text-muted-foreground">จัดการการสมัครฝึกงานจากนักศึกษา</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายการผู้สมัคร</CardTitle>
          <CardDescription>ผู้สมัครทั้งหมดที่สมัครตำแหน่งงานของคุณ</CardDescription>
        </CardHeader>
        <CardContent>
          {companyInternships.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              ยังไม่มีผู้สมัคร
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่อนักศึกษา</TableHead>
                  <TableHead>ตำแหน่งงาน</TableHead>
                  <TableHead>วันที่สมัคร</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companyInternships.map((internship) => (
                  <TableRow key={internship.id}>
                    <TableCell className="font-medium">
                      {getStudentName(internship.studentId)}
                    </TableCell>
                    <TableCell>{getJobPositionTitle(internship.jobPositionId || null)}</TableCell>
                    <TableCell>
                      {internship.createdAt
                        ? new Date(internship.createdAt).toLocaleDateString("th-TH")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(internship.status || "pending")}>
                        {getStatusLabel(internship.status || "pending")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {internship.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(internship.id, "approved")}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            อนุมัติ
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(internship.id, "rejected")}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            ปฏิเสธ
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
