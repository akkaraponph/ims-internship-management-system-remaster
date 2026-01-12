"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { DemoModeProvider } from "@/lib/demo/demo-context";
import { useDemoMode } from "@/lib/demo/demo-context";

function SessionProviderWrapper({ children }: { children: React.ReactNode }) {
  const { isDemo } = useDemoMode();
  
  return (
    <SessionProvider
      refetchOnWindowFocus={!isDemo}
      refetchWhenOffline={!isDemo}
      refetchInterval={isDemo ? 0 : 0} // Disable polling in demo mode
    >
      {children}
    </SessionProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <DemoModeProvider>
        <SessionProviderWrapper>
          {children}
        </SessionProviderWrapper>
      </DemoModeProvider>
    </ThemeProvider>
  );
}
