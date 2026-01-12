"use client";

import { useSession } from "next-auth/react";
import { useDemoMode } from "@/lib/demo/demo-context";
import { getSession } from "@/lib/demo/demo-service";
import { DEMO_STORAGE_KEYS } from "@/lib/demo/storage-keys";
import { useEffect, useState, useCallback } from "react";

export function useDemoSession() {
  const { data: session, status } = useSession();
  const { isDemo } = useDemoMode();
  const [demoSession, setDemoSession] = useState<any>(null);

  // Function to update demo session from localStorage
  const updateDemoSession = useCallback(() => {
    if (isDemo && typeof window !== "undefined") {
      const sessionData = getSession();
      if (sessionData) {
        setDemoSession({
          user: sessionData,
          expires: new Date(Date.now() + 86400000).toISOString(), // 24 hours
        });
      } else {
        setDemoSession(null);
      }
    } else {
      setDemoSession(null);
    }
  }, [isDemo]);

  // Initial load and when demo mode changes
  useEffect(() => {
    updateDemoSession();
  }, [updateDemoSession]);

  // Listen for storage events (when session is set/cleared in another tab/window)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorageChange = (e: StorageEvent) => {
      // Check if the session key changed
      if (e.key === DEMO_STORAGE_KEYS.SESSION || e.key === DEMO_STORAGE_KEYS.MODE) {
        updateDemoSession();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also listen for custom events (for same-tab updates)
    const handleCustomStorageChange = () => {
      updateDemoSession();
    };

    // Listen for custom event that can be dispatched when session changes
    window.addEventListener("demo-session-changed", handleCustomStorageChange);

    // Poll for changes (as a fallback, since storage events don't fire in same tab)
    const pollInterval = setInterval(() => {
      if (isDemo) {
        updateDemoSession();
      }
    }, 1000); // Check every second

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("demo-session-changed", handleCustomStorageChange);
      clearInterval(pollInterval);
    };
  }, [isDemo, updateDemoSession]);

  if (isDemo && demoSession) {
    return {
      data: demoSession,
      status: "authenticated" as const,
    };
  }

  return { data: session, status };
}
