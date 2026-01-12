"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Loader2, FileText, Download, UserCircle, GraduationCap } from "lucide-react";
import { useParams } from "next/navigation";

interface PublicProfile {
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
  resumeApproved: boolean;
  isCoInternship: boolean;
  presentAddress: Address | null;
  permanentAddress: Address | null;
  educations: Education[];
  contactPerson: ContactPerson | null;
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
  firstName: string;
  lastName: string;
  relationship: string | null;
  phone: string | null;
}

export default function PublicProfilePage() {
  const params = useParams();
  const token = params.token as string;
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchPublicProfile();
    }
  }, [token]);

  const fetchPublicProfile = async () => {
    try {
      const response = await fetch(`/api/students/public/${token}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else if (response.status === 404) {
        setError("ไม่พบโปรไฟล์");
      } else {
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      }
    } catch (error) {
      console.error("Error fetching public profile:", error);
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (address: Address | null) => {
    if (!address) return "-";
    const parts = [address.addressLine].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "-";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">{error || "ไม่พบโปรไฟล์"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">โปรไฟล์นักศึกษา</h1>
            <p className="text-muted-foreground">ข้อมูลการฝึกงาน</p>
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
                {profile.image && (
                  <img
                    src={profile.image}
                    alt={`${profile.firstName} ${profile.lastName}`}
                    className="w-32 h-40 object-cover rounded border"
                  />
                )}
                <div className="space-y-2 flex-1">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {profile.firstName} {profile.lastName}
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">อีเมล</Label>
                      <p className="font-medium">{profile.email}</p>
                    </div>
                    {profile.phone && (
                      <div>
                        <Label className="text-muted-foreground">เบอร์โทรศัพท์</Label>
                        <p className="font-medium">{profile.phone}</p>
                      </div>
                    )}
                    {profile.program && (
                      <div>
                        <Label className="text-muted-foreground">สาขาวิชา</Label>
                        <p className="font-medium">{profile.program}</p>
                      </div>
                    )}
                    {profile.department && (
                      <div>
                        <Label className="text-muted-foreground">คณะ</Label>
                        <p className="font-medium">{profile.department}</p>
                      </div>
                    )}
                    {profile.presentGpa && (
                      <div>
                        <Label className="text-muted-foreground">เกรดเฉลี่ย</Label>
                        <p className="font-medium">{profile.presentGpa}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {profile.isCoInternship && (
                      <Badge variant="default">โคออป</Badge>
                    )}
                    {profile.resumeApproved && (
                      <Badge variant="default">Resume อนุมัติแล้ว</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Information */}
          {(profile.skill || profile.interest || profile.projectTopic || profile.experience) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  ข้อมูลการศึกษาและทักษะ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.skill && (
                  <div>
                    <Label className="text-sm font-medium">ทักษะ</Label>
                    <p className="text-sm mt-1 whitespace-pre-wrap">{profile.skill}</p>
                  </div>
                )}
                {profile.interest && (
                  <div>
                    <Label className="text-sm font-medium">ความสนใจ</Label>
                    <p className="text-sm mt-1 whitespace-pre-wrap">{profile.interest}</p>
                  </div>
                )}
                {profile.projectTopic && (
                  <div>
                    <Label className="text-sm font-medium">หัวข้อโปรเจกต์</Label>
                    <p className="text-sm mt-1 whitespace-pre-wrap">{profile.projectTopic}</p>
                  </div>
                )}
                {profile.experience && (
                  <div>
                    <Label className="text-sm font-medium">ประสบการณ์</Label>
                    <p className="text-sm mt-1 whitespace-pre-wrap">{profile.experience}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Education History */}
          {profile.educations && profile.educations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>ประวัติการศึกษา</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.educations.map((edu, index) => (
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
          {(profile.presentAddress || profile.permanentAddress) && (
            <div className="grid gap-4 md:grid-cols-2">
              {profile.presentAddress && (
                <Card>
                  <CardHeader>
                    <CardTitle>ที่อยู่ปัจจุบัน</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{formatAddress(profile.presentAddress)}</p>
                  </CardContent>
                </Card>
              )}
              {profile.permanentAddress && (
                <Card>
                  <CardHeader>
                    <CardTitle>ที่อยู่ถาวร</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{formatAddress(profile.permanentAddress)}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Contact Person */}
          {profile.contactPerson && (
            <Card>
              <CardHeader>
                <CardTitle>บุคคลที่สามารถติดต่อได้</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">ชื่อ-นามสกุล</span>
                  <span className="font-medium">
                    {profile.contactPerson.firstName} {profile.contactPerson.lastName}
                  </span>
                </div>
                {profile.contactPerson.relationship && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">ความสัมพันธ์</span>
                    <span className="font-medium">{profile.contactPerson.relationship}</span>
                  </div>
                )}
                {profile.contactPerson.phone && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">เบอร์โทรศัพท์</span>
                    <span className="font-medium">{profile.contactPerson.phone}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Resume */}
          {profile.resume && profile.resumeApproved && (
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
                    onClick={() => window.open(profile.resume!, "_blank")}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    ดู Resume
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = profile.resume!;
                      link.download = `resume-${profile.firstName}-${profile.lastName}.pdf`;
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
      </div>
    </div>
  );
}
