import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { internships, students } from "@/lib/db/schema";
import { createInternshipSchema } from "@/lib/validations";
import { eq, inArray } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Students can only see their own internships
    if (session.user.role === "student") {
      const studentRecords = await db
        .select()
        .from(students)
        .where(eq(students.userId, session.user.id))
        .limit(1);

      if (studentRecords.length === 0) {
        return NextResponse.json([]);
      }

      const studentInternships = await db
        .select()
        .from(internships)
        .where(eq(internships.studentId, studentRecords[0].id));

      return NextResponse.json(studentInternships);
    }

    // Super-admin can see all internships
    if (session.user.role === "super-admin") {
      const allInternships = await db.select().from(internships);
      return NextResponse.json(allInternships);
    }

    // Directors and admins can see their university's internships
    if (session.user.universityId) {
      // Get all students from the university
      const universityStudents = await db
        .select({ id: students.id })
        .from(students)
        .where(eq(students.universityId, session.user.universityId));

      const studentIds = universityStudents.map((s) => s.id);
      
      if (studentIds.length === 0) {
        return NextResponse.json([]);
      }

      // Get internships for these students
      const universityInternships = await db
        .select()
        .from(internships)
        .where(inArray(internships.studentId, studentIds));
      
      return NextResponse.json(universityInternships);
    }

    return NextResponse.json([]);
  } catch (error) {
    console.error("Error fetching internships:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createInternshipSchema.parse(body);

    const newInternship = await db.insert(internships).values(validatedData).returning();

    return NextResponse.json(newInternship[0], { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    console.error("Error creating internship:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
