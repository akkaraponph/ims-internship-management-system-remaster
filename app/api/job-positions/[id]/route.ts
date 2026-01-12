import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { jobPositions, companyUsers } from "@/lib/db/schema";
import { updateJobPositionSchema } from "@/lib/validations/job-position";
import { eq, and } from "drizzle-orm";

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
    const jobPosition = await db
      .select()
      .from(jobPositions)
      .where(eq(jobPositions.id, id))
      .limit(1);

    if (jobPosition.length === 0) {
      return NextResponse.json({ error: "Job position not found" }, { status: 404 });
    }

    // Check permissions
    if (session.user.role === "company" && session.user.companyId !== jobPosition[0].companyId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(jobPosition[0]);
  } catch (error: any) {
    console.error("Error fetching job position:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateJobPositionSchema.parse(body);

    // Check if job position exists and user has permission
    const existingJobPosition = await db
      .select()
      .from(jobPositions)
      .where(eq(jobPositions.id, id))
      .limit(1);

    if (existingJobPosition.length === 0) {
      return NextResponse.json({ error: "Job position not found" }, { status: 404 });
    }

    if (session.user.role === "company" && session.user.companyId !== existingJobPosition[0].companyId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updateData: any = {};
    if (validatedData.title) updateData.title = validatedData.title;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.requirements !== undefined) updateData.requirements = validatedData.requirements;
    if (validatedData.location !== undefined) updateData.location = validatedData.location;
    if (validatedData.startDate) updateData.startDate = new Date(validatedData.startDate);
    if (validatedData.endDate) updateData.endDate = new Date(validatedData.endDate);
    if (validatedData.maxApplicants !== undefined) updateData.maxApplicants = validatedData.maxApplicants;
    if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive;

    const updatedJobPosition = await db
      .update(jobPositions)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(jobPositions.id, id))
      .returning();

    return NextResponse.json(updatedJobPosition[0]);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    console.error("Error updating job position:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if job position exists and user has permission
    const existingJobPosition = await db
      .select()
      .from(jobPositions)
      .where(eq(jobPositions.id, id))
      .limit(1);

    if (existingJobPosition.length === 0) {
      return NextResponse.json({ error: "Job position not found" }, { status: 404 });
    }

    if (session.user.role === "company" && session.user.companyId !== existingJobPosition[0].companyId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db
      .delete(jobPositions)
      .where(eq(jobPositions.id, id));

    return NextResponse.json({ message: "Job position deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting job position:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
