"use client";

import { School, GraduationCap, Building2, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const benefits = [
  {
    icon: School,
    title: "สำหรับมหาวิทยาลัย",
    items: [
      "ลดเวลาในการจัดการเอกสารและข้อมูล",
      "ติดตามสถานะการฝึกงานแบบเรียลไทม์",
      "รายงานและสถิติที่ละเอียดและครบถ้วน",
      "ระบบแจ้งเตือนอัตโนมัติ",
      "จัดการผู้ใช้และสิทธิ์การเข้าถึงได้ง่าย",
    ],
  },
  {
    icon: GraduationCap,
    title: "สำหรับนักศึกษา",
    items: [
      "สมัครฝึกงานได้ง่ายและรวดเร็ว",
      "ติดตามสถานะการสมัครแบบเรียลไทม์",
      "จัดการข้อมูลส่วนตัวได้ด้วยตนเอง",
      "รับการแจ้งเตือนทันทีเมื่อมีอัปเดต",
      "เข้าถึงเอกสารและประกาศได้ตลอดเวลา",
    ],
  },
  {
    icon: Building2,
    title: "สำหรับบริษัท",
    items: [
      "รับนักศึกษาฝึกงานได้อย่างมีประสิทธิภาพ",
      "จัดการข้อมูลตำแหน่งงานและบริษัท",
      "ติดตามนักศึกษาฝึกงานได้ง่าย",
      "รับการแจ้งเตือนเมื่อมีการสมัครใหม่",
      "ระบบที่ใช้งานง่ายและสะดวก",
    ],
  },
];

export function BenefitsSection() {
  return (
    <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            ข้อดีของระบบ
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            ระบบที่ออกแบบมาเพื่อตอบสนองความต้องการของทุกฝ่าย
            ให้การจัดการการฝึกงานเป็นเรื่องง่าย
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {benefit.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
