import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { companies, jobPositions } from "@/lib/db/schema";
import { eq, and, or, ilike, count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const type = searchParams.get("type");
    const activities = searchParams.get("activities");

    // Build query conditions
    const conditions = [eq(companies.isActive, true)];

    // Search filter
    if (search) {
      conditions.push(
        or(
          ilike(companies.name, `%${search}%`),
          ilike(companies.type, `%${search}%`),
          ilike(companies.activities, `%${search}%`)
        )!
      );
    }

    // Type filter
    if (type) {
      conditions.push(ilike(companies.type, `%${type}%`));
    }

    // Activities filter
    if (activities) {
      conditions.push(ilike(companies.activities, `%${activities}%`));
    }

    // Get companies with job positions count
    const companiesList = await db
      .select({
        id: companies.id,
        name: companies.name,
        type: companies.type,
        activities: companies.activities,
        proposeTo: companies.proposeTo,
        phone: companies.phone,
        contactPersonName: companies.contactPersonName,
        contactPersonPosition: companies.contactPersonPosition,
        contactPersonPhone: companies.contactPersonPhone,
        createdAt: companies.createdAt,
      })
      .from(companies)
      .where(and(...conditions))
      .orderBy(companies.name);

    // Get job positions count for each company
    const companiesWithJobs = await Promise.all(
      companiesList.map(async (company) => {
        const activeJobs = await db
          .select({ count: count() })
          .from(jobPositions)
          .where(
            and(
              eq(jobPositions.companyId, company.id),
              eq(jobPositions.isActive, true)
            )
          );

        return {
          ...company,
          activeJobsCount: activeJobs[0]?.count || 0,
        };
      })
    );

    return NextResponse.json(companiesWithJobs);
  } catch (error: any) {
    console.error("Error fetching public companies:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
