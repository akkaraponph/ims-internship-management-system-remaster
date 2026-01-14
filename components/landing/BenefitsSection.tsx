"use client";

import { School, GraduationCap, Building2, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const benefits = [
  {
    icon: School,
    title: "สำหรับมหาวิทยาลัย",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10",
    iconColor: "text-blue-500",
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
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-500/10",
    iconColor: "text-purple-500",
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
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
    items: [
      "รับนักศึกษาฝึกงานได้อย่างมีประสิทธิภาพ",
      "จัดการข้อมูลตำแหน่งงานและบริษัท",
      "ติดตามนักศึกษาฝึกงานได้ง่าย",
      "รับการแจ้งเตือนเมื่อมีการสมัครใหม่",
      "ระบบที่ใช้งานง่ายและสะดวก",
    ],
  },
];

// Create a map of all unique features across all benefits
const getAllUniqueFeatures = () => {
  const allFeatures = new Set<string>();
  benefits.forEach(benefit => {
    benefit.items.forEach(item => allFeatures.add(item));
  });
  return Array.from(allFeatures);
};

export function BenefitsSection() {
  return (
    <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
      {/* Varied Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(59,130,246,0.1),transparent_50%)]" />

      <div className="container mx-auto relative z-10">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            ข้อดีของระบบ
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            ระบบที่ออกแบบมาเพื่อตอบสนองความต้องการของทุกฝ่าย
            ให้การจัดการการฝึกงานเป็นเรื่องง่าย
          </p>
        </div>

        {/* Header Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card
                key={index}
                className={`group border-2 ${benefit.bgColor} hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:scale-105 hover:-translate-y-2 backdrop-blur-sm`}
              >
                <div className="p-8 text-center space-y-5">
                  <div className={`inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${benefit.color} shadow-xl mx-auto group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border-2 border-white/20`}>
                    <Icon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    {benefit.title}
                  </h3>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Comparison Table */}
        <Card className="border-2 overflow-hidden shadow-xl backdrop-blur-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-muted/50 to-muted/30 border-b-2 border-border">
                  <TableHead className="w-[200px] font-bold text-base">คุณสมบัติ</TableHead>
                  {benefits.map((benefit, index) => (
                    <TableHead key={index} className="text-center">
                      <div className="flex items-center justify-center gap-2 py-2">
                        <benefit.icon className={`h-5 w-5 ${benefit.iconColor}`} />
                        <span className="font-semibold">{benefit.title}</span>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {getAllUniqueFeatures().map((feature, featureIndex) => (
                  <TableRow
                    key={featureIndex}
                    className="hover:bg-muted/40 transition-colors border-b border-border/50"
                  >
                    <TableCell className="font-medium py-4">{feature}</TableCell>
                    {benefits.map((benefit, benefitIndex) => {
                      const hasFeature = benefit.items.includes(feature);
                      return (
                        <TableCell key={benefitIndex} className="text-center py-4">
                          {hasFeature ? (
                            <div className="flex items-center justify-center">
                              <CheckCircle2 className={`h-6 w-6 ${benefit.iconColor} drop-shadow-sm`} />
                            </div>
                          ) : (
                            <span className="text-muted-foreground/50">-</span>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Additional Benefits Summary */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            const borderColors = ['border-l-blue-500', 'border-l-purple-500', 'border-l-emerald-500'];
            return (
              <Card
                key={index}
                className={`group border-l-4 border-l-transparent hover:border-l-primary hover:shadow-xl transition-all duration-500 hover:scale-105 ${borderColors[index]} backdrop-blur-sm`}
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${benefit.bgColor} group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                      <Icon className={`h-6 w-6 ${benefit.iconColor}`} />
                    </div>
                    <h4 className="font-semibold text-lg">{benefit.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {benefit.items.length} คุณสมบัติหลักที่ออกแบบมาเพื่อตอบสนองความต้องการของคุณ
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
