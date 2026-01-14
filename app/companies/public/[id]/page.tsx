"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Building2, 
  Phone, 
  User, 
  MapPin,
  Briefcase,
  ArrowLeft,
  Mail,
  Calendar,
  CheckCircle,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LandingNav } from "@/components/landing/LandingNav";
import { Footer } from "@/components/landing/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface Company {
  id: string;
  name: string;
  type: string | null;
  activities: string | null;
  proposeTo: string | null;
  phone: string | null;
  contactPersonName: string | null;
  contactPersonPosition: string | null;
  contactPersonPhone: string | null;
  createdAt: string;
  activeJobsCount: number;
  address: {
    addressLine: string | null;
    provinceId: string | null;
    districtId: string | null;
    subDistrictId: string | null;
    postalCode: string | null;
  } | null;
}

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (companyId) {
      fetchCompanyDetails();
    }
  }, [companyId]);

  const fetchCompanyDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/companies/public/${companyId}`);
      if (response.ok) {
        const data = await response.json();
        setCompany(data);
      } else if (response.status === 404) {
        toast.error("ไม่พบข้อมูลบริษัท");
        router.push("/companies/public");
      } else {
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
        router.push("/companies/public");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      router.push("/companies/public");
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = () => {
    if (!company?.address) return null;
    const { addressLine, postalCode } = company.address;
    const parts = [addressLine, postalCode].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : null;
  };

  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-primary/10 via-primary/5 to-background py-16 overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(139,92,246,0.1),transparent_50%)]" />
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-6 hover:bg-primary/10"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              กลับ
            </Button>

            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-64" />
                <Skeleton className="h-6 w-96" />
              </div>
            ) : company ? (
              <div className="space-y-6 animate-fade-in-up">
                <div className="flex items-start gap-6">
                  <div className={cn(
                    "h-20 w-20 rounded-2xl flex items-center justify-center shadow-lg",
                    "bg-gradient-to-br from-primary to-purple-600",
                    "transform transition-all duration-300 hover:scale-110 hover:rotate-6"
                  )}>
                    <Building2 className="h-10 w-10 text-white" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-2">
                      {company.name}
                    </h1>
                    {company.type && (
                      <Badge variant="secondary" className="text-base px-3 py-1">
                        {company.type}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {/* Content Section */}
        <section className="relative py-12 overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
          <div className="absolute -top-8 -right-8 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {isLoading ? (
              <div className="space-y-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            ) : company ? (
              <div className="grid gap-6 lg:grid-cols-3 animate-fade-in-up">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Company Overview */}
                  <Card className="relative overflow-hidden border-2 border-primary/10 bg-gradient-to-br from-card/50 to-card backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:border-primary/20 hover:-translate-y-1">
                    <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
                    <CardHeader className="relative z-10">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        ข้อมูลบริษัท
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10 space-y-6">
                      {company.activities && (
                        <div>
                          <h3 className="text-sm font-semibold mb-2 text-muted-foreground">กิจกรรม/ธุรกิจ</h3>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap bg-muted/30 p-4 rounded-lg border border-border/50">
                            {company.activities}
                          </p>
                        </div>
                      )}
                      {company.proposeTo && (
                        <div>
                          <h3 className="text-sm font-semibold mb-2 text-muted-foreground">เสนอให้</h3>
                          <p className="text-sm bg-muted/30 p-4 rounded-lg border border-border/50">
                            {company.proposeTo}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Contact Information */}
                  <Card className="relative overflow-hidden border-2 border-primary/10 bg-gradient-to-br from-card/50 to-card backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:border-primary/20 hover:-translate-y-1">
                    <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
                    <CardHeader className="relative z-10">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Phone className="h-5 w-5 text-primary" />
                        ข้อมูลติดต่อ
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <div className="grid gap-4 md:grid-cols-2">
                        {company.phone && (
                          <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 border border-border/50">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                              <Phone className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-medium text-muted-foreground mb-1">เบอร์โทรศัพท์</p>
                              <p className="text-sm font-semibold">{company.phone}</p>
                            </div>
                          </div>
                        )}
                        {company.contactPersonName && (
                          <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 border border-border/50">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                              <User className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-medium text-muted-foreground mb-1">ผู้ติดต่อ</p>
                              <p className="text-sm font-semibold">
                                {company.contactPersonName}
                                {company.contactPersonPosition && (
                                  <span className="text-muted-foreground font-normal"> ({company.contactPersonPosition})</span>
                                )}
                              </p>
                            </div>
                          </div>
                        )}
                        {company.contactPersonPhone && (
                          <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 border border-border/50">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0">
                              <Phone className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-medium text-muted-foreground mb-1">เบอร์ติดต่อ</p>
                              <p className="text-sm font-semibold">{company.contactPersonPhone}</p>
                            </div>
                          </div>
                        )}
                        {formatAddress() && (
                          <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 border border-border/50">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                              <MapPin className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-medium text-muted-foreground mb-1">ที่อยู่</p>
                              <p className="text-sm font-semibold">{formatAddress()}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Quick Stats */}
                  <Card className="relative overflow-hidden border-2 border-primary/10 bg-gradient-to-br from-card/50 to-card backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:border-primary/20 hover:-translate-y-1 sticky top-24">
                    <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
                    <CardHeader className="relative z-10">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-primary" />
                        ตำแหน่งงาน
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10 space-y-4">
                      <div className="text-center p-6 rounded-lg bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20">
                        <div className="text-4xl font-bold text-primary mb-2">
                          {company.activeJobsCount}
                        </div>
                        <p className="text-sm text-muted-foreground">ตำแหน่งงานที่เปิดรับ</p>
                      </div>
                      <Button asChild className="w-full" size="lg">
                        <Link href={`/jobs?companyId=${company.id}`}>
                          <Briefcase className="mr-2 h-4 w-4" />
                          ดูตำแหน่งงานทั้งหมด
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Company Info */}
                  <Card className="relative overflow-hidden border-2 border-primary/10 bg-gradient-to-br from-card/50 to-card backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:border-primary/20 hover:-translate-y-1">
                    <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
                    <CardHeader className="relative z-10">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-primary" />
                        ข้อมูลเพิ่มเติม
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10 space-y-4">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">เข้าร่วมเมื่อ</p>
                          <p className="text-sm font-semibold">
                            {format(new Date(company.createdAt), "d MMMM yyyy", { locale: th })}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
                </div>
                <div className="relative z-10">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 mb-4">
                    <Building2 className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">ไม่พบข้อมูลบริษัท</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    ไม่สามารถโหลดข้อมูลบริษัทได้ในขณะนี้
                  </p>
                  <Button onClick={() => router.push("/companies/public")} className="mt-4">
                    กลับไปหน้ารายชื่อบริษัท
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
