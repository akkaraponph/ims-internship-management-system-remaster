"use client";

import { useDemoMode } from "@/lib/demo/demo-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TestTube } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";

export function DemoModeToggle() {
  const { isDemo, toggleDemoMode, resetDemo } = useDemoMode();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleToggle = () => {
    if (isDemo) {
      setIsDialogOpen(true);
    } else {
      toggleDemoMode();
    }
  };

  const handleConfirmDisable = () => {
    toggleDemoMode();
    setIsDialogOpen(false);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {isDemo && (
          <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
            <TestTube className="mr-1 h-3 w-3" />
            Demo Mode
          </Badge>
        )}
        <Button
          variant={isDemo ? "default" : "outline"}
          size="sm"
          onClick={handleToggle}
          className="gap-2"
        >
          <TestTube className="h-4 w-4" />
          {isDemo ? "ปิด Demo Mode" : "เปิด Demo Mode"}
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการปิด Demo Mode</DialogTitle>
            <DialogDescription>
              การปิด Demo Mode จะลบข้อมูลทั้งหมดที่เก็บใน localStorage
              คุณแน่ใจหรือไม่ว่าต้องการปิด Demo Mode?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button variant="destructive" onClick={handleConfirmDisable}>
              ปิด Demo Mode
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function DemoModeResetButton() {
  const { resetDemo } = useDemoMode();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsDialogOpen(true)}
        className="gap-2"
      >
        รีเซ็ตข้อมูล Demo
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการรีเซ็ตข้อมูล</DialogTitle>
            <DialogDescription>
              การรีเซ็ตจะลบข้อมูลทั้งหมดและสร้างข้อมูลใหม่ คุณแน่ใจหรือไม่?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button variant="destructive" onClick={() => {
              resetDemo();
              setIsDialogOpen(false);
            }}>
              รีเซ็ต
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
