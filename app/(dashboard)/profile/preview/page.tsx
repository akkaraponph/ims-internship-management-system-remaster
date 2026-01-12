"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Loader2, ArrowLeft, FileText, Download, UserCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  program: string | null;
  department: string | null;
  skill: string | null;
  interest: string | null;
  projectTopic: string | null;
  experience: string | null;
  presentGpa: string | null;
  image: string | null;
  resume: string | null;
  resumeStatus: boolean;
  resumeApproved: boolean;
  isCoInternship: boolean;
  presentAddressId: string | null;
  permanentAddressId: string | null;
}

interface Address {
  id: string;
  addressLine: string | null;
  provinceId: string | null;
  districtId: string | null;
  subDistrictId: string | null;
  postalCode: string | null;
}

interface Education {
  id: string;
  level: string | null;
  academy: string | null;
  gpa: number | null;
  order: number;
}

interface ContactPerson {
  id: string;
  firstName: string;
  lastName: string;
  relationship: string | null;
  phone: string | null;
  addressId: string | null;
}

export default function ProfilePreviewPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [presentAddress, setPresentAddress] = useState<Address | null>(null);
  const [permanentAddress, setPermanentAddress] = useState<Address | null>(null);
  const [educations, setEducations] = useState<Education[]>([]);
  const [contactPerson, setContactPerson] = useState<ContactPerson | null>(null);
  const [contactPersonAddress, setContactPersonAddress] = useState<Address | null>(null);

  useEffect(() => {
    if (session?.user?.role === "student") {
      fetchStudentData();
    } else {
      router.push("/dashboard");
    }
  }, [session, router]);

  const fetchStudentData = async () => {
    try {
      // Get student ID from session
      const studentsResponse = await fetch("/api/students");
      if (!studentsResponse.ok) {
        throw new Error("Failed to fetch student");
      }

      const studentsData = await studentsResponse.json();
      const studentData = Array.isArray(studentsData) ? studentsData[0] : studentsData;

      if (!studentData) {
        toast.error("ไม่พบข้อมูลนักศึกษา");
        router.push("/profile");
        return;
      }

      setStudent(studentData);

      // Fetch related data
      const [presentAddr, permanentAddr, educationsData, contactPersonData] = await Promise.all([
        studentData.presentAddressId
          ? fetch(`/api/addresses/${studentData.presentAddressId}`).then((r) => r.ok ? r.json() : null)
          : Promise.resolve(null),
        studentData.permanentAddressId
          ? fetch(`/api/addresses/${studentData.permanentAddressId}`).then((r) => r.ok ? r.json() : null)
          : Promise.resolve(null),
        fetch(`/api/students/${studentData.id}/educations`).then((r) => r.ok ? r.json() : []),
        fetch(`/api/students/${studentData.id}/contact-person`).then((r) => r.ok ? r.json() : null),
      ]);

      setPresentAddress(presentAddr);
      setPermanentAddress(permanentAddr);
      setEducations(educationsData || []);

      if (contactPersonData) {
        setContactPerson(contactPersonData);
        if (contactPersonData.addressId) {
          const addrResponse = await fetch(`/api/addresses/${contactPersonData.addressId}`);
          if (addrResponse.ok) {
            setContactPersonAddress(await addrResponse.json());
          }
        }
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (address: Address | null) => {
    if (!address) return "-";
    const parts = [
      address.addressLine,
      // Note: In a real implementation, you'd fetch province/district/sub-district names
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "-";
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
          <h2 className="text-2xl font-bold tracking-tight">ตัวอย่างโปรไฟล์</h2>
          <p className="text-muted-foreground">ดูว่าโปรไฟล์ของคุณจะปรากฏต่อผู้อื่นอย่างไร</p>
        </div>
        <Link href="/profile">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            กลับไปแก้ไข
          </Button>
        </Link>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCircle className="h-5 w-5" />
            ข้อมูลส่วนตัว
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            {student.image && (
              <img
                src={student.image}
                alt={`${student.firstName} ${student.lastName}`}
                className="w-32 h-40 object-cover rounded border"
              />
            )}
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">ชื่อ-นามสกุล</span>
                <span className="font-medium text-lg">
                  {student.firstName} {student.lastName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">อีเมล</span>
                <span className="font-medium">{student.email}</span>
              </div>
              {student.phone && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">เบอร์โทรศัพท์</span>
                  <span className="font-medium">{student.phone}</span>
                </div>
              )}
              {student.program && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">สาขาวิชา</span>
                  <span className="font-medium">{student.program}</span>
                </div>
              )}
              {student.department && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">คณะ</span>
                  <span className="font-medium">{student.department}</span>
                </div>
              )}
              {student.presentGpa && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">เกรดเฉลี่ย</span>
                  <span className="font-medium">{student.presentGpa}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                {student.isCoInternship && (
                  <Badge variant="default">โคออป</Badge>
                )}
                {student.resumeApproved && (
                  <Badge variant="default">Resume อนุมัติแล้ว</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Academic Information */}
      {(student.skill || student.interest || student.projectTopic || student.experience) && (
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลการศึกษาและทักษะ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {student.skill && (
              <div>
                <Label className="text-sm font-medium">ทักษะ</Label>
                <p className="text-sm mt-1 whitespace-pre-wrap">{student.skill}</p>
              </div>
            )}
            {student.interest && (
              <div>
                <Label className="text-sm font-medium">ความสนใจ</Label>
                <p className="text-sm mt-1 whitespace-pre-wrap">{student.interest}</p>
              </div>
            )}
            {student.projectTopic && (
              <div>
                <Label className="text-sm font-medium">หัวข้อโปรเจกต์</Label>
                <p className="text-sm mt-1 whitespace-pre-wrap">{student.projectTopic}</p>
              </div>
            )}
            {student.experience && (
              <div>
                <Label className="text-sm font-medium">ประสบการณ์</Label>
                <p className="text-sm mt-1 whitespace-pre-wrap">{student.experience}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Education History */}
      {educations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>ประวัติการศึกษา</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {educations.map((edu, index) => (
                <div key={edu.id || index} className="p-4 border rounded-lg">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">ระดับการศึกษา</Label>
                      <p className="font-medium">{edu.level || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">ชื่อสถานศึกษา</Label>
                      <p className="font-medium">{edu.academy || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">เกรดเฉลี่ย</Label>
                      <p className="font-medium">{edu.gpa ? edu.gpa.toFixed(2) : "-"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Addresses */}
      {(presentAddress || permanentAddress) && (
        <div className="grid gap-4 md:grid-cols-2">
          {presentAddress && (
            <Card>
              <CardHeader>
                <CardTitle>ที่อยู่ปัจจุบัน</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{formatAddress(presentAddress)}</p>
              </CardContent>
            </Card>
          )}
          {permanentAddress && (
            <Card>
              <CardHeader>
                <CardTitle>ที่อยู่ถาวร</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{formatAddress(permanentAddress)}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Contact Person */}
      {contactPerson && (
        <Card>
          <CardHeader>
            <CardTitle>บุคคลที่สามารถติดต่อได้</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">ชื่อ-นามสกุล</span>
              <span className="font-medium">
                {contactPerson.firstName} {contactPerson.lastName}
              </span>
            </div>
            {contactPerson.relationship && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">ความสัมพันธ์</span>
                <span className="font-medium">{contactPerson.relationship}</span>
              </div>
            )}
            {contactPerson.phone && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">เบอร์โทรศัพท์</span>
                <span className="font-medium">{contactPerson.phone}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Resume */}
      {student.resume && student.resumeApproved && (
        <Card>
          <CardHeader>
            <CardTitle>Resume</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="default">อนุมัติแล้ว</Badge>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => window.open(student.resume!, "_blank")}
              >
                <FileText className="mr-2 h-4 w-4" />
                ดู Resume
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = student.resume!;
                  link.download = `resume-${student.firstName}-${student.lastName}.pdf`;
                  link.click();
                }}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Add Label import
import { Label } from "@/components/ui/label";
