"use client";

import { ReactNode, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useDemoMode } from "@/lib/demo/demo-context";
import { getSession, getSelectedRole } from "@/lib/demo/demo-service";
import { useRouter } from "next/navigation";
import { DemoRoleSelector } from "@/components/demo/DemoRoleSelector";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { DemoModeIndicator } from "@/components/demo/DemoModeIndicator";
import { DemoModeBanner } from "@/components/demo/DemoModeBanner";
import { DashboardNavbar } from "./DashboardNavbar";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title = "แดชบอร์ด" }: DashboardLayoutProps) {
  const { data: session, status } = useSession();
  const { isDemo, showRoleSelector, closeRoleSelector, selectRole } = useDemoMode();
  const router = useRouter();
  const [demoSession, setDemoSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isDemo) {
      const sessionData = getSession();
      const selectedRole = getSelectedRole();
      
      // If demo mode is active but no role is selected, redirect to login
      if (!selectedRole && !sessionData) {
        router.push("/login?demo=true");
        return;
      }
      
      setDemoSession(sessionData);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [isDemo, router]);

  if (isLoading || (isDemo && !demoSession && status === "loading")) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="space-y-4 text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-sm text-muted-foreground">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!isDemo && status === "unauthenticated") {
    return null; // Middleware will redirect
  }

  if (isDemo && !demoSession) {
    return null; // Will redirect to login
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col">
          <DashboardNavbar title={title} />
          <DemoModeBanner />
          <main className="flex-1 overflow-auto p-6 sm:p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>

      <DemoRoleSelector
        open={showRoleSelector}
        onOpenChange={closeRoleSelector}
        onRoleSelected={() => {
          closeRoleSelector();
          window.location.reload();
        }}
      />
    </SidebarProvider>
  );
}
