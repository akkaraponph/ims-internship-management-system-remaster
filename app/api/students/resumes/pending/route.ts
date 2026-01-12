import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { students } from "@/lib/db/schema";
import { and, eq, isNotNull, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only directors, admins, and super-admins can view pending resumes
    if (
      session.user.role !== "director" &&
      session.user.role !== "admin" &&
      session.user.role !== "super-admin"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Super-admin can see all pending resumes
    if (session.user.role === "super-admin") {
      const pendingResumes = await db
        .select({
          id: students.id,
          firstName: students.firstName,
          lastName: students.lastName,
          email: students.email,
          phone: students.phone,
          resume: students.resume,
          resumeStatus: students.resumeStatus,
          resumeApproved: students.resumeApproved,
          createdAt: students.createdAt,
          updatedAt: students.updatedAt,
        })
        .from(students)
        .where(
          and(
            isNotNull(students.resume),
            sql`${students.resumeApproved} = false OR ${students.resumeApproved} IS NULL`
          )
        );
      return NextResponse.json(pendingResumes);
    }

    // Directors and admins can see their university's pending resumes
    if (session.user.universityId) {
      const pendingResumes = await db
        .select({
          id: students.id,
          firstName: students.firstName,
          lastName: students.lastName,
          email: students.email,
          phone: students.phone,
          resume: students.resume,
          resumeStatus: students.resumeStatus,
          resumeApproved: students.resumeApproved,
          createdAt: students.createdAt,
          updatedAt: students.updatedAt,
        })
        .from(students)
        .where(
          and(
            eq(students.universityId, session.user.universityId),
            isNotNull(students.resume),
            sql`${students.resumeApproved} = false OR ${students.resumeApproved} IS NULL`
          )
        );
      return NextResponse.json(pendingResumes);
    }

    return NextResponse.json([]);
  } catch (error) {
    console.error("Error fetching pending resumes:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
