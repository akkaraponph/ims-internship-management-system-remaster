import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { jobPositions, companyUsers, companies } from "@/lib/db/schema";
import { createJobPositionSchema } from "@/lib/validations/job-position";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Companies can only see their own job positions
    if (session.user.role === "company" && session.user.companyId) {
      const companyJobPositions = await db
        .select()
        .from(jobPositions)
        .where(eq(jobPositions.companyId, session.user.companyId));
      
      return NextResponse.json(companyJobPositions);
    }

    // Admins and directors can see all job positions for their university
    if (session.user.role === "admin" || session.user.role === "director" || session.user.role === "super-admin") {
      if (session.user.role === "super-admin") {
        const allJobPositions = await db.select().from(jobPositions);
        return NextResponse.json(allJobPositions);
      }

      if (session.user.universityId) {
        // Get all companies for the university
        const universityCompanies = await db
          .select({ id: companies.id })
          .from(companies)
          .where(eq(companies.universityId, session.user.universityId));

        const companyIds = universityCompanies.map((c) => c.id);
        
        if (companyIds.length === 0) {
          return NextResponse.json([]);
        }

        // Get job positions for these companies
        const universityJobPositions = await db
          .select()
          .from(jobPositions)
          .where(
            and(
              ...companyIds.map((id) => eq(jobPositions.companyId, id))
            )
          );

        return NextResponse.json(universityJobPositions);
      }
    }

    return NextResponse.json([]);
  } catch (error: any) {
    console.error("Error fetching job positions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "company") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!session.user.companyId) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = createJobPositionSchema.parse({
      ...body,
      companyId: session.user.companyId,
    });

    const newJobPosition = await db
      .insert(jobPositions)
      .values({
        companyId: validatedData.companyId,
        title: validatedData.title,
        description: validatedData.description || null,
        requirements: validatedData.requirements || null,
        location: validatedData.location || null,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
        maxApplicants: validatedData.maxApplicants || null,
        isActive: validatedData.isActive,
      })
      .returning();

    return NextResponse.json(newJobPosition[0], { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    console.error("Error creating job position:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
