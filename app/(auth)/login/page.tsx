"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { loginSchema } from "@/lib/validations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { useDemoMode } from "@/lib/demo/demo-context";
import { getEntity, setSession } from "@/lib/demo/demo-service";
import { DEMO_STORAGE_KEYS } from "@/lib/demo/storage-keys";
import { DemoModeToggle } from "@/components/demo/DemoModeToggle";
import type { User } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { isDemo } = useDemoMode();

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: toFormikValidationSchema(loginSchema),
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        if (isDemo) {
          // Demo mode: use localStorage
          const users = getEntity<User>(DEMO_STORAGE_KEYS.USERS);
          const user = users.find((u) => u.username === values.username);

          if (!user || !user.isActive) {
            toast.error("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
            setIsLoading(false);
            return;
          }

          // Get companyId if company user
          let companyId = null;
          if (user.role === "company") {
            const companyUsers = getEntity(DEMO_STORAGE_KEYS.COMPANY_USERS);
            const companyUser = companyUsers.find((cu: any) => cu.userId === user.id);
            if (companyUser) {
              companyId = companyUser.companyId;
            }
          }

          const sessionData = {
            id: user.id,
            username: user.username,
            role: user.role,
            isActive: user.isActive,
            universityId: user.universityId,
            companyId: companyId,
          };

          setSession(sessionData);
          toast.success("เข้าสู่ระบบสำเร็จ (Demo Mode)");
          router.push("/dashboard");
          router.refresh();
        } else {
          // Real mode: use NextAuth
          const result = await signIn("credentials", {
            username: values.username,
            password: values.password,
            redirect: false,
          });

          if (result?.error) {
            toast.error("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
          } else {
            toast.success("เข้าสู่ระบบสำเร็จ");
            router.push("/dashboard");
            router.refresh();
          }
        }
      } catch (error) {
        toast.error("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <DemoModeToggle />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">ระบบจัดการการฝึกงาน</CardTitle>
          <CardDescription className="text-center">
            กรุณาเข้าสู่ระบบเพื่อใช้งาน
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">ชื่อผู้ใช้</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="กรุณากรอกชื่อผู้ใช้"
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={isLoading}
              />
              {formik.touched.username && formik.errors.username && (
                <p className="text-sm text-destructive">{formik.errors.username}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">รหัสผ่าน</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="กรุณากรอกรหัสผ่าน"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={isLoading}
              />
              {formik.touched.password && formik.errors.password && (
                <p className="text-sm text-destructive">{formik.errors.password}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </Button>

            {isDemo && (
              <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
                <p className="font-semibold mb-2">บัญชี Demo:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• superadmin (Super Admin)</li>
                  <li>• admin1 (Admin)</li>
                  <li>• director1 (Director)</li>
                  <li>• student1-12 (Student)</li>
                  <li>• company1-8 (Company)</li>
                </ul>
                <p className="mt-2 text-xs text-muted-foreground">
                  รหัสผ่าน: ใช้รหัสผ่านใดก็ได้ในโหมด Demo
                </p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
