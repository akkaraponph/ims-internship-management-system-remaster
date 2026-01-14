"use client";

import { useState, useEffect } from "react";
import { 
  Megaphone, 
  Search,
  Filter,
  X,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  ChevronLeft,
  ChevronRight
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: "info" | "warning" | "success" | "error";
  priority: "low" | "medium" | "high";
  createdAt: string;
  expiresAt: string | null;
}

interface AnnouncementsResponse {
  announcements: Announcement[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const typeIcons = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  error: XCircle,
};

const typeColors = {
  info: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  warning: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  success: "bg-green-500/10 text-green-500 border-green-500/20",
  error: "bg-red-500/10 text-red-500 border-red-500/20",
};

const priorityColors = {
  low: "bg-gray-500/10 text-gray-500",
  medium: "bg-orange-500/10 text-orange-500",
  high: "bg-red-500/10 text-red-500",
};

export default function PublicAnnouncementsPage() {
  const [data, setData] = useState<AnnouncementsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    fetchAnnouncements();
  }, [page, searchQuery, typeFilter, priorityFilter]);

  const fetchAnnouncements = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (typeFilter) params.append("type", typeFilter);
      if (priorityFilter) params.append("priority", priorityFilter);
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const response = await fetch(`/api/announcements/public?${params.toString()}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchAnnouncements();
  };

  const clearFilters = () => {
    setSearchQuery("");
    setTypeFilter("");
    setPriorityFilter("");
    setPage(1);
  };

  const handleViewDetails = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsDialogOpen(true);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    try {
      return format(new Date(dateString), "d MMM yyyy HH:mm", { locale: th });
    } catch {
      return dateString;
    }
  };

  const getTypeIcon = (type: Announcement["type"]) => {
    const Icon = typeIcons[type];
    return <Icon className="h-5 w-5" />;
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
                ประกาศข่าวสาร
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                ติดตามข่าวสารและประกาศสำคัญจากระบบ
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
                    placeholder="ค้นหาประกาศ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <Select value={typeFilter || "all"} onValueChange={(value) => setTypeFilter(value === "all" ? "" : value)}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="ทุกประเภท" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุกประเภท</SelectItem>
                  <SelectItem value="info">ข้อมูล</SelectItem>
                  <SelectItem value="warning">คำเตือน</SelectItem>
                  <SelectItem value="success">สำเร็จ</SelectItem>
                  <SelectItem value="error">ข้อผิดพลาด</SelectItem>
                </SelectContent>
              </Select>

              {/* Priority Filter */}
              <Select value={priorityFilter || "all"} onValueChange={(value) => setPriorityFilter(value === "all" ? "" : value)}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="ทุกความสำคัญ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุกความสำคัญ</SelectItem>
                  <SelectItem value="low">ต่ำ</SelectItem>
                  <SelectItem value="medium">ปานกลาง</SelectItem>
                  <SelectItem value="high">สูง</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              {(searchQuery || typeFilter || priorityFilter) && (
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

        {/* Announcements List */}
        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="mt-4 text-muted-foreground">กำลังโหลดข้อมูล...</p>
              </div>
            ) : !data || data.announcements.length === 0 ? (
              <div className="text-center py-12">
                <Megaphone className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">ไม่พบประกาศ</h3>
                <p className="mt-2 text-muted-foreground">
                  ลองเปลี่ยนเงื่อนไขการค้นหาหรือกรองข้อมูล
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground">
                    พบ {data.pagination.total} ประกาศ
                  </p>
                </div>
                <div className="space-y-4">
                  {data.announcements.map((announcement) => (
                    <Card
                      key={announcement.id}
                      className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => handleViewDetails(announcement)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className={cn("p-2 rounded-lg", typeColors[announcement.type])}>
                                {getTypeIcon(announcement.type)}
                              </div>
                              <CardTitle className="text-lg">{announcement.title}</CardTitle>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className={cn(typeColors[announcement.type])}>
                                {announcement.type === "info" && "ข้อมูล"}
                                {announcement.type === "warning" && "คำเตือน"}
                                {announcement.type === "success" && "สำเร็จ"}
                                {announcement.type === "error" && "ข้อผิดพลาด"}
                              </Badge>
                              <Badge variant="outline" className={priorityColors[announcement.priority]}>
                                {announcement.priority === "low" && "ความสำคัญต่ำ"}
                                {announcement.priority === "medium" && "ความสำคัญปานกลาง"}
                                {announcement.priority === "high" && "ความสำคัญสูง"}
                              </Badge>
                              {formatDate(announcement.createdAt) && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Calendar className="h-4 w-4" />
                                  {formatDate(announcement.createdAt)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {announcement.content}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {data.pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      ก่อนหน้า
                    </Button>
                    <div className="text-sm text-muted-foreground">
                      หน้า {page} จาก {data.pagination.totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                      disabled={page === data.pagination.totalPages}
                    >
                      ถัดไป
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />

      {/* Announcement Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedAnnouncement && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn("p-2 rounded-lg", typeColors[selectedAnnouncement.type])}>
                    {getTypeIcon(selectedAnnouncement.type)}
                  </div>
                  <DialogTitle className="text-2xl">{selectedAnnouncement.title}</DialogTitle>
                </div>
                <DialogDescription>
                  <div className="flex items-center gap-2 flex-wrap mt-2">
                    <Badge variant="outline" className={cn(typeColors[selectedAnnouncement.type])}>
                      {selectedAnnouncement.type === "info" && "ข้อมูล"}
                      {selectedAnnouncement.type === "warning" && "คำเตือน"}
                      {selectedAnnouncement.type === "success" && "สำเร็จ"}
                      {selectedAnnouncement.type === "error" && "ข้อผิดพลาด"}
                    </Badge>
                    <Badge variant="outline" className={priorityColors[selectedAnnouncement.priority]}>
                      {selectedAnnouncement.priority === "low" && "ความสำคัญต่ำ"}
                      {selectedAnnouncement.priority === "medium" && "ความสำคัญปานกลาง"}
                      {selectedAnnouncement.priority === "high" && "ความสำคัญสูง"}
                    </Badge>
                    {formatDate(selectedAnnouncement.createdAt) && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {formatDate(selectedAnnouncement.createdAt)}
                      </div>
                    )}
                    {selectedAnnouncement.expiresAt && formatDate(selectedAnnouncement.expiresAt) && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        หมดอายุ: {formatDate(selectedAnnouncement.expiresAt)}
                      </div>
                    )}
                  </div>
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedAnnouncement.content}
                  </p>
                </div>
                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full">
                    ปิด
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
