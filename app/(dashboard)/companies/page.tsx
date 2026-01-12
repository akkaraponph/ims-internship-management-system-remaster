"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

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
}

interface University {
  id: string;
  name: string;
  code: string;
}

export default function CompaniesPage() {
  const { data: session } = useSession();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
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
    universityId: "",
  });
  const [editFormData, setEditFormData] = useState({
    name: "",
    type: "",
    activities: "",
    proposeTo: "",
    phone: "",
    contactPersonName: "",
    contactPersonPosition: "",
    contactPersonPhone: "",
    isActive: true,
    universityId: "",
  });

  useEffect(() => {
    fetchCompanies();
    if (session?.user?.role === "super-admin") {
      fetchUniversities();
    } else if (session?.user?.universityId) {
      fetchUniversities();
    }
  }, [session]);

  const fetchCompanies = async () => {
    try {
      const response = await fetch("/api/companies");
      if (response.ok) {
        const data = await response.json();
        setCompanies(Array.isArray(data) ? data : [data]);
      } else {
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUniversities = async () => {
    try {
      const response = await fetch("/api/universities");
      if (response.ok) {
        const data = await response.json();
        setUniversities(Array.isArray(data) ? data : [data]);
      }
    } catch (error) {
      // Silently fail
    }
  };

  const getUniversityName = (universityId: string) => {
    const university = universities.find((u) => u.id === universityId);
    return university ? university.name : "-";
  };

  const handleCreate = async () => {
    if (!formData.name) {
      toast.error("กรุณากรอกชื่อบริษัท");
      return;
    }

    if (!formData.universityId && session?.user?.role !== "super-admin") {
      toast.error("กรุณาเลือกมหาวิทยาลัย");
      return;
    }

    try {
      const payload: any = {
        name: formData.name,
        type: formData.type || undefined,
        activities: formData.activities || undefined,
        proposeTo: formData.proposeTo || undefined,
        phone: formData.phone || undefined,
        contactPersonName: formData.contactPersonName || undefined,
        contactPersonPosition: formData.contactPersonPosition || undefined,
        contactPersonPhone: formData.contactPersonPhone || undefined,
        isActive: formData.isActive,
      };

      // Add universityId - super-admin can specify, others use session
      if (session?.user?.role === "super-admin" && formData.universityId) {
        payload.universityId = formData.universityId;
      } else if (session?.user?.universityId) {
        payload.universityId = session.user.universityId;
      }

      const response = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("สร้างบริษัทสำเร็จ");
        setIsCreateDialogOpen(false);
        resetFormData();
        fetchCompanies();
      } else {
        const data = await response.json();
        toast.error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  const handleEdit = async () => {
    if (!selectedCompany || !editFormData.name) {
      toast.error("กรุณากรอกชื่อบริษัท");
      return;
    }

    try {
      const payload: any = {
        name: editFormData.name,
        type: editFormData.type || undefined,
        activities: editFormData.activities || undefined,
        proposeTo: editFormData.proposeTo || undefined,
        phone: editFormData.phone || undefined,
        contactPersonName: editFormData.contactPersonName || undefined,
        contactPersonPosition: editFormData.contactPersonPosition || undefined,
        contactPersonPhone: editFormData.contactPersonPhone || undefined,
        isActive: editFormData.isActive,
      };

      const response = await fetch(`/api/companies/${selectedCompany.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("อัปเดตบริษัทสำเร็จ");
        setIsEditDialogOpen(false);
        setSelectedCompany(null);
        fetchCompanies();
      } else {
        const data = await response.json();
        toast.error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  const handleDelete = async () => {
    if (!selectedCompany) return;

    try {
      const response = await fetch(`/api/companies/${selectedCompany.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("ลบบริษัทสำเร็จ");
        setIsDeleteDialogOpen(false);
        setSelectedCompany(null);
        fetchCompanies();
      } else {
        const data = await response.json();
        toast.error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  const resetFormData = () => {
    setFormData({
      name: "",
      type: "",
      activities: "",
      proposeTo: "",
      phone: "",
      contactPersonName: "",
      contactPersonPosition: "",
      contactPersonPhone: "",
      isActive: true,
      universityId: "",
    });
  };

  const openEditDialog = (company: Company) => {
    setSelectedCompany(company);
    setEditFormData({
      name: company.name,
      type: company.type || "",
      activities: company.activities || "",
      proposeTo: company.proposeTo || "",
      phone: company.phone || "",
      contactPersonName: company.contactPersonName || "",
      contactPersonPosition: company.contactPersonPosition || "",
      contactPersonPhone: company.contactPersonPhone || "",
      isActive: company.isActive,
      universityId: company.universityId,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (company: Company) => {
    setSelectedCompany(company);
    setIsDeleteDialogOpen(true);
  };

  if (isLoading) {
    return <div>กำลังโหลด...</div>;
  }

  const isSuperAdmin = session?.user?.role === "super-admin";
  const canCreate = session?.user?.role === "admin" || session?.user?.role === "director" || isSuperAdmin;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">จัดการบริษัท</h2>
          <p className="text-muted-foreground">
            จัดการข้อมูลบริษัทและสถานประกอบการที่ร่วมโครงการฝึกงาน
          </p>
        </div>
        {canCreate && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                เพิ่มบริษัท
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>เพิ่มบริษัท</DialogTitle>
                <DialogDescription>กรุณากรอกข้อมูลบริษัท</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="create-name">ชื่อบริษัท *</Label>
                  <Input
                    id="create-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="ชื่อบริษัท"
                  />
                </div>
                {isSuperAdmin && (
                  <div className="space-y-2">
                    <Label htmlFor="create-university">มหาวิทยาลัย *</Label>
                    <Select
                      value={formData.universityId}
                      onValueChange={(value) => setFormData({ ...formData, universityId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกมหาวิทยาลัย" />
                      </SelectTrigger>
                      <SelectContent>
                        {universities.map((university) => (
                          <SelectItem key={university.id} value={university.id}>
                            {university.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-type">ประเภท</Label>
                    <Input
                      id="create-type"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      placeholder="ประเภทบริษัท"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-phone">เบอร์โทรศัพท์</Label>
                    <Input
                      id="create-phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="เบอร์โทรศัพท์"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-activities">กิจกรรม</Label>
                  <Input
                    id="create-activities"
                    value={formData.activities}
                    onChange={(e) => setFormData({ ...formData, activities: e.target.value })}
                    placeholder="กิจกรรมของบริษัท"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-proposeTo">เสนอให้</Label>
                  <Input
                    id="create-proposeTo"
                    value={formData.proposeTo}
                    onChange={(e) => setFormData({ ...formData, proposeTo: e.target.value })}
                    placeholder="เสนอให้"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-contactPersonName">ชื่อผู้ติดต่อ</Label>
                  <Input
                    id="create-contactPersonName"
                    value={formData.contactPersonName}
                    onChange={(e) => setFormData({ ...formData, contactPersonName: e.target.value })}
                    placeholder="ชื่อผู้ติดต่อ"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-contactPersonPosition">ตำแหน่งผู้ติดต่อ</Label>
                    <Input
                      id="create-contactPersonPosition"
                      value={formData.contactPersonPosition}
                      onChange={(e) => setFormData({ ...formData, contactPersonPosition: e.target.value })}
                      placeholder="ตำแหน่ง"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-contactPersonPhone">เบอร์โทรผู้ติดต่อ</Label>
                    <Input
                      id="create-contactPersonPhone"
                      value={formData.contactPersonPhone}
                      onChange={(e) => setFormData({ ...formData, contactPersonPhone: e.target.value })}
                      placeholder="เบอร์โทรศัพท์"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="create-isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="create-isActive" className="cursor-pointer">
                    เปิดใช้งาน
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  ยกเลิก
                </Button>
                <Button onClick={handleCreate}>สร้าง</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายชื่อบริษัท</CardTitle>
          <CardDescription>จัดการข้อมูลบริษัททั้งหมด</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ชื่อบริษัท</TableHead>
                <TableHead>ประเภท</TableHead>
                <TableHead>ผู้ติดต่อ</TableHead>
                <TableHead>เบอร์โทรศัพท์</TableHead>
                <TableHead>มหาวิทยาลัย</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="text-right">การจัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    ไม่พบข้อมูลบริษัท
                  </TableCell>
                </TableRow>
              ) : (
                companies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">{company.name}</TableCell>
                    <TableCell>{company.type || "-"}</TableCell>
                    <TableCell>
                      {company.contactPersonName
                        ? `${company.contactPersonName}${company.contactPersonPosition ? ` (${company.contactPersonPosition})` : ""}`
                        : "-"}
                    </TableCell>
                    <TableCell>{company.phone || company.contactPersonPhone || "-"}</TableCell>
                    <TableCell>{getUniversityName(company.universityId)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={company.isActive ? "default" : "secondary"}
                        className={
                          company.isActive
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : ""
                        }
                      >
                        {company.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/companies/${company.id}/users`}>
                          <Button variant="outline" size="sm" title="จัดการผู้ใช้">
                            <Users className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(company)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {(isSuperAdmin || session?.user?.role === "admin") && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteDialog(company)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>แก้ไขบริษัท</DialogTitle>
            <DialogDescription>แก้ไขข้อมูลบริษัท</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">ชื่อบริษัท *</Label>
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-type">ประเภท</Label>
                <Input
                  id="edit-type"
                  value={editFormData.type}
                  onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">เบอร์โทรศัพท์</Label>
                <Input
                  id="edit-phone"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-activities">กิจกรรม</Label>
              <Input
                id="edit-activities"
                value={editFormData.activities}
                onChange={(e) => setEditFormData({ ...editFormData, activities: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-proposeTo">เสนอให้</Label>
              <Input
                id="edit-proposeTo"
                value={editFormData.proposeTo}
                onChange={(e) => setEditFormData({ ...editFormData, proposeTo: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-contactPersonName">ชื่อผู้ติดต่อ</Label>
              <Input
                id="edit-contactPersonName"
                value={editFormData.contactPersonName}
                onChange={(e) => setEditFormData({ ...editFormData, contactPersonName: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-contactPersonPosition">ตำแหน่งผู้ติดต่อ</Label>
                <Input
                  id="edit-contactPersonPosition"
                  value={editFormData.contactPersonPosition}
                  onChange={(e) => setEditFormData({ ...editFormData, contactPersonPosition: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-contactPersonPhone">เบอร์โทรผู้ติดต่อ</Label>
                <Input
                  id="edit-contactPersonPhone"
                  value={editFormData.contactPersonPhone}
                  onChange={(e) => setEditFormData({ ...editFormData, contactPersonPhone: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-isActive"
                checked={editFormData.isActive}
                onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="edit-isActive" className="cursor-pointer">
                เปิดใช้งาน
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleEdit}>บันทึก</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการลบ</DialogTitle>
            <DialogDescription>
              คุณแน่ใจหรือไม่ว่าต้องการลบบริษัท "{selectedCompany?.name}"? การกระทำนี้ไม่สามารถยกเลิกได้
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              ลบ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
