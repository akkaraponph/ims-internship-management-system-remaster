"use client";

import { useState, useEffect } from "react";
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
// Using separate cards instead of tabs for now
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Loader2, Save } from "lucide-react";

interface Student {
  id: string;
  userId: string | null;
  universityId: string;
  email: string;
  idCard: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  program: string | null;
  department: string | null;
  skill: string | null;
  interest: string | null;
  projectTopic: string | null;
  dateOfBirth: string | null;
  experience: string | null;
  religion: string | null;
  fatherName: string | null;
  fatherJob: string | null;
  motherName: string | null;
  motherJob: string | null;
  presentGpa: string | null;
  image: string | null;
  resumeStatus: boolean;
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

export default function ProfilePage() {
  const { data: session } = useSession();
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [subDistricts, setSubDistricts] = useState<SubDistrict[]>([]);
  const [presentDistricts, setPresentDistricts] = useState<District[]>([]);
  const [presentSubDistricts, setPresentSubDistricts] = useState<SubDistrict[]>([]);
  const [permanentDistricts, setPermanentDistricts] = useState<District[]>([]);
  const [permanentSubDistricts, setPermanentSubDistricts] = useState<SubDistrict[]>([]);
  const [presentAddress, setPresentAddress] = useState<Address | null>(null);
  const [permanentAddress, setPermanentAddress] = useState<Address | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    dateOfBirth: "",
    religion: "",
    program: "",
    department: "",
    presentGpa: "",
    skill: "",
    interest: "",
    projectTopic: "",
    experience: "",
    fatherName: "",
    fatherJob: "",
    motherName: "",
    motherJob: "",
    isCoInternship: false,
  });

  const [presentAddressData, setPresentAddressData] = useState({
    addressLine: "",
    provinceId: "",
    districtId: "",
    subDistrictId: "",
    postalCode: "",
  });

  const [permanentAddressData, setPermanentAddressData] = useState({
    addressLine: "",
    provinceId: "",
    districtId: "",
    subDistrictId: "",
    postalCode: "",
  });

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
          setStudent(studentData);
          setFormData({
            email: studentData.email || "",
            firstName: studentData.firstName || "",
            lastName: studentData.lastName || "",
            phone: studentData.phone || "",
            dateOfBirth: studentData.dateOfBirth
              ? new Date(studentData.dateOfBirth).toISOString().split("T")[0]
              : "",
            religion: studentData.religion || "",
            program: studentData.program || "",
            department: studentData.department || "",
            presentGpa: studentData.presentGpa || "",
            skill: studentData.skill || "",
            interest: studentData.interest || "",
            projectTopic: studentData.projectTopic || "",
            experience: studentData.experience || "",
            fatherName: studentData.fatherName || "",
            fatherJob: studentData.fatherJob || "",
            motherName: studentData.motherName || "",
            motherJob: studentData.motherJob || "",
            isCoInternship: studentData.isCoInternship || false,
          });

          if (studentData.presentAddressId) {
            fetchAddress(studentData.presentAddressId, "present");
          }
          if (studentData.permanentAddressId) {
            fetchAddress(studentData.permanentAddressId, "permanent");
          }
        }
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAddress = async (addressId: string, type: "present" | "permanent") => {
    try {
      const response = await fetch(`/api/addresses/${addressId}`);
      if (response.ok) {
        const address = await response.json();
        if (type === "present") {
          setPresentAddress(address);
          setPresentAddressData({
            addressLine: address.addressLine || "",
            provinceId: address.provinceId || "",
            districtId: address.districtId || "",
            subDistrictId: address.subDistrictId || "",
            postalCode: address.postalCode || "",
          });
          if (address.provinceId) {
            fetchDistricts(address.provinceId, "present");
          }
          if (address.districtId) {
            fetchSubDistricts(address.districtId, "present");
          }
        } else {
          setPermanentAddress(address);
          setPermanentAddressData({
            addressLine: address.addressLine || "",
            provinceId: address.provinceId || "",
            districtId: address.districtId || "",
            subDistrictId: address.subDistrictId || "",
            postalCode: address.postalCode || "",
          });
          if (address.provinceId) {
            fetchDistricts(address.provinceId, "permanent");
          }
          if (address.districtId) {
            fetchSubDistricts(address.districtId, "permanent");
          }
        }
      }
    } catch (error) {
      console.error("Error fetching address:", error);
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

  const fetchDistricts = async (provinceId: string, type: "present" | "permanent") => {
    try {
      const response = await fetch(`/api/addresses/districts?provinceId=${provinceId}`);
      if (response.ok) {
        const data = await response.json();
        if (type === "present") {
          setPresentDistricts(data);
        } else {
          setPermanentDistricts(data);
        }
      }
    } catch (error) {
      console.error("Error fetching districts:", error);
    }
  };

  const fetchSubDistricts = async (districtId: string, type: "present" | "permanent") => {
    try {
      const response = await fetch(`/api/addresses/sub-districts?districtId=${districtId}`);
      if (response.ok) {
        const data = await response.json();
        if (type === "present") {
          setPresentSubDistricts(data);
        } else {
          setPermanentSubDistricts(data);
        }
      }
    } catch (error) {
      console.error("Error fetching sub-districts:", error);
    }
  };

  const handleProvinceChange = async (provinceId: string, type: "present" | "permanent") => {
    if (type === "present") {
      setPresentAddressData({
        ...presentAddressData,
        provinceId,
        districtId: "",
        subDistrictId: "",
      });
      setPresentDistricts([]);
      setPresentSubDistricts([]);
      if (provinceId) {
        await fetchDistricts(provinceId, "present");
      }
    } else {
      setPermanentAddressData({
        ...permanentAddressData,
        provinceId,
        districtId: "",
        subDistrictId: "",
      });
      setPermanentDistricts([]);
      setPermanentSubDistricts([]);
      if (provinceId) {
        await fetchDistricts(provinceId, "permanent");
      }
    }
  };

  const handleDistrictChange = async (districtId: string, type: "present" | "permanent") => {
    if (type === "present") {
      setPresentAddressData({
        ...presentAddressData,
        districtId,
        subDistrictId: "",
      });
      setPresentSubDistricts([]);
      if (districtId) {
        await fetchSubDistricts(districtId, "present");
      }
    } else {
      setPermanentAddressData({
        ...permanentAddressData,
        districtId,
        subDistrictId: "",
      });
      setPermanentSubDistricts([]);
      if (districtId) {
        await fetchSubDistricts(districtId, "permanent");
      }
    }
  };

  const handleSaveAddress = async (type: "present" | "permanent") => {
    if (!student) return;

    setIsSaving(true);
    try {
      const addressData = type === "present" ? presentAddressData : permanentAddressData;
      let addressId: string;

      if (type === "present" && presentAddress) {
        // Update existing address
        const response = await fetch(`/api/addresses/${presentAddress.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(addressData),
        });
        if (response.ok) {
          const updated = await response.json();
          addressId = updated.id;
        } else {
          const error = await response.json();
          throw new Error(error.error || "Failed to update address");
        }
      } else if (type === "permanent" && permanentAddress) {
        // Update existing address
        const response = await fetch(`/api/addresses/${permanentAddress.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(addressData),
        });
        if (response.ok) {
          const updated = await response.json();
          addressId = updated.id;
        } else {
          const error = await response.json();
          throw new Error(error.error || "Failed to update address");
        }
      } else {
        // Create new address
        const response = await fetch("/api/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(addressData),
        });
        if (response.ok) {
          const newAddress = await response.json();
          addressId = newAddress.id;
        } else {
          const error = await response.json();
          throw new Error(error.error || "Failed to create address");
        }
      }

      // Update student with address ID
      const updateField = type === "present" ? "presentAddressId" : "permanentAddressId";
      const updateResponse = await fetch(`/api/students/${student.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [updateField]: addressId }),
      });

      if (!updateResponse.ok) {
        throw new Error("Failed to update student address");
      }

      toast.success(`บันทึกที่อยู่${type === "present" ? "ปัจจุบัน" : "ถาวร"}สำเร็จ`);
      await fetchStudent();
    } catch (error: any) {
      console.error("Error saving address:", error);
      toast.error(error.message || "เกิดข้อผิดพลาดในการบันทึกที่อยู่");
    } finally {
      setIsSaving(false);
    }
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      toast.error("กรุณากรอกชื่อ");
      return false;
    }
    if (!formData.lastName.trim()) {
      toast.error("กรุณากรอกนามสกุล");
      return false;
    }
    if (!formData.email.trim()) {
      toast.error("กรุณากรอกอีเมล");
      return false;
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("รูปแบบอีเมลไม่ถูกต้อง");
      return false;
    }
    // GPA validation if provided
    if (formData.presentGpa) {
      const gpa = parseFloat(formData.presentGpa);
      if (isNaN(gpa) || gpa < 0 || gpa > 4) {
        toast.error("เกรดเฉลี่ยต้องอยู่ระหว่าง 0.00 - 4.00");
        return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!student) return;

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      const payload: any = {
        email: formData.email.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone?.trim() || undefined,
        religion: formData.religion?.trim() || undefined,
        program: formData.program?.trim() || undefined,
        department: formData.department?.trim() || undefined,
        presentGpa: formData.presentGpa?.trim() || undefined,
        skill: formData.skill?.trim() || undefined,
        interest: formData.interest?.trim() || undefined,
        projectTopic: formData.projectTopic?.trim() || undefined,
        experience: formData.experience?.trim() || undefined,
        fatherName: formData.fatherName?.trim() || undefined,
        fatherJob: formData.fatherJob?.trim() || undefined,
        motherName: formData.motherName?.trim() || undefined,
        motherJob: formData.motherJob?.trim() || undefined,
        isCoInternship: formData.isCoInternship,
      };

      if (formData.dateOfBirth) {
        payload.dateOfBirth = new Date(formData.dateOfBirth);
      }

      const response = await fetch(`/api/students/${student.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("บันทึกข้อมูลสำเร็จ");
        await fetchStudent();
      } else {
        const data = await response.json();
        toast.error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
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
      <div>
        <h2 className="text-2xl font-bold tracking-tight">ข้อมูลส่วนตัว</h2>
        <p className="text-muted-foreground">จัดการข้อมูลส่วนตัวของคุณ</p>
      </div>

      <div className="space-y-4">
        {/* Personal Information Section */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลส่วนตัว</CardTitle>
              <CardDescription>ข้อมูลพื้นฐานของคุณ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">ชื่อ *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">นามสกุล *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">อีเมล *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">วันเกิด</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="religion">ศาสนา</Label>
                  <Input
                    id="religion"
                    value={formData.religion}
                    onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isCoInternship"
                  checked={formData.isCoInternship}
                  onChange={(e) => setFormData({ ...formData, isCoInternship: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isCoInternship" className="cursor-pointer">
                  โคออป
                </Label>
              </div>
              <Button onClick={handleSave} disabled={isSaving}>
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
            </CardContent>
          </Card>
        </div>

        {/* Academic Information Section */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลการศึกษา</CardTitle>
              <CardDescription>ข้อมูลทางการศึกษาของคุณ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="program">สาขาวิชา</Label>
                  <Input
                    id="program"
                    value={formData.program}
                    onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">คณะ</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="presentGpa">เกรดเฉลี่ย</Label>
                <Input
                  id="presentGpa"
                  value={formData.presentGpa}
                  onChange={(e) => setFormData({ ...formData, presentGpa: e.target.value })}
                  placeholder="เช่น 3.50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skill">ทักษะ</Label>
                <Textarea
                  id="skill"
                  value={formData.skill}
                  onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interest">ความสนใจ</Label>
                <Textarea
                  id="interest"
                  value={formData.interest}
                  onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectTopic">หัวข้อโปรเจกต์</Label>
                <Textarea
                  id="projectTopic"
                  value={formData.projectTopic}
                  onChange={(e) => setFormData({ ...formData, projectTopic: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">ประสบการณ์</Label>
                <Textarea
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  rows={5}
                />
              </div>
              <Button onClick={handleSave} disabled={isSaving}>
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
            </CardContent>
          </Card>
        </div>

        {/* Family Information Section */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลครอบครัว</CardTitle>
              <CardDescription>ข้อมูลเกี่ยวกับครอบครัว</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fatherName">ชื่อบิดา</Label>
                  <Input
                    id="fatherName"
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fatherJob">อาชีพบิดา</Label>
                  <Input
                    id="fatherJob"
                    value={formData.fatherJob}
                    onChange={(e) => setFormData({ ...formData, fatherJob: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="motherName">ชื่อมารดา</Label>
                  <Input
                    id="motherName"
                    value={formData.motherName}
                    onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motherJob">อาชีพมารดา</Label>
                  <Input
                    id="motherJob"
                    value={formData.motherJob}
                    onChange={(e) => setFormData({ ...formData, motherJob: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={handleSave} disabled={isSaving}>
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
            </CardContent>
          </Card>
        </div>

        {/* Address Section */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>ที่อยู่ปัจจุบัน</CardTitle>
              <CardDescription>ที่อยู่ปัจจุบันของคุณ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="present-addressLine">ที่อยู่</Label>
                <Textarea
                  id="present-addressLine"
                  value={presentAddressData.addressLine}
                  onChange={(e) =>
                    setPresentAddressData({ ...presentAddressData, addressLine: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="present-province">จังหวัด</Label>
                  <Select
                    value={presentAddressData.provinceId}
                    onValueChange={(value) => handleProvinceChange(value, "present")}
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
                  <Label htmlFor="present-district">อำเภอ</Label>
                  <Select
                    value={presentAddressData.districtId}
                    onValueChange={(value) => handleDistrictChange(value, "present")}
                    disabled={!presentAddressData.provinceId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกอำเภอ" />
                    </SelectTrigger>
                    <SelectContent>
                      {presentDistricts.map((district) => (
                        <SelectItem key={district.id} value={district.id}>
                          {district.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="present-subDistrict">ตำบล</Label>
                  <Select
                    value={presentAddressData.subDistrictId}
                    onValueChange={(value) =>
                      setPresentAddressData({ ...presentAddressData, subDistrictId: value })
                    }
                    disabled={!presentAddressData.districtId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกตำบล" />
                    </SelectTrigger>
                    <SelectContent>
                      {presentSubDistricts.map((subDistrict) => (
                        <SelectItem key={subDistrict.id} value={subDistrict.id}>
                          {subDistrict.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="present-postalCode">รหัสไปรษณีย์</Label>
                  <Input
                    id="present-postalCode"
                    value={presentAddressData.postalCode}
                    onChange={(e) =>
                      setPresentAddressData({ ...presentAddressData, postalCode: e.target.value })
                    }
                  />
                </div>
              </div>
              <Button onClick={() => handleSaveAddress("present")} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    บันทึกที่อยู่ปัจจุบัน
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ที่อยู่ถาวร</CardTitle>
              <CardDescription>ที่อยู่ถาวรของคุณ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="permanent-addressLine">ที่อยู่</Label>
                <Textarea
                  id="permanent-addressLine"
                  value={permanentAddressData.addressLine}
                  onChange={(e) =>
                    setPermanentAddressData({ ...permanentAddressData, addressLine: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="permanent-province">จังหวัด</Label>
                  <Select
                    value={permanentAddressData.provinceId}
                    onValueChange={(value) => handleProvinceChange(value, "permanent")}
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
                  <Label htmlFor="permanent-district">อำเภอ</Label>
                  <Select
                    value={permanentAddressData.districtId}
                    onValueChange={(value) => handleDistrictChange(value, "permanent")}
                    disabled={!permanentAddressData.provinceId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกอำเภอ" />
                    </SelectTrigger>
                    <SelectContent>
                      {permanentDistricts.map((district) => (
                        <SelectItem key={district.id} value={district.id}>
                          {district.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="permanent-subDistrict">ตำบล</Label>
                  <Select
                    value={permanentAddressData.subDistrictId}
                    onValueChange={(value) =>
                      setPermanentAddressData({ ...permanentAddressData, subDistrictId: value })
                    }
                    disabled={!permanentAddressData.districtId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกตำบล" />
                    </SelectTrigger>
                    <SelectContent>
                      {permanentSubDistricts.map((subDistrict) => (
                        <SelectItem key={subDistrict.id} value={subDistrict.id}>
                          {subDistrict.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="permanent-postalCode">รหัสไปรษณีย์</Label>
                  <Input
                    id="permanent-postalCode"
                    value={permanentAddressData.postalCode}
                    onChange={(e) =>
                      setPermanentAddressData({ ...permanentAddressData, postalCode: e.target.value })
                    }
                  />
                </div>
              </div>
              <Button onClick={() => handleSaveAddress("permanent")} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    บันทึกที่อยู่ถาวร
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
