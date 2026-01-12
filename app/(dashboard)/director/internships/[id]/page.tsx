"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Loader2, CheckCircle, XCircle, ArrowLeft, RotateCcw } from "lucide-react";
import Link from "next/link";

interface InternshipDetail {
  id: string;
  studentId: string | null;
  companyId: string | null;
  isSend: string | null;
  isConfirm: string | null;
  status: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    program: string | null;
  };
  company?: {
    id: string;
    name: string;
    type: string | null;
    activities: string | null;
    proposeTo: string | null;
    phone: string | null;
    contactPersonName: string | null;
    contactPersonPosition: string | null;
    contactPersonPhone: string | null;
    address?: {
      addressLine: string | null;
      province?: { name: string };
      district?: { name: string };
      subDistrict?: { name: string };
      postalCode: string | null;
    };
  };
  coStudents?: Array<{
    id: string;
    firstName: string | null;
    lastName: string | null;
    studentIdString: string | null;
    phone: string | null;
  }>;
}

export default function InternshipDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [internship, setInternship] = useState<InternshipDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (session && id) {
      fetchInternshipDetail();
    }
  }, [session, id]);

  const fetchInternshipDetail = async () => {
    try {
      const response = await fetch(`/api/internships/${id}/detail`);
      if (response.ok) {
        const data = await response.json();
        setInternship(data);
      } else {
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!confirm("ยืนยันการอนุมัติแบบฟอร์มนี้?")) return;

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/internships/${id}/confirm`, {
        method: "POST",
      });

      if (response.ok) {
        toast.success("อนุมัติแบบฟอร์มสำเร็จ");
        router.push("/director/internships/confirmed");
      } else {
        const error = await response.json();
        toast.error(error.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnconfirm = async () => {
    if (!confirm("ยืนยันการเปลี่ยนสถานะกลับเป็นรอการยืนยัน?")) return;

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/internships/${id}/unconfirm`, {
        method: "POST",
      });

      if (response.ok) {
        toast.success("เปลี่ยนสถานะสำเร็จ");
        router.push("/director/internships/pending");
      } else {
        const error = await response.json();
        toast.error(error.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReturn = async () => {
    if (!confirm("ยืนยันการส่งคืนแบบฟอร์มให้กับนักศึกษา?")) return;

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/internships/${id}/return`, {
        method: "POST",
      });

      if (response.ok) {
        toast.success("ส่งคืนแบบฟอร์มสำเร็จ");
        router.push("/director/internships/pending");
      } else {
        const error = await response.json();
        toast.error(error.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!internship) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">ไม่พบข้อมูล</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPending = internship.isSend === "1" && internship.isConfirm !== "1";
  const isConfirmed = internship.isSend === "1" && internship.isConfirm === "1";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">รายละเอียดแบบฟอร์มฝึกงาน</h2>
          <p className="text-muted-foreground">ข้อมูลแบบฟอร์มฝึกประสบการณ์วิชาชีพ</p>
        </div>
        <Link href={isPending ? "/director/internships/pending" : "/director/internships/confirmed"}>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            กลับ
          </Button>
        </Link>
      </div>

      {/* Student Information */}
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลผู้เสนอ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>ชื่อ</Label>
              <Input value={internship.student?.firstName || "-"} disabled />
            </div>
            <div className="space-y-2">
              <Label>นามสกุล</Label>
              <Input value={internship.student?.lastName || "-"} disabled />
            </div>
            <div className="space-y-2">
              <Label>รหัสนักศึกษา</Label>
              <Input value={internship.student?.id || "-"} disabled />
            </div>
            <div className="space-y-2">
              <Label>เบอร์โทรศัพท์</Label>
              <Input value={internship.student?.phone || "-"} disabled />
            </div>
            <div className="space-y-2">
              <Label>อีเมล</Label>
              <Input value={internship.student?.email || "-"} disabled />
            </div>
            <div className="space-y-2">
              <Label>สาขาวิชา</Label>
              <Input value={internship.student?.program || "-"} disabled />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลสถานที่ฝึกงาน</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>ชื่อหน่วยงาน</Label>
              <Input value={internship.company?.name || "-"} disabled />
            </div>
            <div className="space-y-2">
              <Label>สังกัดภาค</Label>
              <Input value={internship.company?.type || "-"} disabled />
            </div>
            <div className="space-y-2">
              <Label>กิจกรรมหลักของหน่วยงาน</Label>
              <Input value={internship.company?.activities || "-"} disabled />
            </div>
            <div className="space-y-2">
              <Label>เสนอหนังสือต่อ</Label>
              <Input value={internship.company?.proposeTo || "-"} disabled />
            </div>
            <div className="space-y-2">
              <Label>ติดต่อสถานที่ฝึกงานกับ</Label>
              <Input value={internship.company?.contactPersonName || "-"} disabled />
            </div>
            <div className="space-y-2">
              <Label>ตำแหน่ง</Label>
              <Input value={internship.company?.contactPersonPosition || "-"} disabled />
            </div>
            <div className="space-y-2">
              <Label>เบอร์ติดต่อ</Label>
              <Input value={internship.company?.contactPersonPhone || "-"} disabled />
            </div>
            <div className="space-y-2">
              <Label>เบอร์โทรศัพท์หน่วยงาน</Label>
              <Input value={internship.company?.phone || "-"} disabled />
            </div>
          </div>

          {internship.company?.address && (
            <div className="mt-4 p-4 border rounded-lg">
              <h4 className="font-medium mb-2">ที่อยู่</h4>
              <div className="space-y-2 text-sm">
                <div>
                  {internship.company.address.addressLine && (
                    <p>{internship.company.address.addressLine}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {internship.company.address.subDistrict?.name && (
                    <span>ตำบล {internship.company.address.subDistrict.name}</span>
                  )}
                  {internship.company.address.district?.name && (
                    <span>อำเภอ {internship.company.address.district.name}</span>
                  )}
                  {internship.company.address.province?.name && (
                    <span>จังหวัด {internship.company.address.province.name}</span>
                  )}
                  {internship.company.address.postalCode && (
                    <span>{internship.company.address.postalCode}</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Co-internship Students */}
      {internship.coStudents && internship.coStudents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>พร้อมด้วยนักศึกษา</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {internship.coStudents.map((coStudent, index) => (
                <div key={coStudent.id || index} className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">นักศึกษาคนที่ {index + 1}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>ชื่อ</Label>
                      <Input value={coStudent.firstName || "-"} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>นามสกุล</Label>
                      <Input value={coStudent.lastName || "-"} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>รหัสนักศึกษา</Label>
                      <Input value={coStudent.studentIdString || "-"} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>เบอร์โทรศัพท์</Label>
                      <Input value={coStudent.phone || "-"} disabled />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-end gap-4">
            {isPending && (
              <>
                <Button
                  variant="destructive"
                  onClick={handleReturn}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      กำลังส่งคืน...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      ส่งคืน
                    </>
                  )}
                </Button>
                <Button onClick={handleConfirm} disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      กำลังอนุมัติ...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      อนุมัติ
                    </>
                  )}
                </Button>
              </>
            )}
            {isConfirmed && (
              <>
                <Button
                  variant="destructive"
                  onClick={handleReturn}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      กำลังส่งคืน...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      ส่งคืน
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleUnconfirm}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      กำลังเปลี่ยนสถานะ...
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-2 h-4 w-4" />
                      พิจารณาใหม่
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
