import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { 
  students, 
  companies, 
  jobPositions, 
  internships,
  users,
  universities
} from "@/lib/db/schema";
import { eq, and, count, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Get basic statistics
    const [
      totalStudents,
      totalCompanies,
      totalJobPositions,
      totalInternships,
      activeInternships,
      completedInternships,
      totalUsers,
      totalUniversities
    ] = await Promise.all([
      db.select({ count: count() }).from(students),
      db.select({ count: count() }).from(companies).where(eq(companies.isActive, true)),
      db.select({ count: count() }).from(jobPositions).where(eq(jobPositions.isActive, true)),
      db.select({ count: count() }).from(internships),
      db.select({ count: count() }).from(internships).where(eq(internships.status, "approved")),
      db.select({ count: count() }).from(internships).where(eq(internships.status, "completed")),
      db.select({ count: count() }).from(users),
      db.select({ count: count() }).from(universities)
    ]);

    // Get internships by status
    const internshipsByStatus = await db
      .select({
        status: internships.status,
        count: count(),
      })
      .from(internships)
      .groupBy(internships.status);

    // Get companies by type
    const companiesByType = await db
      .select({
        type: companies.type,
        count: count(),
      })
      .from(companies)
      .where(eq(companies.isActive, true))
      .groupBy(companies.type);

    // Get monthly statistics (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    
    const monthlyStats = await db
      .select({
        month: sql<string>`TO_CHAR(${internships.createdAt}, 'YYYY-MM')`.as('month'),
        count: count(),
      })
      .from(internships)
      .where(
        sql`${internships.createdAt} >= ${twelveMonthsAgo}`
      )
      .groupBy(sql`TO_CHAR(${internships.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${internships.createdAt}, 'YYYY-MM')`);

    // Get statistics by university (if applicable)
    const statsByUniversity = await db
      .select({
        universityId: students.universityId,
        count: count(),
      })
      .from(students)
      .groupBy(students.universityId);

    const statistics = {
      overview: {
        totalStudents: totalStudents[0]?.count || 0,
        totalCompanies: totalCompanies[0]?.count || 0,
        totalJobPositions: totalJobPositions[0]?.count || 0,
        totalInternships: totalInternships[0]?.count || 0,
        activeInternships: activeInternships[0]?.count || 0,
        completedInternships: completedInternships[0]?.count || 0,
        totalUsers: totalUsers[0]?.count || 0,
        totalUniversities: totalUniversities[0]?.count || 0,
      },
      internshipsByStatus: internshipsByStatus.map((item) => ({
        status: item.status || "unknown",
        count: item.count,
      })),
      companiesByType: companiesByType
        .filter((item) => item.type)
        .map((item) => ({
          type: item.type || "unknown",
          count: item.count,
        })),
      monthlyStats: monthlyStats.map((item) => ({
        month: item.month,
        count: item.count,
      })),
      statsByUniversity: statsByUniversity.map((item) => ({
        universityId: item.universityId,
        count: item.count,
      })),
    };

    return NextResponse.json(statistics);
  } catch (error: any) {
    console.error("Error fetching public statistics:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
