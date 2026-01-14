import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { internships, students } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getWorkflowInstanceByResource } from "@/lib/workflows/workflow.service";

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

      // Check if student's resume is approved before sending to company
      if (!studentRecords[0].resumeApproved) {
        return NextResponse.json(
          { error: "Resume must be approved by director before sending internship application to company" },
          { status: 400 }
        );
      }

      // Check workflow status - must be at least past director review
      const workflowInstance = await getWorkflowInstanceByResource("internship", id);
      if (workflowInstance && workflowInstance.status !== "approved" && workflowInstance.currentStepSequence && workflowInstance.currentStepSequence < 2) {
        return NextResponse.json(
          { error: "Internship must pass director review before sending to company" },
          { status: 400 }
        );
      }
    } else if (
      session.user.role !== "admin" &&
      session.user.role !== "director" &&
      session.user.role !== "super-admin"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    } else {
      // For admins/directors/super-admins, also check resume approval if it's a student's internship
      if (internship.studentId) {
        const studentRecords = await db
          .select({ resumeApproved: students.resumeApproved })
          .from(students)
          .where(eq(students.id, internship.studentId))
          .limit(1);

        if (studentRecords.length > 0 && !studentRecords[0].resumeApproved) {
          return NextResponse.json(
            { error: "Student's resume must be approved before sending internship application to company" },
            { status: 400 }
          );
        }
      }
    }

    // Update internship to mark as sent
    await db
      .update(internships)
      .set({
        isSend: "1",
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
    console.error("Error sending internship:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
