"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { DemoModeProvider } from "@/lib/demo/demo-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <DemoModeProvider>
          {children}
        </DemoModeProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
