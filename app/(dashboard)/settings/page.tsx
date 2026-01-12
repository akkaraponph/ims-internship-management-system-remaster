"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon, Mail, Shield, Database, Bell } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin" || session?.user?.role === "super-admin";
  const isSuperAdmin = session?.user?.role === "super-admin";

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
                <span className="font-medium text-green-600">ทำงานปกติ</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
