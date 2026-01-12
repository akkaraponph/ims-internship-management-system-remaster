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
  resumeStatus: boolean;
  isCoInternship: boolean;
  createdAt: string;
  updatedAt: string;
}

interface University {
  id: string;
  name: string;
  code: string;
}

export default function StudentsPage() {
  const { data: session } = useSession();
  const [students, setStudents] = useState<Student[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    idCard: "",
    firstName: "",
    lastName: "",
    phone: "",
    program: "",
    department: "",
    skill: "",
    interest: "",
    projectTopic: "",
    dateOfBirth: "",
    experience: "",
    religion: "",
    fatherName: "",
    fatherJob: "",
    motherName: "",
    motherJob: "",
    presentGpa: "",
    resumeStatus: false,
    isCoInternship: false,
    universityId: "",
  });
  const [editFormData, setEditFormData] = useState({
    email: "",
    idCard: "",
    firstName: "",
    lastName: "",
    phone: "",
    program: "",
    department: "",
    skill: "",
    interest: "",
    projectTopic: "",
    dateOfBirth: "",
    experience: "",
    religion: "",
    fatherName: "",
    fatherJob: "",
    motherName: "",
    motherJob: "",
    presentGpa: "",
    resumeStatus: false,
    isCoInternship: false,
    universityId: "",
  });

  useEffect(() => {
    fetchStudents();
    if (session?.user?.role === "super-admin") {
      fetchUniversities();
    } else if (session?.user?.universityId) {
      // For non-super-admin, we still need to know their university name
      fetchUniversities();
    }
  }, [session]);

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/students");
      if (response.ok) {
        const data = await response.json();
        setStudents(Array.isArray(data) ? data : [data]);
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
    if (!formData.email || !formData.idCard || !formData.firstName || !formData.lastName) {
      toast.error("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      return;
    }

    if (!formData.universityId && session?.user?.role !== "super-admin") {
      toast.error("กรุณาเลือกมหาวิทยาลัย");
      return;
    }

    try {
      const payload: any = {
        email: formData.email,
        idCard: formData.idCard,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
        program: formData.program || undefined,
        department: formData.department || undefined,
        skill: formData.skill || undefined,
        interest: formData.interest || undefined,
        projectTopic: formData.projectTopic || undefined,
        experience: formData.experience || undefined,
        religion: formData.religion || undefined,
        fatherName: formData.fatherName || undefined,
        fatherJob: formData.fatherJob || undefined,
        motherName: formData.motherName || undefined,
        motherJob: formData.motherJob || undefined,
        presentGpa: formData.presentGpa || undefined,
        resumeStatus: formData.resumeStatus,
        isCoInternship: formData.isCoInternship,
      };

      if (formData.dateOfBirth) {
        payload.dateOfBirth = new Date(formData.dateOfBirth);
      }

      // Add universityId - super-admin can specify, others use session
      if (session?.user?.role === "super-admin" && formData.universityId) {
        payload.universityId = formData.universityId;
      } else if (session?.user?.universityId) {
        payload.universityId = session.user.universityId;
      }

      const response = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("สร้างนักศึกษาสำเร็จ");
        setIsCreateDialogOpen(false);
        resetFormData();
        fetchStudents();
      } else {
        const data = await response.json();
        toast.error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  const handleEdit = async () => {
    if (!selectedStudent || !editFormData.email || !editFormData.firstName || !editFormData.lastName) {
      toast.error("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      return;
    }

    try {
      const payload: any = {
        email: editFormData.email,
        idCard: editFormData.idCard,
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
        phone: editFormData.phone || undefined,
        program: editFormData.program || undefined,
        department: editFormData.department || undefined,
        skill: editFormData.skill || undefined,
        interest: editFormData.interest || undefined,
        projectTopic: editFormData.projectTopic || undefined,
        experience: editFormData.experience || undefined,
        religion: editFormData.religion || undefined,
        fatherName: editFormData.fatherName || undefined,
        fatherJob: editFormData.fatherJob || undefined,
        motherName: editFormData.motherName || undefined,
        motherJob: editFormData.motherJob || undefined,
        presentGpa: editFormData.presentGpa || undefined,
        resumeStatus: editFormData.resumeStatus,
        isCoInternship: editFormData.isCoInternship,
      };

      if (editFormData.dateOfBirth) {
        payload.dateOfBirth = new Date(editFormData.dateOfBirth);
      }

      const response = await fetch(`/api/students/${selectedStudent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("อัปเดตนักศึกษาสำเร็จ");
        setIsEditDialogOpen(false);
        setSelectedStudent(null);
        fetchStudents();
      } else {
        const data = await response.json();
        toast.error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  const handleDelete = async () => {
    if (!selectedStudent) return;

    try {
      const response = await fetch(`/api/students/${selectedStudent.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("ลบนักศึกษาสำเร็จ");
        setIsDeleteDialogOpen(false);
        setSelectedStudent(null);
        fetchStudents();
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
      email: "",
      idCard: "",
      firstName: "",
      lastName: "",
      phone: "",
      program: "",
      department: "",
      skill: "",
      interest: "",
      projectTopic: "",
      dateOfBirth: "",
      experience: "",
      religion: "",
      fatherName: "",
      fatherJob: "",
      motherName: "",
      motherJob: "",
      presentGpa: "",
      resumeStatus: false,
      isCoInternship: false,
      universityId: "",
    });
  };

  const openEditDialog = (student: Student) => {
    setSelectedStudent(student);
    setEditFormData({
      email: student.email,
      idCard: student.idCard,
      firstName: student.firstName,
      lastName: student.lastName,
      phone: student.phone || "",
      program: student.program || "",
      department: student.department || "",
      skill: student.skill || "",
      interest: student.interest || "",
      projectTopic: student.projectTopic || "",
      dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split("T")[0] : "",
      experience: student.experience || "",
      religion: student.religion || "",
      fatherName: student.fatherName || "",
      fatherJob: student.fatherJob || "",
      motherName: student.motherName || "",
      motherJob: student.motherJob || "",
      presentGpa: student.presentGpa || "",
      resumeStatus: student.resumeStatus,
      isCoInternship: student.isCoInternship,
      universityId: student.universityId,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (student: Student) => {
    setSelectedStudent(student);
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
          <h2 className="text-2xl font-bold tracking-tight">จัดการนักศึกษา</h2>
          <p className="text-muted-foreground">จัดการข้อมูลนักศึกษาทั้งหมด</p>
        </div>
        {canCreate && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                เพิ่มนักศึกษา
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>เพิ่มนักศึกษา</DialogTitle>
                <DialogDescription>กรุณากรอกข้อมูลนักศึกษา</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-firstName">ชื่อ *</Label>
                    <Input
                      id="create-firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="ชื่อ"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-lastName">นามสกุล *</Label>
                    <Input
                      id="create-lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="นามสกุล"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-email">อีเมล *</Label>
                    <Input
                      id="create-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="อีเมล"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-idCard">เลขบัตรประชาชน *</Label>
                    <Input
                      id="create-idCard"
                      value={formData.idCard}
                      onChange={(e) => setFormData({ ...formData, idCard: e.target.value })}
                      placeholder="เลขบัตรประชาชน"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-phone">เบอร์โทรศัพท์</Label>
                    <Input
                      id="create-phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="เบอร์โทรศัพท์"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-dateOfBirth">วันเกิด</Label>
                    <Input
                      id="create-dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    />
                  </div>
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
                    <Label htmlFor="create-program">สาขาวิชา</Label>
                    <Input
                      id="create-program"
                      value={formData.program}
                      onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                      placeholder="สาขาวิชา"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-department">คณะ</Label>
                    <Input
                      id="create-department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="คณะ"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-presentGpa">เกรดเฉลี่ย</Label>
                  <Input
                    id="create-presentGpa"
                    value={formData.presentGpa}
                    onChange={(e) => setFormData({ ...formData, presentGpa: e.target.value })}
                    placeholder="เช่น 3.50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-skill">ทักษะ</Label>
                  <Input
                    id="create-skill"
                    value={formData.skill}
                    onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
                    placeholder="ทักษะ"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-interest">ความสนใจ</Label>
                  <Input
                    id="create-interest"
                    value={formData.interest}
                    onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                    placeholder="ความสนใจ"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="create-resumeStatus"
                      checked={formData.resumeStatus}
                      onChange={(e) => setFormData({ ...formData, resumeStatus: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="create-resumeStatus" className="cursor-pointer">
                      สถานะเรซูเม่
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="create-isCoInternship"
                      checked={formData.isCoInternship}
                      onChange={(e) => setFormData({ ...formData, isCoInternship: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="create-isCoInternship" className="cursor-pointer">
                      โคออป
                    </Label>
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
          <CardTitle>รายชื่อนักศึกษา</CardTitle>
          <CardDescription>จัดการข้อมูลนักศึกษาทั้งหมด</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ชื่อ-นามสกุล</TableHead>
                <TableHead>อีเมล</TableHead>
                <TableHead>เลขบัตรประชาชน</TableHead>
                <TableHead>มหาวิทยาลัย</TableHead>
                <TableHead>สาขาวิชา</TableHead>
                <TableHead className="text-right">การจัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    ไม่พบข้อมูลนักศึกษา
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">
                      {student.firstName} {student.lastName}
                    </TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.idCard}</TableCell>
                    <TableCell>{getUniversityName(student.universityId)}</TableCell>
                    <TableCell>{student.program || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(student)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {(isSuperAdmin || session?.user?.role === "admin" || session?.user?.role === "director") && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteDialog(student)}
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
            <DialogTitle>แก้ไขนักศึกษา</DialogTitle>
            <DialogDescription>แก้ไขข้อมูลนักศึกษา</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-firstName">ชื่อ *</Label>
                <Input
                  id="edit-firstName"
                  value={editFormData.firstName}
                  onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lastName">นามสกุล *</Label>
                <Input
                  id="edit-lastName"
                  value={editFormData.lastName}
                  onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-email">อีเมล *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-idCard">เลขบัตรประชาชน *</Label>
                <Input
                  id="edit-idCard"
                  value={editFormData.idCard}
                  onChange={(e) => setEditFormData({ ...editFormData, idCard: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-phone">เบอร์โทรศัพท์</Label>
                <Input
                  id="edit-phone"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-dateOfBirth">วันเกิด</Label>
                <Input
                  id="edit-dateOfBirth"
                  type="date"
                  value={editFormData.dateOfBirth}
                  onChange={(e) => setEditFormData({ ...editFormData, dateOfBirth: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-program">สาขาวิชา</Label>
                <Input
                  id="edit-program"
                  value={editFormData.program}
                  onChange={(e) => setEditFormData({ ...editFormData, program: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-department">คณะ</Label>
                <Input
                  id="edit-department"
                  value={editFormData.department}
                  onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-presentGpa">เกรดเฉลี่ย</Label>
              <Input
                id="edit-presentGpa"
                value={editFormData.presentGpa}
                onChange={(e) => setEditFormData({ ...editFormData, presentGpa: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-resumeStatus"
                  checked={editFormData.resumeStatus}
                  onChange={(e) => setEditFormData({ ...editFormData, resumeStatus: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="edit-resumeStatus" className="cursor-pointer">
                  สถานะเรซูเม่
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-isCoInternship"
                  checked={editFormData.isCoInternship}
                  onChange={(e) => setEditFormData({ ...editFormData, isCoInternship: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="edit-isCoInternship" className="cursor-pointer">
                  โคออป
                </Label>
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
              คุณแน่ใจหรือไม่ว่าต้องการลบนักศึกษา "{selectedStudent?.firstName} {selectedStudent?.lastName}"? การกระทำนี้ไม่สามารถยกเลิกได้
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
