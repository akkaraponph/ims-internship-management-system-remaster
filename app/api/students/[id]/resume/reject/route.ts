import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { students } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createNotification } from "@/lib/notifications/notification-service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only directors, admins, and super-admins can reject resumes
    if (
      session.user.role !== "director" &&
      session.user.role !== "admin" &&
      session.user.role !== "super-admin"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Verify student exists
    const studentRecords = await db
      .select()
      .from(students)
      .where(eq(students.id, id))
      .limit(1);

    if (studentRecords.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const student = studentRecords[0];

    // Check access permissions - directors/admins can only reject their university's students
    if (session.user.role !== "super-admin") {
      if (student.universityId !== session.user.universityId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Update student resume approval status (reject/unapprove)
    await db
      .update(students)
      .set({
        resumeApproved: false,
        resumeApprovedBy: null,
        resumeApprovedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(students.id, id));

    // Notify student
    if (student.userId) {
      try {
        await createNotification({
          userId: student.userId,
          type: "student",
          title: "Resume ถูกปฏิเสธ",
          message: "Resume ของคุณถูกปฏิเสธ กรุณาอัพโหลด Resume ใหม่",
          link: `/documents`,
          sendEmail: false,
        });
      } catch (error) {
        console.error("Error sending notification:", error);
      }
    }

    const updatedStudent = await db
      .select()
      .from(students)
      .where(eq(students.id, id))
      .limit(1);

    return NextResponse.json(updatedStudent[0]);
  } catch (error: any) {
    console.error("Error rejecting resume:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
