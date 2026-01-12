"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import type { Announcement } from "@/types";

export default function AnnouncementsPage() {
  const { data: session } = useSession();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const canCreate = session?.user?.role === "admin" || 
                   session?.user?.role === "director" || 
                   session?.user?.role === "super-admin";

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch("/api/announcements?includeRead=true");
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data);
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการโหลดประกาศ");
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4" />;
      case "error":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  if (loading) {
    return <div>กำลังโหลด...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">ประกาศข่าวสาร</h2>
          <p className="text-muted-foreground">ดูประกาศและข่าวสารจากระบบ</p>
        </div>
        {canCreate && (
          <Link href="/announcements/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              สร้างประกาศใหม่
            </Button>
          </Link>
        )}
      </div>

      {announcements.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">ยังไม่มีประกาศ</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={getTypeColor(announcement.type)}>
                      {getTypeIcon(announcement.type)}
                    </div>
                    <CardTitle>{announcement.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{announcement.priority}</Badge>
                    {announcement.type && (
                      <Badge className={getTypeColor(announcement.type)}>
                        {announcement.type}
                      </Badge>
                    )}
                  </div>
                </div>
                <CardDescription>
                  {new Date(announcement.createdAt).toLocaleDateString("th-TH")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{announcement.content}</p>
                <div className="mt-4">
                  <Link href={`/announcements/${announcement.id}`}>
                    <Button variant="outline" size="sm">
                      อ่านเพิ่มเติม
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
