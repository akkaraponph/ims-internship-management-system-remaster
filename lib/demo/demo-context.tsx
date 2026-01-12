"use client";

import { createContext, useContext, useEffect, useState, ReactNode, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { isDemoMode, enableDemoMode, disableDemoMode, resetDemoData } from "./demo-service";
import { initializeApiInterceptor, restoreApiInterceptor } from "./api-interceptor";

interface DemoModeContextType {
  isDemo: boolean;
  toggleDemoMode: () => void;
  resetDemo: () => void;
}

const DemoModeContext = createContext<DemoModeContextType | null>(null);

function DemoModeProviderInner({ children }: { children: ReactNode }) {
  const [isDemo, setIsDemo] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Check URL parameter first
    const demoParam = searchParams.get("demo");
    if (demoParam === "true" && !isDemoMode()) {
      enableDemoMode();
      setIsDemo(true);
      initializeApiInterceptor();
    } else if (demoParam === "false" && isDemoMode()) {
      disableDemoMode();
      setIsDemo(false);
      restoreApiInterceptor();
    } else {
      // Check localStorage
      const demoState = isDemoMode();
      setIsDemo(demoState);

      if (demoState) {
        initializeApiInterceptor();
      } else {
        restoreApiInterceptor();
      }
    }
  }, [searchParams]);

  useEffect(() => {
    // Initialize on mount
    const demoState = isDemoMode();
    setIsDemo(demoState);
    if (demoState) {
      initializeApiInterceptor();
    }
  }, []);

  const toggleDemoMode = () => {
    if (isDemoMode()) {
      disableDemoMode();
      setIsDemo(false);
      restoreApiInterceptor();
      // Remove demo param from URL
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete("demo");
      router.push(`?${newSearchParams.toString()}`);
    } else {
      enableDemoMode();
      setIsDemo(true);
      initializeApiInterceptor();
      // Add demo param to URL
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.set("demo", "true");
      router.push(`?${newSearchParams.toString()}`);
    }
  };

  const resetDemo = () => {
    resetDemoData();
    // Refresh the page to reload data
    window.location.reload();
  };

  return (
    <DemoModeContext.Provider value={{ isDemo, toggleDemoMode, resetDemo }}>
      {children}
    </DemoModeContext.Provider>
  );
}

export function DemoModeProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<>{children}</>}>
      <DemoModeProviderInner>{children}</DemoModeProviderInner>
    </Suspense>
  );
}

export function useDemoMode() {
  const context = useContext(DemoModeContext);
  if (!context) {
    throw new Error("useDemoMode must be used within DemoModeProvider");
  }
  return context;
}
