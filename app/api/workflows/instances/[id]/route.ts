import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { workflowInstances, workflowSteps, workflowApprovals } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { getWorkflowInstance, getCurrentStep } from "@/lib/workflows/workflow.service";

const updateWorkflowInstanceSchema = z.object({
  status: z.enum(["pending", "in_progress", "approved", "rejected", "cancelled"]).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const instance = await getWorkflowInstance(id);
    if (!instance) {
      return NextResponse.json({ error: "Workflow instance not found" }, { status: 404 });
    }

    // Get current step and approvals
    const currentStep = await getCurrentStep(id);

    return NextResponse.json({
      ...instance,
      currentStep: currentStep.step,
      currentApprovals: currentStep.approvals,
    });
  } catch (error: any) {
    console.error("Error fetching workflow instance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins and super-admins can update workflow instances
    if (
      session.user.role !== "admin" &&
      session.user.role !== "super-admin"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateWorkflowInstanceSchema.parse(body);

    const instance = await getWorkflowInstance(id);
    if (!instance) {
      return NextResponse.json({ error: "Workflow instance not found" }, { status: 404 });
    }

    const [updated] = await db
      .update(workflowInstances)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(workflowInstances.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating workflow instance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
