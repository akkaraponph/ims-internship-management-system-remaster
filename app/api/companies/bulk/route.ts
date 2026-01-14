import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { companies } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins and super-admins can perform bulk operations
    if (session.user.role !== "admin" && session.user.role !== "super-admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { action, companyIds } = body;

    if (!action || !Array.isArray(companyIds) || companyIds.length === 0) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Filter company IDs based on university (if not super-admin)
    let filteredCompanyIds = companyIds;
    if (session.user.role === "admin" && session.user.universityId) {
      const universityCompanies = await db
        .select({ id: companies.id })
        .from(companies)
        .where(
          inArray(companies.id, companyIds)
        );
      
      filteredCompanyIds = universityCompanies
        .filter(c => c.id)
        .map(c => c.id);
    }

    let result;
    switch (action) {
      case "activate":
        result = await db
          .update(companies)
          .set({ isActive: true })
          .where(inArray(companies.id, filteredCompanyIds))
          .returning();
        break;

      case "deactivate":
        result = await db
          .update(companies)
          .set({ isActive: false })
          .where(inArray(companies.id, filteredCompanyIds))
          .returning();
        break;

      case "delete":
        result = await db
          .delete(companies)
          .where(inArray(companies.id, filteredCompanyIds))
          .returning();
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      affected: result.length,
      action,
    });
  } catch (error: any) {
    console.error("Error performing bulk company operation:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
