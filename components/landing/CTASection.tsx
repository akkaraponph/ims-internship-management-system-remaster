"use client";

import Link from "next/link";
import { ArrowRight, Users, Building2, GraduationCap, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDemoSession } from "@/hooks/use-demo-session";

const stats = [
  { icon: Users, value: "1,000+", label: "ผู้ใช้ทั้งหมด" },
  { icon: Building2, value: "500+", label: "บริษัทพันธมิตร" },
  { icon: GraduationCap, value: "2,000+", label: "นักศึกษา" },
  { icon: TrendingUp, value: "95%", label: "ความพึงพอใจ" },
];

export function CTASection() {
  const { data: session } = useDemoSession();
  const isAuthenticated = !!session;
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/10 to-blue-500/10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.15),transparent_70%)]" />
      
      <div className="container mx-auto relative z-10">
        <Card className="border-2 overflow-hidden bg-gradient-to-br from-background to-muted/30 backdrop-blur-xl shadow-2xl">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Left Column - CTA Content */}
            <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center space-y-8 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
              <div className="space-y-6 relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm shadow-lg">
                  <span className="text-sm font-medium text-primary">พร้อมเริ่มต้นแล้ว</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                  พร้อมเริ่มต้นใช้งานแล้วหรือยัง?
                </h2>
                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl">
                  เข้าร่วมกับมหาวิทยาลัย บริษัท และนักศึกษาหลายพันคน
                  ที่ใช้ระบบของเราในการจัดการการฝึกงาน
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {!isAuthenticated && (
                  <Button
                    size="lg"
                    asChild
                    className="group h-12 px-8 text-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300"
                  >
                    <Link href="/register">
                      สมัครสมาชิกฟรี
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                )}
                <Button
                  size="lg"
                  variant={isAuthenticated ? "default" : "outline"}
                  className={isAuthenticated 
                    ? "group h-12 px-8 text-lg" 
                    : "h-12 px-8 text-lg border-2"
                  }
                  asChild
                >
                  <Link href={isAuthenticated ? "/dashboard" : "/login"}>
                    {isAuthenticated ? (
                      <>
                        เข้าสู่แอปพลิเคชัน
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </>
                    ) : (
                      "เข้าสู่ระบบ"
                    )}
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right Column - Statistics */}
            <div className="p-8 sm:p-12 lg:p-16 bg-gradient-to-br from-muted/50 via-background to-background flex items-center relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2 translate-x-1/2" />
              
              <div className="w-full space-y-8 relative z-10">
                <div className="space-y-3">
                  <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    สถิติการใช้งาน
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    ตัวเลขที่แสดงถึงความน่าเชื่อถือของระบบ
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        key={index}
                        className="group relative p-6 rounded-xl border-2 border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-500 hover:scale-105 hover:-translate-y-1"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
                        <div className="relative space-y-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-md">
                            <Icon className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                              {stat.value}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                              {stat.label}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Additional visual element */}
                <div className="pt-8 border-t border-border/50">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex -space-x-2">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 border-2 border-background shadow-lg hover:scale-110 transition-transform duration-300" />
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-background shadow-lg hover:scale-110 transition-transform duration-300" />
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 border-2 border-background shadow-lg hover:scale-110 transition-transform duration-300" />
                    </div>
                    <span className="font-medium">ผู้ใช้ที่เชื่อถือในระบบของเรา</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
