"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";
import type { Announcement } from "@/types";
import { useSession } from "next-auth/react";

export default function AnnouncementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchAnnouncement();
    }
  }, [params.id]);

  const fetchAnnouncement = async () => {
    try {
      const response = await fetch(`/api/announcements/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setAnnouncement(data);
        // Mark as read
        await fetch(`/api/announcements/${params.id}/read`, { method: "POST" });
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

  if (!announcement) {
    return <div>ไม่พบประกาศ</div>;
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        กลับ
      </Button>

      <Card>
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
            {new Date(announcement.createdAt).toLocaleDateString("th-TH", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap">{announcement.content}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
