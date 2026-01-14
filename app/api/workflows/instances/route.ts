import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  workflowInstances,
  internships,
  students,
  companyUsers,
} from "@/lib/db/schema";
import { eq, and, inArray, or } from "drizzle-orm";
import { z } from "zod";
import { createWorkflowInstance } from "@/lib/workflows/workflow.service";

const createWorkflowInstanceSchema = z.object({
  workflowId: z.string().uuid(),
  resourceType: z.enum(["internship", "resume"]),
  resourceId: z.string().uuid(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const resourceType = searchParams.get("resourceType") as
      | "internship"
      | "resume"
      | null;
    const resourceId = searchParams.get("resourceId");

    // Students can only see their own workflow instances
    if (session.user.role === "student") {
      const studentRecords = await db
        .select()
        .from(students)
        .where(eq(students.userId, session.user.id))
        .limit(1);

      if (studentRecords.length === 0) {
        return NextResponse.json([]);
      }

      const conditions = [];
      if (resourceType) {
        conditions.push(eq(workflowInstances.resourceType, resourceType));
      }
      if (resourceId) {
        conditions.push(eq(workflowInstances.resourceId, resourceId));
      }

      // Get internships for this student
      const studentInternships = await db
        .select({ id: internships.id })
        .from(internships)
        .where(eq(internships.studentId, studentRecords[0].id));

      const internshipIds = studentInternships.map((i) => i.id);

      if (internshipIds.length > 0) {
        conditions.push(
          or(
            eq(workflowInstances.resourceId, studentRecords[0].id),
            inArray(workflowInstances.resourceId, internshipIds)
          )
        );
      } else {
        conditions.push(eq(workflowInstances.resourceId, studentRecords[0].id));
      }

      const instances = await db
        .select()
        .from(workflowInstances)
        .where(and(...conditions));

      return NextResponse.json(instances);
    }

    // Companies can see workflow instances for their company's internships
    if (session.user.role === "company") {
      const companyUserRecords = await db
        .select({ companyId: companyUsers.companyId })
        .from(companyUsers)
        .where(eq(companyUsers.userId, session.user.id))
        .limit(1);

      if (companyUserRecords.length === 0) {
        return NextResponse.json([]);
      }

      const companyInternships = await db
        .select({ id: internships.id })
        .from(internships)
        .where(eq(internships.companyId, companyUserRecords[0].companyId));

      const internshipIds = companyInternships.map((i) => i.id);

      if (internshipIds.length === 0) {
        return NextResponse.json([]);
      }

      const conditions = [
        eq(workflowInstances.resourceType, "internship"),
        inArray(workflowInstances.resourceId, internshipIds),
      ];

      if (resourceId) {
        conditions.push(eq(workflowInstances.resourceId, resourceId));
      }

      const instances = await db
        .select()
        .from(workflowInstances)
        .where(and(...conditions));

      return NextResponse.json(instances);
    }

    // Super-admin can see all
    if (session.user.role === "super-admin") {
      const conditions = [];
      if (resourceType) {
        conditions.push(eq(workflowInstances.resourceType, resourceType));
      }
      if (resourceId) {
        conditions.push(eq(workflowInstances.resourceId, resourceId));
      }

      const instances = await db
        .select()
        .from(workflowInstances)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      return NextResponse.json(instances);
    }

    // Directors and admins can see their university's workflow instances
    if (session.user.universityId) {
      // Get all students from the university
      const universityStudents = await db
        .select({ id: students.id })
        .from(students)
        .where(eq(students.universityId, session.user.universityId));

      const studentIds = universityStudents.map((s) => s.id);

      if (studentIds.length === 0) {
        return NextResponse.json([]);
      }

      // Get internships for these students
      const universityInternships = await db
        .select({ id: internships.id })
        .from(internships)
        .where(inArray(internships.studentId, studentIds));

      const internshipIds = universityInternships.map((i) => i.id);

      const conditions = [
        or(
          inArray(workflowInstances.resourceId, studentIds),
          inArray(workflowInstances.resourceId, internshipIds)
        ),
      ];

      if (resourceType) {
        conditions.push(eq(workflowInstances.resourceType, resourceType));
      }
      if (resourceId) {
        conditions.push(eq(workflowInstances.resourceId, resourceId));
      }

      const instances = await db
        .select()
        .from(workflowInstances)
        .where(and(...conditions));

      return NextResponse.json(instances);
    }

    return NextResponse.json([]);
  } catch (error: any) {
    console.error("Error fetching workflow instances:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createWorkflowInstanceSchema.parse(body);

    // Check if instance already exists
    const existing = await db
      .select()
      .from(workflowInstances)
      .where(
        and(
          eq(workflowInstances.resourceType, validatedData.resourceType),
          eq(workflowInstances.resourceId, validatedData.resourceId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(existing[0]);
    }

    const instance = await createWorkflowInstance({
      ...validatedData,
      createdBy: session.user.id,
    });

    return NextResponse.json(instance, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating workflow instance:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
