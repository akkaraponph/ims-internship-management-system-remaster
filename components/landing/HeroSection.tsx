"use client";

import Link from "next/link";
import { ArrowRight, GraduationCap, Building2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDemoSession } from "@/hooks/use-demo-session";

export function HeroSection() {
  const { data: session } = useDemoSession();
  const isAuthenticated = !!session;
  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-[90vh] flex items-center">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse-glow delay-1000" />
      </div>

      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight">
                ระบบจัดการการฝึกงาน
                <span className="block text-primary mt-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
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
              <Button size="lg" asChild className="group h-12 px-8 text-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300">
                <Link href={isAuthenticated ? "/dashboard" : "/login"}>
                  {isAuthenticated ? "เข้าสู่แอปพลิเคชัน" : "เริ่มต้นใช้งาน"}
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              {!isAuthenticated && (
                <Button size="lg" variant="outline" asChild className="h-12 px-8 text-lg glass hover:bg-white/10 border-white/20">
                  <Link href="/register">สมัครสมาชิก</Link>
                </Button>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/10">
              <div>
                <div className="text-3xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground mt-1">ครอบคลุม</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground mt-1">พร้อมใช้งาน</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">Secure</div>
                <div className="text-sm text-muted-foreground mt-1">ปลอดภัย</div>
              </div>
            </div>
          </div>

          {/* Right side - Visual */}
          <div className="relative animate-float">
            <div className="grid grid-cols-2 gap-6">
              <Card className="p-6 space-y-4 glass-card hover:bg-white/10 transition-colors duration-300 border-white/10">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 text-primary">
                  <GraduationCap className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">นักศึกษา</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    จัดการข้อมูลและสมัครฝึกงาน
                  </p>
                </div>
              </Card>
              <Card className="p-6 space-y-4 glass-card hover:bg-white/10 transition-colors duration-300 border-white/10 mt-12">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-400">
                  <Building2 className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">บริษัท</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    รับนักศึกษาฝึกงาน
                  </p>
                </div>
              </Card>
              <Card className="p-6 space-y-4 glass-card hover:bg-white/10 transition-colors duration-300 border-white/10">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-400">
                  <Users className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">มหาวิทยาลัย</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    ดูแลและติดตามการฝึกงาน
                  </p>
                </div>
              </Card>
              <Card className="p-6 space-y-4 glass-card hover:bg-white/10 transition-colors duration-300 border-white/10 mt-12">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
                  <GraduationCap className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">รายงาน</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    สถิติและรายงานครบถ้วน
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
