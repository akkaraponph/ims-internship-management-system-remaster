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
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Loader2, Save, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Company {
  id: string;
  universityId: string;
  name: string;
  type: string | null;
  activities: string | null;
  proposeTo: string | null;
  phone: string | null;
  addressId: string | null;
  contactPersonName: string | null;
  contactPersonPosition: string | null;
  contactPersonPhone: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  address: Address | null;
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

export default function CompanyProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [subDistricts, setSubDistricts] = useState<SubDistrict[]>([]);
  const [address, setAddress] = useState<Address | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    activities: "",
    proposeTo: "",
    phone: "",
    contactPersonName: "",
    contactPersonPosition: "",
    contactPersonPhone: "",
    isActive: true,
  });

  const [addressData, setAddressData] = useState({
    addressLine: "",
    provinceId: "",
    districtId: "",
    subDistrictId: "",
    postalCode: "",
  });

  useEffect(() => {
    if (session?.user) {
      // Get company ID from session
      const companyId = session.user.companyId;
      if (companyId) {
        fetchCompany(companyId);
      } else if (session.user.role === "admin" || session.user.role === "director") {
        // For admins/directors, they might access via URL parameter
        // For now, redirect to companies page
        router.push("/companies");
      }
      fetchProvinces();
    }
  }, [session, router]);

  const fetchCompany = async (companyId: string) => {
    try {
      const response = await fetch(`/api/companies/${companyId}`);
      if (response.ok) {
        const data = await response.json();
        setCompany(data);
        setFormData({
          name: data.name || "",
          type: data.type || "",
          activities: data.activities || "",
          proposeTo: data.proposeTo || "",
          phone: data.phone || "",
          contactPersonName: data.contactPersonName || "",
          contactPersonPosition: data.contactPersonPosition || "",
          contactPersonPhone: data.contactPersonPhone || "",
          isActive: data.isActive ?? true,
        });

        if (data.address) {
          setAddress(data.address);
          setAddressData({
            addressLine: data.address.addressLine || "",
            provinceId: data.address.provinceId || "",
            districtId: data.address.districtId || "",
            subDistrictId: data.address.subDistrictId || "",
            postalCode: data.address.postalCode || "",
          });
          if (data.address.provinceId) {
            fetchDistricts(data.address.provinceId);
          }
          if (data.address.districtId) {
            fetchSubDistricts(data.address.districtId);
          }
        }
      } else if (response.status === 403) {
        toast.error("คุณไม่มีสิทธิ์เข้าถึงข้อมูลบริษัทนี้");
        router.push("/company");
      } else {
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      }
    } catch (error) {
      console.error("Error fetching company:", error);
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

  const fetchDistricts = async (provinceId: string) => {
    try {
      const response = await fetch(`/api/addresses/districts?provinceId=${provinceId}`);
      if (response.ok) {
        const data = await response.json();
        setDistricts(data);
      }
    } catch (error) {
      console.error("Error fetching districts:", error);
    }
  };

  const fetchSubDistricts = async (districtId: string) => {
    try {
      const response = await fetch(`/api/addresses/sub-districts?districtId=${districtId}`);
      if (response.ok) {
        const data = await response.json();
        setSubDistricts(data);
      }
    } catch (error) {
      console.error("Error fetching sub-districts:", error);
    }
  };

  const handleProvinceChange = async (provinceId: string) => {
    setAddressData({
      ...addressData,
      provinceId,
      districtId: "",
      subDistrictId: "",
    });
    setDistricts([]);
    setSubDistricts([]);
    if (provinceId) {
      await fetchDistricts(provinceId);
    }
  };

  const handleDistrictChange = async (districtId: string) => {
    setAddressData({
      ...addressData,
      districtId,
      subDistrictId: "",
    });
    setSubDistricts([]);
    if (districtId) {
      await fetchSubDistricts(districtId);
    }
  };

  const handleSaveAddress = async () => {
    if (!company) return;

    setIsSaving(true);
    try {
      let addressId: string;

      if (address) {
        // Update existing address
        const response = await fetch(`/api/addresses/${address.id}`, {
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

      // Update company with address ID
      const updateResponse = await fetch(`/api/companies/${company.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addressId }),
      });

      if (!updateResponse.ok) {
        throw new Error("Failed to update company address");
      }

      toast.success("บันทึกที่อยู่สำเร็จ");
      await fetchCompany(company.id);
    } catch (error: any) {
      console.error("Error saving address:", error);
      toast.error(error.message || "เกิดข้อผิดพลาดในการบันทึกที่อยู่");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!company) return;

    if (!formData.name.trim()) {
      toast.error("กรุณากรอกชื่อบริษัท");
      return;
    }

    setIsSaving(true);
    try {
      const payload: any = {
        name: formData.name.trim(),
        type: formData.type?.trim() || undefined,
        activities: formData.activities?.trim() || undefined,
        proposeTo: formData.proposeTo?.trim() || undefined,
        phone: formData.phone?.trim() || undefined,
        contactPersonName: formData.contactPersonName?.trim() || undefined,
        contactPersonPosition: formData.contactPersonPosition?.trim() || undefined,
        contactPersonPhone: formData.contactPersonPhone?.trim() || undefined,
        isActive: formData.isActive,
      };

      // Only admins/directors/super-admins can change isActive
      if (session?.user?.role !== "admin" && session?.user?.role !== "director" && session?.user?.role !== "super-admin") {
        delete payload.isActive;
      }

      const response = await fetch(`/api/companies/${company.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("บันทึกข้อมูลสำเร็จ");
        await fetchCompany(company.id);
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

  if (!company) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">ไม่พบข้อมูลบริษัท</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">ข้อมูลบริษัท</h2>
        <p className="text-muted-foreground">จัดการข้อมูลบริษัทของคุณ</p>
      </div>

      <div className="space-y-4">
        {/* Company Information Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              ข้อมูลบริษัท
            </CardTitle>
            <CardDescription>ข้อมูลพื้นฐานของบริษัท</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">ชื่อบริษัท *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">ประเภท</Label>
                <Input
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  placeholder="เช่น เอกชน, รัฐวิสาหกิจ, รัฐบาล"
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

            <div className="space-y-2">
              <Label htmlFor="activities">กิจกรรม</Label>
              <Textarea
                id="activities"
                value={formData.activities}
                onChange={(e) => setFormData({ ...formData, activities: e.target.value })}
                rows={3}
                placeholder="อธิบายกิจกรรมหลักของบริษัท"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proposeTo">เสนอให้</Label>
              <Input
                id="proposeTo"
                value={formData.proposeTo}
                onChange={(e) => setFormData({ ...formData, proposeTo: e.target.value })}
                placeholder="เช่น สาขาวิชา, คณะ"
              />
            </div>

            {(session?.user?.role === "admin" || session?.user?.role === "director" || session?.user?.role === "super-admin") && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  เปิดใช้งาน
                </Label>
              </div>
            )}

            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  บันทึกข้อมูลบริษัท
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Contact Person Section */}
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลผู้ติดต่อ</CardTitle>
            <CardDescription>ข้อมูลผู้ติดต่อของบริษัท</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contactPersonName">ชื่อผู้ติดต่อ</Label>
              <Input
                id="contactPersonName"
                value={formData.contactPersonName}
                onChange={(e) => setFormData({ ...formData, contactPersonName: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPersonPosition">ตำแหน่ง</Label>
                <Input
                  id="contactPersonPosition"
                  value={formData.contactPersonPosition}
                  onChange={(e) => setFormData({ ...formData, contactPersonPosition: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPersonPhone">เบอร์โทรศัพท์</Label>
                <Input
                  id="contactPersonPhone"
                  value={formData.contactPersonPhone}
                  onChange={(e) => setFormData({ ...formData, contactPersonPhone: e.target.value })}
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
                  บันทึกข้อมูลผู้ติดต่อ
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Address Section */}
        <Card>
          <CardHeader>
            <CardTitle>ที่อยู่บริษัท</CardTitle>
            <CardDescription>ที่อยู่ของบริษัท</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="addressLine">ที่อยู่</Label>
              <Textarea
                id="addressLine"
                value={addressData.addressLine}
                onChange={(e) =>
                  setAddressData({ ...addressData, addressLine: e.target.value })
                }
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="province">จังหวัด</Label>
                <Select
                  value={addressData.provinceId}
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
                <Label htmlFor="district">อำเภอ</Label>
                <Select
                  value={addressData.districtId}
                  onValueChange={handleDistrictChange}
                  disabled={!addressData.provinceId}
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subDistrict">ตำบล</Label>
                <Select
                  value={addressData.subDistrictId}
                  onValueChange={(value) =>
                    setAddressData({ ...addressData, subDistrictId: value })
                  }
                  disabled={!addressData.districtId}
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
              <div className="space-y-2">
                <Label htmlFor="postalCode">รหัสไปรษณีย์</Label>
                <Input
                  id="postalCode"
                  value={addressData.postalCode}
                  onChange={(e) =>
                    setAddressData({ ...addressData, postalCode: e.target.value })
                  }
                />
              </div>
            </div>
            <Button onClick={handleSaveAddress} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  บันทึกที่อยู่
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
