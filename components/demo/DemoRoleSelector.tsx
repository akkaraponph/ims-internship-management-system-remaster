"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Shield,
  UserCog,
  GraduationCap,
  Building2,
  UserCheck,
} from "lucide-react";
import type { UserRole } from "@/types";
import { useDemoMode } from "@/lib/demo/demo-context";
import { toast } from "sonner";

interface RoleOption {
  role: UserRole;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const roleOptions: RoleOption[] = [
  {
    role: "super-admin",
    title: "ผู้ดูแลระบบหลัก",
    description: "จัดการระบบทั้งหมด",
    icon: Shield,
  },
  {
    role: "admin",
    title: "ผู้ดูแลระบบ",
    description: "จัดการผู้ใช้และข้อมูล",
    icon: UserCog,
  },
  {
    role: "director",
    title: "อาจารย์ที่ปรึกษา",
    description: "ดูแลนักศึกษาและติดตามการฝึกงาน",
    icon: UserCheck,
  },
  {
    role: "student",
    title: "นักศึกษา",
    description: "สมัครฝึกงานและจัดการข้อมูลส่วนตัว",
    icon: GraduationCap,
  },
  {
    role: "company",
    title: "บริษัท",
    description: "จัดการตำแหน่งงานและรับนักศึกษาฝึกงาน",
    icon: Building2,
  },
];

interface DemoRoleSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoleSelected?: () => void;
}

export function DemoRoleSelector({ open, onOpenChange, onRoleSelected }: DemoRoleSelectorProps) {
  const { selectRole } = useDemoMode();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleRoleSelect = async (role: UserRole) => {
    setIsLoading(role);
    try {
      await selectRole(role);
      toast.success(`เข้าสู่ระบบเป็น ${roleOptions.find((r) => r.role === role)?.title}`);
      onOpenChange(false);
      if (onRoleSelected) {
        onRoleSelected();
      }
    } catch (error) {
      console.error("Error selecting role:", error);
      toast.error("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>เลือกบทบาทสำหรับ Demo Mode</DialogTitle>
          <DialogDescription>
            เลือกบทบาทที่คุณต้องการทดสอบระบบในโหมด Demo
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {roleOptions.map((option) => {
            const Icon = option.icon;
            const isRoleLoading = isLoading === option.role;
            
            return (
              <Card
                key={option.role}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => !isRoleLoading && handleRoleSelect(option.role)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{option.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    {option.description}
                  </CardDescription>
                  <Button
                    className="w-full"
                    disabled={isRoleLoading}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRoleSelect(option.role);
                    }}
                  >
                    {isRoleLoading ? "กำลังเข้าสู่ระบบ..." : "เลือก"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
