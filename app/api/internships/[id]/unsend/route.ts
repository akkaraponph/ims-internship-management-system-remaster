import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { internships, students } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify internship exists
    const internshipRecords = await db
      .select()
      .from(internships)
      .where(eq(internships.id, id))
      .limit(1);

    if (internshipRecords.length === 0) {
      return NextResponse.json({ error: "Internship not found" }, { status: 404 });
    }

    const internship = internshipRecords[0];

    // Check if user is the student who owns the internship
    if (session.user.role === "student") {
      const studentRecords = await db
        .select()
        .from(students)
        .where(eq(students.userId, session.user.id))
        .limit(1);

      if (studentRecords.length === 0 || studentRecords[0].id !== internship.studentId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } else if (
      session.user.role !== "admin" &&
      session.user.role !== "director" &&
      session.user.role !== "super-admin"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update internship to mark as unsent
    await db
      .update(internships)
      .set({
        isSend: "0",
        isConfirm: "0",
        updatedAt: new Date(),
      })
      .where(eq(internships.id, id));

    const updatedInternship = await db
      .select()
      .from(internships)
      .where(eq(internships.id, id))
      .limit(1);

    return NextResponse.json(updatedInternship[0]);
  } catch (error: any) {
    console.error("Error unsending internship:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
