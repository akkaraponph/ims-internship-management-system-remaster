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
    idCard: "",
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

  const [educations, setEducations] = useState([
    { level: "", academy: "", gpa: "", order: 1 },
    { level: "", academy: "", gpa: "", order: 2 },
    { level: "", academy: "", gpa: "", order: 3 },
  ]);

  const [contactPerson, setContactPerson] = useState({
    firstName: "",
    lastName: "",
    relationship: "",
    phone: "",
    addressId: "",
  });

  const [contactPersonAddress, setContactPersonAddress] = useState({
    addressLine: "",
    provinceId: "",
    districtId: "",
    subDistrictId: "",
    postalCode: "",
  });

  const [contactPersonDistricts, setContactPersonDistricts] = useState<District[]>([]);
  const [contactPersonSubDistricts, setContactPersonSubDistricts] = useState<SubDistrict[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

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
            idCard: studentData.idCard || "",
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

          if (studentData.image) {
            setImagePreview(studentData.image);
          }

          // Fetch educations
          const educationsResponse = await fetch(`/api/students/${studentData.id}/educations`);
          if (educationsResponse.ok) {
            const educationsData = await educationsResponse.json();
            if (Array.isArray(educationsData) && educationsData.length > 0) {
              const sortedEducations = educationsData.sort((a: any, b: any) => a.order - b.order);
              const educationArray = [
                sortedEducations[0] || { level: "", academy: "", gpa: "", order: 1 },
                sortedEducations[1] || { level: "", academy: "", gpa: "", order: 2 },
                sortedEducations[2] || { level: "", academy: "", gpa: "", order: 3 },
              ];
              setEducations(educationArray);
            }
          }

          // Fetch contact person
          const contactResponse = await fetch(`/api/students/${studentData.id}/contact-person`);
          if (contactResponse.ok) {
            const contactData = await contactResponse.json();
            if (contactData) {
              setContactPerson({
                firstName: contactData.firstName || "",
                lastName: contactData.lastName || "",
                relationship: contactData.relationship || "",
                phone: contactData.phone || "",
                addressId: contactData.addressId || "",
              });
              if (contactData.addressId) {
                fetchContactPersonAddress(contactData.addressId);
              }
            }
          }

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

  const fetchContactPersonAddress = async (addressId: string) => {
    try {
      const response = await fetch(`/api/addresses/${addressId}`);
      if (response.ok) {
        const address = await response.json();
        setContactPersonAddress({
          addressLine: address.addressLine || "",
          provinceId: address.provinceId || "",
          districtId: address.districtId || "",
          subDistrictId: address.subDistrictId || "",
          postalCode: address.postalCode || "",
        });
        if (address.provinceId) {
          const districtsResponse = await fetch(`/api/addresses/districts?provinceId=${address.provinceId}`);
          if (districtsResponse.ok) {
            setContactPersonDistricts(await districtsResponse.json());
          }
        }
        if (address.districtId) {
          const subDistrictsResponse = await fetch(`/api/addresses/sub-districts?districtId=${address.districtId}`);
          if (subDistrictsResponse.ok) {
            setContactPersonSubDistricts(await subDistrictsResponse.json());
          }
        }
      }
    } catch (error) {
      console.error("Error fetching contact person address:", error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("กรุณาเลือกไฟล์รูปภาพ");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("ขนาดไฟล์ต้องไม่เกิน 2MB");
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setImagePreview(data.imageUrl);
        toast.success("อัปโหลดรูปภาพสำเร็จ");
        await fetchStudent();
      } else {
        const error = await response.json();
        toast.error(error.error || "เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveEducations = async () => {
    if (!student) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/students/${student.id}/educations`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ educations }),
      });

      if (response.ok) {
        toast.success("บันทึกประวัติการศึกษาสำเร็จ");
        await fetchStudent();
      } else {
        const data = await response.json();
        toast.error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.error("Error saving educations:", error);
      toast.error("เกิดข้อผิดพลาดในการบันทึกประวัติการศึกษา");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveContactPerson = async () => {
    if (!student) return;

    setIsSaving(true);
    try {
      // Save contact person address first
      let addressId = contactPerson.addressId;
      if (contactPersonAddress.provinceId || contactPersonAddress.districtId) {
        if (addressId) {
          const addressResponse = await fetch(`/api/addresses/${addressId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(contactPersonAddress),
          });
          if (!addressResponse.ok) {
            throw new Error("Failed to update address");
          }
        } else {
          const addressResponse = await fetch("/api/addresses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(contactPersonAddress),
          });
          if (addressResponse.ok) {
            const newAddress = await addressResponse.json();
            addressId = newAddress.id;
          } else {
            throw new Error("Failed to create address");
          }
        }
      }

      // Save contact person
      const response = await fetch(`/api/students/${student.id}/contact-person`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...contactPerson, addressId }),
      });

      if (response.ok) {
        toast.success("บันทึกข้อมูลผู้ติดต่อสำเร็จ");
        await fetchStudent();
      } else {
        const data = await response.json();
        toast.error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (error: any) {
      console.error("Error saving contact person:", error);
      toast.error(error.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูลผู้ติดต่อ");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!student) return;

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      const payload: any = {
        idCard: formData.idCard?.trim() || undefined,
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
              {/* Image Upload */}
              <div className="space-y-2">
                <Label>รูปภาพ</Label>
                <div className="flex items-center gap-4">
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Profile"
                      className="w-32 h-40 object-cover rounded border"
                    />
                  )}
                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="cursor-pointer"
                    />
                    {uploadingImage && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        กำลังอัปโหลด...
                      </div>
                    )}
                  </div>
                </div>
              </div>

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
                  <Label htmlFor="idCard">รหัสประจำตัวประชาชน *</Label>
                  <Input
                    id="idCard"
                    value={formData.idCard}
                    onChange={(e) => setFormData({ ...formData, idCard: e.target.value })}
                    maxLength={13}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">อีเมล *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">วันเกิด</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
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

        {/* Education History Section */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>ประวัติการศึกษา</CardTitle>
              <CardDescription>ประวัติการศึกษาของคุณ (สูงสุด 3 ระดับ)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {educations.map((education, index) => (
                <div key={index} className="space-y-4 p-4 border rounded-lg">
                  <h4 className="font-medium">ระดับการศึกษา {index + 1}</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`education-${index}-level`}>ระดับการศึกษา</Label>
                      <Input
                        id={`education-${index}-level`}
                        value={education.level}
                        onChange={(e) => {
                          const newEducations = [...educations];
                          newEducations[index].level = e.target.value;
                          setEducations(newEducations);
                        }}
                        placeholder="เช่น มัธยมศึกษาตอนต้น"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`education-${index}-academy`}>ชื่อสถานศึกษา</Label>
                      <Input
                        id={`education-${index}-academy`}
                        value={education.academy}
                        onChange={(e) => {
                          const newEducations = [...educations];
                          newEducations[index].academy = e.target.value;
                          setEducations(newEducations);
                        }}
                        placeholder="เช่น โรงเรียน..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`education-${index}-gpa`}>เกรดเฉลี่ย</Label>
                      <Input
                        id={`education-${index}-gpa`}
                        type="number"
                        step="0.01"
                        min="0"
                        max="4"
                        value={education.gpa}
                        onChange={(e) => {
                          const newEducations = [...educations];
                          newEducations[index].gpa = e.target.value;
                          setEducations(newEducations);
                        }}
                        placeholder="เช่น 3.50"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button onClick={handleSaveEducations} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    บันทึกประวัติการศึกษา
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Contact Person Section */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>บุคคลที่สามารถติดต่อได้</CardTitle>
              <CardDescription>ข้อมูลผู้ติดต่อฉุกเฉิน</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactFirstName">ชื่อ *</Label>
                  <Input
                    id="contactFirstName"
                    value={contactPerson.firstName}
                    onChange={(e) =>
                      setContactPerson({ ...contactPerson, firstName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactLastName">นามสกุล *</Label>
                  <Input
                    id="contactLastName"
                    value={contactPerson.lastName}
                    onChange={(e) =>
                      setContactPerson({ ...contactPerson, lastName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactRelationship">ความสัมพันธ์</Label>
                  <Input
                    id="contactRelationship"
                    value={contactPerson.relationship}
                    onChange={(e) =>
                      setContactPerson({ ...contactPerson, relationship: e.target.value })
                    }
                    placeholder="เช่น ผู้ปกครอง"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">เบอร์โทรศัพท์</Label>
                  <Input
                    id="contactPhone"
                    value={contactPerson.phone}
                    onChange={(e) =>
                      setContactPerson({ ...contactPerson, phone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>ที่อยู่ผู้ติดต่อ</Label>
                <div className="space-y-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="contact-addressLine">ที่อยู่</Label>
                    <Textarea
                      id="contact-addressLine"
                      value={contactPersonAddress.addressLine}
                      onChange={(e) =>
                        setContactPersonAddress({
                          ...contactPersonAddress,
                          addressLine: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact-province">จังหวัด</Label>
                      <Select
                        value={contactPersonAddress.provinceId}
                        onValueChange={async (value) => {
                          setContactPersonAddress({
                            ...contactPersonAddress,
                            provinceId: value,
                            districtId: "",
                            subDistrictId: "",
                          });
                          setContactPersonDistricts([]);
                          setContactPersonSubDistricts([]);
                          if (value) {
                            const response = await fetch(`/api/addresses/districts?provinceId=${value}`);
                            if (response.ok) {
                              setContactPersonDistricts(await response.json());
                            }
                          }
                        }}
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
                      <Label htmlFor="contact-district">อำเภอ</Label>
                      <Select
                        value={contactPersonAddress.districtId}
                        onValueChange={async (value) => {
                          setContactPersonAddress({
                            ...contactPersonAddress,
                            districtId: value,
                            subDistrictId: "",
                          });
                          setContactPersonSubDistricts([]);
                          if (value) {
                            const response = await fetch(`/api/addresses/sub-districts?districtId=${value}`);
                            if (response.ok) {
                              setContactPersonSubDistricts(await response.json());
                            }
                          }
                        }}
                        disabled={!contactPersonAddress.provinceId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกอำเภอ" />
                        </SelectTrigger>
                        <SelectContent>
                          {contactPersonDistricts.map((district) => (
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
                      <Label htmlFor="contact-subDistrict">ตำบล</Label>
                      <Select
                        value={contactPersonAddress.subDistrictId}
                        onValueChange={(value) =>
                          setContactPersonAddress({
                            ...contactPersonAddress,
                            subDistrictId: value,
                          })
                        }
                        disabled={!contactPersonAddress.districtId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกตำบล" />
                        </SelectTrigger>
                        <SelectContent>
                          {contactPersonSubDistricts.map((subDistrict) => (
                            <SelectItem key={subDistrict.id} value={subDistrict.id}>
                              {subDistrict.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-postalCode">รหัสไปรษณีย์</Label>
                      <Input
                        id="contact-postalCode"
                        value={contactPersonAddress.postalCode}
                        onChange={(e) =>
                          setContactPersonAddress({
                            ...contactPersonAddress,
                            postalCode: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveContactPerson} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    บันทึกข้อมูลผู้ติดต่อ
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
