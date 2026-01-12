"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Loader2, Eye, FileText } from "lucide-react";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  resume: string | null;
  resumeStatus: boolean;
  resumeApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ResumesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.role === "director" || session?.user?.role === "admin" || session?.user?.role === "super-admin") {
      fetchPendingResumes();
    }
  }, [session]);

  const fetchPendingResumes = async () => {
    try {
      const response = await fetch("/api/students/resumes/pending");
      if (response.ok) {
        const data = await response.json();
        setStudents(Array.isArray(data) ? data : []);
      } else {
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Resume รอการอนุมัติ</h2>
        <p className="text-muted-foreground">Resume ที่อัพโหลดแล้วรอการพิจารณา</p>
      </div>

      {students.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">ไม่มี Resume รอการอนุมัติ</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {students.map((student) => (
            <Card key={student.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {student.firstName} {student.lastName}
                  </CardTitle>
                  <Badge variant="secondary">รอการอนุมัติ</Badge>
                </div>
                <CardDescription>{student.email}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">เบอร์โทรศัพท์:</span>
                    <span>{student.phone || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">อัพโหลดเมื่อ:</span>
                    <span>{formatDate(student.updatedAt)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {student.resume && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(student.resume!, "_blank")}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      ดู Resume
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/director/resumes/${student.id}`)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    ดูรายละเอียด
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
