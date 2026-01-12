"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useFormik } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { companyRegistrationSchema } from "@/lib/validations/company-registration";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface UniversityInfo {
  id: string;
  name: string;
  code: string;
}

export default function RegisterCompanyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [university, setUniversity] = useState<UniversityInfo | null>(null);
  const [inviteCode, setInviteCode] = useState(searchParams.get("code") || "");

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
      companyName: "",
      contactPersonName: "",
      contactPersonEmail: "",
      contactPersonPhone: "",
      contactPersonPosition: "",
      position: "",
      isPrimary: true,
    },
    validationSchema: toFormikValidationSchema(companyRegistrationSchema),
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (!university) {
        toast.error("กรุณากรอกรหัสเชิญที่ถูกต้อง");
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch("/api/auth/register-company", {
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
              <Building2 className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">ลงทะเบียนบริษัท</CardTitle>
          <CardDescription className="text-center">
            กรุณากรอกข้อมูลเพื่อลงทะเบียนบริษัท
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inviteCode">รหัสเชิญมหาวิทยาลัย *</Label>
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
                disabled={isLoading || isValidatingCode}
              />
              {isValidatingCode && (
                <p className="text-sm text-muted-foreground">กำลังตรวจสอบรหัสเชิญ...</p>
              )}
              {university && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>มหาวิทยาลัย: {university.name}</span>
                </div>
              )}
              {formik.touched.inviteCode && formik.errors.inviteCode && (
                <p className="text-sm text-destructive">{formik.errors.inviteCode}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">ชื่อผู้ใช้ *</Label>
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
                <Label htmlFor="password">รหัสผ่าน *</Label>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">ชื่อบริษัท *</Label>
              <Input
                id="companyName"
                name="companyName"
                type="text"
                placeholder="กรุณากรอกชื่อบริษัท"
                value={formik.values.companyName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={isLoading}
              />
              {formik.touched.companyName && formik.errors.companyName && (
                <p className="text-sm text-destructive">{formik.errors.companyName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPersonName">ชื่อผู้ติดต่อ *</Label>
              <Input
                id="contactPersonName"
                name="contactPersonName"
                type="text"
                placeholder="กรุณากรอกชื่อผู้ติดต่อ"
                value={formik.values.contactPersonName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={isLoading}
              />
              {formik.touched.contactPersonName && formik.errors.contactPersonName && (
                <p className="text-sm text-destructive">{formik.errors.contactPersonName}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPersonEmail">อีเมลผู้ติดต่อ *</Label>
                <Input
                  id="contactPersonEmail"
                  name="contactPersonEmail"
                  type="email"
                  placeholder="กรุณากรอกอีเมล"
                  value={formik.values.contactPersonEmail}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isLoading}
                />
                {formik.touched.contactPersonEmail && formik.errors.contactPersonEmail && (
                  <p className="text-sm text-destructive">{formik.errors.contactPersonEmail}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPersonPhone">เบอร์โทรศัพท์</Label>
                <Input
                  id="contactPersonPhone"
                  name="contactPersonPhone"
                  type="tel"
                  placeholder="กรุณากรอกเบอร์โทรศัพท์"
                  value={formik.values.contactPersonPhone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isLoading}
                />
                {formik.touched.contactPersonPhone && formik.errors.contactPersonPhone && (
                  <p className="text-sm text-destructive">{formik.errors.contactPersonPhone}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPersonPosition">ตำแหน่งผู้ติดต่อ</Label>
                <Input
                  id="contactPersonPosition"
                  name="contactPersonPosition"
                  type="text"
                  placeholder="ตำแหน่งงาน"
                  value={formik.values.contactPersonPosition}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">ตำแหน่งของคุณในบริษัท</Label>
                <Input
                  id="position"
                  name="position"
                  type="text"
                  placeholder="ตำแหน่งของคุณ"
                  value={formik.values.position}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || !university}>
              {isLoading ? "กำลังลงทะเบียน..." : "ลงทะเบียน"}
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">มีบัญชีอยู่แล้ว? </span>
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
