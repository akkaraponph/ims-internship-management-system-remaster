import { db } from "@/lib/db";
import {
  workflows,
  workflowInstances,
  workflowSteps,
  workflowApprovals,
  users,
  internships,
  students,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import type {
  Workflow,
  WorkflowInstance,
  WorkflowStep,
  WorkflowApproval,
} from "@/types";
import {
  getNextSteps,
  checkStepCompletion,
  getStepApprovers,
} from "./workflow-step.service";
import { createApproval, getApprovalsForStep } from "./approval.service";
import { createNotification } from "@/lib/notifications/notification-service";

export interface CreateWorkflowInstanceInput {
  workflowId: string;
  resourceType: "internship" | "resume";
  resourceId: string;
  createdBy: string;
}

/**
 * Create a new workflow instance for a resource
 */
export async function createWorkflowInstance(
  input: CreateWorkflowInstanceInput
): Promise<WorkflowInstance> {
  // Check if workflow exists
  const workflowRecords = await db
    .select()
    .from(workflows)
    .where(
      and(
        eq(workflows.id, input.workflowId),
        eq(workflows.status, "active")
      )
    )
    .limit(1);

  if (workflowRecords.length === 0) {
    throw new Error("Workflow not found or inactive");
  }

  // Check if instance already exists
  const existingInstances = await db
    .select()
    .from(workflowInstances)
    .where(
      and(
        eq(workflowInstances.resourceType, input.resourceType),
        eq(workflowInstances.resourceId, input.resourceId)
      )
    )
    .limit(1);

  if (existingInstances.length > 0) {
    return existingInstances[0];
  }

  // Create workflow instance
  const [instance] = await db
    .insert(workflowInstances)
    .values({
      workflowId: input.workflowId,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      status: "pending",
      currentStepSequence: 1,
      createdBy: input.createdBy,
    })
    .returning();

  // Get first step and create initial approvals
  const firstSteps = await getNextSteps(input.workflowId, 0);
  
  if (firstSteps.length > 0) {
    // Get university ID for context
    let universityId: string | null = null;
    
    if (input.resourceType === "internship") {
      const internshipRecords = await db
        .select({ studentId: internships.studentId })
        .from(internships)
        .where(eq(internships.id, input.resourceId))
        .limit(1);

      if (internshipRecords.length > 0 && internshipRecords[0].studentId) {
        const studentRecords = await db
          .select({ universityId: students.universityId })
          .from(students)
          .where(eq(students.id, internshipRecords[0].studentId!))
          .limit(1);

        if (studentRecords.length > 0) {
          universityId = studentRecords[0].universityId;
        }
      }
    } else if (input.resourceType === "resume") {
      const studentRecords = await db
        .select({ universityId: students.universityId })
        .from(students)
        .where(eq(students.id, input.resourceId))
        .limit(1);

      if (studentRecords.length > 0) {
        universityId = studentRecords[0].universityId;
      }
    }

    // Create approvals for first step
    for (const step of firstSteps) {
      const approvers = await getStepApprovers(
        step.id,
        input.resourceType,
        input.resourceId,
        universityId || undefined
      );

      for (const approver of approvers) {
        await createApproval({
          workflowInstanceId: instance.id,
          workflowStepId: step.id,
          sequence: step.sequence,
          requestorId: input.createdBy,
          responsible: approver.canApprove,
        });
      }
    }

    // Update instance status
    await db
      .update(workflowInstances)
      .set({
        status: "in_progress",
        updatedAt: new Date(),
      })
      .where(eq(workflowInstances.id, instance.id));

    instance.status = "in_progress";
  }

  return instance;
}

/**
 * Get workflow instance by ID
 */
export async function getWorkflowInstance(
  instanceId: string
): Promise<WorkflowInstance | null> {
  const instances = await db
    .select()
    .from(workflowInstances)
    .where(eq(workflowInstances.id, instanceId))
    .limit(1);

  return instances.length > 0 ? instances[0] : null;
}

/**
 * Get workflow instance by resource
 */
export async function getWorkflowInstanceByResource(
  resourceType: "internship" | "resume",
  resourceId: string
): Promise<WorkflowInstance | null> {
  const instances = await db
    .select()
    .from(workflowInstances)
    .where(
      and(
        eq(workflowInstances.resourceType, resourceType),
        eq(workflowInstances.resourceId, resourceId)
      )
    )
    .limit(1);

  return instances.length > 0 ? instances[0] : null;
}

/**
 * Get current step for a workflow instance
 */
export async function getCurrentStep(
  instanceId: string
): Promise<{ step: WorkflowStep | null; approvals: WorkflowApproval[] }> {
  const instance = await getWorkflowInstance(instanceId);
  if (!instance) {
    return { step: null, approvals: [] };
  }

  const steps = await db
    .select()
    .from(workflowSteps)
    .where(
      and(
        eq(workflowSteps.workflowId, instance.workflowId),
        eq(workflowSteps.sequence, instance.currentStepSequence || 1),
        eq(workflowSteps.isActive, true)
      )
    )
    .limit(1);

  const step = steps.length > 0 ? steps[0] : null;

  if (!step) {
    return { step: null, approvals: [] };
  }

  const approvals = await getApprovalsForStep(instanceId, step.id);

  return { step, approvals };
}

/**
 * Get pending approvals for a workflow instance
 */
export async function getPendingApprovals(
  instanceId: string
): Promise<WorkflowApproval[]> {
  const approvals = await db
    .select()
    .from(workflowApprovals)
    .where(
      and(
        eq(workflowApprovals.workflowInstanceId, instanceId),
        eq(workflowApprovals.status, "pending")
      )
    );

  return approvals;
}

/**
 * Transition workflow to next step
 */
export async function transitionWorkflow(
  instanceId: string
): Promise<WorkflowInstance | null> {
  const instance = await getWorkflowInstance(instanceId);
  if (!instance) {
    return null;
  }

  // Get current step approvals
  const currentStep = await getCurrentStep(instanceId);
  if (!currentStep.step) {
    return instance;
  }

  // Get all approvals for current step
  const allApprovals = await db
    .select()
    .from(workflowApprovals)
    .where(
      and(
        eq(workflowApprovals.workflowInstanceId, instanceId),
        eq(workflowApprovals.workflowStepId, currentStep.step.id)
      )
    );

  // Check if step is complete
  const isComplete = await checkStepCompletion(
    currentStep.step.id,
    instanceId,
    allApprovals.map((a) => ({
      status: a.status,
      workflowStepId: a.workflowStepId,
    }))
  );

  if (!isComplete) {
    return instance;
  }

  // Check if any approval was rejected
  const hasRejection = allApprovals.some((a) => a.status === "rejected");
  if (hasRejection) {
    // Update instance to rejected
    const [updated] = await db
      .update(workflowInstances)
      .set({
        status: "rejected",
        updatedAt: new Date(),
      })
      .where(eq(workflowInstances.id, instanceId))
      .returning();

    // Notify requestor
    try {
      const requestor = await db
        .select()
        .from(users)
        .where(eq(users.id, instance.createdBy))
        .limit(1);

      if (requestor.length > 0) {
        await createNotification({
          userId: requestor[0].id,
          type: instance.resourceType === "internship" ? "internship" : "student",
          title: "Workflow Rejected",
          message: `Your ${instance.resourceType} workflow has been rejected`,
          link: instance.resourceType === "internship" ? `/internships` : `/documents`,
          sendEmail: false,
        });
      }
    } catch (error) {
      console.error("Error sending rejection notification:", error);
    }

    return updated;
  }

  // Get next steps
  const nextSteps = await getNextSteps(
    instance.workflowId,
    instance.currentStepSequence || 1
  );

  if (nextSteps.length === 0) {
    // No more steps - workflow is complete
    const [updated] = await db
      .update(workflowInstances)
      .set({
        status: "approved",
        updatedAt: new Date(),
      })
      .where(eq(workflowInstances.id, instanceId))
      .returning();

    // Notify requestor
    try {
      const requestor = await db
        .select()
        .from(users)
        .where(eq(users.id, instance.createdBy))
        .limit(1);

      if (requestor.length > 0) {
        await createNotification({
          userId: requestor[0].id,
          type: instance.resourceType === "internship" ? "internship" : "student",
          title: "Workflow Approved",
          message: `Your ${instance.resourceType} workflow has been fully approved`,
          link: instance.resourceType === "internship" ? `/internships` : `/documents`,
          sendEmail: false,
        });
      }
    } catch (error) {
      console.error("Error sending approval notification:", error);
    }

    return updated;
  }

  // Move to next step
  const nextStepSequence = (instance.currentStepSequence || 1) + 1;
  const [updated] = await db
    .update(workflowInstances)
    .set({
      currentStepSequence: nextStepSequence,
      updatedAt: new Date(),
    })
    .where(eq(workflowInstances.id, instanceId))
    .returning();

  // Get university ID for context
  let universityId: string | null = null;
  
  if (instance.resourceType === "internship") {
    const internshipRecords = await db
      .select({ studentId: internships.studentId })
      .from(internships)
      .where(eq(internships.id, instance.resourceId))
      .limit(1);

    if (internshipRecords.length > 0 && internshipRecords[0].studentId) {
      const studentRecords = await db
        .select({ universityId: students.universityId })
        .from(students)
        .where(eq(students.id, internshipRecords[0].studentId!))
        .limit(1);

      if (studentRecords.length > 0) {
        universityId = studentRecords[0].universityId;
      }
    }
  } else if (instance.resourceType === "resume") {
    const studentRecords = await db
      .select({ universityId: students.universityId })
      .from(students)
      .where(eq(students.id, instance.resourceId))
      .limit(1);

    if (studentRecords.length > 0) {
      universityId = studentRecords[0].universityId;
    }
  }

  // Create approvals for next steps
  for (const step of nextSteps) {
    const approvers = await getStepApprovers(
      step.id,
      instance.resourceType,
      instance.resourceId,
      universityId || undefined
    );

    for (const approver of approvers) {
      await createApproval({
        workflowInstanceId: instanceId,
        workflowStepId: step.id,
        sequence: step.sequence,
        requestorId: instance.createdBy,
        responsible: approver.canApprove,
      });
    }
  }

  return updated;
}
