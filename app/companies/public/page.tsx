"use client";

import { useState, useEffect } from "react";
import { 
  Building2, 
  Search,
  Grid3x3,
  List,
  Briefcase,
  Filter,
  X
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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
}

export default function PublicCompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [types, setTypes] = useState<string[]>([]);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [companies, searchQuery, typeFilter]);

  const fetchCompanies = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (typeFilter) params.append("type", typeFilter);

      const response = await fetch(`/api/companies/public?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
        setFilteredCompanies(data);
        
        // Extract unique types
        const uniqueTypes = Array.from(
          new Set(data.map((company: Company) => company.type).filter(Boolean))
        ) as string[];
        setTypes(uniqueTypes);
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
    let filtered = [...companies];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (company) =>
          company.name.toLowerCase().includes(query) ||
          company.type?.toLowerCase().includes(query) ||
          company.activities?.toLowerCase().includes(query)
      );
    }

    if (typeFilter) {
      filtered = filtered.filter((company) => company.type === typeFilter);
    }

    setFilteredCompanies(filtered);
  };

  const handleSearch = () => {
    applyFilters();
  };

  const clearFilters = () => {
    setSearchQuery("");
    setTypeFilter("");
  };

  const handleViewDetails = (company: Company) => {
    router.push(`/companies/public/${company.id}`);
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
                บริษัทที่เข้าร่วมโครงการ
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                ดูรายชื่อบริษัทที่เข้าร่วมโครงการฝึกงานและตำแหน่งงานที่เปิดรับ
              </p>
            </div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="border-b bg-card py-6 sticky top-16 z-30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              {/* Search */}
              <div className="flex-1 w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="ค้นหาบริษัท..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <Select value={typeFilter || "all"} onValueChange={(value) => setTypeFilter(value === "all" ? "" : value)}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="ทุกประเภท" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุกประเภท</SelectItem>
                  {types.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="flex gap-2 border rounded-md p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Clear Filters */}
              {(searchQuery || typeFilter) && (
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

        {/* Companies List */}
        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="mt-4 text-muted-foreground">กำลังโหลดข้อมูล...</p>
              </div>
            ) : filteredCompanies.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">ไม่พบบริษัท</h3>
                <p className="mt-2 text-muted-foreground">
                  ลองเปลี่ยนเงื่อนไขการค้นหาหรือกรองข้อมูล
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground">
                    พบ {filteredCompanies.length} บริษัท
                  </p>
                </div>
                {viewMode === "grid" ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredCompanies.map((company) => (
                      <Card
                        key={company.id}
                        className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => handleViewDetails(company)}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg mb-2">{company.name}</CardTitle>
                              {company.type && (
                                <CardDescription>{company.type}</CardDescription>
                              )}
                            </div>
                            <Badge variant="secondary" className="ml-2">
                              <Briefcase className="mr-1 h-3 w-3" />
                              {company.activeJobsCount}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {company.activities && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {company.activities}
                              </p>
                            )}
                            <Button 
                              className="w-full mt-4" 
                              variant="outline"
                              onClick={() => handleViewDetails(company)}
                            >
                              ดูรายละเอียด
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredCompanies.map((company) => (
                      <Card
                        key={company.id}
                        className="hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleViewDetails(company)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-start gap-4">
                                <div className="flex-1">
                                  <h3 className="text-lg font-semibold mb-1">{company.name}</h3>
                                  {company.type && (
                                    <p className="text-sm text-muted-foreground mb-2">
                                      {company.type}
                                    </p>
                                  )}
                                  {company.activities && (
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                      {company.activities}
                                    </p>
                                  )}
                                </div>
                                <Badge variant="secondary">
                                  <Briefcase className="mr-1 h-3 w-3" />
                                  {company.activeJobsCount} ตำแหน่ง
                                </Badge>
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewDetails(company)}
                            >
                              ดูรายละเอียด
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
