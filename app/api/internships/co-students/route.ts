import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { coInternships, internships, students } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const coStudentSchema = z.object({
  internshipId: z.string().uuid(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  studentIdString: z.string().optional(),
  phone: z.string().optional(),
  studentId: z.string().uuid().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = coStudentSchema.parse(body);

    // Verify internship exists and user has access
    const internshipRecords = await db
      .select()
      .from(internships)
      .where(eq(internships.id, validatedData.internshipId))
      .limit(1);

    if (internshipRecords.length === 0) {
      return NextResponse.json({ error: "Internship not found" }, { status: 404 });
    }

    const internship = internshipRecords[0];

    // If studentId is provided, verify it's a valid student
    if (validatedData.studentId) {
      const studentRecords = await db
        .select()
        .from(students)
        .where(eq(students.id, validatedData.studentId))
        .limit(1);

      if (studentRecords.length === 0) {
        return NextResponse.json({ error: "Student not found" }, { status: 404 });
      }
    }

    // Check if user is the student who owns the internship or has admin/director role
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

    const newCoInternship = await db
      .insert(coInternships)
      .values({
        internshipId: validatedData.internshipId,
        studentId: validatedData.studentId || null,
        firstName: validatedData.firstName || null,
        lastName: validatedData.lastName || null,
        studentIdString: validatedData.studentIdString || null,
        phone: validatedData.phone || null,
      })
      .returning();

    return NextResponse.json(newCoInternship[0], { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating co-internship student:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
