import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jobPositions, companies } from "@/lib/db/schema";
import { eq, and, or, ilike, gte, lte } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const companyId = searchParams.get("companyId");
    const location = searchParams.get("location");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build query conditions
    const conditions = [eq(jobPositions.isActive, true)];

    // Search filter
    if (search) {
      conditions.push(
        or(
          ilike(jobPositions.title, `%${search}%`),
          ilike(jobPositions.description, `%${search}%`),
          ilike(jobPositions.location, `%${search}%`)
        )!
      );
    }

    // Company filter
    if (companyId) {
      conditions.push(eq(jobPositions.companyId, companyId));
    }

    // Location filter
    if (location) {
      conditions.push(ilike(jobPositions.location, `%${location}%`));
    }

    // Date filters
    if (startDate) {
      conditions.push(gte(jobPositions.startDate, new Date(startDate)));
    }
    if (endDate) {
      conditions.push(lte(jobPositions.endDate, new Date(endDate)));
    }

    // Get job positions with company information
    const jobs = await db
      .select({
        id: jobPositions.id,
        title: jobPositions.title,
        description: jobPositions.description,
        requirements: jobPositions.requirements,
        location: jobPositions.location,
        startDate: jobPositions.startDate,
        endDate: jobPositions.endDate,
        maxApplicants: jobPositions.maxApplicants,
        createdAt: jobPositions.createdAt,
        company: {
          id: companies.id,
          name: companies.name,
          type: companies.type,
          activities: companies.activities,
        },
      })
      .from(jobPositions)
      .innerJoin(companies, eq(jobPositions.companyId, companies.id))
      .where(and(...conditions))
      .orderBy(jobPositions.createdAt);

    return NextResponse.json(jobs);
  } catch (error: any) {
    console.error("Error fetching public job positions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
