"use client";

import { useSession } from "next-auth/react";
import { useDemoMode } from "@/lib/demo/demo-context";
import { getSession } from "@/lib/demo/demo-service";
import { useEffect, useState } from "react";

export function useDemoSession() {
  const { data: session, status } = useSession();
  const { isDemo } = useDemoMode();
  const [demoSession, setDemoSession] = useState<any>(null);

  useEffect(() => {
    if (isDemo && typeof window !== "undefined") {
      const sessionData = getSession();
      if (sessionData) {
        setDemoSession({
          user: sessionData,
          expires: new Date(Date.now() + 86400000).toISOString(), // 24 hours
        });
      }
    } else {
      setDemoSession(null);
    }
  }, [isDemo]);

  if (isDemo && demoSession) {
    return {
      data: demoSession,
      status: "authenticated" as const,
    };
  }

  return { data: session, status };
}
