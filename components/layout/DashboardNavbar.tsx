"use client";

import { useState } from "react";
import { Search, Bell, Settings, User, LogOut, Menu } from "lucide-react";
import { useSession } from "next-auth/react";
import { useDemoMode } from "@/lib/demo/demo-context";
import { getSession } from "@/lib/demo/demo-service";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { DemoModeIndicator } from "@/components/demo/DemoModeIndicator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect } from "react";

interface DashboardNavbarProps {
  title?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  actions?: React.ReactNode;
}

export function DashboardNavbar({
  title,
  breadcrumbs,
  onSearch,
  searchPlaceholder = "ค้นหา...",
  actions,
}: DashboardNavbarProps) {
  const { data: session } = useSession();
  const { isDemo } = useDemoMode();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [demoSession, setDemoSession] = useState<any>(null);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (isDemo) {
      const sessionData = getSession();
      setDemoSession(sessionData);
    }
  }, [isDemo]);

  const currentSession = isDemo ? { user: demoSession } : session;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleLogout = () => {
    if (isDemo) {
      window.location.href = "/login";
    } else {
      // Handle regular logout
      router.push("/login");
    }
  };

  const getRoleLabel = (role?: string): string => {
    const roleMap: Record<string, string> = {
      "super-admin": "ผู้ดูแลระบบหลัก",
      admin: "ผู้ดูแลระบบ",
      director: "อาจารย์ที่ปรึกษา",
      student: "นักศึกษา",
      company: "บริษัท",
    };
    return roleMap[role || ""] || "";
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm shadow-black/5">
      <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
        {/* Left: Sidebar Trigger, Breadcrumbs and Title */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          {breadcrumbs && breadcrumbs.length > 0 ? (
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {index > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      {crumb.href ? (
                        <BreadcrumbLink asChild>
                          <Link href={crumb.href}>{crumb.label}</Link>
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          ) : (
            title && (
              <h1 className="text-lg sm:text-xl font-semibold truncate bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                {title}
              </h1>
            )
          )}
        </div>

        {/* Center: Search */}
        {onSearch && (
          <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 h-9 bg-background/50 backdrop-blur-sm border-border/50 focus:bg-background focus:border-primary/50 transition-all"
              />
            </form>
          </div>
        )}

        {/* Right: Actions and User Menu */}
        <div className="flex items-center gap-2">
          {/* Demo Mode Indicator */}
          <DemoModeIndicator />
          
          {/* Custom Actions */}
          {actions}

          {/* Search Button (Mobile) */}
          {onSearch && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => {
                // Could open a search modal on mobile
                const query = prompt("ค้นหา:");
                if (query) {
                  setSearchQuery(query);
                  onSearch(query);
                }
              }}
            >
              <Search className="h-5 w-5" />
            </Button>
          )}

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative hover:bg-accent/50 transition-colors">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs shadow-lg animate-pulse"
                  >
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 backdrop-blur-xl bg-background/95 border-border/50">
              <DropdownMenuLabel>การแจ้งเตือน</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="p-6 text-center text-sm text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                <p>ไม่มีการแจ้งเตือนใหม่</p>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu */}
          {currentSession?.user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 h-9 hover:bg-accent/50 transition-colors">
                  <Avatar className="h-8 w-8 border-2 border-border/50">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-xs font-semibold">
                      {currentSession.user.username?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-medium">
                      {currentSession.user.username}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {getRoleLabel(currentSession.user.role)}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 backdrop-blur-xl bg-background/95 border-border/50">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {currentSession.user.username}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {getRoleLabel(currentSession.user.role)}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    โปรไฟล์
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    ตั้งค่า
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  ออกจากระบบ
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
