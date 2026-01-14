"use client";

import Link from "next/link";
import { GraduationCap } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-gradient-to-b from-background to-muted/20 py-12 px-4 sm:px-6 lg:px-8">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(120,119,198,0.05),transparent_50%)]" />
      
      <div className="container mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground group-hover:scale-110 transition-transform">
                <GraduationCap className="h-6 w-6" />
              </div>
              <span className="text-lg font-bold">ระบบจัดการการฝึกงาน</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              แพลตฟอร์มที่ช่วยให้มหาวิทยาลัย บริษัท และนักศึกษา
              จัดการกระบวนการฝึกงานได้อย่างมีประสิทธิภาพ
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wide">ลิงก์ด่วน</h3>
            <nav className="flex flex-col gap-3">
              <Link 
                href="#features" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors hover:translate-x-1 inline-block w-fit"
              >
                คุณสมบัติ
              </Link>
              <Link 
                href="#about" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors hover:translate-x-1 inline-block w-fit"
              >
                เกี่ยวกับ
              </Link>
              <Link 
                href="#benefits" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors hover:translate-x-1 inline-block w-fit"
              >
                ข้อดี
              </Link>
              <Link 
                href="/jobs" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors hover:translate-x-1 inline-block w-fit"
              >
                ตำแหน่งงาน
              </Link>
            </nav>
          </div>

          {/* Contact/Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wide">ข้อมูล</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>ระบบจัดการการฝึกงาน</p>
              <p>สำหรับมหาวิทยาลัยและองค์กร</p>
              <p className="pt-2 text-xs">
                © {new Date().getFullYear()} refactorroom.com
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground text-center md:text-left">
              สงวนลิขสิทธิ์ © {new Date().getFullYear()} - ระบบจัดการการฝึกงาน
            </p>
            <div className="flex gap-6 text-xs text-muted-foreground">
              <Link href="#features" className="hover:text-foreground transition-colors">
                คุณสมบัติ
              </Link>
              <Link href="#about" className="hover:text-foreground transition-colors">
                เกี่ยวกับ
              </Link>
              <Link href="#benefits" className="hover:text-foreground transition-colors">
                ข้อดี
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
