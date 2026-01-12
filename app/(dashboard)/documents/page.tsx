"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Loader2, Upload, FileText, Download, Trash2, Image as ImageIcon } from "lucide-react";

interface Student {
  id: string;
  resumeStatus: boolean;
  resume: string | null;
  resumeApproved: boolean;
  resumeApprovedAt: string | null;
  image: string | null;
}

export default function DocumentsPage() {
  const { data: session } = useSession();
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (session?.user?.role === "student") {
      fetchStudent();
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
        }
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile || !student) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", resumeFile);

      const response = await fetch("/api/upload/resume", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("อัพโหลด Resume สำเร็จ");
        setResumeFile(null);
        await fetchStudent();
      } else {
        const error = await response.json();
        toast.error(error.error || "เกิดข้อผิดพลาดในการอัพโหลด");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการอัพโหลด");
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile || !student) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", imageFile);

      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("อัพโหลดรูปภาพสำเร็จ");
        setImageFile(null);
        await fetchStudent();
      } else {
        const error = await response.json();
        toast.error(error.error || "เกิดข้อผิดพลาดในการอัพโหลด");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการอัพโหลด");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "resume" | "image") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "resume") {
      // Validate resume file
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("กรุณาเลือกไฟล์ PDF หรือ DOCX เท่านั้น");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("ขนาดไฟล์ต้องไม่เกิน 5MB");
        return;
      }
      setResumeFile(file);
    } else {
      // Validate image file
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("กรุณาเลือกไฟล์รูปภาพ (JPEG, PNG, WebP) เท่านั้น");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error("ขนาดไฟล์ต้องไม่เกิน 2MB");
        return;
      }
      setImageFile(file);
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
        <h2 className="text-2xl font-bold tracking-tight">เอกสาร</h2>
        <p className="text-muted-foreground">จัดการเอกสารและรูปภาพของคุณ</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Resume
            </CardTitle>
            <CardDescription>อัพโหลด Resume ของคุณ (PDF หรือ DOCX)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={student.resumeStatus ? "default" : "secondary"}>
                {student.resumeStatus ? "อัพโหลดแล้ว" : "ยังไม่อัพโหลด"}
              </Badge>
              {student.resumeStatus && (
                <Badge
                  variant={
                    student.resumeApproved
                      ? "default"
                      : "secondary"
                  }
                >
                  {student.resumeApproved
                    ? "อนุมัติแล้ว"
                    : "รอการอนุมัติ"}
                </Badge>
              )}
            </div>
            {student.resumeApproved && student.resumeApprovedAt && (
              <div className="text-sm text-muted-foreground">
                อนุมัติเมื่อ: {new Date(student.resumeApprovedAt).toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            )}
            {student.resume && student.resumeStatus && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(student.resume!, "_blank")}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  ดู Resume
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = student.resume!;
                    link.download = `resume.pdf`;
                    link.click();
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  ดาวน์โหลด
                </Button>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="resume-upload">เลือกไฟล์ Resume</Label>
              <input
                id="resume-upload"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => handleFileChange(e, "resume")}
                className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              {resumeFile && (
                <p className="text-sm text-muted-foreground">ไฟล์ที่เลือก: {resumeFile.name}</p>
              )}
            </div>
            <Button
              onClick={handleResumeUpload}
              disabled={!resumeFile || isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังอัพโหลด...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  อัพโหลด Resume
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              รองรับไฟล์ PDF และ DOCX ขนาดไม่เกิน 5MB
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              รูปภาพโปรไฟล์
            </CardTitle>
            <CardDescription>อัพโหลดรูปภาพโปรไฟล์ของคุณ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {student.image && (
              <div className="space-y-2">
                <img
                  src={student.image}
                  alt="Profile"
                  className="w-32 h-32 rounded-lg object-cover border"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="image-upload">เลือกไฟล์รูปภาพ</Label>
              <input
                id="image-upload"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={(e) => handleFileChange(e, "image")}
                className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              {imageFile && (
                <p className="text-sm text-muted-foreground">ไฟล์ที่เลือก: {imageFile.name}</p>
              )}
            </div>
            <Button
              onClick={handleImageUpload}
              disabled={!imageFile || isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังอัพโหลด...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  อัพโหลดรูปภาพ
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              รองรับไฟล์ JPEG, PNG, WebP ขนาดไม่เกิน 2MB
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
