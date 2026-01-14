"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { WorkflowApproval } from "@/types";

interface ApprovalCardProps {
  approval: WorkflowApproval & {
    permissions?: {
      canApprove: boolean;
      canReject: boolean;
      canComment: boolean;
    };
  };
  onAction?: () => void;
}

export function ApprovalCard({ approval, onAction }: ApprovalCardProps) {
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(
    null
  );

  const handleAction = async (action: "approve" | "reject") => {
    if (!approval.permissions) {
      return;
    }

    if (action === "approve" && !approval.permissions.canApprove) {
      return;
    }

    if (action === "reject" && !approval.permissions.canReject) {
      return;
    }

    setLoading(true);
    setActionType(action);

    try {
      const response = await fetch(`/api/workflows/approvals/${approval.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          comments: comments || undefined,
        }),
      });

      if (response.ok) {
        if (onAction) {
          onAction();
        }
        setComments("");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to process approval");
      }
    } catch (error) {
      console.error("Error processing approval:", error);
      alert("Failed to process approval");
    } finally {
      setLoading(false);
      setActionType(null);
    }
  };

  const handleComment = async () => {
    if (!approval.permissions?.canComment || !comments.trim()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/workflows/approvals/${approval.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comments: comments,
        }),
      });

      if (response.ok) {
        if (onAction) {
          onAction();
        }
        setComments("");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to add comment");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    switch (approval.status) {
      case "approved":
        return <Badge variant="default">อนุมัติแล้ว</Badge>;
      case "rejected":
        return <Badge variant="destructive">ปฏิเสธ</Badge>;
      default:
        return <Badge variant="outline">รอการอนุมัติ</Badge>;
    }
  };

  const canTakeAction =
    approval.status === "pending" &&
    approval.permissions &&
    (approval.permissions.canApprove || approval.permissions.canReject);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>การอนุมัติ</span>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {approval.comments && (
          <div className="text-sm">
            <span className="font-medium">ความคิดเห็น:</span>
            <p className="text-muted-foreground mt-1">{approval.comments}</p>
          </div>
        )}

        {approval.responseTime && (
          <div className="text-sm text-muted-foreground">
            อนุมัติเมื่อ: {new Date(approval.responseTime).toLocaleString("th-TH")}
          </div>
        )}

        {canTakeAction && (
          <div className="space-y-2">
            <Textarea
              placeholder="เพิ่มความคิดเห็น (ไม่บังคับ)"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2">
              {approval.permissions?.canApprove && (
                <Button
                  onClick={() => handleAction("approve")}
                  disabled={loading && actionType !== "approve"}
                  variant="default"
                >
                  {loading && actionType === "approve"
                    ? "กำลังดำเนินการ..."
                    : "อนุมัติ"}
                </Button>
              )}
              {approval.permissions?.canReject && (
                <Button
                  onClick={() => handleAction("reject")}
                  disabled={loading && actionType !== "reject"}
                  variant="destructive"
                >
                  {loading && actionType === "reject"
                    ? "กำลังดำเนินการ..."
                    : "ปฏิเสธ"}
                </Button>
              )}
              {approval.permissions?.canComment && (
                <Button
                  onClick={handleComment}
                  disabled={loading || !comments.trim()}
                  variant="outline"
                >
                  เพิ่มความคิดเห็น
                </Button>
              )}
            </div>
          </div>
        )}

        {!canTakeAction && approval.status === "pending" && (
          <div className="text-sm text-muted-foreground">
            คุณไม่มีสิทธิ์ในการอนุมัติรายการนี้
          </div>
        )}
      </CardContent>
    </Card>
  );
}
