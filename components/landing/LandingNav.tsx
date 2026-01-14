"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  Menu, 
  X, 
  GraduationCap, 
  Search, 
  ChevronDown, 
  User, 
  LogOut, 
  Settings,
  Briefcase,
  Building2,
  BarChart3,
  FileText,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DemoModeToggle } from "@/components/demo/DemoModeToggle";
import { useDemoSession } from "@/hooks/use-demo-session";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function LandingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: session } = useDemoSession();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/jobs?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const navItems = [
    { 
      label: "คุณสมบัติ", 
      href: "#features",
      items: [
        { label: "จัดการนักศึกษา", href: "#features" },
        { label: "จัดการบริษัท", href: "#features" },
        { label: "จัดการการฝึกงาน", href: "#features" },
        { label: "ประกาศข่าวสาร", href: "#features" },
      ]
    },
    { 
      label: "เกี่ยวกับ", 
      href: "#about",
      items: [
        { label: "เทคโนโลยี", href: "#about" },
        { label: "บทบาทผู้ใช้", href: "#about" },
      ]
    },
    { 
      label: "ข้อดี", 
      href: "#benefits"
    },
  ];

  const publicLinks = [
    { label: "ตำแหน่งงาน", href: "/jobs", icon: Briefcase },
    { label: "บริษัท", href: "/companies/public", icon: Building2 },
    { label: "สถิติ", href: "/statistics", icon: BarChart3 },
  ];

  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled 
          ? "bg-background/95 backdrop-blur-xl border-b border-border shadow-lg shadow-black/5" 
          : "bg-background/80 backdrop-blur-md border-b border-border/50"
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground group-hover:scale-110 group-hover:shadow-lg shadow-primary/20 transition-all duration-300">
              <GraduationCap className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold hidden sm:inline bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary/70 transition-all duration-300">
              ระบบจัดการการฝึกงาน
            </span>
            <span className="text-xl font-bold sm:hidden bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary/70 transition-all duration-300">
              ระบบฝึกงาน
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              if (item.items) {
                return (
                  <DropdownMenu key={item.label}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="text-sm font-medium hover:bg-accent/50 transition-colors">
                        {item.label}
                        <ChevronDown className="ml-1 h-4 w-4 transition-transform group-hover:rotate-180" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="backdrop-blur-xl bg-background/95 border-border/50">
                      {item.items.map((subItem) => (
                        <DropdownMenuItem key={subItem.label} asChild>
                          <Link href={subItem.href} className="hover:bg-accent/50 transition-colors">
                            {subItem.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }
              return (
                <Button key={item.label} variant="ghost" asChild className="hover:bg-accent/50 transition-colors">
                  <Link href={item.href} className="text-sm font-medium">
                    {item.label}
                  </Link>
                </Button>
              );
            })}
            
            {/* Public Links */}
            <div className="mx-2 h-6 w-px bg-border/50" />
            {publicLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Button key={link.href} variant="ghost" asChild size="sm" className="hover:bg-accent/50 transition-colors">
                  <Link href={link.href} className="flex items-center gap-1.5 group">
                    <Icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    <span>{link.label}</span>
                  </Link>
                </Button>
              );
            })}
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="ค้นหาตำแหน่งงาน..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 h-9 bg-background/50 backdrop-blur-sm border-border/50 focus:bg-background focus:border-primary/50 transition-all"
              />
            </form>
          </div>

          {/* Right side buttons */}
          <div className="hidden md:flex items-center space-x-2">
            <DemoModeToggle />
            <ThemeToggle />
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {session.user?.username?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden lg:inline">{session.user?.username}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>บัญชีของฉัน</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      แดชบอร์ด
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      ตั้งค่าโปรไฟล์
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => {
                      // Handle logout
                      window.location.href = "/login";
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    ออกจากระบบ
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>เมนู</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  {/* Mobile Search */}
                  <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="ค้นหาตำแหน่งงาน..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </form>

                  {/* Navigation Items */}
                  <div className="space-y-2">
                    {navItems.map((item) => (
                      <div key={item.label}>
                        <Link
                          href={item.href}
                          className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-accent"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                        {item.items && (
                          <div className="ml-4 mt-1 space-y-1">
                            {item.items.map((subItem) => (
                              <Link
                                key={subItem.label}
                                href={subItem.href}
                                className="block px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                {subItem.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Public Links */}
                  <div className="pt-4 border-t">
                    <div className="space-y-2">
                      {publicLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Icon className="h-4 w-4" />
                            {link.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  {/* Auth Buttons */}
                  <div className="pt-4 border-t space-y-2">
                    {session ? (
                      <>
                        <Button asChild className="w-full">
                          <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                            แดชบอร์ด
                          </Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => {
                            window.location.href = "/login";
                            setMobileMenuOpen(false);
                          }}
                        >
                          ออกจากระบบ
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" asChild className="w-full">
                          <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                            เข้าสู่ระบบ
                          </Link>
                        </Button>
                        <Button asChild className="w-full">
                          <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                            สมัครสมาชิก
                          </Link>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
