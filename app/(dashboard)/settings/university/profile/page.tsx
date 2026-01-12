"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Loader2, Save, School, Copy, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

interface University {
  id: string;
  name: string;
  code: string;
  inviteCode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function UniversityProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [university, setUniversity] = useState<University | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    isActive: true,
  });

  const isSuperAdmin = session?.user?.role === "super-admin";
  const isReadOnly = !isSuperAdmin;

  useEffect(() => {
    if (session?.user) {
      // Get university ID from session
      const universityId = session.user.universityId;
      if (universityId) {
        fetchUniversity(universityId);
      } else if (isSuperAdmin) {
        // Super-admin might access via URL parameter
        // For now, redirect to universities page
        router.push("/universities");
      } else {
        toast.error("ไม่พบข้อมูลมหาวิทยาลัย");
        router.push("/dashboard");
      }
    }
  }, [session, router, isSuperAdmin]);

  const fetchUniversity = async (universityId: string) => {
    try {
      const response = await fetch(`/api/universities/${universityId}`);
      if (response.ok) {
        const data = await response.json();
        setUniversity(data);
        setFormData({
          name: data.name || "",
          code: data.code || "",
          isActive: data.isActive ?? true,
        });
      } else if (response.status === 403) {
        toast.error("คุณไม่มีสิทธิ์เข้าถึงข้อมูลมหาวิทยาลัยนี้");
        router.push("/dashboard");
      } else {
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      }
    } catch (error) {
      console.error("Error fetching university:", error);
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!university || !isSuperAdmin) return;

    if (!formData.name.trim()) {
      toast.error("กรุณากรอกชื่อมหาวิทยาลัย");
      return;
    }

    if (!formData.code.trim()) {
      toast.error("กรุณากรอกรหัสมหาวิทยาลัย");
      return;
    }

    setIsSaving(true);
    try {
      const payload: any = {
        name: formData.name.trim(),
        code: formData.code.trim(),
        isActive: formData.isActive,
      };

      const response = await fetch(`/api/universities/${university.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("บันทึกข้อมูลสำเร็จ");
        await fetchUniversity(university.id);
      } else {
        const data = await response.json();
        toast.error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerateInvite = async () => {
    if (!university || !isSuperAdmin) return;

    try {
      const response = await fetch(`/api/universities/${university.id}/regenerate-invite`, {
        method: "PATCH",
      });

      if (response.ok) {
        toast.success("สร้างรหัสเชิญใหม่สำเร็จ");
        await fetchUniversity(university.id);
      } else {
        toast.error("เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.error("Error regenerating invite code:", error);
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!university) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">ไม่พบข้อมูลมหาวิทยาลัย</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">ข้อมูลมหาวิทยาลัย</h2>
        <p className="text-muted-foreground">
          {isReadOnly ? "ดูข้อมูลมหาวิทยาลัยของคุณ" : "จัดการข้อมูลมหาวิทยาลัย"}
        </p>
      </div>

      <div className="space-y-4">
        {/* University Information Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="h-5 w-5" />
              ข้อมูลมหาวิทยาลัย
            </CardTitle>
            <CardDescription>ข้อมูลพื้นฐานของมหาวิทยาลัย</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">ชื่อมหาวิทยาลัย *</Label>
              {isReadOnly ? (
                <p className="text-lg font-semibold">{formData.name}</p>
              ) : (
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">รหัสมหาวิทยาลัย *</Label>
              {isReadOnly ? (
                <p className="text-lg font-semibold">{formData.code}</p>
              ) : (
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="isActive">สถานะ</Label>
              {isReadOnly ? (
                <p className="text-lg">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      formData.isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                    }`}
                  >
                    {formData.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                  </span>
                </p>
              ) : (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">
                    เปิดใช้งาน
                  </Label>
                </div>
              )}
            </div>

            {!isReadOnly && (
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    บันทึกข้อมูล
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Invite Code Section */}
        <Card>
          <CardHeader>
            <CardTitle>รหัสเชิญ (Invite Code)</CardTitle>
            <CardDescription>
              {isReadOnly
                ? "รหัสเชิญสำหรับให้นักศึกษาลงทะเบียน (อ่านอย่างเดียว)"
                : "ใช้รหัสเชิญหรือลิงก์เชิญเพื่อให้นักศึกษาลงทะเบียน"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>รหัสเชิญ</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-4 py-2 bg-muted rounded text-lg font-mono">
                  {university.inviteCode}
                </code>
                <Button variant="outline" onClick={copyInviteCode}>
                  <Copy className="mr-2 h-4 w-4" />
                  คัดลอก
                </Button>
                {isSuperAdmin && (
                  <Button variant="outline" onClick={handleRegenerateInvite}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    สร้างใหม่
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>ลิงก์เชิญ</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-4 py-2 bg-muted rounded text-sm font-mono truncate">
                  {typeof window !== "undefined" &&
                    `${window.location.origin}/register?code=${university.inviteCode}`}
                </code>
                <Button variant="outline" onClick={copyInviteLink}>
                  <Copy className="mr-2 h-4 w-4" />
                  คัดลอก
                </Button>
              </div>
            </div>

            {isReadOnly && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>หมายเหตุ:</strong> คุณสามารถดูและคัดลอกรหัสเชิญได้ แต่ไม่สามารถแก้ไขได้
                  หากต้องการแก้ไข กรุณาติดต่อผู้ดูแลระบบหลัก
                </p>
              </div>
            )}

            {!isReadOnly && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>คำแนะนำ:</strong> ส่งรหัสเชิญหรือลิงก์เชิญให้นักศึกษาเพื่อให้พวกเขาสามารถลงทะเบียนในระบบได้
                  นักศึกษาจะต้องใช้รหัสเชิญนี้ในการลงทะเบียนครั้งแรก
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
