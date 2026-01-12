"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

interface CompanyUser {
  id: string;
  userId: string;
  companyId: string;
  position: string | null;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    role: string;
    isActive: boolean;
    customRoleId: string | null;
  };
  customRole: {
    id: string;
    name: string;
    description: string | null;
    permissions: string[];
  } | null;
}

interface Role {
  id: string;
  name: string;
  description: string | null;
}

export default function CompanyUsersManagementPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const companyId = session?.user?.companyId;

  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<CompanyUser | null>(null);
  const [isPrimaryUser, setIsPrimaryUser] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    position: "",
    customRoleId: "",
    isPrimary: false,
  });
  const [editFormData, setEditFormData] = useState({
    position: "",
    customRoleId: "",
    isPrimary: false,
  });

  useEffect(() => {
    if (!session) return;
    
    if (session.user.role !== "company" || !companyId) {
      router.push("/dashboard");
      return;
    }

    fetchCompanyUsers();
    fetchRoles();
    checkPrimaryUser();
  }, [session, companyId, router]);

  const checkPrimaryUser = async () => {
    if (!companyId) return;
    
    try {
      const response = await fetch(`/api/companies/${companyId}/users`);
      if (response.ok) {
        const data = await response.json();
        const currentUser = data.find(
          (cu: CompanyUser) => cu.userId === session.user.id
        );
        if (currentUser?.isPrimary) {
          setIsPrimaryUser(true);
        } else {
          // Not primary user, redirect
          router.push("/company");
        }
      }
    } catch (error) {
      console.error("Error checking primary user:", error);
    }
  };

  const fetchCompanyUsers = async () => {
    if (!companyId) return;
    
    try {
      const response = await fetch(`/api/companies/${companyId}/users`);
      if (response.ok) {
        const data = await response.json();
        setCompanyUsers(data);
      } else {
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch("/api/roles");
      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const handleCreate = async () => {
    if (!formData.username || !formData.password) {
      toast.error("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
      return;
    }

    if (!companyId) return;

    try {
      const payload: any = {
        username: formData.username,
        password: formData.password,
        position: formData.position || undefined,
        isPrimary: formData.isPrimary,
      };

      if (formData.customRoleId) {
        payload.customRoleId = formData.customRoleId;
      }

      const response = await fetch(`/api/companies/${companyId}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("เพิ่มผู้ใช้บริษัทสำเร็จ");
        setIsCreateDialogOpen(false);
        setFormData({
          username: "",
          password: "",
          position: "",
          customRoleId: "",
          isPrimary: false,
        });
        fetchCompanyUsers();
      } else {
        const error = await response.json();
        toast.error(error.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  const handleEdit = async () => {
    if (!selectedUser || !companyId) return;

    try {
      const payload: any = {
        position: editFormData.position || undefined,
        isPrimary: editFormData.isPrimary,
      };

      if (editFormData.customRoleId !== undefined) {
        payload.customRoleId = editFormData.customRoleId || null;
      }

      const response = await fetch(
        `/api/companies/${companyId}/users/${selectedUser.userId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        toast.success("อัปเดตข้อมูลสำเร็จ");
        setIsEditDialogOpen(false);
        setSelectedUser(null);
        fetchCompanyUsers();
      } else {
        const error = await response.json();
        toast.error(error.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  const handleDelete = async () => {
    if (!selectedUser || !companyId) return;

    try {
      const response = await fetch(
        `/api/companies/${companyId}/users/${selectedUser.userId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast.success("ลบผู้ใช้สำเร็จ");
        setIsDeleteDialogOpen(false);
        setSelectedUser(null);
        fetchCompanyUsers();
      } else {
        const error = await response.json();
        toast.error(error.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  const openEditDialog = (user: CompanyUser) => {
    setSelectedUser(user);
    setEditFormData({
      position: user.position || "",
      customRoleId: user.customRole?.id || "",
      isPrimary: user.isPrimary,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (user: CompanyUser) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  if (!isPrimaryUser) {
    return <div className="p-6">กำลังโหลด...</div>;
  }

  if (isLoading) {
    return <div className="p-6">กำลังโหลด...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">จัดการผู้ใช้บริษัท</h2>
          <p className="text-muted-foreground">
            จัดการผู้ใช้ทั้งหมดของบริษัทของคุณ
          </p>
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
              <DialogTitle>เพิ่มผู้ใช้บริษัท</DialogTitle>
              <DialogDescription>
                เพิ่มผู้ใช้ใหม่ให้กับบริษัทของคุณ
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">ชื่อผู้ใช้</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">รหัสผ่าน</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">ตำแหน่ง</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: e.target.value })
                  }
                  placeholder="เช่น HR, Manager"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customRoleId">บทบาท</Label>
                <Select
                  value={formData.customRoleId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, customRoleId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกบทบาท" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">ไม่มี</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={formData.isPrimary}
                  onChange={(e) =>
                    setFormData({ ...formData, isPrimary: e.target.checked })
                  }
                  className="h-4 w-4"
                />
                <Label htmlFor="isPrimary">ผู้ใช้หลัก</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button onClick={handleCreate}>เพิ่ม</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายชื่อผู้ใช้</CardTitle>
          <CardDescription>
            รายชื่อผู้ใช้ทั้งหมดของบริษัท
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ชื่อผู้ใช้</TableHead>
                <TableHead>ตำแหน่ง</TableHead>
                <TableHead>บทบาท</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>ผู้ใช้หลัก</TableHead>
                <TableHead>การจัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companyUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    ไม่มีข้อมูล
                  </TableCell>
                </TableRow>
              ) : (
                companyUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.user.username}</TableCell>
                    <TableCell>{user.position || "-"}</TableCell>
                    <TableCell>
                      {user.customRole ? (
                        <Badge variant="secondary">{user.customRole.name}</Badge>
                      ) : (
                        <Badge variant="outline">ไม่มี</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.user.isActive ? "default" : "destructive"}
                      >
                        {user.user.isActive ? "ใช้งาน" : "ไม่ใช้งาน"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.isPrimary && (
                        <Badge variant="default">หลัก</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(user)}
                          disabled={user.isPrimary && companyUsers.filter(cu => cu.isPrimary).length === 1}
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
            <DialogDescription>แก้ไขข้อมูลผู้ใช้บริษัท</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>ชื่อผู้ใช้</Label>
              <Input value={selectedUser?.user.username || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-position">ตำแหน่ง</Label>
              <Input
                id="edit-position"
                value={editFormData.position}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, position: e.target.value })
                }
                placeholder="เช่น HR, Manager"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-customRoleId">บทบาท</Label>
              <Select
                value={editFormData.customRoleId}
                onValueChange={(value) =>
                  setEditFormData({ ...editFormData, customRoleId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกบทบาท" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">ไม่มี</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-isPrimary"
                checked={editFormData.isPrimary}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, isPrimary: e.target.checked })
                }
                className="h-4 w-4"
              />
              <Label htmlFor="edit-isPrimary">ผู้ใช้หลัก</Label>
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
              คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้{" "}
              {selectedUser?.user.username}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
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
