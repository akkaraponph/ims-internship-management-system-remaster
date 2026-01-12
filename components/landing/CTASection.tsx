"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function CTASection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <Card className="bg-primary text-primary-foreground border-none">
          <div className="p-8 sm:p-12 lg:p-16 text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              พร้อมเริ่มต้นใช้งานแล้วหรือยัง?
            </h2>
            <p className="text-lg sm:text-xl text-primary-foreground/90 max-w-2xl mx-auto">
              เข้าร่วมกับมหาวิทยาลัย บริษัท และนักศึกษาหลายพันคน
              ที่ใช้ระบบของเราในการจัดการการฝึกงาน
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="group"
              >
                <Link href="/register">
                  สมัครสมาชิกฟรี
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <Link href="/login">เข้าสู่ระบบ</Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
