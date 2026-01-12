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
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                ระบบจัดการการฝึกงาน
                <span className="block text-primary mt-2">
                  ที่สมบูรณ์แบบ
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl">
                แพลตฟอร์มที่ช่วยให้มหาวิทยาลัย บริษัท และนักศึกษา
                จัดการกระบวนการฝึกงานได้อย่างมีประสิทธิภาพ
                ในระบบเดียวที่ครอบคลุมทุกความต้องการ
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="group">
                <Link href={isAuthenticated ? "/dashboard" : "/login"}>
                  {isAuthenticated ? "เข้าสู่แอปพลิเคชัน" : "เริ่มต้นใช้งาน"}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              {!isAuthenticated && (
                <Button size="lg" variant="outline" asChild>
                  <Link href="/register">สมัครสมาชิก</Link>
                </Button>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <div>
                <div className="text-2xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground">ครอบคลุม</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">พร้อมใช้งาน</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">ปลอดภัย</div>
                <div className="text-sm text-muted-foreground">ข้อมูลของคุณ</div>
              </div>
            </div>
          </div>

          {/* Right side - Visual */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 space-y-2 hover:shadow-lg transition-shadow">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <h3 className="font-semibold">นักศึกษา</h3>
                <p className="text-sm text-muted-foreground">
                  จัดการข้อมูลและสมัครฝึกงาน
                </p>
              </Card>
              <Card className="p-6 space-y-2 hover:shadow-lg transition-shadow mt-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Building2 className="h-6 w-6" />
                </div>
                <h3 className="font-semibold">บริษัท</h3>
                <p className="text-sm text-muted-foreground">
                  รับนักศึกษาฝึกงาน
                </p>
              </Card>
              <Card className="p-6 space-y-2 hover:shadow-lg transition-shadow">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="font-semibold">มหาวิทยาลัย</h3>
                <p className="text-sm text-muted-foreground">
                  ดูแลและติดตามการฝึกงาน
                </p>
              </Card>
              <Card className="p-6 space-y-2 hover:shadow-lg transition-shadow mt-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <h3 className="font-semibold">รายงาน</h3>
                <p className="text-sm text-muted-foreground">
                  สถิติและรายงานครบถ้วน
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
