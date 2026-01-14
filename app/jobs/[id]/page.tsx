"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Briefcase, 
  Building2, 
  MapPin, 
  Calendar, 
  Users, 
  ArrowLeft,
  Send,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LandingNav } from "@/components/landing/LandingNav";
import { Footer } from "@/components/landing/Footer";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import Link from "next/link";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useDemoSession } from "@/hooks/use-demo-session";
import { useDemoMode } from "@/lib/demo/demo-context";
import { getSession } from "@/lib/demo/demo-service";

interface JobPosition {
  id: string;
  title: string;
  description: string | null;
  requirements: string | null;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  maxApplicants: number | null;
  createdAt: string;
  company: {
    id: string;
    name: string;
    type: string | null;
    activities: string | null;
  };
}

interface Student {
  id: string;
  resumeApproved: boolean;
  resumeStatus: boolean;
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  const { data: session } = useSession();
  const { data: demoSession } = useDemoSession();
  const { isDemo } = useDemoMode();
  const [job, setJob] = useState<JobPosition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);
  const [hasApplied, setHasApplied] = useState(false);

  const currentSession = isDemo ? { user: demoSession } : session;

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  useEffect(() => {
    if (currentSession?.user?.role === "student") {
      fetchStudent();
    }
  }, [currentSession?.user?.role]);

  const fetchJobDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/jobs/public`);
      if (response.ok) {
        const data = await response.json();
        const foundJob = data.find((j: JobPosition) => j.id === jobId);
        if (foundJob) {
          setJob(foundJob);
        } else {
          toast.error("ไม่พบตำแหน่งงาน");
          router.push("/jobs");
        }
      } else {
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
        router.push("/jobs");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      router.push("/jobs");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudent = async () => {
    try {
      const response = await fetch("/api/students");
      if (response.ok) {
        const data = await response.json();
        const studentData = Array.isArray(data) ? data[0] : data;
        if (studentData) {
          setStudent({
            id: studentData.id,
            resumeApproved: studentData.resumeApproved || false,
            resumeStatus: studentData.resumeStatus || false,
          });
          // Check if applied after getting student ID
          checkIfApplied(studentData.id);
        }
      }
    } catch (error) {
      console.error("Error fetching student:", error);
    }
  };

  const checkIfApplied = async (studentId: string) => {
    try {
      const response = await fetch("/api/internships");
      if (response.ok) {
        const internships = await response.json();
        const applied = internships.some(
          (internship: any) =>
            internship.jobPositionId === jobId &&
            internship.studentId === studentId
        );
        setHasApplied(applied);
      }
    } catch (error) {
      console.error("Error checking application:", error);
    }
  };

  const handleApply = async () => {
    if (!currentSession?.user) {
      toast.error("กรุณาเข้าสู่ระบบก่อน");
      router.push(`/login?callbackUrl=/jobs/${jobId}`);
      return;
    }

    if (currentSession.user.role !== "student") {
      toast.error("เฉพาะนักศึกษาที่สามารถสมัครงานได้");
      return;
    }

    if (!student) {
      toast.error("ไม่พบข้อมูลนักศึกษา");
      return;
    }

    if (!student.resumeStatus) {
      toast.error("กรุณาอัพโหลด Resume ก่อนสมัครงาน");
      router.push("/profile");
      return;
    }

    if (!student.resumeApproved) {
      toast.error("กรุณารอการอนุมัติ Resume จากอาจารย์ที่ปรึกษาก่อนสมัครงาน");
      return;
    }

    setIsApplying(true);
    try {
      const response = await fetch("/api/internships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.id,
          companyId: job?.company.id,
          jobPositionId: jobId,
          isSend: "0",
          isConfirm: "0",
          status: "pending",
        }),
      });

      if (response.ok) {
        toast.success("สมัครงานสำเร็จ");
        setHasApplied(true);
        router.push("/internship");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "เกิดข้อผิดพลาดในการสมัครงาน");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการสมัครงาน");
    } finally {
      setIsApplying(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "ไม่ระบุ";
    try {
      return format(new Date(dateString), "d MMM yyyy", { locale: th });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <LandingNav />
        <main className="pt-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="mt-4 text-muted-foreground">กำลังโหลดข้อมูล...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!job) {
    return null;
  }

  const canApply = 
    currentSession?.user?.role === "student" &&
    student &&
    student.resumeStatus &&
    student.resumeApproved &&
    !hasApplied;

  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <main className="pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back Button */}
          <Link href="/jobs">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              กลับไปยังรายการตำแหน่งงาน
            </Button>
          </Link>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-3xl mb-2">{job.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 text-lg">
                        <Building2 className="h-5 w-5" />
                        {job.company.name}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {job.location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                    )}
                    {(job.startDate || job.endDate) && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {formatDate(job.startDate)} - {formatDate(job.endDate)}
                        </span>
                      </div>
                    )}
                    {job.maxApplicants && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>รับ {job.maxApplicants} คน</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Job Description */}
              {job.description && (
                <Card>
                  <CardHeader>
                    <CardTitle>รายละเอียดงาน</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {job.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Requirements */}
              {job.requirements && (
                <Card>
                  <CardHeader>
                    <CardTitle>คุณสมบัติ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {job.requirements}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Company Info */}
              <Card>
                <CardHeader>
                  <CardTitle>เกี่ยวกับบริษัท</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1">ชื่อบริษัท</p>
                    <p className="text-muted-foreground">{job.company.name}</p>
                  </div>
                  {job.company.type && (
                    <div>
                      <p className="text-sm font-medium mb-1">ประเภท</p>
                      <p className="text-muted-foreground">{job.company.type}</p>
                    </div>
                  )}
                  {job.company.activities && (
                    <div>
                      <p className="text-sm font-medium mb-1">กิจกรรมหลัก</p>
                      <p className="text-muted-foreground">{job.company.activities}</p>
                    </div>
                  )}
                  <Link href={`/companies/public?companyId=${job.company.id}`}>
                    <Button variant="outline" size="sm">
                      ดูข้อมูลบริษัทเพิ่มเติม
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Apply Card */}
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>สมัครงาน</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!currentSession?.user ? (
                    <>
                      <p className="text-sm text-muted-foreground">
                        กรุณาเข้าสู่ระบบเพื่อสมัครงาน
                      </p>
                      <Button asChild className="w-full">
                        <Link href={`/login?callbackUrl=/jobs/${jobId}`}>
                          เข้าสู่ระบบ
                        </Link>
                      </Button>
                      <Button variant="outline" asChild className="w-full">
                        <Link href="/register">สมัครสมาชิก</Link>
                      </Button>
                    </>
                  ) : currentSession.user.role !== "student" ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">
                        เฉพาะนักศึกษาที่สามารถสมัครงานได้
                      </p>
                    </div>
                  ) : !student?.resumeStatus ? (
                    <>
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                            ยังไม่อัพโหลด Resume
                          </p>
                          <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                            กรุณาอัพโหลด Resume ก่อนสมัครงาน
                          </p>
                        </div>
                      </div>
                      <Button asChild className="w-full">
                        <Link href="/profile">
                          <FileText className="mr-2 h-4 w-4" />
                          อัพโหลด Resume
                        </Link>
                      </Button>
                    </>
                  ) : !student.resumeApproved ? (
                    <>
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                            รอการอนุมัติ Resume
                          </p>
                          <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                            Resume ของคุณกำลังรอการอนุมัติจากอาจารย์ที่ปรึกษา
                          </p>
                        </div>
                      </div>
                      <Button disabled className="w-full">
                        <FileText className="mr-2 h-4 w-4" />
                        รอการอนุมัติ Resume
                      </Button>
                    </>
                  ) : hasApplied ? (
                    <>
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-800 dark:text-green-200">
                            สมัครแล้ว
                          </p>
                          <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                            คุณได้สมัครตำแหน่งนี้แล้ว
                          </p>
                        </div>
                      </div>
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/internship">
                          ดูสถานะการสมัคร
                        </Link>
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                        <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                            พร้อมสมัคร
                          </p>
                          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                            Resume ของคุณได้รับการอนุมัติแล้ว
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={handleApply}
                        disabled={isApplying}
                        className="w-full"
                      >
                        {isApplying ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            กำลังสมัคร...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            ส่ง Resume สมัครงาน
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Quick Info */}
              <Card>
                <CardHeader>
                  <CardTitle>ข้อมูลเพิ่มเติม</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium mb-1">วันที่ประกาศ</p>
                    <p className="text-muted-foreground">{formatDate(job.createdAt)}</p>
                  </div>
                  {job.maxApplicants && (
                    <div>
                      <p className="font-medium mb-1">จำนวนที่รับ</p>
                      <p className="text-muted-foreground">{job.maxApplicants} คน</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
