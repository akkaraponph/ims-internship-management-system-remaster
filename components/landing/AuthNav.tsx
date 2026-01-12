"use client";

import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DemoModeToggle } from "@/components/demo/DemoModeToggle";

export function AuthNav() {
  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold">ระบบจัดการการฝึกงาน</span>
          </Link>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            <DemoModeToggle />
            <ThemeToggle />
            <Link
              href="/"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              กลับหน้าหลัก
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
