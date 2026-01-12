"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Loader2, CheckCircle, XCircle, ArrowLeft, FileText, Download } from "lucide-react";
import Link from "next/link";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  program: string | null;
  resume: string | null;
  resumeStatus: boolean;
  resumeApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ResumeDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (session && id) {
      fetchStudent();
    }
  }, [session, id]);

  const fetchStudent = async () => {
    try {
      const response = await fetch(`/api/students/${id}`);
      if (response.ok) {
        const data = await response.json();
        setStudent(data);
      } else {
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm("ยืนยันการอนุมัติ Resume นี้?")) return;

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/students/${id}/resume/approve`, {
        method: "POST",
      });

      if (response.ok) {
        toast.success("อนุมัติ Resume สำเร็จ");
        router.push("/director/resumes");
      } else {
        const error = await response.json();
        toast.error(error.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!confirm("ยืนยันการปฏิเสธ Resume นี้?")) return;

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/students/${id}/resume/reject`, {
        method: "POST",
      });

      if (response.ok) {
        toast.success("ปฏิเสธ Resume สำเร็จ");
        router.push("/director/resumes");
      } else {
        const error = await response.json();
        toast.error(error.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">ไม่พบข้อมูลนักศึกษา</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">รายละเอียด Resume</h2>
          <p className="text-muted-foreground">ตรวจสอบและอนุมัติ Resume ของนักศึกษา</p>
        </div>
        <Link href="/director/resumes">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            กลับ
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลนักศึกษา</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">ชื่อ-นามสกุล</span>
                <span className="font-medium">
                  {student.firstName} {student.lastName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">อีเมล</span>
                <span className="font-medium">{student.email}</span>
              </div>
              {student.phone && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">เบอร์โทรศัพท์</span>
                  <span className="font-medium">{student.phone}</span>
                </div>
              )}
              {student.program && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">สาขาวิชา</span>
                  <span className="font-medium">{student.program}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">อัพโหลดเมื่อ</span>
                <span className="font-medium">{formatDate(student.updatedAt)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resume</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {student.resume ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant={student.resumeStatus ? "default" : "secondary"}>
                    {student.resumeStatus ? "อัพโหลดแล้ว" : "ยังไม่อัพโหลด"}
                  </Badge>
                  <Badge variant={student.resumeApproved ? "default" : "secondary"}>
                    {student.resumeApproved ? "อนุมัติแล้ว" : "รอการอนุมัติ"}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.open(student.resume!, "_blank")}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    ดู Resume
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = student.resume!;
                      link.download = `resume-${student.firstName}-${student.lastName}.pdf`;
                      link.click();
                    }}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
                <div className="border rounded-lg p-4 bg-muted/50">
                  <iframe
                    src={student.resume}
                    className="w-full h-96 border-0"
                    title="Resume Preview"
                  />
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">ไม่พบ Resume</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>การดำเนินการ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 justify-end">
            <Button
              variant="outline"
              onClick={() => router.push("/director/resumes")}
              disabled={isProcessing}
            >
              ยกเลิก
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isProcessing || student.resumeApproved}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังดำเนินการ...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  ปฏิเสธ
                </>
              )}
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isProcessing || student.resumeApproved}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังดำเนินการ...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  อนุมัติ
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
