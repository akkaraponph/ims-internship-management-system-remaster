"use client";

import { useDemoMode } from "@/lib/demo/demo-context";
import { Badge } from "@/components/ui/badge";
import { TestTube } from "lucide-react";

export function DemoModeIndicator() {
  const { isDemo } = useDemoMode();

  if (!isDemo) return null;

  return (
    <Badge
      variant="secondary"
      className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20"
    >
      <TestTube className="mr-1 h-3 w-3" />
      Demo Mode
    </Badge>
  );
}
