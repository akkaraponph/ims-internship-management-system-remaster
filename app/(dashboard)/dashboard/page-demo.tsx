"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDemoMode } from "@/lib/demo/demo-context";
import { getSession } from "@/lib/demo/demo-service";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { DirectorDashboard } from "@/components/dashboard/DirectorDashboard";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { CompanyDashboard } from "@/components/dashboard/CompanyDashboard";

export default function DashboardPageDemo() {
  const router = useRouter();
  const { isDemo } = useDemoMode();
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isDemo) {
      const demoSession = getSession();
      if (demoSession) {
        setSession(demoSession);
      } else {
        router.push("/login");
      }
      setIsLoading(false);
    } else {
      // In real mode, this component shouldn't be used
      router.push("/dashboard");
    }
  }, [isDemo, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const { role } = session;

  if (role === "admin" || role === "super-admin") {
    return <AdminDashboard />;
  }

  if (role === "director") {
    return <DirectorDashboard />;
  }

  if (role === "company") {
    return <CompanyDashboard />;
  }

  return <StudentDashboard />;
}
