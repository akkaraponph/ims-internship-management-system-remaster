"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Briefcase, 
  Building2, 
  MapPin, 
  Calendar, 
  Users, 
  Search,
  Filter,
  X,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LandingNav } from "@/components/landing/LandingNav";
import { Footer } from "@/components/landing/Footer";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import Link from "next/link";
import { toast } from "sonner";

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

export default function JobsPage() {
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<JobPosition[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [locationFilter, setLocationFilter] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [companies, setCompanies] = useState<Array<{ id: string; name: string }>>([]);
  const [locations, setLocations] = useState<string[]>([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [jobs, searchQuery, locationFilter, companyFilter]);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (locationFilter) params.append("location", locationFilter);
      if (companyFilter) params.append("companyId", companyFilter);

      const response = await fetch(`/api/jobs/public?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
        setFilteredJobs(data);
        
        // Extract unique companies and locations
        const uniqueCompanies = Array.from(
          new Map(data.map((job: JobPosition) => [job.company.id, job.company])).values()
        );
        setCompanies(uniqueCompanies.map(c => ({ id: c.id, name: c.name })));
        
        const uniqueLocations = Array.from(
          new Set(data.map((job: JobPosition) => job.location).filter(Boolean))
        ) as string[];
        setLocations(uniqueLocations);
      } else {
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...jobs];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.description?.toLowerCase().includes(query) ||
          job.company.name.toLowerCase().includes(query) ||
          job.location?.toLowerCase().includes(query)
      );
    }

    if (locationFilter) {
      filtered = filtered.filter((job) => job.location === locationFilter);
    }

    if (companyFilter) {
      filtered = filtered.filter((job) => job.company.id === companyFilter);
    }

    setFilteredJobs(filtered);
  };

  const handleSearch = () => {
    applyFilters();
  };

  const clearFilters = () => {
    setSearchQuery("");
    setLocationFilter("");
    setCompanyFilter("");
  };


  const formatDate = (dateString: string | null) => {
    if (!dateString) return "ไม่ระบุ";
    try {
      return format(new Date(dateString), "d MMM yyyy", { locale: th });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/10 to-background py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                ตำแหน่งงานฝึกงาน
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                ค้นหาตำแหน่งงานฝึกงานที่เหมาะกับคุณจากบริษัทชั้นนำ
              </p>
            </div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="border-b bg-card py-6 sticky top-16 z-30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="ค้นหาตำแหน่งงาน, บริษัท, หรือสถานที่..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Location Filter */}
              <Select value={locationFilter || "all"} onValueChange={(value) => setLocationFilter(value === "all" ? "" : value)}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <MapPin className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="ทุกสถานที่" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุกสถานที่</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Company Filter */}
              <Select value={companyFilter || "all"} onValueChange={(value) => setCompanyFilter(value === "all" ? "" : value)}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <Building2 className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="ทุกบริษัท" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุกบริษัท</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              {(searchQuery || locationFilter || companyFilter) && (
                <Button variant="outline" onClick={clearFilters}>
                  <X className="mr-2 h-4 w-4" />
                  ล้าง
                </Button>
              )}

              <Button onClick={handleSearch}>
                <Search className="mr-2 h-4 w-4" />
                ค้นหา
              </Button>
            </div>
          </div>
        </section>

        {/* Jobs List */}
        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="mt-4 text-muted-foreground">กำลังโหลดข้อมูล...</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">ไม่พบตำแหน่งงาน</h3>
                <p className="mt-2 text-muted-foreground">
                  ลองเปลี่ยนเงื่อนไขการค้นหาหรือกรองข้อมูล
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground">
                    พบ {filteredJobs.length} ตำแหน่งงาน
                  </p>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredJobs.map((job) => (
                    <Card
                      key={job.id}
                      className="hover:shadow-lg transition-shadow"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-2">{job.title}</CardTitle>
                            <CardDescription className="flex items-center gap-1">
                              <Building2 className="h-4 w-4" />
                              {job.company.name}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {job.location && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              {job.location}
                            </div>
                          )}
                          {(job.startDate || job.endDate) && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {formatDate(job.startDate)} - {formatDate(job.endDate)}
                            </div>
                          )}
                          {job.maxApplicants && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Users className="h-4 w-4" />
                              รับ {job.maxApplicants} คน
                            </div>
                          )}
                          {job.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {job.description}
                            </p>
                          )}
                          <Button 
                            className="w-full mt-4" 
                            variant="outline"
                            asChild
                          >
                            <Link href={`/jobs/${job.id}`}>
                              ดูรายละเอียด
                              <ExternalLink className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
