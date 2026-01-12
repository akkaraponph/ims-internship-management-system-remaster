"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Loader2, Save, Send, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Province {
  id: string;
  name: string;
}

interface District {
  id: string;
  name: string;
  provinceId: string;
}

interface SubDistrict {
  id: string;
  name: string;
  districtId: string;
}

interface Student {
  id: string;
  universityId: string;
  firstName: string;
  lastName: string;
  email: string;
  program: string | null;
  phone: string | null;
  resumeApproved: boolean;
}

interface CoStudent {
  firstName: string;
  lastName: string;
  studentIdString: string;
  phone: string;
}

export default function CreateInternshipPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);

  // Company form data
  const [companyData, setCompanyData] = useState({
    name: "",
    type: "",
    activities: "",
    proposeTo: "",
    phone: "",
    contactPersonName: "",
    contactPersonPosition: "",
    contactPersonPhone: "",
  });

  // Company address data
  const [companyAddress, setCompanyAddress] = useState({
    addressLine: "",
    provinceId: "",
    districtId: "",
    subDistrictId: "",
    postalCode: "",
    houseNumber: "",
    road: "",
  });

  // Co-internship students (up to 4)
  const [coStudents, setCoStudents] = useState<CoStudent[]>([
    { firstName: "", lastName: "", studentIdString: "", phone: "" },
    { firstName: "", lastName: "", studentIdString: "", phone: "" },
    { firstName: "", lastName: "", studentIdString: "", phone: "" },
    { firstName: "", lastName: "", studentIdString: "", phone: "" },
  ]);

  // Address dropdowns
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [subDistricts, setSubDistricts] = useState<SubDistrict[]>([]);

  useEffect(() => {
    if (session?.user?.role === "student") {
      fetchStudent();
      fetchProvinces();
    }
  }, [session]);

  const fetchStudent = async () => {
    try {
      const response = await fetch("/api/students");
      if (response.ok) {
        const data = await response.json();
        const studentData = Array.isArray(data) ? data[0] : data;
        if (studentData) {
          setStudent({
            id: studentData.id,
            universityId: studentData.universityId,
            firstName: studentData.firstName,
            lastName: studentData.lastName,
            email: studentData.email,
            program: studentData.program,
            phone: studentData.phone,
          });
        }
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProvinces = async () => {
    try {
      const response = await fetch("/api/addresses/provinces");
      if (response.ok) {
        const data = await response.json();
        setProvinces(data);
      }
    } catch (error) {
      console.error("Error fetching provinces:", error);
    }
  };

  const handleProvinceChange = async (provinceId: string) => {
    setCompanyAddress({
      ...companyAddress,
      provinceId,
      districtId: "",
      subDistrictId: "",
    });
    setDistricts([]);
    setSubDistricts([]);
    if (provinceId) {
      try {
        const response = await fetch(`/api/addresses/districts?provinceId=${provinceId}`);
        if (response.ok) {
          setDistricts(await response.json());
        }
      } catch (error) {
        console.error("Error fetching districts:", error);
      }
    }
  };

  const handleDistrictChange = async (districtId: string) => {
    setCompanyAddress({
      ...companyAddress,
      districtId,
      subDistrictId: "",
    });
    setSubDistricts([]);
    if (districtId) {
      try {
        const response = await fetch(`/api/addresses/sub-districts?districtId=${districtId}`);
        if (response.ok) {
          setSubDistricts(await response.json());
        }
      } catch (error) {
        console.error("Error fetching sub-districts:", error);
      }
    }
  };

  const validateForm = () => {
    if (!companyData.name.trim()) {
      toast.error("กรุณากรอกชื่อหน่วยงาน");
      return false;
    }
    if (!companyData.type) {
      toast.error("กรุณาเลือกสังกัดภาค");
      return false;
    }
    if (!companyAddress.provinceId) {
      toast.error("กรุณาเลือกจังหวัด");
      return false;
    }
    if (!companyAddress.districtId) {
      toast.error("กรุณาเลือกอำเภอ");
      return false;
    }
    if (!companyAddress.subDistrictId) {
      toast.error("กรุณาเลือกตำบล");
      return false;
    }
    return true;
  };

  const handleSave = async (isSend: boolean = false) => {
    if (!student) return;

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      // Create company address first
      const addressParts = [
        companyAddress.houseNumber,
        companyAddress.road,
      ].filter(Boolean);
      const addressLine = addressParts.length > 0 ? addressParts.join(" ") : undefined;

      const addressResponse = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressLine: addressLine || undefined,
          provinceId: companyAddress.provinceId,
          districtId: companyAddress.districtId,
          subDistrictId: companyAddress.subDistrictId,
          postalCode: companyAddress.postalCode,
        }),
      });

      if (!addressResponse.ok) {
        throw new Error("Failed to create address");
      }

      const address = await addressResponse.json();

      // Create company
      const companyResponse = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: companyData.name,
          type: companyData.type,
          activities: companyData.activities,
          proposeTo: companyData.proposeTo,
          phone: companyData.phone,
          contactPersonName: companyData.contactPersonName,
          contactPersonPosition: companyData.contactPersonPosition,
          contactPersonPhone: companyData.contactPersonPhone,
          addressId: address.id,
          universityId: student.universityId,
        }),
      });

      if (!companyResponse.ok) {
        throw new Error("Failed to create company");
      }

      const company = await companyResponse.json();

      // Create internship
      const internshipResponse = await fetch("/api/internships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.id,
          companyId: company.id,
          isSend: isSend ? "1" : "0",
          isConfirm: "0",
          status: "pending",
        }),
      });

      if (!internshipResponse.ok) {
        const errorData = await internshipResponse.json();
        throw new Error(errorData.error || "Failed to create internship");
      }

      const internship = await internshipResponse.json();

      // Create co-internship students
      const validCoStudents = coStudents.filter(
        (co) => co.firstName || co.lastName || co.studentIdString
      );

      if (validCoStudents.length > 0) {
        for (const coStudent of validCoStudents) {
          await fetch("/api/internships/co-students", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              internshipId: internship.id,
              firstName: coStudent.firstName,
              lastName: coStudent.lastName,
              studentIdString: coStudent.studentIdString,
              phone: coStudent.phone,
            }),
          });
        }
      }

      toast.success(isSend ? "ส่งแบบฟอร์มสำเร็จ" : "บันทึกแบบฟอร์มสำเร็จ");
      router.push("/internship");
    } catch (error: any) {
      console.error("Error saving internship:", error);
      toast.error(error.message || "เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">ไม่พบข้อมูลนักศึกษา</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">แบบฟอร์มฝึกประสบการณ์วิชาชีพ</h2>
          <p className="text-muted-foreground">กรอกข้อมูลสถานที่ฝึกงาน</p>
        </div>
        <Link href="/internship">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            กลับ
          </Button>
        </Link>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave(false);
        }}
      >
        {/* Sender Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>ข้อมูลผู้เสนอ</CardTitle>
            <CardDescription>ข้อมูลนักศึกษาผู้ส่งแบบฟอร์ม</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ชื่อ</Label>
                <Input value={student.firstName} disabled />
              </div>
              <div className="space-y-2">
                <Label>นามสกุล</Label>
                <Input value={student.lastName} disabled />
              </div>
              <div className="space-y-2">
                <Label>รหัสนักศึกษา</Label>
                <Input value={student.id} disabled />
              </div>
              <div className="space-y-2">
                <Label>เบอร์โทรศัพท์</Label>
                <Input value={student.phone || ""} disabled />
              </div>
              <div className="space-y-2">
                <Label>อีเมล</Label>
                <Input value={student.email} disabled />
              </div>
              <div className="space-y-2">
                <Label>สาขาวิชา</Label>
                <Input value={student.program || ""} disabled />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>ข้อมูลสถานที่ฝึกงาน</CardTitle>
            <CardDescription>กรอกข้อมูลบริษัทหรือหน่วยงานที่ต้องการฝึกงาน</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">ชื่อหน่วยงาน *</Label>
                <Input
                  id="companyName"
                  value={companyData.name}
                  onChange={(e) =>
                    setCompanyData({ ...companyData, name: e.target.value })
                  }
                  placeholder="บริษัท..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyType">สังกัดภาค *</Label>
                <Select
                  value={companyData.type}
                  onValueChange={(value) =>
                    setCompanyData({ ...companyData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกสังกัดภาค" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="เอกชน">เอกชน</SelectItem>
                    <SelectItem value="รัฐวิสาหกิจ">รัฐวิสาหกิจ</SelectItem>
                    <SelectItem value="รัฐบาล">รัฐบาล</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="activities">กิจกรรมหลักของหน่วยงาน</Label>
                <Input
                  id="activities"
                  value={companyData.activities}
                  onChange={(e) =>
                    setCompanyData({ ...companyData, activities: e.target.value })
                  }
                  placeholder="งานที่เกี่ยวข้องกับคอมพิวเตอร์"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proposeTo">เสนอหนังสือต่อ</Label>
                <Input
                  id="proposeTo"
                  value={companyData.proposeTo}
                  onChange={(e) =>
                    setCompanyData({ ...companyData, proposeTo: e.target.value })
                  }
                  placeholder="เช่น หัวหน้างานฝ่ายบุคคล"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPersonName">ติดต่อสถานที่ฝึกงานกับ</Label>
                <Input
                  id="contactPersonName"
                  value={companyData.contactPersonName}
                  onChange={(e) =>
                    setCompanyData({ ...companyData, contactPersonName: e.target.value })
                  }
                  placeholder="ชื่อผู้ติดต่อ"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPersonPosition">ตำแหน่ง</Label>
                <Input
                  id="contactPersonPosition"
                  value={companyData.contactPersonPosition}
                  onChange={(e) =>
                    setCompanyData({ ...companyData, contactPersonPosition: e.target.value })
                  }
                  placeholder="ตำแหน่ง"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPersonPhone">เบอร์ติดต่อ</Label>
                <Input
                  id="contactPersonPhone"
                  value={companyData.contactPersonPhone}
                  onChange={(e) =>
                    setCompanyData({ ...companyData, contactPersonPhone: e.target.value })
                  }
                  placeholder="เบอร์โทรศัพท์"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyPhone">เบอร์โทรศัพท์หน่วยงาน</Label>
              <Input
                id="companyPhone"
                value={companyData.phone}
                onChange={(e) =>
                  setCompanyData({ ...companyData, phone: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Company Address */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>ที่อยู่สถานที่ฝึกงาน</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="province">จังหวัด *</Label>
                <Select
                  value={companyAddress.provinceId}
                  onValueChange={handleProvinceChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกจังหวัด" />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces.map((province) => (
                      <SelectItem key={province.id} value={province.id}>
                        {province.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">อำเภอ *</Label>
                <Select
                  value={companyAddress.districtId}
                  onValueChange={handleDistrictChange}
                  disabled={!companyAddress.provinceId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกอำเภอ" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((district) => (
                      <SelectItem key={district.id} value={district.id}>
                        {district.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subDistrict">ตำบล *</Label>
                <Select
                  value={companyAddress.subDistrictId}
                  onValueChange={(value) =>
                    setCompanyAddress({ ...companyAddress, subDistrictId: value })
                  }
                  disabled={!companyAddress.districtId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกตำบล" />
                  </SelectTrigger>
                  <SelectContent>
                    {subDistricts.map((subDistrict) => (
                      <SelectItem key={subDistrict.id} value={subDistrict.id}>
                        {subDistrict.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="houseNumber">เลขที่</Label>
                <Input
                  id="houseNumber"
                  value={companyAddress.houseNumber}
                  onChange={(e) =>
                    setCompanyAddress({ ...companyAddress, houseNumber: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="road">ถนน / ซอย / หมู่</Label>
                <Input
                  id="road"
                  value={companyAddress.road}
                  onChange={(e) =>
                    setCompanyAddress({ ...companyAddress, road: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">รหัสไปรษณีย์</Label>
                <Input
                  id="postalCode"
                  value={companyAddress.postalCode}
                  onChange={(e) =>
                    setCompanyAddress({ ...companyAddress, postalCode: e.target.value })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Co-internship Students */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>พร้อมด้วยนักศึกษา</CardTitle>
            <CardDescription>ข้อมูลนักศึกษาที่จะฝึกงานร่วมกัน (สูงสุด 4 คน)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {coStudents.map((coStudent, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <h4 className="font-medium">นักศึกษาคนที่ {index + 1}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`coFirstName-${index}`}>ชื่อ</Label>
                    <Input
                      id={`coFirstName-${index}`}
                      value={coStudent.firstName}
                      onChange={(e) => {
                        const newCoStudents = [...coStudents];
                        newCoStudents[index].firstName = e.target.value;
                        setCoStudents(newCoStudents);
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`coLastName-${index}`}>นามสกุล</Label>
                    <Input
                      id={`coLastName-${index}`}
                      value={coStudent.lastName}
                      onChange={(e) => {
                        const newCoStudents = [...coStudents];
                        newCoStudents[index].lastName = e.target.value;
                        setCoStudents(newCoStudents);
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`coStudentId-${index}`}>รหัสนักศึกษา</Label>
                    <Input
                      id={`coStudentId-${index}`}
                      value={coStudent.studentIdString}
                      onChange={(e) => {
                        const newCoStudents = [...coStudents];
                        newCoStudents[index].studentIdString = e.target.value;
                        setCoStudents(newCoStudents);
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`coPhone-${index}`}>เบอร์โทรศัพท์</Label>
                    <Input
                      id={`coPhone-${index}`}
                      value={coStudent.phone}
                      onChange={(e) => {
                        const newCoStudents = [...coStudents];
                        newCoStudents[index].phone = e.target.value;
                        setCoStudents(newCoStudents);
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Resume Approval Warning */}
        {student && !student.resumeApproved && (
          <Card className="mb-6 border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                <span className="font-medium">
                  ⚠️ หมายเหตุ: Resume ของคุณยังไม่ได้รับการอนุมัติจากอาจารย์ที่ปรึกษา
                  กรุณาอัพโหลด Resume และรอการอนุมัติก่อนส่งใบสมัครฝึกงาน
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/internship")}
            disabled={isSaving}
          >
            ยกเลิก
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                บันทึก
              </>
            )}
          </Button>
          <Button
            type="button"
            onClick={() => handleSave(true)}
            disabled={isSaving || (student && !student.resumeApproved)}
            title={student && !student.resumeApproved ? "กรุณารอการอนุมัติ Resume ก่อนส่ง" : undefined}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                กำลังส่ง...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                ส่ง
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
