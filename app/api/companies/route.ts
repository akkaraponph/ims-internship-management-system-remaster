import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { companies, students } from "@/lib/db/schema";
import { createCompanySchema } from "@/lib/validations";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Super-admin can see all companies
    if (session.user.role === "super-admin") {
      const allCompanies = await db.select().from(companies);
      return NextResponse.json(allCompanies);
    }

    // Directors and admins can see their university's companies
    if (session.user.universityId) {
      const universityCompanies = await db
        .select()
        .from(companies)
        .where(eq(companies.universityId, session.user.universityId));
      return NextResponse.json(universityCompanies);
    }

    return NextResponse.json([]);
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Allow students to create companies for their internship applications
    // or admins/directors/super-admins
    const allowedRoles = ["admin", "director", "super-admin", "student"];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createCompanySchema.parse(body);

    let universityId = body.universityId;

    // For students, get universityId from their student record
    if (session.user.role === "student") {
      const studentRecords = await db
        .select()
        .from(students)
        .where(eq(students.userId, session.user.id))
        .limit(1);
      
      if (studentRecords.length === 0) {
        return NextResponse.json({ error: "Student not found" }, { status: 404 });
      }
      
      universityId = studentRecords[0].universityId;
    } else if (!session.user.universityId && session.user.role !== "super-admin") {
      return NextResponse.json({ error: "University context required" }, { status: 400 });
    } else {
      // Auto-assign universityId from session (unless super-admin specifies)
      universityId = session.user.role === "super-admin" && body.universityId 
        ? body.universityId 
        : session.user.universityId;
    }

    if (!universityId) {
      return NextResponse.json({ error: "University ID is required" }, { status: 400 });
    }

    const newCompany = await db
      .insert(companies)
      .values({
        ...validatedData,
        universityId,
      })
      .returning();

    return NextResponse.json(newCompany[0], { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    console.error("Error creating company:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
