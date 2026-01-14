import { db } from "../lib/db";
import {
  workflows,
  workflowSteps,
  workflowStepResponsibilities,
} from "../lib/db/schema";
import { eq } from "drizzle-orm";

async function seedWorkflows() {
  console.log("Seeding workflows...");

  try {
    // Check if workflows already exist
    const existingWorkflows = await db.select().from(workflows);

    if (existingWorkflows.length > 0) {
      console.log("Workflows already exist, skipping seed...");
      return;
    }

    // 1. Create Internship Workflow
    const [internshipWorkflow] = await db
      .insert(workflows)
      .values({
        type: "internship",
        name: "Internship Approval Workflow",
        description: "Multi-step approval workflow for internship applications",
        status: "active",
      })
      .returning();

    console.log("Created internship workflow:", internshipWorkflow.id);

    // Step 1: Director Review
    const [step1] = await db
      .insert(workflowSteps)
      .values({
        workflowId: internshipWorkflow.id,
        sequence: 1,
        stepCode: "director_review",
        stepName: "Director Review",
        flowType: "sequential",
        isActive: true,
        requiresAll: true,
      })
      .returning();

    // Step 1 Responsibility: Directors
    await db.insert(workflowStepResponsibilities).values({
      workflowStepId: step1.id,
      responsibilityType: "director",
      canApprove: true,
      canReject: true,
      canComment: true,
      priority: 0,
      isActive: true,
    });

    // Step 2: Company Review
    const [step2] = await db
      .insert(workflowSteps)
      .values({
        workflowId: internshipWorkflow.id,
        sequence: 2,
        stepCode: "company_review",
        stepName: "Company Review",
        flowType: "sequential",
        isActive: true,
        requiresAll: true,
      })
      .returning();

    // Step 2 Responsibility: Company users (role-based)
    // Note: We'll use a special marker or handle this in the service
    // For now, we'll use role type with company role
    await db.insert(workflowStepResponsibilities).values({
      workflowStepId: step2.id,
      responsibilityType: "role",
      responsibilityId: null, // Company role will be checked in service
      canApprove: true,
      canReject: true,
      canComment: true,
      priority: 0,
      isActive: true,
    });

    // Step 3: Final Confirmation
    const [step3] = await db
      .insert(workflowSteps)
      .values({
        workflowId: internshipWorkflow.id,
        sequence: 3,
        stepCode: "final_confirmation",
        stepName: "Final Confirmation",
        flowType: "sequential",
        isActive: true,
        requiresAll: true,
      })
      .returning();

    // Step 3 Responsibility: Directors and Admins
    await db.insert(workflowStepResponsibilities).values({
      workflowStepId: step3.id,
      responsibilityType: "role",
      responsibilityId: null,
      canApprove: true,
      canReject: true,
      canComment: true,
      priority: 0,
      isActive: true,
    });

    // 2. Create Resume Workflow
    const [resumeWorkflow] = await db
      .insert(workflows)
      .values({
        type: "resume",
        name: "Resume Approval Workflow",
        description: "Simple approval workflow for student resumes",
        status: "active",
      })
      .returning();

    console.log("Created resume workflow:", resumeWorkflow.id);

    // Step 1: Director Approval
    const [resumeStep1] = await db
      .insert(workflowSteps)
      .values({
        workflowId: resumeWorkflow.id,
        sequence: 1,
        stepCode: "director_approval",
        stepName: "Director Approval",
        flowType: "sequential",
        isActive: true,
        requiresAll: true,
      })
      .returning();

    // Resume Step 1 Responsibility: Directors
    await db.insert(workflowStepResponsibilities).values({
      workflowStepId: resumeStep1.id,
      responsibilityType: "director",
      canApprove: true,
      canReject: true,
      canComment: true,
      priority: 0,
      isActive: true,
    });

    console.log("Workflows seeded successfully!");
  } catch (error) {
    console.error("Error seeding workflows:", error);
    throw error;
  }
}

// Run seed if called directly
if (require.main === module) {
  seedWorkflows()
    .then(() => {
      console.log("Seed completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seed failed:", error);
      process.exit(1);
    });
}

export { seedWorkflows };
