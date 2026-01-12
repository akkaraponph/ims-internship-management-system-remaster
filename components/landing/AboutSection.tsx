"use client";

import { Code2, Database, Shield, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const techStack = [
  {
    icon: Code2,
    name: "Next.js 16",
    description: "Framework ที่ทันสมัยและมีประสิทธิภาพสูง",
  },
  {
    icon: Database,
    name: "PostgreSQL",
    description: "ฐานข้อมูลที่เสถียรและปลอดภัย",
  },
  {
    icon: Shield,
    name: "NextAuth.js",
    description: "ระบบยืนยันตัวตนที่ปลอดภัย",
  },
  {
    icon: Zap,
    name: "TypeScript",
    description: "Type-safe เพื่อความน่าเชื่อถือ",
  },
];

const roles = [
  {
    title: "ผู้ดูแลระบบ (Admin)",
    description: "จัดการผู้ใช้ นักศึกษา บริษัท และการฝึกงานทั้งหมด ควบคุมระบบได้อย่างเต็มรูปแบบ",
  },
  {
    title: "อาจารย์ที่ปรึกษา (Director)",
    description: "ดูแลนักศึกษาในความดูแล อนุมัติการฝึกงาน และติดตามความคืบหน้า",
  },
  {
    title: "นักศึกษา (Student)",
    description: "จัดการข้อมูลส่วนตัว สมัครฝึกงาน และติดตามสถานะการฝึกงาน",
  },
];

export function AboutSection() {
  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            เกี่ยวกับระบบ
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            ระบบจัดการการฝึกงานที่พัฒนาด้วยเทคโนโลยีล่าสุด
            เพื่อให้การจัดการการฝึกงานเป็นเรื่องง่ายและมีประสิทธิภาพ
          </p>
        </div>

        {/* Technology Stack */}
        <div className="mb-20">
          <h3 className="text-2xl font-semibold mb-8 text-center">
            เทคโนโลยีที่ใช้
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {techStack.map((tech, index) => {
              const Icon = tech.icon;
              return (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mx-auto mb-4">
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">{tech.name}</CardTitle>
                    <CardDescription>{tech.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>

        {/* User Roles */}
        <div>
          <h3 className="text-2xl font-semibold mb-8 text-center">
            บทบาทผู้ใช้ในระบบ
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {roles.map((role, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl">{role.title}</CardTitle>
                  <CardDescription className="text-base">
                    {role.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
