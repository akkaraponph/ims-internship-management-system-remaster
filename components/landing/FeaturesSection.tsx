"use client";

import {
  GraduationCap,
  Building2,
  ClipboardList,
  Megaphone,
  BarChart3,
  Bell,
} from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: GraduationCap,
    title: "จัดการนักศึกษา",
    description: "ระบบจัดการข้อมูลนักศึกษาอย่างครบถ้วน ตั้งแต่ข้อมูลส่วนตัว หลักสูตร และประวัติการฝึกงาน",
    gradient: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: Building2,
    title: "จัดการบริษัท",
    description: "ฐานข้อมูลบริษัทที่สมัครเข้าร่วมโครงการฝึกงาน พร้อมข้อมูลติดต่อและรายละเอียดตำแหน่งงาน",
    gradient: "from-purple-500/20 to-pink-500/20",
    iconColor: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    icon: ClipboardList,
    title: "จัดการการฝึกงาน",
    description: "ติดตามสถานะการฝึกงาน อนุมัติการสมัคร และจัดการเอกสารที่เกี่ยวข้องทั้งหมด",
    gradient: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    icon: Megaphone,
    title: "ประกาศข่าวสาร",
    description: "แจ้งข่าวสารและประกาศสำคัญให้กับผู้ใช้ทุกคนในระบบได้อย่างรวดเร็วและมีประสิทธิภาพ",
    gradient: "from-orange-500/20 to-red-500/20",
    iconColor: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    icon: BarChart3,
    title: "รายงานและสถิติ",
    description: "รายงานสรุปและสถิติการฝึกงานที่ละเอียด ช่วยในการตัดสินใจและวางแผน",
    gradient: "from-indigo-500/20 to-blue-500/20",
    iconColor: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
  },
  {
    icon: Bell,
    title: "ระบบแจ้งเตือน",
    description: "แจ้งเตือนทันทีเมื่อมีอัปเดตสำคัญ เช่น การอนุมัติการฝึกงาน หรือประกาศใหม่",
    gradient: "from-rose-500/20 to-pink-500/20",
    iconColor: "text-rose-500",
    bgColor: "bg-rose-500/10",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      {/* Varied Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl -z-10" />

      <div className="container mx-auto">
        <div className="text-center space-y-4 mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            คุณสมบัติหลักของระบบ
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            ระบบที่ออกแบบมาเพื่อให้การจัดการการฝึกงานเป็นเรื่องง่าย
            และมีประสิทธิภาพสูงสุด
          </p>
        </div>

        <div className="space-y-24">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isEven = index % 2 === 0;
            
            return (
              <div
                key={index}
                className={`grid lg:grid-cols-2 gap-12 items-center ${
                  isEven ? "" : "lg:grid-flow-dense"
                }`}
              >
                {/* Visual/Icon Section */}
                <div
                  className={`relative ${
                    isEven ? "lg:order-1" : "lg:order-2"
                  }`}
                >
                  <div className={`relative p-12 rounded-3xl bg-gradient-to-br ${feature.gradient} border border-border/50 backdrop-blur-sm`}>
                    <div className="absolute inset-0 bg-grid-pattern opacity-5" />
                    <div className="relative flex items-center justify-center">
                      <div className={`h-32 w-32 rounded-2xl ${feature.bgColor} flex items-center justify-center shadow-2xl transform transition-all duration-500 hover:scale-110 hover:rotate-6`}>
                        <Icon className={`h-16 w-16 ${feature.iconColor}`} />
                      </div>
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
                    <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-secondary/20 rounded-full blur-2xl" />
                  </div>
                </div>

                {/* Content Section */}
                <div
                  className={`space-y-6 ${
                    isEven ? "lg:order-2" : "lg:order-1"
                  }`}
                >
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border">
                      <span className="text-sm font-medium text-muted-foreground">
                        Feature {index + 1}
                      </span>
                    </div>
                    <h3 className="text-3xl sm:text-4xl font-bold tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                  
                  {/* Additional visual element */}
                  <div className="flex items-center gap-4 pt-4">
                    <div className={`h-1 w-16 rounded-full bg-gradient-to-r ${feature.gradient}`} />
                    <div className="h-1 w-8 rounded-full bg-muted" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
