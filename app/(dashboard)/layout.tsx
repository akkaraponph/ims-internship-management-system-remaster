"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useDemoMode } from "@/lib/demo/demo-context";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { getSession } from "@/lib/demo/demo-service";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isDemo } = useDemoMode();
  const pathname = usePathname();

  useEffect(() => {
    if (isDemo && typeof window !== "undefined") {
      // Ensure demo session exists for protected routes
      const session = getSession();
      if (!session && pathname !== "/login" && pathname !== "/register") {
        // Redirect to login if no session in demo mode
        window.location.href = "/login?demo=true";
      }
    }
  }, [isDemo, pathname]);

  return <DashboardLayout>{children}</DashboardLayout>;
}
