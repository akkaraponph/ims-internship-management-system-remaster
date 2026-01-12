import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { educations, students } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const educationSchema = z.object({
  educations: z.array(
    z.object({
      level: z.string().optional(),
      academy: z.string().optional(),
      gpa: z.string().optional(),
      order: z.number().int().min(1).max(3).optional(),
    })
  ),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify student exists and user has access
    const studentRecords = await db
      .select()
      .from(students)
      .where(eq(students.id, id))
      .limit(1);

    if (studentRecords.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const student = studentRecords[0];

    // Check if user is the student or has admin/director role
    if (
      session.user.role !== "admin" &&
      session.user.role !== "director" &&
      session.user.role !== "super-admin" &&
      student.userId !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const educationRecords = await db
      .select()
      .from(educations)
      .where(eq(educations.studentId, id))
      .orderBy(educations.order);

    return NextResponse.json(educationRecords);
  } catch (error: any) {
    console.error("Error fetching educations:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify student exists and user has access
    const studentRecords = await db
      .select()
      .from(students)
      .where(eq(students.id, id))
      .limit(1);

    if (studentRecords.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const student = studentRecords[0];

    // Check if user is the student or has admin/director role
    if (
      session.user.role !== "admin" &&
      session.user.role !== "director" &&
      session.user.role !== "super-admin" &&
      student.userId !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = educationSchema.parse(body);

    // Delete existing educations
    await db.delete(educations).where(eq(educations.studentId, id));

    // Insert new educations
    const newEducations = validatedData.educations
      .filter((edu) => edu.level || edu.academy || edu.gpa)
      .map((edu, index) => ({
        studentId: id,
        level: edu.level || null,
        academy: edu.academy || null,
        gpa: edu.gpa ? parseFloat(edu.gpa) : null,
        order: edu.order || index + 1,
      }));

    if (newEducations.length > 0) {
      await db.insert(educations).values(newEducations);
    }

    // Fetch updated educations
    const updatedEducations = await db
      .select()
      .from(educations)
      .where(eq(educations.studentId, id))
      .orderBy(educations.order);

    return NextResponse.json(updatedEducations);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating educations:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
