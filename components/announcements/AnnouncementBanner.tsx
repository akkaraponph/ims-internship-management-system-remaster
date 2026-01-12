"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";
import Link from "next/link";
import type { Announcement } from "@/types";

export function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchUnreadAnnouncements();
  }, []);

  const fetchUnreadAnnouncements = async () => {
    try {
      const response = await fetch("/api/announcements/unread");
      if (response.ok) {
        const data = await response.json();
        // Filter high priority announcements for banner
        const highPriority = data.filter(
          (a: Announcement) => a.priority === "high" && a.isActive
        );
        setAnnouncements(highPriority.slice(0, 3)); // Show max 3
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
    }
  };

  const handleDismiss = (id: string) => {
    setDismissed(new Set([...dismissed, id]));
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
        return "border-green-500 bg-green-50";
      case "warning":
        return "border-yellow-500 bg-yellow-50";
      case "error":
        return "border-red-500 bg-red-50";
      default:
        return "border-blue-500 bg-blue-50";
    }
  };

  const visibleAnnouncements = announcements.filter((a) => !dismissed.has(a.id));

  if (visibleAnnouncements.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {visibleAnnouncements.map((announcement) => (
        <Card
          key={announcement.id}
          className={`${getTypeColor(announcement.type)} border-l-4`}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{getTypeIcon(announcement.type)}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold">{announcement.title}</h4>
                  <Badge variant="outline" className="text-xs">
                    {announcement.priority}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {announcement.content}
                </p>
                <Link href={`/announcements/${announcement.id}`}>
                  <Button variant="link" size="sm" className="p-0 h-auto mt-1">
                    อ่านเพิ่มเติม →
                  </Button>
                </Link>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleDismiss(announcement.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
