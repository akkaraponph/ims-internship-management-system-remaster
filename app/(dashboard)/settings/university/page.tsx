"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, RefreshCw, Users } from "lucide-react";

interface University {
  id: string;
  name: string;
  code: string;
  inviteCode: string;
  isActive: boolean;
}

export default function UniversitySettingsPage() {
  const [university, setUniversity] = useState<University | null>(null);
  const [studentCount, setStudentCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUniversity();
    fetchStudentCount();
  }, []);

  const fetchUniversity = async () => {
    try {
      const response = await fetch("/api/universities");
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          setUniversity(data[0]);
        }
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudentCount = async () => {
    try {
      const response = await fetch("/api/students");
      if (response.ok) {
        const data = await response.json();
        setStudentCount(data.length);
      }
    } catch (error) {
      // Silently fail
    }
  };

  const handleRegenerateInvite = async () => {
    if (!university) return;

    try {
      const response = await fetch(`/api/universities/${university.id}/regenerate-invite`, {
        method: "PATCH",
      });

      if (response.ok) {
        toast.success("สร้างรหัสเชิญใหม่สำเร็จ");
        fetchUniversity();
      } else {
        toast.error("เกิดข้อผิดพลาด");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  const copyInviteLink = () => {
    if (!university) return;
    const link = `${window.location.origin}/register?code=${university.inviteCode}`;
    navigator.clipboard.writeText(link);
    toast.success("คัดลอกลิงก์เชิญแล้ว");
  };

  const copyInviteCode = () => {
    if (!university) return;
    navigator.clipboard.writeText(university.inviteCode);
    toast.success("คัดลอกรหัสเชิญแล้ว");
  };

  if (isLoading) {
    return <div>กำลังโหลด...</div>;
  }

  if (!university) {
    return <div>ไม่พบข้อมูลมหาวิทยาลัย</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">ตั้งค่ามหาวิทยาลัย</h2>
        <p className="text-muted-foreground">จัดการข้อมูลและรหัสเชิญของมหาวิทยาลัย</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลมหาวิทยาลัย</CardTitle>
            <CardDescription>ข้อมูลพื้นฐานของมหาวิทยาลัย</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">ชื่อมหาวิทยาลัย</label>
              <p className="text-lg font-semibold">{university.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">รหัสมหาวิทยาลัย</label>
              <p className="text-lg font-semibold">{university.code}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">สถานะ</label>
              <p className="text-lg">
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    university.isActive
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                  }`}
                >
                  {university.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              สถิติ
            </CardTitle>
            <CardDescription>จำนวนนักศึกษาที่ลงทะเบียน</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{studentCount}</div>
            <p className="text-sm text-muted-foreground mt-2">นักศึกษา</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รหัสเชิญ (Invite Code)</CardTitle>
          <CardDescription>ใช้รหัสเชิญหรือลิงก์เชิญเพื่อให้นักศึกษาลงทะเบียน</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">รหัสเชิญ</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-4 py-2 bg-muted rounded text-lg font-mono">
                {university.inviteCode}
              </code>
              <Button variant="outline" onClick={copyInviteCode}>
                <Copy className="mr-2 h-4 w-4" />
                คัดลอก
              </Button>
              <Button variant="outline" onClick={handleRegenerateInvite}>
                <RefreshCw className="mr-2 h-4 w-4" />
                สร้างใหม่
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">ลิงก์เชิญ</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-4 py-2 bg-muted rounded text-sm font-mono truncate">
                {typeof window !== "undefined" && `${window.location.origin}/register?code=${university.inviteCode}`}
              </code>
              <Button variant="outline" onClick={copyInviteLink}>
                <Copy className="mr-2 h-4 w-4" />
                คัดลอก
              </Button>
            </div>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>คำแนะนำ:</strong> ส่งรหัสเชิญหรือลิงก์เชิญให้นักศึกษาเพื่อให้พวกเขาสามารถลงทะเบียนในระบบได้
              นักศึกษาจะต้องใช้รหัสเชิญนี้ในการลงทะเบียนครั้งแรก
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
