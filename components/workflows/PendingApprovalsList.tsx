"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ApprovalCard } from "./ApprovalCard";
import type { WorkflowApproval } from "@/types";
import Link from "next/link";

export function PendingApprovalsList() {
  const [approvals, setApprovals] = useState<
    (WorkflowApproval & {
      permissions?: {
        canApprove: boolean;
        canReject: boolean;
        canComment: boolean;
      };
    })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedApproval, setSelectedApproval] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  async function fetchPendingApprovals() {
    try {
      const response = await fetch("/api/workflows/approvals");
      if (response.ok) {
        const data = await response.json();
        // Fetch permissions for each approval
        const approvalsWithPermissions = await Promise.all(
          data.map(async (approval: WorkflowApproval) => {
            try {
              const permResponse = await fetch(
                `/api/workflows/approvals/${approval.id}`
              );
              if (permResponse.ok) {
                const permData = await permResponse.json();
                return {
                  ...approval,
                  permissions: permData.permissions,
                };
              }
            } catch (error) {
              console.error("Error fetching permissions:", error);
            }
            return approval;
          })
        );
        setApprovals(approvalsWithPermissions);
      }
    } catch (error) {
      console.error("Error fetching pending approvals:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div>Loading pending approvals...</div>;
  }

  if (approvals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>การอนุมัติที่รอดำเนินการ</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            ไม่มีการอนุมัติที่รอดำเนินการ
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>การอนุมัติที่รอดำเนินการ ({approvals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {approvals.map((approval) => (
              <div key={approval.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">รอการอนุมัติ</Badge>
                    <span className="text-sm text-muted-foreground">
                      Workflow Instance: {approval.workflowInstanceId.slice(0, 8)}...
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSelectedApproval(
                        selectedApproval === approval.id ? null : approval.id
                      )
                    }
                  >
                    {selectedApproval === approval.id ? "ซ่อน" : "ดูรายละเอียด"}
                  </Button>
                </div>
                {selectedApproval === approval.id && (
                  <ApprovalCard
                    approval={approval}
                    onAction={() => {
                      fetchPendingApprovals();
                      setSelectedApproval(null);
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
