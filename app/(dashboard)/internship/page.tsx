"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Loader2, Calendar, Building2, User, Clock, CheckCircle, XCircle, Plus } from "lucide-react";
import Link from "next/link";

interface Internship {
  id: string;
  studentId: string | null;
  companyId: string | null;
  isSend: string | null;
  isConfirm: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Company {
  id: string;
  name: string;
}

export default function StudentInternshipPage() {
  const { data: session } = useSession();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.role === "student") {
      fetchInternships();
      fetchCompanies();
    }
  }, [session]);

  const fetchInternships = async () => {
    try {
      const response = await fetch("/api/internships");
      if (response.ok) {
        const data = await response.json();
        setInternships(Array.isArray(data) ? data : [data]);
      } else {
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await fetch("/api/companies");
      if (response.ok) {
        const data = await response.json();
        setCompanies(Array.isArray(data) ? data : [data]);
      }
    } catch (error) {
      // Silently fail
    }
  };

  const getCompanyName = (companyId: string | null) => {
    if (!companyId) return "-";
    const company = companies.find((c) => c.id === companyId);
    return company ? company.name : "-";
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">การฝึกงาน</h2>
          <p className="text-muted-foreground">ดูข้อมูลการฝึกงานของคุณ</p>
        </div>
        <Link href="/internship/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            สร้างแบบฟอร์มใหม่
          </Button>
        </Link>
      </div>

      {internships.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">ยังไม่มีการฝึกงาน</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {internships.map((internship) => (
            <Card key={internship.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {getCompanyName(internship.companyId)}
                  </CardTitle>
                  <Badge variant={getStatusBadgeVariant(internship.status)}>
                    {getStatusLabel(internship.status)}
                  </Badge>
                </div>
                <CardDescription>ข้อมูลการฝึกงาน</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">วันที่เริ่ม:</span>
                    <span>{formatDate(internship.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">วันที่สิ้นสุด:</span>
                    <span>{formatDate(internship.endDate)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    {internship.isSend ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="text-muted-foreground">ส่งเอกสาร:</span>
                    <span>{internship.isSend || "ยังไม่ส่ง"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {internship.isConfirm ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="text-muted-foreground">ยืนยัน:</span>
                    <span>{internship.isConfirm || "ยังไม่ยืนยัน"}</span>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      สร้างเมื่อ: {formatDate(internship.createdAt)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
