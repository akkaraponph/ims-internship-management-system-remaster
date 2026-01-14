"use client";

import Link from "next/link";
import { ArrowRight, GraduationCap, Building2, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDemoSession } from "@/hooks/use-demo-session";

const visualCards = [
  {
    icon: GraduationCap,
    title: "นักศึกษา",
    description: "จัดการข้อมูลและสมัครฝึกงาน",
    gradient: "from-blue-500/20 to-cyan-500/20",
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-500",
    delay: "0s",
  },
  {
    icon: Building2,
    title: "บริษัท",
    description: "รับนักศึกษาฝึกงาน",
    gradient: "from-purple-500/20 to-pink-500/20",
    iconBg: "bg-purple-500/20",
    iconColor: "text-purple-500",
    delay: "0.2s",
  },
  {
    icon: Users,
    title: "มหาวิทยาลัย",
    description: "ดูแลและติดตามการฝึกงาน",
    gradient: "from-emerald-500/20 to-teal-500/20",
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-500",
    delay: "0.4s",
  },
  {
    icon: BarChart3,
    title: "รายงาน",
    description: "สถิติและรายงานครบถ้วน",
    gradient: "from-orange-500/20 to-red-500/20",
    iconBg: "bg-orange-500/20",
    iconColor: "text-orange-500",
    delay: "0.6s",
  },
];

export function HeroSection() {
  const { data: session } = useDemoSession();
  const isAuthenticated = !!session;
  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-[90vh] flex items-center">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Multiple gradient orbs with different animations */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-primary/20 via-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-tl from-purple-500/20 via-pink-500/20 to-rose-500/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "2s" }} />
        
        {/* Decorative grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-30" />
        
        {/* Geometric shapes */}
        <div className="absolute top-20 right-20 w-32 h-32 border-2 border-primary/20 rounded-lg rotate-45 animate-float" style={{ animationDelay: "0.5s" }} />
        <div className="absolute bottom-32 left-32 w-24 h-24 border-2 border-purple-500/20 rounded-full animate-float" style={{ animationDelay: "1.5s" }} />
      </div>

      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left side - Content */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
                <span className="text-sm font-medium text-primary">ระบบจัดการการฝึกงาน</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight">
                ระบบจัดการการฝึกงาน
                <span className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-500 animate-gradient">
                  ที่สมบูรณ์แบบ
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                แพลตฟอร์มที่ช่วยให้มหาวิทยาลัย บริษัท และนักศึกษา
                จัดการกระบวนการฝึกงานได้อย่างมีประสิทธิภาพ
                ในระบบเดียวที่ครอบคลุมทุกความต้องการ
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="group h-12 px-8 text-lg shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 hover:scale-105 bg-gradient-to-r from-primary to-primary/90">
                <Link href={isAuthenticated ? "/dashboard" : "/login"}>
                  {isAuthenticated ? "เข้าสู่แอปพลิเคชัน" : "เริ่มต้นใช้งาน"}
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              {!isAuthenticated && (
                <Button size="lg" variant="outline" asChild className="h-12 px-8 text-lg border-2 hover:bg-muted/50 hover:border-primary/50 transition-all duration-300 hover:scale-105 backdrop-blur-sm">
                  <Link href="/register">สมัครสมาชิก</Link>
                </Button>
              )}
            </div>

            {/* Enhanced Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border/50">
              <div className="group cursor-default">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                  100%
                </div>
                <div className="text-sm text-muted-foreground mt-1.5">ครอบคลุม</div>
              </div>
              <div className="group cursor-default">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                  24/7
                </div>
                <div className="text-sm text-muted-foreground mt-1.5">พร้อมใช้งาน</div>
              </div>
              <div className="group cursor-default">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                  Secure
                </div>
                <div className="text-sm text-muted-foreground mt-1.5">ปลอดภัย</div>
              </div>
            </div>
          </div>

          {/* Right side - Enhanced Visual */}
          <div className="relative">
            {/* Floating cards with staggered animations */}
            <div className="grid grid-cols-2 gap-6">
              {visualCards.map((card, index) => {
                const Icon = card.icon;
                const isOffset = index % 2 === 1;
                return (
                  <Card
                    key={index}
                    className={`group relative p-6 space-y-4 border-2 bg-gradient-to-br ${card.gradient} backdrop-blur-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:scale-105 hover:-translate-y-2 ${isOffset ? "mt-12" : ""} overflow-hidden`}
                    style={{ animationDelay: card.delay }}
                  >
                    <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${card.iconBg} ${card.iconColor} shadow-xl transform transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 border-2 border-white/10`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1.5 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                        {card.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {card.description}
                      </p>
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-white/5 rounded-full blur-xl" />
                    <div className="absolute -top-2 -left-2 w-12 h-12 bg-white/5 rounded-full blur-xl" />
                  </Card>
                );
              })}
            </div>
            
            {/* Additional decorative elements */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-pulse" />
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: "1s" }} />
          </div>
        </div>
      </div>
    </section>
  );
}
