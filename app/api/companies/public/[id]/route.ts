import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { companies, jobPositions, addresses } from "@/lib/db/schema";
import { eq, and, count } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get company with address
    const companyResult = await db
      .select({
        company: companies,
        address: addresses,
      })
      .from(companies)
      .leftJoin(addresses, eq(companies.addressId, addresses.id))
      .where(and(eq(companies.id, id), eq(companies.isActive, true)))
      .limit(1);

    if (companyResult.length === 0) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const { company, address } = companyResult[0];

    // Get active job positions count
    const activeJobs = await db
      .select({ count: count() })
      .from(jobPositions)
      .where(
        and(
          eq(jobPositions.companyId, company.id),
          eq(jobPositions.isActive, true)
        )
      );

    return NextResponse.json({
      ...company,
      address: address || null,
      activeJobsCount: activeJobs[0]?.count || 0,
    });
  } catch (error: any) {
    console.error("Error fetching public company:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
