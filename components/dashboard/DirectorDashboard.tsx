"use client";

"use client";

import {
  GraduationCap,
  Building2,
  ClipboardCheck,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnnouncementBanner } from "@/components/announcements/AnnouncementBanner";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export function DirectorDashboard() {
  const { data: session } = useSession();
  const [pendingResumesCount, setPendingResumesCount] = useState(0);

  useEffect(() => {
    if (session?.user?.role === "director" || session?.user?.role === "admin" || session?.user?.role === "super-admin") {
      fetchPendingResumesCount();
    }
  }, [session]);

  const fetchPendingResumesCount = async () => {
    try {
      const response = await fetch("/api/students/resumes/pending");
      if (response.ok) {
        const data = await response.json();
        setPendingResumesCount(Array.isArray(data) ? data.length : 0);
      }
    } catch (error) {
      console.error("Error fetching pending resumes count:", error);
    }
  };

  return (
    <div className="space-y-8">
      <AnnouncementBanner />
      
      <div className="space-y-2">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
          ยินดีต้อนรับ, อาจารย์ที่ปรึกษา
        </h2>
        <p className="text-lg text-muted-foreground">ภาพรวมนักศึกษาในความดูแล</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 backdrop-blur-sm group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">นักศึกษาในความดูแล</CardTitle>
            <div className="p-3 rounded-xl bg-muted group-hover:scale-110 transition-transform duration-300 shadow-md">
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">0</div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 backdrop-blur-sm group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">การฝึกงานที่รออนุมัติ</CardTitle>
            <div className="p-3 rounded-xl bg-yellow-500/10 group-hover:scale-110 transition-transform duration-300 shadow-md">
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">0</div>
            <Link href="/director/internships/pending">
              <Button variant="link" className="p-0 h-auto mt-2 hover:text-primary transition-colors">
                ดูรายการ <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 backdrop-blur-sm group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">การฝึกงานที่อนุมัติ</CardTitle>
            <div className="p-3 rounded-xl bg-green-500/10 group-hover:scale-110 transition-transform duration-300 shadow-md">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">0</div>
            <Link href="/director/internships/confirmed">
              <Button variant="link" className="p-0 h-auto mt-2 hover:text-primary transition-colors">
                ดูรายการ <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 backdrop-blur-sm group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resume รอการอนุมัติ</CardTitle>
            <div className="p-3 rounded-xl bg-yellow-500/10 group-hover:scale-110 transition-transform duration-300 shadow-md">
              <FileText className="h-5 w-5 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">{pendingResumesCount}</div>
            <Link href="/director/resumes">
              <Button variant="link" className="p-0 h-auto mt-2 hover:text-primary transition-colors">
                ดูรายการ <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:scale-[1.01] backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">นักศึกษาในความดูแล</CardTitle>
          <CardDescription className="pt-1">รายชื่อนักศึกษาที่อยู่ในความดูแล</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-12">
            <GraduationCap className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-sm">ยังไม่มีข้อมูลนักศึกษา</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
