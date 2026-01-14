"use client";

import {
  Briefcase,
  Users,
  ClipboardCheck,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AnnouncementBanner } from "@/components/announcements/AnnouncementBanner";
import { useEffect, useState } from "react";

const stats = [
  {
    title: "ตำแหน่งงานที่เปิด",
    value: "0",
    change: "+0%",
    icon: Briefcase,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "ผู้สมัครทั้งหมด",
    value: "0",
    change: "+0%",
    icon: Users,
    color: "text-accent-foreground",
    bgColor: "bg-accent",
  },
  {
    title: "การฝึกงานที่อนุมัติ",
    value: "0",
    change: "+0%",
    icon: ClipboardCheck,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "นักศึกษากำลังฝึกงาน",
    value: "0",
    change: "+0%",
    icon: Users,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
  },
];

const internshipStatus = [
  { label: "รอดำเนินการ", count: 0, color: "bg-yellow-500" },
  { label: "อนุมัติแล้ว", count: 0, color: "bg-green-500" },
  { label: "ปฏิเสธ", count: 0, color: "bg-red-500" },
];

export function CompanyDashboard() {
  const [statsData, setStatsData] = useState({
    totalJobPositions: 0,
    totalApplications: 0,
    approvedInternships: 0,
    activeInterns: 0,
  });
  const [statusData, setStatusData] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [jobPositionsRes, internshipsRes] = await Promise.all([
        fetch("/api/job-positions"),
        fetch("/api/internships"),
      ]);

      const jobPositions = jobPositionsRes.ok ? await jobPositionsRes.json() : [];
      const internships = internshipsRes.ok ? await internshipsRes.json() : [];

      const activeJobPositions = jobPositions.filter((jp: any) => jp.isActive).length;
      const pendingInternships = internships.filter((i: any) => i.status === "pending").length;
      const approvedInternships = internships.filter((i: any) => i.status === "approved").length;
      const rejectedInternships = internships.filter((i: any) => i.status === "rejected").length;
      const activeInterns = internships.filter((i: any) => i.status === "approved").length;

      setStatsData({
        totalJobPositions: activeJobPositions,
        totalApplications: internships.length,
        approvedInternships: approvedInternships,
        activeInterns: activeInterns,
      });

      setStatusData({
        pending: pendingInternships,
        approved: approvedInternships,
        rejected: rejectedInternships,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalInternships = statusData.pending + statusData.approved + statusData.rejected;

  return (
    <div className="space-y-8">
      <AnnouncementBanner />
      
      <div className="space-y-2">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
          ยินดีต้อนรับ, บริษัท
        </h2>
        <p className="text-lg text-muted-foreground">ภาพรวมระบบจัดการการฝึกงานประจำวันนี้</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          let value = "0";
          if (index === 0) value = statsData.totalJobPositions.toString();
          else if (index === 1) value = statsData.totalApplications.toString();
          else if (index === 2) value = statsData.approvedInternships.toString();
          else if (index === 3) value = statsData.activeInterns.toString();

          return (
            <Card key={stat.title} className="border-2 hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 backdrop-blur-sm group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className={`${stat.bgColor} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  {value}
                </div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Internship Status */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:scale-[1.01] backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">สถานะการฝึกงาน</CardTitle>
            <CardDescription className="pt-1">ภาพรวมสถานะการฝึกงานทั้งหมด</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {internshipStatus.map((status, index) => {
                let count = 0;
                if (index === 0) count = statusData.pending;
                else if (index === 1) count = statusData.approved;
                else if (index === 2) count = statusData.rejected;

                const percentage = totalInternships > 0 ? (count / totalInternships) * 100 : 0;

                return (
                  <div key={status.label} className="space-y-3 p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`h-3 w-3 rounded-full ${status.color} shadow-sm`} />
                        <span className="font-medium">{status.label}</span>
                      </div>
                      <span className="font-bold text-lg">{count}</span>
                    </div>
                    <Progress value={percentage} className="h-3 shadow-inner" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:scale-[1.01] backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">การแจ้งเตือนล่าสุด</CardTitle>
            <CardDescription className="pt-1">อัปเดตล่าสุดจากระบบ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/10">
                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">ไม่มีแจ้งเตือนใหม่</p>
                  <p className="text-xs text-muted-foreground mt-1">ระบบจะแจ้งเตือนเมื่อมีการอัปเดต</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
