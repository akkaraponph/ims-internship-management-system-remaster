"use client";

import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  Settings,
  UserCircle,
  GraduationCap,
  ClipboardList,
  BarChart3,
  LogOut,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

interface MenuItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

const adminMenuItems: MenuItem[] = [
  { title: "แดชบอร์ด", url: "/dashboard", icon: LayoutDashboard },
  { title: "จัดการผู้ใช้", url: "/users", icon: Users },
  { title: "จัดการนักศึกษา", url: "/students", icon: GraduationCap },
  { title: "จัดการบริษัท", url: "/companies", icon: Building2 },
  { title: "การฝึกงาน", url: "/internships", icon: ClipboardList },
  { title: "รายงาน", url: "/reports", icon: BarChart3 },
  { title: "ตั้งค่าระบบ", url: "/settings", icon: Settings },
];

const directorMenuItems: MenuItem[] = [
  { title: "แดชบอร์ด", url: "/dashboard", icon: LayoutDashboard },
  { title: "นักศึกษาในที่ปรึกษา", url: "/students", icon: GraduationCap },
  { title: "บริษัท", url: "/companies", icon: Building2 },
  { title: "สถานะการฝึกงาน", url: "/internships", icon: ClipboardList },
  { title: "รายงาน", url: "/reports", icon: BarChart3 },
];

const studentMenuItems: MenuItem[] = [
  { title: "แดชบอร์ด", url: "/dashboard", icon: LayoutDashboard },
  { title: "ข้อมูลส่วนตัว", url: "/profile", icon: UserCircle },
  { title: "การฝึกงาน", url: "/internship", icon: ClipboardList },
  { title: "เอกสาร", url: "/documents", icon: FileText },
];

export function AppSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const getMenuItems = (): MenuItem[] => {
    switch (session?.user?.role) {
      case "admin":
        return adminMenuItems;
      case "director":
        return directorMenuItems;
      case "student":
        return studentMenuItems;
      default:
        return [];
    }
  };

  const getRoleLabel = (): string => {
    switch (session?.user?.role) {
      case "admin":
        return "ผู้ดูแลระบบ";
      case "director":
        return "อาจารย์ที่ปรึกษา";
      case "student":
        return "นักศึกษา";
      default:
        return "";
    }
  };

  const menuItems = getMenuItems();
  const user = session?.user;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-6 w-6" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-sidebar-foreground">
                ระบบฝึกงาน
              </span>
              <span className="text-xs text-muted-foreground">
                Internship Management
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>เมนูหลัก</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = pathname === item.url || pathname?.startsWith(item.url + "/");
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex flex-col gap-2 p-2">
          {!collapsed && user && (
            <>
              <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent p-2">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {user.username?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate text-sm font-medium text-sidebar-foreground">
                    {user.username}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {getRoleLabel()}
                  </span>
                </div>
              </div>
              <Separator />
            </>
          )}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>ออกจากระบบ</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
