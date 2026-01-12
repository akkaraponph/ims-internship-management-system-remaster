import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { students } from "@/lib/db/schema";
import { updateStudentSchema } from "@/lib/validations";
import { eq } from "drizzle-orm";

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
    const student = await db.select().from(students).where(eq(students.id, id)).limit(1);

    if (student.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Check access permissions
    if (session.user.role === "student") {
      // Students can only see their own data
      if (student[0].userId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } else if (session.user.role !== "super-admin") {
      // Directors and admins can only see their university's students
      if (student[0].universityId !== session.user.universityId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json(student[0]);
  } catch (error) {
    console.error("Error fetching student:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    
    // Check if student exists and user has access
    const existingStudent = await db.select().from(students).where(eq(students.id, id)).limit(1);
    
    if (existingStudent.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Check access permissions
    if (session.user.role === "student") {
      // Students can only update their own data
      if (existingStudent[0].userId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } else if (session.user.role !== "super-admin") {
      // Directors and admins can only update their university's students
      if (existingStudent[0].universityId !== session.user.universityId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const body = await request.json();
    const validatedData = updateStudentSchema.parse(body);

    const updatedStudent = await db
      .update(students)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(students.id, id))
      .returning();

    return NextResponse.json(updatedStudent[0]);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    console.error("Error updating student:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "admin" && session.user.role !== "director" && session.user.role !== "super-admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    
    // Check if student exists and user has access
    const existingStudent = await db.select().from(students).where(eq(students.id, id)).limit(1);
    
    if (existingStudent.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Check access permissions
    if (session.user.role !== "super-admin" && existingStudent[0].universityId !== session.user.universityId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.delete(students).where(eq(students.id, id));

    return NextResponse.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
