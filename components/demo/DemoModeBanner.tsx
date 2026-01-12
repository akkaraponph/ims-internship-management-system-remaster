"use client";

import { useState } from "react";
import { useDemoMode } from "@/lib/demo/demo-context";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function DemoModeBanner() {
  const { isDemo, toggleDemoMode } = useDemoMode();
  const [dismissed, setDismissed] = useState(false);

  if (!isDemo || dismissed) return null;

  return (
    <Card className="bg-yellow-500/10 border-yellow-500/20 m-4">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          <div>
            <p className="font-semibold text-yellow-600 dark:text-yellow-400">
              โหมด Demo กำลังเปิดใช้งาน
            </p>
            <p className="text-sm text-muted-foreground">
              ข้อมูลทั้งหมดถูกเก็บใน localStorage และจะไม่ถูกบันทึกลงฐานข้อมูลจริง
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDismissed(true)}
          className="text-yellow-600 dark:text-yellow-400"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
