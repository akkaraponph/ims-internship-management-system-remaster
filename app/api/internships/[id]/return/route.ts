import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { internships, students } from "@/lib/db/schema";
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

    // Only directors and admins can return
    if (
      session.user.role !== "director" &&
      session.user.role !== "admin" &&
      session.user.role !== "super-admin"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

    // Update internship to return to student (unsent, unconfirmed)
    await db
      .update(internships)
      .set({
        isSend: "0",
        isConfirm: "0",
        status: "pending",
        updatedAt: new Date(),
      })
      .where(eq(internships.id, id));

    // Notify student
    if (internship.studentId) {
      try {
        const studentRecord = await db
          .select({ userId: students.userId })
          .from(students)
          .where(eq(students.id, internship.studentId))
          .limit(1);

        if (studentRecord.length > 0 && studentRecord[0].userId) {
          await createNotification({
            userId: studentRecord[0].userId,
            type: "internship",
            title: "แบบฟอร์มถูกส่งคืน",
            message: "แบบฟอร์มฝึกประสบการณ์วิชาชีพของคุณถูกส่งคืน กรุณาตรวจสอบและแก้ไขข้อมูล",
            link: `/internship`,
            sendEmail: false,
          });
        }
      } catch (error) {
        console.error("Error sending notification:", error);
      }
    }

    const updatedInternship = await db
      .select()
      .from(internships)
      .where(eq(internships.id, id))
      .limit(1);

    return NextResponse.json(updatedInternship[0]);
  } catch (error: any) {
    console.error("Error returning internship:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
