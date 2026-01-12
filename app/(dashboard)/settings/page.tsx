"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon, Mail, Shield, Database, Bell, TestTube } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { DemoModeToggle, DemoModeResetButton } from "@/components/demo/DemoModeToggle";
import { DemoRoleSelector } from "@/components/demo/DemoRoleSelector";
import { useDemoMode } from "@/lib/demo/demo-context";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { isDemo, selectedRole, showRoleSelector, changeRole, closeRoleSelector } = useDemoMode();
  const isAdmin = session?.user?.role === "admin" || session?.user?.role === "super-admin";
  const isSuperAdmin = session?.user?.role === "super-admin";

  const getRoleLabel = (role: string | null): string => {
    const roleMap: Record<string, string> = {
      "super-admin": "ผู้ดูแลระบบหลัก",
      admin: "ผู้ดูแลระบบ",
      director: "อาจารย์ที่ปรึกษา",
      student: "นักศึกษา",
      company: "บริษัท",
    };
    return roleMap[role || ""] || "";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">ตั้งค่าระบบ</h2>
        <p className="text-muted-foreground">จัดการการตั้งค่าระบบและค่าคอนฟิกต่างๆ</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isAdmin && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                <CardTitle>การตั้งค่าอีเมล</CardTitle>
              </div>
              <CardDescription>จัดการเทมเพลตอีเมลและตั้งค่า SMTP</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/settings/email">
                <Button variant="outline" className="w-full">
                  ไปที่การตั้งค่าอีเมล
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {isSuperAdmin && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <CardTitle>จัดการบทบาท</CardTitle>
              </div>
              <CardDescription>สร้างและจัดการบทบาทและสิทธิ์</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/settings/roles">
                <Button variant="outline" className="w-full">
                  ไปที่จัดการบทบาท
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {isAdmin && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                <CardTitle>การสำรองข้อมูล</CardTitle>
              </div>
              <CardDescription>สร้างและจัดการการสำรองข้อมูล</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/settings/backup">
                <Button variant="outline" className="w-full">
                  ไปที่การสำรองข้อมูล
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>การแจ้งเตือน</CardTitle>
            </div>
            <CardDescription>ตั้งค่าการแจ้งเตือนของคุณ</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/settings/notifications">
              <Button variant="outline" className="w-full">
                ไปที่การตั้งค่าการแจ้งเตือน
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              <CardTitle>Demo Mode</CardTitle>
            </div>
            <CardDescription>เปิด/ปิดโหมด Demo สำหรับทดสอบระบบ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                โหมด Demo จะใช้ข้อมูลจาก localStorage แทนการเชื่อมต่อกับฐานข้อมูลจริง
              </p>
              <DemoModeToggle />
            </div>
            {isDemo && (
              <div className="pt-4 border-t space-y-4">
                {selectedRole && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">บทบาทปัจจุบัน:</span>
                      <Badge variant="secondary">{getRoleLabel(selectedRole)}</Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={changeRole}
                      className="w-full"
                    >
                      เปลี่ยนบทบาท
                    </Button>
                  </div>
                )}
                <DemoModeResetButton />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลระบบ</CardTitle>
            <CardDescription>ข้อมูลและสถิติของระบบ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">เวอร์ชันระบบ:</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">สถานะ:</span>
                <span className={`font-medium ${isDemo ? "text-yellow-600" : "text-green-600"}`}>
                  {isDemo ? "Demo Mode" : "ทำงานปกติ"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <DemoRoleSelector
        open={showRoleSelector}
        onOpenChange={closeRoleSelector}
        onRoleSelected={() => {
          closeRoleSelector();
          window.location.reload();
        }}
      />
    </div>
  );
}
