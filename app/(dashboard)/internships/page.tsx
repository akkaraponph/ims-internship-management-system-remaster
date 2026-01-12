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
import { Plus, Edit, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";

interface Internship {
  id: string;
  studentId: string | null;
  companyId: string | null;
  isSend: string | null;
  isConfirm: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Company {
  id: string;
  name: string;
}

export default function InternshipsPage() {
  const { data: session } = useSession();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);
  const [formData, setFormData] = useState({
    studentId: "",
    companyId: "",
    isSend: "",
    isConfirm: "",
    status: "pending" as "pending" | "approved" | "rejected",
    startDate: "",
    endDate: "",
  });
  const [editFormData, setEditFormData] = useState({
    studentId: "",
    companyId: "",
    isSend: "",
    isConfirm: "",
    status: "pending" as "pending" | "approved" | "rejected",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchInternships();
    fetchStudents();
    fetchCompanies();
  }, []);

  const fetchInternships = async () => {
    try {
      const response = await fetch("/api/internships");
      if (response.ok) {
        const data = await response.json();
        setInternships(Array.isArray(data) ? data : [data]);
      } else {
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/students");
      if (response.ok) {
        const data = await response.json();
        setStudents(Array.isArray(data) ? data : [data]);
      }
    } catch (error) {
      // Silently fail
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await fetch("/api/companies");
      if (response.ok) {
        const data = await response.json();
        setCompanies(Array.isArray(data) ? data : [data]);
      }
    } catch (error) {
      // Silently fail
    }
  };

  const getStudentName = (studentId: string | null) => {
    if (!studentId) return "-";
    const student = students.find((s) => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : "-";
  };

  const getCompanyName = (companyId: string | null) => {
    if (!companyId) return "-";
    const company = companies.find((c) => c.id === companyId);
    return company ? company.name : "-";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "รอดำเนินการ",
      approved: "อนุมัติแล้ว",
      rejected: "ปฏิเสธ",
    };
    return labels[status] || status;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "default";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const handleCreate = async () => {
    if (!formData.studentId || !formData.companyId) {
      toast.error("กรุณาเลือกนักศึกษาและบริษัท");
      return;
    }

    try {
      const payload: any = {
        studentId: formData.studentId,
        companyId: formData.companyId,
        status: formData.status,
        isSend: formData.isSend || undefined,
        isConfirm: formData.isConfirm || undefined,
      };

      if (formData.startDate) {
        payload.startDate = new Date(formData.startDate);
      }
      if (formData.endDate) {
        payload.endDate = new Date(formData.endDate);
      }

      const response = await fetch("/api/internships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("สร้างการฝึกงานสำเร็จ");
        setIsCreateDialogOpen(false);
        resetFormData();
        fetchInternships();
      } else {
        const data = await response.json();
        toast.error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  const handleEdit = async () => {
    if (!selectedInternship || !editFormData.studentId || !editFormData.companyId) {
      toast.error("กรุณาเลือกนักศึกษาและบริษัท");
      return;
    }

    try {
      const payload: any = {
        studentId: editFormData.studentId,
        companyId: editFormData.companyId,
        status: editFormData.status,
        isSend: editFormData.isSend || undefined,
        isConfirm: editFormData.isConfirm || undefined,
      };

      if (editFormData.startDate) {
        payload.startDate = new Date(editFormData.startDate);
      }
      if (editFormData.endDate) {
        payload.endDate = new Date(editFormData.endDate);
      }

      const response = await fetch(`/api/internships/${selectedInternship.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("อัปเดตการฝึกงานสำเร็จ");
        setIsEditDialogOpen(false);
        setSelectedInternship(null);
        fetchInternships();
      } else {
        const data = await response.json();
        toast.error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  const handleDelete = async () => {
    if (!selectedInternship) return;

    try {
      const response = await fetch(`/api/internships/${selectedInternship.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("ลบการฝึกงานสำเร็จ");
        setIsDeleteDialogOpen(false);
        setSelectedInternship(null);
        fetchInternships();
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
      studentId: "",
      companyId: "",
      isSend: "",
      isConfirm: "",
      status: "pending",
      startDate: "",
      endDate: "",
    });
  };

  const openEditDialog = (internship: Internship) => {
    setSelectedInternship(internship);
    setEditFormData({
      studentId: internship.studentId || "",
      companyId: internship.companyId || "",
      isSend: internship.isSend || "",
      isConfirm: internship.isConfirm || "",
      status: (internship.status as "pending" | "approved" | "rejected") || "pending",
      startDate: internship.startDate ? new Date(internship.startDate).toISOString().split("T")[0] : "",
      endDate: internship.endDate ? new Date(internship.endDate).toISOString().split("T")[0] : "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (internship: Internship) => {
    setSelectedInternship(internship);
    setIsDeleteDialogOpen(true);
  };

  if (isLoading) {
    return <div>กำลังโหลด...</div>;
  }

  const isSuperAdmin = session?.user?.role === "super-admin";
  const canManage = isSuperAdmin || session?.user?.role === "admin";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">จัดการการฝึกงาน</h2>
          <p className="text-muted-foreground">จัดการข้อมูลการฝึกงานทั้งหมด</p>
        </div>
        {canManage && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                เพิ่มการฝึกงาน
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>เพิ่มการฝึกงาน</DialogTitle>
                <DialogDescription>กรุณากรอกข้อมูลการฝึกงาน</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="create-student">นักศึกษา *</Label>
                  <Select
                    value={formData.studentId}
                    onValueChange={(value) => setFormData({ ...formData, studentId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกนักศึกษา" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.firstName} {student.lastName} ({student.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-company">บริษัท *</Label>
                  <Select
                    value={formData.companyId}
                    onValueChange={(value) => setFormData({ ...formData, companyId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกบริษัท" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-status">สถานะ</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">รอดำเนินการ</SelectItem>
                      <SelectItem value="approved">อนุมัติแล้ว</SelectItem>
                      <SelectItem value="rejected">ปฏิเสธ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-startDate">วันที่เริ่มต้น</Label>
                    <Input
                      id="create-startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-endDate">วันที่สิ้นสุด</Label>
                    <Input
                      id="create-endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
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
          <CardTitle>รายการฝึกงาน</CardTitle>
          <CardDescription>จัดการข้อมูลการฝึกงานทั้งหมด</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>นักศึกษา</TableHead>
                <TableHead>บริษัท</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>วันที่เริ่มต้น</TableHead>
                <TableHead>วันที่สิ้นสุด</TableHead>
                <TableHead className="text-right">การจัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {internships.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    ไม่พบข้อมูลการฝึกงาน
                  </TableCell>
                </TableRow>
              ) : (
                internships.map((internship) => (
                  <TableRow key={internship.id}>
                    <TableCell className="font-medium">
                      {getStudentName(internship.studentId)}
                    </TableCell>
                    <TableCell>{getCompanyName(internship.companyId)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(internship.status)}>
                        {getStatusLabel(internship.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {internship.startDate
                        ? new Date(internship.startDate).toLocaleDateString("th-TH")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {internship.endDate
                        ? new Date(internship.endDate).toLocaleDateString("th-TH")
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {canManage && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(internship)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDeleteDialog(internship)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขการฝึกงาน</DialogTitle>
            <DialogDescription>แก้ไขข้อมูลการฝึกงาน</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-student">นักศึกษา *</Label>
              <Select
                value={editFormData.studentId}
                onValueChange={(value) => setEditFormData({ ...editFormData, studentId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกนักศึกษา" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.firstName} {student.lastName} ({student.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-company">บริษัท *</Label>
              <Select
                value={editFormData.companyId}
                onValueChange={(value) => setEditFormData({ ...editFormData, companyId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกบริษัท" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">สถานะ</Label>
              <Select
                value={editFormData.status}
                onValueChange={(value: any) => setEditFormData({ ...editFormData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">รอดำเนินการ</SelectItem>
                  <SelectItem value="approved">อนุมัติแล้ว</SelectItem>
                  <SelectItem value="rejected">ปฏิเสธ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-startDate">วันที่เริ่มต้น</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={editFormData.startDate}
                  onChange={(e) => setEditFormData({ ...editFormData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-endDate">วันที่สิ้นสุด</Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  value={editFormData.endDate}
                  onChange={(e) => setEditFormData({ ...editFormData, endDate: e.target.value })}
                />
              </div>
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
              คุณแน่ใจหรือไม่ว่าต้องการลบการฝึกงานนี้? การกระทำนี้ไม่สามารถยกเลิกได้
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
