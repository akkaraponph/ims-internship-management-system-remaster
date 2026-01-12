"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useFormik } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { studentRegistrationSchema } from "@/lib/validations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface UniversityInfo {
  id: string;
  name: string;
  code: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [university, setUniversity] = useState<UniversityInfo | null>(null);
  const [inviteCode, setInviteCode] = useState(searchParams.get("code") || "");

  // Validate invite code when it changes
  useEffect(() => {
    if (inviteCode && inviteCode.length >= 8) {
      validateInviteCode(inviteCode);
    } else {
      setUniversity(null);
    }
  }, [inviteCode]);

  const validateInviteCode = async (code: string) => {
    setIsValidatingCode(true);
    try {
      const response = await fetch("/api/universities/validate-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: code }),
      });

      if (response.ok) {
        const data = await response.json();
        setUniversity(data.university);
      } else {
        setUniversity(null);
      }
    } catch (error) {
      setUniversity(null);
    } finally {
      setIsValidatingCode(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      inviteCode: inviteCode,
      username: "",
      password: "",
      email: "",
      idCard: "",
      firstName: "",
      lastName: "",
      phone: "",
      program: "",
      department: "",
    },
    validationSchema: toFormikValidationSchema(studentRegistrationSchema),
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (!university) {
        toast.error("กรุณากรอกรหัสเชิญที่ถูกต้อง");
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        const data = await response.json();

        if (response.ok) {
          toast.success("ลงทะเบียนสำเร็จ กรุณาเข้าสู่ระบบ");
          router.push("/login");
        } else {
          toast.error(data.error || "เกิดข้อผิดพลาดในการลงทะเบียน");
        }
      } catch (error) {
        toast.error("เกิดข้อผิดพลาดในการลงทะเบียน");
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">ลงทะเบียนนักศึกษา</CardTitle>
          <CardDescription className="text-center">
            กรุณากรอกรหัสเชิญและข้อมูลส่วนตัวเพื่อลงทะเบียน
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            {/* Invite Code Section */}
            <div className="space-y-2 p-4 border rounded-lg bg-muted/50">
              <Label htmlFor="inviteCode">รหัสเชิญ (Invite Code)</Label>
              <Input
                id="inviteCode"
                name="inviteCode"
                type="text"
                placeholder="กรุณากรอกรหัสเชิญ"
                value={formik.values.inviteCode}
                onChange={(e) => {
                  formik.handleChange(e);
                  setInviteCode(e.target.value);
                }}
                onBlur={formik.handleBlur}
                disabled={isLoading}
              />
              {formik.touched.inviteCode && formik.errors.inviteCode && (
                <p className="text-sm text-destructive">{formik.errors.inviteCode}</p>
              )}
              {isValidatingCode && (
                <p className="text-sm text-muted-foreground">กำลังตรวจสอบรหัสเชิญ...</p>
              )}
              {university && (
                <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950 rounded text-green-700 dark:text-green-300">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm">มหาวิทยาลัย: {university.name}</span>
                </div>
              )}
            </div>

            {/* Account Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">ข้อมูลบัญชี</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    disabled={isLoading || !university}
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
                    disabled={isLoading || !university}
                  />
                  {formik.touched.password && formik.errors.password && (
                    <p className="text-sm text-destructive">{formik.errors.password}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">ข้อมูลส่วนตัว</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">อีเมล</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="example@email.com"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={isLoading || !university}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className="text-sm text-destructive">{formik.errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idCard">เลขบัตรประชาชน</Label>
                  <Input
                    id="idCard"
                    name="idCard"
                    type="text"
                    placeholder="กรุณากรอกเลขบัตรประชาชน"
                    value={formik.values.idCard}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={isLoading || !university}
                  />
                  {formik.touched.idCard && formik.errors.idCard && (
                    <p className="text-sm text-destructive">{formik.errors.idCard}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firstName">ชื่อ</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="กรุณากรอกชื่อ"
                    value={formik.values.firstName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={isLoading || !university}
                  />
                  {formik.touched.firstName && formik.errors.firstName && (
                    <p className="text-sm text-destructive">{formik.errors.firstName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">นามสกุล</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="กรุณากรอกนามสกุล"
                    value={formik.values.lastName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={isLoading || !university}
                  />
                  {formik.touched.lastName && formik.errors.lastName && (
                    <p className="text-sm text-destructive">{formik.errors.lastName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="text"
                    placeholder="กรุณากรอกเบอร์โทรศัพท์"
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={isLoading || !university}
                  />
                  {formik.touched.phone && formik.errors.phone && (
                    <p className="text-sm text-destructive">{formik.errors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="program">สาขาวิชา</Label>
                  <Input
                    id="program"
                    name="program"
                    type="text"
                    placeholder="กรุณากรอกสาขาวิชา"
                    value={formik.values.program}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={isLoading || !university}
                  />
                  {formik.touched.program && formik.errors.program && (
                    <p className="text-sm text-destructive">{formik.errors.program}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">คณะ</Label>
                  <Input
                    id="department"
                    name="department"
                    type="text"
                    placeholder="กรุณากรอกคณะ"
                    value={formik.values.department}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={isLoading || !university}
                  />
                  {formik.touched.department && formik.errors.department && (
                    <p className="text-sm text-destructive">{formik.errors.department}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="flex-1" disabled={isLoading || !university}>
                {isLoading ? "กำลังลงทะเบียน..." : "ลงทะเบียน"}
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              มีบัญชีแล้ว?{" "}
              <Link href="/login" className="text-primary hover:underline">
                เข้าสู่ระบบ
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
