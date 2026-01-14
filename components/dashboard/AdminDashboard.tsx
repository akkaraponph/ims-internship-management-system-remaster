"use client";

import {
  Users,
  GraduationCap,
  Building2,
  ClipboardCheck,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AnnouncementBanner } from "@/components/announcements/AnnouncementBanner";

const stats = [
  {
    title: "นักศึกษาทั้งหมด",
    value: "0",
    change: "+0%",
    icon: GraduationCap,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "บริษัทที่ร่วมโครงการ",
    value: "0",
    change: "+0%",
    icon: Building2,
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
    title: "ผู้ใช้งานระบบ",
    value: "0",
    change: "+0%",
    icon: Users,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
  },
];

const recentActivities = [
  {
    id: 1,
    action: "นักศึกษาสมัครฝึกงาน",
    student: "สมชาย ใจดี",
    company: "บริษัท ABC จำกัด",
    status: "pending",
    time: "5 นาทีที่แล้ว",
  },
];

const internshipStatus = [
  { label: "รอดำเนินการ", count: 0, color: "bg-yellow-500" },
  { label: "อนุมัติแล้ว", count: 0, color: "bg-green-500" },
  { label: "กำลังฝึกงาน", count: 0, color: "bg-blue-500" },
  { label: "เสร็จสิ้น", count: 0, color: "bg-muted-foreground" },
];

export function AdminDashboard() {
  const totalInternships = internshipStatus.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="space-y-8">
      <AnnouncementBanner />
      
      <div className="space-y-2">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
          ยินดีต้อนรับ, ผู้ดูแลระบบ
        </h2>
        <p className="text-lg text-muted-foreground">ภาพรวมระบบจัดการการฝึกงานประจำวันนี้</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-2 hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 backdrop-blur-sm group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`rounded-xl p-3 ${stat.bgColor} group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                {stat.change} จากเดือนที่แล้ว
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:scale-[1.01] backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">สถานะการฝึกงาน</CardTitle>
            <CardDescription className="pt-1">ภาพรวมสถานะการฝึกงานทั้งหมด</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {internshipStatus.map((status) => (
              <div key={status.label} className="space-y-3 p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${status.color} shadow-sm`} />
                    <span className="font-medium">{status.label}</span>
                  </div>
                  <span className="font-bold text-lg">{status.count}</span>
                </div>
                <Progress
                  value={totalInternships > 0 ? (status.count / totalInternships) * 100 : 0}
                  className="h-3 shadow-inner"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:scale-[1.01] backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">กิจกรรมล่าสุด</CardTitle>
            <CardDescription className="pt-1">การดำเนินการในระบบล่าสุด</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                    <div className="mt-0.5 flex-shrink-0">
                      {activity.status === "pending" && (
                        <Clock className="h-5 w-5 text-yellow-500" />
                      )}
                      {activity.status === "approved" && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {activity.status === "new" && (
                        <AlertCircle className="h-5 w-5 text-blue-500" />
                      )}
                      {activity.status === "updated" && (
                        <TrendingUp className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.student !== "-" && activity.student}
                        {activity.student !== "-" && activity.company !== "-" && " → "}
                        {activity.company !== "-" && activity.company}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0">{activity.time}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-sm">ยังไม่มีกิจกรรมล่าสุด</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
