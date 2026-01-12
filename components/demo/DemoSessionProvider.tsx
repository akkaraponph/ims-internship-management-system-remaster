"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useDemoMode } from "./demo-context";
import { getSession, setSession } from "../demo/demo-service";

export function DemoSessionProvider({ children }: { children: React.ReactNode }) {
  const { isDemo } = useDemoMode();
  const { data: session, update } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (isDemo && typeof window !== "undefined") {
      const demoSession = getSession();
      if (demoSession && !session) {
        // Update NextAuth session with demo session
        // This is a workaround - we'll use a custom hook instead
      }
    }
  }, [isDemo, session]);

  return <>{children}</>;
}
