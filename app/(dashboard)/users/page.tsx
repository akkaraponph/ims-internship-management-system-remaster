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

interface User {
  id: string;
  username: string;
  role: "admin" | "director" | "student" | "super-admin";
  universityId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface University {
  id: string;
  name: string;
  code: string;
}

export default function UsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "admin" as "admin" | "director" | "student" | "super-admin",
    universityId: "",
    isActive: true,
  });
  const [editFormData, setEditFormData] = useState({
    username: "",
    password: "",
    role: "admin" as "admin" | "director" | "student" | "super-admin",
    universityId: "",
    isActive: true,
  });

  useEffect(() => {
    fetchUsers();
    if (session?.user?.role === "super-admin") {
      fetchUniversities();
    }
  }, [session]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
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
        setUniversities(data);
      }
    } catch (error) {
      // Silently fail
    }
  };

  const getUniversityName = (universityId: string | null) => {
    if (!universityId) return "-";
    const university = universities.find((u) => u.id === universityId);
    return university ? university.name : "-";
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      "super-admin": "ผู้ดูแลระบบหลัก",
      admin: "ผู้ดูแลระบบ",
      director: "อาจารย์ที่ปรึกษา",
      student: "นักศึกษา",
    };
    return labels[role] || role;
  };

  const handleCreate = async () => {
    if (!formData.username || !formData.password) {
      toast.error("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
      return;
    }

    try {
      const payload: any = {
        username: formData.username,
        password: formData.password,
        role: formData.role,
        isActive: formData.isActive,
      };

      // Only include universityId if role is not super-admin
      if (formData.role !== "super-admin" && formData.universityId) {
        payload.universityId = formData.universityId;
      }

      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("สร้างผู้ใช้สำเร็จ");
        setIsCreateDialogOpen(false);
        setFormData({
          username: "",
          password: "",
          role: "admin",
          universityId: "",
          isActive: true,
        });
        fetchUsers();
      } else {
        const data = await response.json();
        toast.error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  const handleEdit = async () => {
    if (!selectedUser || !editFormData.username) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    try {
      const payload: any = {
        username: editFormData.username,
        role: editFormData.role,
        isActive: editFormData.isActive,
      };

      // Only include password if provided
      if (editFormData.password) {
        payload.password = editFormData.password;
      }

      // Only include universityId if role is not super-admin
      if (editFormData.role !== "super-admin" && editFormData.universityId) {
        payload.universityId = editFormData.universityId;
      }

      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("อัปเดตผู้ใช้สำเร็จ");
        setIsEditDialogOpen(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        const data = await response.json();
        toast.error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("ลบผู้ใช้สำเร็จ");
        setIsDeleteDialogOpen(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        const data = await response.json();
        toast.error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      username: user.username,
      password: "",
      role: user.role,
      universityId: user.universityId || "",
      isActive: user.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  if (isLoading) {
    return <div>กำลังโหลด...</div>;
  }

  const isSuperAdmin = session?.user?.role === "super-admin";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">จัดการผู้ใช้</h2>
          <p className="text-muted-foreground">จัดการข้อมูลผู้ใช้งานระบบทั้งหมด</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              เพิ่มผู้ใช้
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>เพิ่มผู้ใช้</DialogTitle>
              <DialogDescription>กรุณากรอกข้อมูลผู้ใช้</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="create-username">ชื่อผู้ใช้</Label>
                <Input
                  id="create-username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="กรุณากรอกชื่อผู้ใช้"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-password">รหัสผ่าน</Label>
                <Input
                  id="create-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="กรุณากรอกรหัสผ่าน"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-role">บทบาท</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: any) => {
                    setFormData({ ...formData, role: value, universityId: value === "super-admin" ? "" : formData.universityId });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super-admin">ผู้ดูแลระบบหลัก</SelectItem>
                    <SelectItem value="admin">ผู้ดูแลระบบ</SelectItem>
                    <SelectItem value="director">อาจารย์ที่ปรึกษา</SelectItem>
                    <SelectItem value="student">นักศึกษา</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.role !== "super-admin" && isSuperAdmin && (
                <div className="space-y-2">
                  <Label htmlFor="create-university">มหาวิทยาลัย</Label>
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายชื่อผู้ใช้</CardTitle>
          <CardDescription>จัดการข้อมูลผู้ใช้ทั้งหมด</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ชื่อผู้ใช้</TableHead>
                <TableHead>บทบาท</TableHead>
                <TableHead>มหาวิทยาลัย</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="text-right">การจัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    ไม่พบข้อมูลผู้ใช้
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getRoleLabel(user.role)}</Badge>
                    </TableCell>
                    <TableCell>
                      {isSuperAdmin ? getUniversityName(user.universityId) : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.isActive ? "default" : "secondary"}
                        className={
                          user.isActive
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : ""
                        }
                      >
                        {user.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteDialog(user)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
            <DialogTitle>แก้ไขผู้ใช้</DialogTitle>
            <DialogDescription>แก้ไขข้อมูลผู้ใช้</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-username">ชื่อผู้ใช้</Label>
              <Input
                id="edit-username"
                value={editFormData.username}
                onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                placeholder="กรุณากรอกชื่อผู้ใช้"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">รหัสผ่าน (เว้นว่างไว้หากไม่ต้องการเปลี่ยน)</Label>
              <Input
                id="edit-password"
                type="password"
                value={editFormData.password}
                onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                placeholder="กรุณากรอกรหัสผ่านใหม่"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">บทบาท</Label>
              <Select
                value={editFormData.role}
                onValueChange={(value: any) => {
                  setEditFormData({ ...editFormData, role: value, universityId: value === "super-admin" ? "" : editFormData.universityId });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super-admin">ผู้ดูแลระบบหลัก</SelectItem>
                  <SelectItem value="admin">ผู้ดูแลระบบ</SelectItem>
                  <SelectItem value="director">อาจารย์ที่ปรึกษา</SelectItem>
                  <SelectItem value="student">นักศึกษา</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editFormData.role !== "super-admin" && isSuperAdmin && (
              <div className="space-y-2">
                <Label htmlFor="edit-university">มหาวิทยาลัย</Label>
                <Select
                  value={editFormData.universityId}
                  onValueChange={(value) => setEditFormData({ ...editFormData, universityId: value })}
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
              คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้ "{selectedUser?.username}"? การกระทำนี้ไม่สามารถยกเลิกได้
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
