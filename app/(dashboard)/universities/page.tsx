"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Copy, RefreshCw } from "lucide-react";

interface University {
  id: string;
  name: string;
  code: string;
  inviteCode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", code: "", isActive: true });

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      const response = await fetch("/api/universities");
      if (response.ok) {
        const data = await response.json();
        setUniversities(data);
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await fetch("/api/universities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("สร้างมหาวิทยาลัยสำเร็จ");
        setIsDialogOpen(false);
        setFormData({ name: "", code: "", isActive: true });
        fetchUniversities();
      } else {
        const data = await response.json();
        toast.error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  const handleRegenerateInvite = async (id: string) => {
    try {
      const response = await fetch(`/api/universities/${id}/regenerate-invite`, {
        method: "PATCH",
      });

      if (response.ok) {
        toast.success("สร้างรหัสเชิญใหม่สำเร็จ");
        fetchUniversities();
      } else {
        toast.error("เกิดข้อผิดพลาด");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  const copyInviteLink = (inviteCode: string) => {
    const link = `${window.location.origin}/register?code=${inviteCode}`;
    navigator.clipboard.writeText(link);
    toast.success("คัดลอกลิงก์เชิญแล้ว");
  };

  const copyInviteCode = (inviteCode: string) => {
    navigator.clipboard.writeText(inviteCode);
    toast.success("คัดลอกรหัสเชิญแล้ว");
  };

  if (isLoading) {
    return <div>กำลังโหลด...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">จัดการมหาวิทยาลัย</h2>
          <p className="text-muted-foreground">จัดการข้อมูลมหาวิทยาลัยทั้งหมด</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              เพิ่มมหาวิทยาลัย
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>เพิ่มมหาวิทยาลัย</DialogTitle>
              <DialogDescription>กรุณากรอกข้อมูลมหาวิทยาลัย</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">ชื่อมหาวิทยาลัย</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="กรุณากรอกชื่อมหาวิทยาลัย"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">รหัสมหาวิทยาลัย</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="กรุณากรอกรหัสมหาวิทยาลัย"
                />
              </div>
              <Button onClick={handleCreate} className="w-full">
                สร้าง
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {universities.map((university) => (
          <Card key={university.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{university.name}</CardTitle>
                  <CardDescription>รหัส: {university.code}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      university.isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                    }`}
                  >
                    {university.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Label className="w-24">รหัสเชิญ:</Label>
                  <code className="flex-1 px-2 py-1 bg-muted rounded text-sm font-mono">
                    {university.inviteCode}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyInviteCode(university.inviteCode)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRegenerateInvite(university.id)}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="w-24">ลิงก์เชิญ:</Label>
                  <code className="flex-1 px-2 py-1 bg-muted rounded text-sm font-mono truncate">
                    {typeof window !== "undefined" && `${window.location.origin}/register?code=${university.inviteCode}`}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyInviteLink(university.inviteCode)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
