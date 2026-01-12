"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DemoModeToggle } from "@/components/demo/DemoModeToggle";
import { useDemoSession } from "@/hooks/use-demo-session";

export function LandingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useDemoSession();

  const navItems = [
    { label: "คุณสมบัติ", href: "#features" },
    { label: "เกี่ยวกับ", href: "#about" },
    { label: "ข้อดี", href: "#benefits" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold">ระบบจัดการการฝึกงาน</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right side buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <DemoModeToggle />
            <ThemeToggle />
            {session ? (
              <Button asChild>
                <Link href="/dashboard">แดชบอร์ด</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">เข้าสู่ระบบ</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">สมัครสมาชิก</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <DemoModeToggle />
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-border">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-4 space-y-2 border-t border-border">
              <div className="px-2 pb-2">
                <DemoModeToggle />
              </div>
              {session ? (
                <Button asChild className="w-full">
                  <Link href="/dashboard">แดชบอร์ด</Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/login">เข้าสู่ระบบ</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/register">สมัครสมาชิก</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
