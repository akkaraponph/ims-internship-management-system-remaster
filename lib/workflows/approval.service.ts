import { db } from "@/lib/db";
import {
  workflowApprovals,
  workflowApprovalHistory,
  workflowInstances,
  workflowSteps,
  users,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import type {
  WorkflowApproval,
  WorkflowApprovalHistory,
  WorkflowInstance,
} from "@/types";
import { transitionWorkflow } from "./workflow.service";
import { getStepApprovers } from "./workflow-step.service";
import { createNotification } from "@/lib/notifications/notification-service";

export interface CreateApprovalInput {
  workflowInstanceId: string;
  workflowStepId: string;
  sequence: number;
  requestorId: string;
  responsible?: boolean;
}

/**
 * Create an approval record for a step
 */
export async function createApproval(
  input: CreateApprovalInput
): Promise<WorkflowApproval> {
  const [approval] = await db
    .insert(workflowApprovals)
    .values({
      workflowInstanceId: input.workflowInstanceId,
      workflowStepId: input.workflowStepId,
      sequence: input.sequence,
      status: "pending",
      responsible: input.responsible || false,
      requestorId: input.requestorId,
      requestTime: new Date(),
    })
    .returning();

  // Create history record
  await db.insert(workflowApprovalHistory).values({
    workflowInstanceId: input.workflowInstanceId,
    workflowApprovalId: approval.id,
    action: "created",
    performedBy: input.requestorId,
    newStatus: "pending",
    createdAt: new Date(),
  });

  return approval;
}

/**
 * Get approvals for a specific step
 */
export async function getApprovalsForStep(
  workflowInstanceId: string,
  workflowStepId: string
): Promise<WorkflowApproval[]> {
  return await db
    .select()
    .from(workflowApprovals)
    .where(
      and(
        eq(workflowApprovals.workflowInstanceId, workflowInstanceId),
        eq(workflowApprovals.workflowStepId, workflowStepId)
      )
    );
}

/**
 * Get approval by ID
 */
export async function getApproval(
  approvalId: string
): Promise<WorkflowApproval | null> {
  const approvals = await db
    .select()
    .from(workflowApprovals)
    .where(eq(workflowApprovals.id, approvalId))
    .limit(1);

  return approvals.length > 0 ? approvals[0] : null;
}

/**
 * Check if user has permission to approve
 */
export async function checkApprovalPermissions(
  approvalId: string,
  userId: string
): Promise<{
  canApprove: boolean;
  canReject: boolean;
  canComment: boolean;
}> {
  const approval = await getApproval(approvalId);
  if (!approval) {
    return { canApprove: false, canReject: false, canComment: false };
  }

  // Get workflow instance
  const instance = await db
    .select()
    .from(workflowInstances)
    .where(eq(workflowInstances.id, approval.workflowInstanceId))
    .limit(1);

  if (instance.length === 0) {
    return { canApprove: false, canReject: false, canComment: false };
  }

  // Get step
  const step = await db
    .select()
    .from(workflowSteps)
    .where(eq(workflowSteps.id, approval.workflowStepId))
    .limit(1);

  if (step.length === 0) {
    return { canApprove: false, canReject: false, canComment: false };
  }

  // Get approvers for this step
  const approvers = await getStepApprovers(
    approval.workflowStepId,
    instance[0].resourceType,
    instance[0].resourceId
  );

  // Check if user is in the approvers list
  const userApprover = approvers.find((a) => a.userId === userId);

  if (!userApprover) {
    return { canApprove: false, canReject: false, canComment: false };
  }

  // Check if approval is already processed
  if (approval.status !== "pending") {
    return {
      canApprove: false,
      canReject: false,
      canComment: userApprover.canComment,
    };
  }

  return {
    canApprove: userApprover.canApprove,
    canReject: userApprover.canReject,
    canComment: userApprover.canComment,
  };
}

/**
 * Approve an approval request
 */
export async function approve(
  approvalId: string,
  approverId: string,
  comments?: string
): Promise<WorkflowApproval> {
  const approval = await getApproval(approvalId);
  if (!approval) {
    throw new Error("Approval not found");
  }

  // Check permissions
  const permissions = await checkApprovalPermissions(approvalId, approverId);
  if (!permissions.canApprove) {
    throw new Error("User does not have permission to approve");
  }

  if (approval.status !== "pending") {
    throw new Error("Approval is not pending");
  }

  // Update approval
  const [updated] = await db
    .update(workflowApprovals)
    .set({
      status: "approved",
      approverId: approverId,
      responseTime: new Date(),
      comments: comments || null,
      updatedAt: new Date(),
    })
    .where(eq(workflowApprovals.id, approvalId))
    .returning();

  // Create history record
  await db.insert(workflowApprovalHistory).values({
    workflowInstanceId: approval.workflowInstanceId,
    workflowApprovalId: approvalId,
    action: "approved",
    performedBy: approverId,
    previousStatus: "pending",
    newStatus: "approved",
    comments: comments || null,
    createdAt: new Date(),
  });

  // Notify requestor
  try {
    const requestor = await db
      .select()
      .from(users)
      .where(eq(users.id, approval.requestorId))
      .limit(1);

    if (requestor.length > 0) {
      const instance = await db
        .select()
        .from(workflowInstances)
        .where(eq(workflowInstances.id, approval.workflowInstanceId))
        .limit(1);

      if (instance.length > 0) {
        await createNotification({
          userId: requestor[0].id,
          type: instance[0].resourceType === "internship" ? "internship" : "student",
          title: "Approval Received",
          message: `Your ${instance[0].resourceType} has received an approval`,
          link: instance[0].resourceType === "internship" ? `/internships` : `/documents`,
          sendEmail: false,
        });
      }
    }
  } catch (error) {
    console.error("Error sending approval notification:", error);
  }

  // Try to transition workflow
  try {
    await transitionWorkflow(approval.workflowInstanceId);
  } catch (error) {
    console.error("Error transitioning workflow:", error);
  }

  return updated;
}

/**
 * Reject an approval request
 */
export async function reject(
  approvalId: string,
  approverId: string,
  comments?: string
): Promise<WorkflowApproval> {
  const approval = await getApproval(approvalId);
  if (!approval) {
    throw new Error("Approval not found");
  }

  // Check permissions
  const permissions = await checkApprovalPermissions(approvalId, approverId);
  if (!permissions.canReject) {
    throw new Error("User does not have permission to reject");
  }

  if (approval.status !== "pending") {
    throw new Error("Approval is not pending");
  }

  // Update approval
  const [updated] = await db
    .update(workflowApprovals)
    .set({
      status: "rejected",
      approverId: approverId,
      responseTime: new Date(),
      comments: comments || null,
      updatedAt: new Date(),
    })
    .where(eq(workflowApprovals.id, approvalId))
    .returning();

  // Create history record
  await db.insert(workflowApprovalHistory).values({
    workflowInstanceId: approval.workflowInstanceId,
    workflowApprovalId: approvalId,
    action: "rejected",
    performedBy: approverId,
    previousStatus: "pending",
    newStatus: "rejected",
    comments: comments || null,
    createdAt: new Date(),
  });

  // Notify requestor
  try {
    const requestor = await db
      .select()
      .from(users)
      .where(eq(users.id, approval.requestorId))
      .limit(1);

    if (requestor.length > 0) {
      const instance = await db
        .select()
        .from(workflowInstances)
        .where(eq(workflowInstances.id, approval.workflowInstanceId))
        .limit(1);

      if (instance.length > 0) {
        await createNotification({
          userId: requestor[0].id,
          type: instance[0].resourceType === "internship" ? "internship" : "student",
          title: "Approval Rejected",
          message: `Your ${instance[0].resourceType} has been rejected`,
          link: instance[0].resourceType === "internship" ? `/internships` : `/documents`,
          sendEmail: false,
        });
      }
    }
  } catch (error) {
    console.error("Error sending rejection notification:", error);
  }

  // Try to transition workflow (will mark as rejected)
  try {
    await transitionWorkflow(approval.workflowInstanceId);
  } catch (error) {
    console.error("Error transitioning workflow:", error);
  }

  return updated;
}

/**
 * Add comment to approval
 */
export async function addComment(
  approvalId: string,
  userId: string,
  comments: string
): Promise<WorkflowApproval> {
  const approval = await getApproval(approvalId);
  if (!approval) {
    throw new Error("Approval not found");
  }

  // Check permissions
  const permissions = await checkApprovalPermissions(approvalId, userId);
  if (!permissions.canComment) {
    throw new Error("User does not have permission to comment");
  }

  // Update approval with comment
  const [updated] = await db
    .update(workflowApprovals)
    .set({
      comments: comments,
      updatedAt: new Date(),
    })
    .where(eq(workflowApprovals.id, approvalId))
    .returning();

  // Create history record
  await db.insert(workflowApprovalHistory).values({
    workflowInstanceId: approval.workflowInstanceId,
    workflowApprovalId: approvalId,
    action: "commented",
    performedBy: userId,
    previousStatus: approval.status,
    newStatus: approval.status,
    comments: comments,
    createdAt: new Date(),
  });

  return updated;
}

/**
 * Get approval history for a workflow instance
 */
export async function getApprovalHistory(
  workflowInstanceId: string
): Promise<WorkflowApprovalHistory[]> {
  return await db
    .select()
    .from(workflowApprovalHistory)
    .where(eq(workflowApprovalHistory.workflowInstanceId, workflowInstanceId))
    .orderBy(workflowApprovalHistory.createdAt);
}

/**
 * Get pending approvals for a user
 */
export async function getPendingApprovalsForUser(
  userId: string
): Promise<WorkflowApproval[]> {
  // Get all pending approvals
  const allPending = await db
    .select()
    .from(workflowApprovals)
    .where(eq(workflowApprovals.status, "pending"));

  // Filter by user permissions
  const userApprovals: WorkflowApproval[] = [];

  for (const approval of allPending) {
    const permissions = await checkApprovalPermissions(approval.id, userId);
    if (permissions.canApprove || permissions.canReject) {
      userApprovals.push(approval);
    }
  }

  return userApprovals;
}
