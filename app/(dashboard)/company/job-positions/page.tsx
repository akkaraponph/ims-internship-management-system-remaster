"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Briefcase } from "lucide-react";
import { useSession } from "next-auth/react";
import type { JobPosition } from "@/types";

export default function JobPositionsPage() {
  const { data: session } = useSession();
  const [jobPositions, setJobPositions] = useState<JobPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedJobPosition, setSelectedJobPosition] = useState<JobPosition | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    location: "",
    startDate: "",
    endDate: "",
    maxApplicants: "",
    isActive: true,
  });

  useEffect(() => {
    fetchJobPositions();
  }, []);

  const fetchJobPositions = async () => {
    try {
      const response = await fetch("/api/job-positions");
      if (response.ok) {
        const data = await response.json();
        setJobPositions(Array.isArray(data) ? data : [data]);
      } else {
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.title) {
      toast.error("กรุณากรอกชื่อตำแหน่งงาน");
      return;
    }

    try {
      const response = await fetch("/api/job-positions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("สร้างตำแหน่งงานสำเร็จ");
        setIsCreateDialogOpen(false);
        setFormData({
          title: "",
          description: "",
          requirements: "",
          location: "",
          startDate: "",
          endDate: "",
          maxApplicants: "",
          isActive: true,
        });
        fetchJobPositions();
      } else {
        const error = await response.json();
        toast.error(error.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  const handleEdit = async () => {
    if (!selectedJobPosition || !formData.title) {
      toast.error("กรุณากรอกชื่อตำแหน่งงาน");
      return;
    }

    try {
      const response = await fetch(`/api/job-positions/${selectedJobPosition.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("อัปเดตตำแหน่งงานสำเร็จ");
        setIsEditDialogOpen(false);
        setSelectedJobPosition(null);
        fetchJobPositions();
      } else {
        const error = await response.json();
        toast.error(error.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  const handleDelete = async () => {
    if (!selectedJobPosition) return;

    try {
      const response = await fetch(`/api/job-positions/${selectedJobPosition.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("ลบตำแหน่งงานสำเร็จ");
        setIsDeleteDialogOpen(false);
        setSelectedJobPosition(null);
        fetchJobPositions();
      } else {
        const error = await response.json();
        toast.error(error.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  if (isLoading) {
    return <div>กำลังโหลด...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">ตำแหน่งงาน</h2>
          <p className="text-muted-foreground">จัดการตำแหน่งงานที่เปิดรับนักศึกษาฝึกงาน</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              สร้างตำแหน่งงานใหม่
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>สร้างตำแหน่งงานใหม่</DialogTitle>
              <DialogDescription>กรุณากรอกข้อมูลตำแหน่งงาน</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">ชื่อตำแหน่งงาน *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">รายละเอียด</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="requirements">คุณสมบัติ</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">สถานที่</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxApplicants">จำนวนผู้สมัครสูงสุด</Label>
                  <Input
                    id="maxApplicants"
                    type="number"
                    value={formData.maxApplicants}
                    onChange={(e) => setFormData({ ...formData, maxApplicants: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">วันที่เริ่มต้น</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">วันที่สิ้นสุด</Label>
                  <Input
                    id="endDate"
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายการตำแหน่งงาน</CardTitle>
          <CardDescription>ตำแหน่งงานทั้งหมดที่เปิดรับ</CardDescription>
        </CardHeader>
        <CardContent>
          {jobPositions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              ยังไม่มีตำแหน่งงาน
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่อตำแหน่ง</TableHead>
                  <TableHead>สถานที่</TableHead>
                  <TableHead>วันที่เริ่มต้น</TableHead>
                  <TableHead>วันที่สิ้นสุด</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobPositions.map((jobPosition) => (
                  <TableRow key={jobPosition.id}>
                    <TableCell className="font-medium">{jobPosition.title}</TableCell>
                    <TableCell>{jobPosition.location || "-"}</TableCell>
                    <TableCell>
                      {jobPosition.startDate
                        ? new Date(jobPosition.startDate).toLocaleDateString("th-TH")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {jobPosition.endDate
                        ? new Date(jobPosition.endDate).toLocaleDateString("th-TH")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={jobPosition.isActive ? "default" : "secondary"}>
                        {jobPosition.isActive ? "เปิดรับ" : "ปิดรับ"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedJobPosition(jobPosition);
                            setFormData({
                              title: jobPosition.title || "",
                              description: jobPosition.description || "",
                              requirements: jobPosition.requirements || "",
                              location: jobPosition.location || "",
                              startDate: jobPosition.startDate
                                ? new Date(jobPosition.startDate).toISOString().split("T")[0]
                                : "",
                              endDate: jobPosition.endDate
                                ? new Date(jobPosition.endDate).toISOString().split("T")[0]
                                : "",
                              maxApplicants: jobPosition.maxApplicants?.toString() || "",
                              isActive: jobPosition.isActive,
                            });
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedJobPosition(jobPosition);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>แก้ไขตำแหน่งงาน</DialogTitle>
            <DialogDescription>แก้ไขข้อมูลตำแหน่งงาน</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">ชื่อตำแหน่งงาน *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">รายละเอียด</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-requirements">คุณสมบัติ</Label>
              <Textarea
                id="edit-requirements"
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-location">สถานที่</Label>
                <Input
                  id="edit-location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-maxApplicants">จำนวนผู้สมัครสูงสุด</Label>
                <Input
                  id="edit-maxApplicants"
                  type="number"
                  value={formData.maxApplicants}
                  onChange={(e) => setFormData({ ...formData, maxApplicants: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-startDate">วันที่เริ่มต้น</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-endDate">วันที่สิ้นสุด</Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
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
              คุณแน่ใจหรือไม่ว่าต้องการลบตำแหน่งงาน "{selectedJobPosition?.title}"?
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
