"use client";

import { createContext, useContext, useEffect, useState, ReactNode, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { isDemoMode, enableDemoMode, disableDemoMode, resetDemoData, getSelectedRole, loginAsRole } from "./demo-service";
import { initializeApiInterceptor, restoreApiInterceptor } from "./api-interceptor";
import type { UserRole } from "@/types";

interface DemoModeContextType {
  isDemo: boolean;
  selectedRole: UserRole | null;
  showRoleSelector: boolean;
  toggleDemoMode: () => void;
  resetDemo: () => void;
  openRoleSelector: () => void;
  closeRoleSelector: () => void;
  selectRole: (role: UserRole) => Promise<void>;
  changeRole: () => void;
}

const DemoModeContext = createContext<DemoModeContextType | null>(null);

function DemoModeProviderInner({ children }: { children: ReactNode }) {
  // Initialize state from localStorage immediately to avoid hydration issues
  const [isDemo, setIsDemo] = useState(() => {
    if (typeof window !== "undefined") {
      return isDemoMode();
    }
    return false;
  });
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(() => {
    if (typeof window !== "undefined") {
      return getSelectedRole();
    }
    return null;
  });
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Check URL parameter first
    const demoParam = searchParams.get("demo");
    if (demoParam === "true" && !isDemoMode()) {
      const role = getSelectedRole();
      if (role) {
        enableDemoMode(role);
        setIsDemo(true);
        initializeApiInterceptor();
      } else {
        // No role selected, show role selector
        setShowRoleSelector(true);
      }
    } else if (demoParam === "false" && isDemoMode()) {
      disableDemoMode();
      setIsDemo(false);
      setSelectedRole(null);
      restoreApiInterceptor();
    } else {
      // Check localStorage
      const demoState = isDemoMode();
      setIsDemo(demoState);

      if (demoState) {
        initializeApiInterceptor();
        const role = getSelectedRole();
        setSelectedRole(role);
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
      const role = getSelectedRole();
      setSelectedRole(role);
    }
  }, []);

  // Update selected role when it changes in localStorage
  useEffect(() => {
    if (isDemo) {
      const role = getSelectedRole();
      setSelectedRole(role);
    }
  }, [isDemo]);

  const toggleDemoMode = () => {
    if (isDemoMode()) {
      disableDemoMode();
      setIsDemo(false);
      setSelectedRole(null);
      restoreApiInterceptor();
      // Remove demo param from URL
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete("demo");
      router.push(`?${newSearchParams.toString()}`);
    } else {
      // Check if role is already selected
      const role = getSelectedRole();
      if (role) {
        // Role already selected, enable demo mode
        enableDemoMode(role);
        setIsDemo(true);
        initializeApiInterceptor();
        // Add demo param to URL
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.set("demo", "true");
        router.push(`?${newSearchParams.toString()}`);
      } else {
        // No role selected, show role selector
        setShowRoleSelector(true);
      }
    }
  };

  const openRoleSelector = () => {
    setShowRoleSelector(true);
  };

  const closeRoleSelector = () => {
    setShowRoleSelector(false);
  };

  const selectRole = async (role: UserRole) => {
    try {
      enableDemoMode(role);
      setIsDemo(true);
      setSelectedRole(role);
      initializeApiInterceptor();
      
      // Auto-login as the selected role
      const result = loginAsRole(role);
      if (result.success) {
        setShowRoleSelector(false);
        // Add demo param to URL
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.set("demo", "true");
        router.push(`?${newSearchParams.toString()}`);
        // Redirect to dashboard
        router.push("/dashboard");
        router.refresh();
      } else {
        throw new Error(result.error || "Failed to login");
      }
    } catch (error) {
      console.error("Error selecting role:", error);
      throw error;
    }
  };

  const changeRole = () => {
    setShowRoleSelector(true);
  };

  const resetDemo = () => {
    resetDemoData();
    // Refresh the page to reload data
    window.location.reload();
  };

  return (
    <DemoModeContext.Provider
      value={{
        isDemo,
        selectedRole,
        showRoleSelector,
        toggleDemoMode,
        resetDemo,
        openRoleSelector,
        closeRoleSelector,
        selectRole,
        changeRole,
      }}
    >
      {children}
    </DemoModeContext.Provider>
  );
}

// Create a wrapper that provides default context during suspense
function DemoModeProviderFallback({ children }: { children: ReactNode }) {
  // Provide a default context value during suspense to prevent errors
  const defaultContext: DemoModeContextType = {
    isDemo: false,
    selectedRole: null,
    showRoleSelector: false,
    toggleDemoMode: () => {
      console.warn("DemoModeProvider is not ready yet");
    },
    resetDemo: () => {
      console.warn("DemoModeProvider is not ready yet");
    },
    openRoleSelector: () => {
      console.warn("DemoModeProvider is not ready yet");
    },
    closeRoleSelector: () => {
      console.warn("DemoModeProvider is not ready yet");
    },
    selectRole: async () => {
      console.warn("DemoModeProvider is not ready yet");
    },
    changeRole: () => {
      console.warn("DemoModeProvider is not ready yet");
    },
  };

  return (
    <DemoModeContext.Provider value={defaultContext}>
      {children}
    </DemoModeContext.Provider>
  );
}

export function DemoModeProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<DemoModeProviderFallback>{children}</DemoModeProviderFallback>}>
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
