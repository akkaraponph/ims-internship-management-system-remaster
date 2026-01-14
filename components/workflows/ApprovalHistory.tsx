"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { WorkflowApprovalHistory } from "@/types";

interface ApprovalHistoryProps {
  instanceId: string;
}

export function ApprovalHistory({ instanceId }: ApprovalHistoryProps) {
  const [history, setHistory] = useState<WorkflowApprovalHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const response = await fetch(
          `/api/workflows/instances/${instanceId}/history`
        );
        if (response.ok) {
          const data = await response.json();
          setHistory(data);
        }
      } catch (error) {
        console.error("Error fetching approval history:", error);
      } finally {
        setLoading(false);
      }
    }

    if (instanceId) {
      fetchHistory();
    }
  }, [instanceId]);

  if (loading) {
    return <div>Loading history...</div>;
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ประวัติการอนุมัติ</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">ไม่มีประวัติ</p>
        </CardContent>
      </Card>
    );
  }

  const getActionLabel = (action: string) => {
    switch (action) {
      case "created":
        return "สร้าง";
      case "approved":
        return "อนุมัติ";
      case "rejected":
        return "ปฏิเสธ";
      case "commented":
        return "แสดงความคิดเห็น";
      case "cancelled":
        return "ยกเลิก";
      default:
        return action;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "approved":
        return "default";
      case "rejected":
        return "destructive";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>ประวัติการอนุมัติ</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.map((item, index) => (
            <div
              key={item.id}
              className="flex items-start gap-4 pb-4 border-b last:border-0"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={getActionColor(item.action)}>
                    {getActionLabel(item.action)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(item.createdAt).toLocaleString("th-TH")}
                  </span>
                </div>
                {item.comments && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.comments}
                  </p>
                )}
                {item.previousStatus && item.newStatus && (
                  <p className="text-xs text-muted-foreground">
                    {item.previousStatus} → {item.newStatus}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
