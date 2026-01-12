"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Loader2, Eye, CheckCircle, XCircle } from "lucide-react";

interface Internship {
  id: string;
  studentId: string | null;
  companyId: string | null;
  isSend: string | null;
  isConfirm: string | null;
  status: string;
  createdAt: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  company?: {
    id: string;
    name: string;
  };
}

export default function PendingInternshipsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.role === "director" || session?.user?.role === "admin") {
      fetchPendingInternships();
    }
  }, [session]);

  const fetchPendingInternships = async () => {
    try {
      const response = await fetch("/api/internships?status=pending&isSend=1&isConfirm=0");
      if (response.ok) {
        const data = await response.json();
        setInternships(Array.isArray(data) ? data : []);
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
        <h2 className="text-2xl font-bold tracking-tight">แบบฟอร์มรอการยืนยัน</h2>
        <p className="text-muted-foreground">แบบฟอร์มที่ส่งมาแล้วรอการพิจารณา</p>
      </div>

      {internships.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">ไม่มีแบบฟอร์มรอการยืนยัน</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {internships.map((internship) => (
            <Card key={internship.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {internship.student
                      ? `${internship.student.firstName} ${internship.student.lastName}`
                      : "ไม่ระบุชื่อ"}
                  </CardTitle>
                  <Badge variant="secondary">รอการยืนยัน</Badge>
                </div>
                <CardDescription>
                  {internship.company ? internship.company.name : "ไม่ระบุบริษัท"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">อีเมล:</span>
                    <span>{internship.student?.email || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">ส่งเมื่อ:</span>
                    <span>{formatDate(internship.createdAt)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/director/internships/${internship.id}`)}
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
