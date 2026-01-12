"use client";

import {
  GraduationCap,
  Building2,
  ClipboardCheck,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnnouncementBanner } from "@/components/announcements/AnnouncementBanner";
import Link from "next/link";

export function DirectorDashboard() {
  return (
    <div className="space-y-6">
      <AnnouncementBanner />
      
      <div>
        <h2 className="text-2xl font-bold tracking-tight">ยินดีต้อนรับ, อาจารย์ที่ปรึกษา</h2>
        <p className="text-muted-foreground">ภาพรวมนักศึกษาในความดูแล</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">นักศึกษาในความดูแล</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">การฝึกงานที่รออนุมัติ</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <Link href="/director/internships/pending">
              <Button variant="link" className="p-0 h-auto mt-2">
                ดูรายการ <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">การฝึกงานที่อนุมัติ</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <Link href="/director/internships/confirmed">
              <Button variant="link" className="p-0 h-auto mt-2">
                ดูรายการ <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>นักศึกษาในความดูแล</CardTitle>
          <CardDescription>รายชื่อนักศึกษาที่อยู่ในความดูแล</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            ยังไม่มีข้อมูลนักศึกษา
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
