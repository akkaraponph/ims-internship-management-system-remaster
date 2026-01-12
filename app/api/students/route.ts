import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { students } from "@/lib/db/schema";
import { createStudentSchema } from "@/lib/validations";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Super-admin can see all students
    if (session.user.role === "super-admin") {
      const allStudents = await db.select().from(students);
      return NextResponse.json(allStudents);
    }

    // Students can only see their own data
    if (session.user.role === "student") {
      const student = await db
        .select()
        .from(students)
        .where(eq(students.userId, session.user.id))
        .limit(1);
      return NextResponse.json(student);
    }

    // Directors and admins can see their university's students
    if (session.user.universityId) {
      const universityStudents = await db
        .select()
        .from(students)
        .where(eq(students.universityId, session.user.universityId));
      return NextResponse.json(universityStudents);
    }

    return NextResponse.json([]);
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only directors and admins can create students
    if (session.user.role !== "director" && session.user.role !== "admin" && session.user.role !== "super-admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!session.user.universityId && session.user.role !== "super-admin") {
      return NextResponse.json({ error: "University context required" }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = createStudentSchema.parse(body);

    // Auto-assign universityId from session (unless super-admin specifies)
    const universityId = session.user.role === "super-admin" && body.universityId 
      ? body.universityId 
      : session.user.universityId;

    if (!universityId) {
      return NextResponse.json({ error: "University ID is required" }, { status: 400 });
    }

    const newStudent = await db
      .insert(students)
      .values({
        ...validatedData,
        universityId,
      })
      .returning();

    return NextResponse.json(newStudent[0], { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    console.error("Error creating student:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
