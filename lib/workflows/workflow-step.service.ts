import { db } from "@/lib/db";
import {
  workflowSteps,
  workflowStepResponsibilities,
  users,
  directors,
  companyUsers,
  students,
  internships,
} from "@/lib/db/schema";
import { eq, and, or, inArray } from "drizzle-orm";
import type { WorkflowStep, WorkflowStepResponsibility, User } from "@/types";

export interface StepApprover {
  userId: string;
  responsibilityId: string;
  canApprove: boolean;
  canReject: boolean;
  canComment: boolean;
}

/**
 * Get the next steps in a workflow based on current step sequence
 */
export async function getNextSteps(
  workflowId: string,
  currentStepSequence: number
): Promise<WorkflowStep[]> {
  const steps = await db
    .select()
    .from(workflowSteps)
    .where(
      and(
        eq(workflowSteps.workflowId, workflowId),
        eq(workflowSteps.isActive, true),
        eq(workflowSteps.sequence, currentStepSequence + 1)
      )
    )
    .orderBy(workflowSteps.sequence);

  return steps;
}

/**
 * Check if a step is complete (all approvals done)
 */
export async function checkStepCompletion(
  workflowStepId: string,
  workflowInstanceId: string,
  approvals: Array<{ status: string; workflowStepId: string }>
): Promise<boolean> {
  // Get the step to check flow type
  const step = await db
    .select()
    .from(workflowSteps)
    .where(eq(workflowSteps.id, workflowStepId))
    .limit(1);

  if (step.length === 0) {
    return false;
  }

  const stepData = step[0];
  const stepApprovals = approvals.filter(
    (a) => a.workflowStepId === workflowStepId
  );

  // For sequential flow, just need one approval
  if (stepData.flowType === "sequential") {
    return stepApprovals.some((a) => a.status === "approved");
  }

  // For parallel flow, check if all required approvals are done
  if (stepData.flowType === "parallel") {
    // Get all responsibilities for this step
    const responsibilities = await db
      .select()
      .from(workflowStepResponsibilities)
      .where(
        and(
          eq(workflowStepResponsibilities.workflowStepId, workflowStepId),
          eq(workflowStepResponsibilities.isActive, true)
        )
      );

    if (stepData.requiresAll) {
      // Need all approvals
      const approvedCount = stepApprovals.filter(
        (a) => a.status === "approved"
      ).length;
      return approvedCount >= responsibilities.length;
    } else {
      // Need at least one approval
      return stepApprovals.some((a) => a.status === "approved");
    }
  }

  return false;
}

/**
 * Get list of users who can approve the current step
 */
export async function getStepApprovers(
  workflowStepId: string,
  resourceType: "internship" | "resume",
  resourceId: string,
  universityId?: string | null
): Promise<StepApprover[]> {
  // Get all responsibilities for this step
  const responsibilities = await db
    .select()
    .from(workflowStepResponsibilities)
    .where(
      and(
        eq(workflowStepResponsibilities.workflowStepId, workflowStepId),
        eq(workflowStepResponsibilities.isActive, true)
      )
    )
    .orderBy(workflowStepResponsibilities.priority);

  const approvers: StepApprover[] = [];

  for (const responsibility of responsibilities) {
    if (responsibility.responsibilityType === "role") {
      // Get all users with this role
      let roleUsers: User[] = [];

      if (responsibility.responsibilityId) {
        // Specific role ID
        roleUsers = await db
          .select()
          .from(users)
          .where(
            and(
              eq(users.customRoleId, responsibility.responsibilityId),
              eq(users.isActive, true)
            )
          );
      } else {
        // Role name (from enum) - this case is handled below for company role
        // For other roles (admin, director), we need the responsibilityId to be set
        // Skip for now as we need more context
      }

      for (const user of roleUsers) {
        approvers.push({
          userId: user.id,
          responsibilityId: responsibility.id,
          canApprove: responsibility.canApprove,
          canReject: responsibility.canReject,
          canComment: responsibility.canComment,
        });
      }
    } else if (responsibility.responsibilityType === "user") {
      // Specific user
      if (responsibility.responsibilityId) {
        const user = await db
          .select()
          .from(users)
          .where(
            and(
              eq(users.id, responsibility.responsibilityId),
              eq(users.isActive, true)
            )
          )
          .limit(1);

        if (user.length > 0) {
          approvers.push({
            userId: user[0].id,
            responsibilityId: responsibility.id,
            canApprove: responsibility.canApprove,
            canReject: responsibility.canReject,
            canComment: responsibility.canComment,
          });
        }
      }
    } else if (responsibility.responsibilityType === "director") {
      // All directors for the university
      if (universityId) {
        const directorRecords = await db
          .select({ userId: directors.userId })
          .from(directors)
          .where(eq(directors.universityId, universityId));

        const directorUserIds = directorRecords
          .map((d) => d.userId)
          .filter((id): id is string => id !== null);

        if (directorUserIds.length > 0) {
          const directorUsers = await db
            .select()
            .from(users)
            .where(
              and(
                inArray(users.id, directorUserIds),
                eq(users.isActive, true)
              )
            );

          for (const user of directorUsers) {
            approvers.push({
              userId: user.id,
              responsibilityId: responsibility.id,
              canApprove: responsibility.canApprove,
              canReject: responsibility.canReject,
              canComment: responsibility.canComment,
            });
          }
        }
      }
    }

    // For internship workflows, handle company role specially
    if (resourceType === "internship" && responsibility.responsibilityType === "role" && !responsibility.responsibilityId) {
      // This is likely a company role responsibility
      // Get company users for the internship's company
      const internshipRecords = await db
        .select({ companyId: internships.companyId })
        .from(internships)
        .where(eq(internships.id, resourceId))
        .limit(1);

      if (internshipRecords.length > 0 && internshipRecords[0].companyId) {
        const companyUserRecords = await db
          .select({ userId: companyUsers.userId })
          .from(companyUsers)
          .where(eq(companyUsers.companyId, internshipRecords[0].companyId!));

        const companyUserIds = companyUserRecords
          .map((cu) => cu.userId)
          .filter((id): id is string => id !== null);

        if (companyUserIds.length > 0) {
          const companyUsersList = await db
            .select()
            .from(users)
            .where(
              and(
                inArray(users.id, companyUserIds),
                eq(users.isActive, true)
              )
            );

          for (const user of companyUsersList) {
            approvers.push({
              userId: user.id,
              responsibilityId: responsibility.id,
              canApprove: responsibility.canApprove,
              canReject: responsibility.canReject,
              canComment: responsibility.canComment,
            });
          }
        }
      }
    } else if (responsibility.responsibilityType === "role" && !responsibility.responsibilityId) {
      // Handle other roles (admin, director) when responsibilityId is null
      // This means "any user with this role" - we'll skip for now as it's too broad
      // In practice, you'd want to specify which roles can approve
    }
  }

  return approvers;
}

/**
 * Get step by ID
 */
export async function getWorkflowStep(stepId: string): Promise<WorkflowStep | null> {
  const steps = await db
    .select()
    .from(workflowSteps)
    .where(eq(workflowSteps.id, stepId))
    .limit(1);

  return steps.length > 0 ? steps[0] : null;
}

/**
 * Get steps for a workflow
 */
export async function getWorkflowSteps(workflowId: string): Promise<WorkflowStep[]> {
  return await db
    .select()
    .from(workflowSteps)
    .where(
      and(
        eq(workflowSteps.workflowId, workflowId),
        eq(workflowSteps.isActive, true)
      )
    )
    .orderBy(workflowSteps.sequence);
}
