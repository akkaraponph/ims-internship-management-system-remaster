"use client";

import { Code2, Database, Shield, Zap, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const techStack = [
  {
    icon: Code2,
    name: "Next.js 16",
    description: "Framework ที่ทันสมัยและมีประสิทธิภาพสูง",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: Database,
    name: "PostgreSQL",
    description: "ฐานข้อมูลที่เสถียรและปลอดภัย",
    color: "from-indigo-500 to-purple-500",
    bgColor: "bg-indigo-500/10",
  },
  {
    icon: Shield,
    name: "NextAuth.js",
    description: "ระบบยืนยันตัวตนที่ปลอดภัย",
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    icon: Zap,
    name: "TypeScript",
    description: "Type-safe เพื่อความน่าเชื่อถือ",
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-500/10",
  },
];

const roles = [
  {
    id: "admin",
    title: "ผู้ดูแลระบบ",
    subtitle: "Admin",
    description: "จัดการผู้ใช้ นักศึกษา บริษัท และการฝึกงานทั้งหมด ควบคุมระบบได้อย่างเต็มรูปแบบ",
    features: [
      "จัดการผู้ใช้และสิทธิ์การเข้าถึง",
      "ควบคุมการตั้งค่าระบบ",
      "ดูรายงานและสถิติทั้งหมด",
      "จัดการประกาศและข่าวสาร",
    ],
    icon: Shield,
    color: "from-red-500 to-rose-500",
  },
  {
    id: "director",
    title: "อาจารย์ที่ปรึกษา",
    subtitle: "Director",
    description: "ดูแลนักศึกษาในความดูแล อนุมัติการฝึกงาน และติดตามความคืบหน้า",
    features: [
      "อนุมัติการฝึกงานของนักศึกษา",
      "ติดตามความคืบหน้าการฝึกงาน",
      "ดูรายงานการฝึกงาน",
      "จัดการข้อมูลนักศึกษา",
    ],
    icon: Code2,
    color: "from-blue-500 to-indigo-500",
  },
  {
    id: "student",
    title: "นักศึกษา",
    subtitle: "Student",
    description: "จัดการข้อมูลส่วนตัว สมัครฝึกงาน และติดตามสถานะการฝึกงาน",
    features: [
      "สมัครฝึกงานออนไลน์",
      "ติดตามสถานะการสมัคร",
      "จัดการโปรไฟล์ส่วนตัว",
      "รับการแจ้งเตือนอัตโนมัติ",
    ],
    icon: Zap,
    color: "from-green-500 to-emerald-500",
  },
];

export function AboutSection() {
  return (
    <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/20 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 rounded-full blur-3xl -z-10 animate-pulse-glow" />
      <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl -z-10 animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />

      <div className="container mx-auto relative z-10">
        <div className="text-center space-y-6 mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm mb-4">
            <span className="text-sm font-medium text-primary">เกี่ยวกับเรา</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
            เกี่ยวกับระบบ
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            ระบบจัดการการฝึกงานที่พัฒนาด้วยเทคโนโลยีล่าสุด
            เพื่อให้การจัดการการฝึกงานเป็นเรื่องง่ายและมีประสิทธิภาพ
          </p>
        </div>

        {/* Technology Stack - Horizontal Timeline */}
        <div className="mb-24">
          <h3 className="text-2xl sm:text-3xl font-semibold mb-12 text-center">
            เทคโนโลยีที่ใช้
          </h3>
          <div className="relative">
            {/* Timeline Line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent -translate-y-1/2" />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative">
              {techStack.map((tech, index) => {
                const Icon = tech.icon;
                return (
                  <div key={index} className="relative">
                    {/* Timeline Dot */}
                    <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background z-10" />
                    
                    <Card className="text-center border-2 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:scale-105 bg-card/50 backdrop-blur-sm group">
                      <div className="p-8 space-y-5">
                        <div className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${tech.color} mx-auto shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border-2 border-white/20`}>
                          <Icon className="h-10 w-10 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                            {tech.name}
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">{tech.description}</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* User Roles - Tabbed Interface */}
        <div>
          <h3 className="text-2xl sm:text-3xl font-semibold mb-12 text-center">
            บทบาทผู้ใช้ในระบบ
          </h3>
          <Tabs defaultValue="admin" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-12 bg-muted/50 backdrop-blur-sm border border-border/50">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <TabsTrigger
                    key={role.id}
                    value={role.id}
                    className="data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:border-primary/50 transition-all duration-300"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">{role.title}</span>
                    <span className="sm:hidden">{role.subtitle}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
            
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <TabsContent key={role.id} value={role.id} className="mt-8 animate-fade-in-up">
                  <Card className="border-2 overflow-hidden shadow-xl backdrop-blur-sm">
                    <div className="grid md:grid-cols-2 gap-0">
                      {/* Left: Visual */}
                      <div className={`bg-gradient-to-br ${role.color} p-8 md:p-12 flex items-center justify-center relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />
                        <div className="relative z-10 text-center space-y-6">
                          <div className="inline-flex h-24 w-24 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/30 shadow-2xl hover:scale-110 transition-transform duration-500">
                            <Icon className="h-12 w-12 text-white" />
                          </div>
                          <div>
                            <h4 className="text-2xl sm:text-3xl font-bold text-white mb-2">{role.title}</h4>
                            <p className="text-white/90 text-lg">{role.subtitle}</p>
                          </div>
                        </div>
                        {/* Decorative elements */}
                        <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse" />
                        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: "1s" }} />
                      </div>

                      {/* Right: Content */}
                      <div className="p-8 md:p-12 space-y-6 bg-gradient-to-br from-background to-muted/20">
                        <div>
                          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                            {role.description}
                          </p>
                        </div>
                        <div className="space-y-5 pt-4">
                          <h5 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground border-b border-border/50 pb-2">
                            ความสามารถหลัก
                          </h5>
                          <ul className="space-y-4">
                            {role.features.map((feature, idx) => (
                              <li key={idx} className="flex items-start gap-3 group">
                                <ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0 group-hover:translate-x-1 transition-transform duration-300" />
                                <span className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                                  {feature}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </Card>
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      </div>
    </section>
  );
}
