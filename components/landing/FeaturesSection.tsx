"use client";

import {
  GraduationCap,
  Building2,
  ClipboardList,
  Megaphone,
  BarChart3,
  Bell,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: GraduationCap,
    title: "จัดการนักศึกษา",
    description: "ระบบจัดการข้อมูลนักศึกษาอย่างครบถ้วน ตั้งแต่ข้อมูลส่วนตัว หลักสูตร และประวัติการฝึกงาน",
  },
  {
    icon: Building2,
    title: "จัดการบริษัท",
    description: "ฐานข้อมูลบริษัทที่สมัครเข้าร่วมโครงการฝึกงาน พร้อมข้อมูลติดต่อและรายละเอียดตำแหน่งงาน",
  },
  {
    icon: ClipboardList,
    title: "จัดการการฝึกงาน",
    description: "ติดตามสถานะการฝึกงาน อนุมัติการสมัคร และจัดการเอกสารที่เกี่ยวข้องทั้งหมด",
  },
  {
    icon: Megaphone,
    title: "ประกาศข่าวสาร",
    description: "แจ้งข่าวสารและประกาศสำคัญให้กับผู้ใช้ทุกคนในระบบได้อย่างรวดเร็วและมีประสิทธิภาพ",
  },
  {
    icon: BarChart3,
    title: "รายงานและสถิติ",
    description: "รายงานสรุปและสถิติการฝึกงานที่ละเอียด ช่วยในการตัดสินใจและวางแผน",
  },
  {
    icon: Bell,
    title: "ระบบแจ้งเตือน",
    description: "แจ้งเตือนทันทีเมื่อมีอัปเดตสำคัญ เช่น การอนุมัติการฝึกงาน หรือประกาศใหม่",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />

      <div className="container mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            คุณสมบัติหลักของระบบ
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            ระบบที่ออกแบบมาเพื่อให้การจัดการการฝึกงานเป็นเรื่องง่าย
            และมีประสิทธิภาพสูงสุด
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="glass-card border-white/10 hover:bg-white/10 hover:scale-105 transition-all duration-300 group">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors duration-300">{feature.title}</CardTitle>
                  <CardDescription className="text-muted-foreground/80">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
