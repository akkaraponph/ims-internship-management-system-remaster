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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
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
          <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-background px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage>{title}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="flex items-center gap-2">
              <DemoModeIndicator />
              <ThemeToggle />
            </div>
          </header>
          <DemoModeBanner />
          <main className="flex-1 overflow-auto p-6">
            {children}
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
