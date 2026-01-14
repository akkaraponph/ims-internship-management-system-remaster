"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { WorkflowInstance, WorkflowStep, WorkflowApproval } from "@/types";

interface WorkflowStatusProps {
  instanceId: string;
}

export function WorkflowStatus({ instanceId }: WorkflowStatusProps) {
  const [instance, setInstance] = useState<WorkflowInstance | null>(null);
  const [currentStep, setCurrentStep] = useState<WorkflowStep | null>(null);
  const [approvals, setApprovals] = useState<WorkflowApproval[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWorkflowStatus() {
      try {
        const response = await fetch(`/api/workflows/instances/${instanceId}`);
        if (response.ok) {
          const data = await response.json();
          setInstance(data);
          setCurrentStep(data.currentStep);
          setApprovals(data.currentApprovals || []);
        }
      } catch (error) {
        console.error("Error fetching workflow status:", error);
      } finally {
        setLoading(false);
      }
    }

    if (instanceId) {
      fetchWorkflowStatus();
    }
  }, [instanceId]);

  if (loading) {
    return <div>Loading workflow status...</div>;
  }

  if (!instance) {
    return <div>Workflow instance not found</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "default";
      case "rejected":
        return "destructive";
      case "in_progress":
        return "secondary";
      case "pending":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "approved":
        return "อนุมัติแล้ว";
      case "rejected":
        return "ปฏิเสธ";
      case "in_progress":
        return "กำลังดำเนินการ";
      case "pending":
        return "รอดำเนินการ";
      case "cancelled":
        return "ยกเลิก";
      default:
        return status;
    }
  };

  const pendingCount = approvals.filter((a) => a.status === "pending").length;
  const approvedCount = approvals.filter((a) => a.status === "approved").length;
  const totalCount = approvals.length;
  const progress = totalCount > 0 ? (approvedCount / totalCount) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>สถานะการอนุมัติ</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">สถานะ:</span>
          <Badge variant={getStatusColor(instance.status)}>
            {getStatusLabel(instance.status)}
          </Badge>
        </div>

        {currentStep && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">ขั้นตอนปัจจุบัน:</span>
              <span className="text-sm text-muted-foreground">
                {currentStep.stepName}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {approvedCount} / {totalCount} อนุมัติแล้ว
            </div>
          </div>
        )}

        {approvals.length > 0 && (
          <div className="space-y-2">
            <span className="text-sm font-medium">การอนุมัติ:</span>
            <div className="space-y-1">
              {approvals.map((approval) => (
                <div
                  key={approval.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground">
                    {approval.status === "pending"
                      ? "รอการอนุมัติ"
                      : approval.status === "approved"
                      ? "อนุมัติแล้ว"
                      : "ปฏิเสธ"}
                  </span>
                  <Badge
                    variant={
                      approval.status === "approved"
                        ? "default"
                        : approval.status === "rejected"
                        ? "destructive"
                        : "outline"
                    }
                  >
                    {approval.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
