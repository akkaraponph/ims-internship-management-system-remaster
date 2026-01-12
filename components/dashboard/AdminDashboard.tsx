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
    <div className="space-y-6">
      <AnnouncementBanner />
      
      <div>
        <h2 className="text-2xl font-bold tracking-tight">ยินดีต้อนรับ, ผู้ดูแลระบบ</h2>
        <p className="text-muted-foreground">ภาพรวมระบบจัดการการฝึกงานประจำวันนี้</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="mr-1 inline h-3 w-3 text-green-500" />
                {stat.change} จากเดือนที่แล้ว
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>สถานะการฝึกงาน</CardTitle>
            <CardDescription>ภาพรวมสถานะการฝึกงานทั้งหมด</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {internshipStatus.map((status) => (
              <div key={status.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{status.label}</span>
                  <span className="font-medium">{status.count}</span>
                </div>
                <Progress
                  value={totalInternships > 0 ? (status.count / totalInternships) * 100 : 0}
                  className="h-2"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>กิจกรรมล่าสุด</CardTitle>
            <CardDescription>การดำเนินการในระบบล่าสุด</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {activity.status === "pending" && (
                      <Clock className="h-4 w-4 text-yellow-500" />
                    )}
                    {activity.status === "approved" && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {activity.status === "new" && (
                      <AlertCircle className="h-4 w-4 text-blue-500" />
                    )}
                    {activity.status === "updated" && (
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.student !== "-" && activity.student}
                      {activity.student !== "-" && activity.company !== "-" && " → "}
                      {activity.company !== "-" && activity.company}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
