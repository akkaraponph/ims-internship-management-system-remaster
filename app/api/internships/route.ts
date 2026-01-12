import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { internships, students, companyUsers, users } from "@/lib/db/schema";
import { createInternshipSchema } from "@/lib/validations";
import { eq, inArray, and, or, sql } from "drizzle-orm";
import { createNotification } from "@/lib/notifications/notification-service";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const isSend = searchParams.get("isSend");
    const isConfirm = searchParams.get("isConfirm");

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

      const conditions = [eq(internships.studentId, studentRecords[0].id)];
      if (isSend !== null) {
        if (isSend === "0") {
          // Handle both null and "0" for not-sent
          conditions.push(or(sql`${internships.isSend} IS NULL`, eq(internships.isSend, "0")));
        } else {
          conditions.push(eq(internships.isSend, isSend));
        }
      }
      if (isConfirm !== null) {
        if (isConfirm === "0") {
          // Handle both null and "0" for not-confirmed
          conditions.push(or(sql`${internships.isConfirm} IS NULL`, eq(internships.isConfirm, "0")));
        } else {
          conditions.push(eq(internships.isConfirm, isConfirm));
        }
      }
      if (status) {
        conditions.push(eq(internships.status, status));
      }

      const studentInternships = await db
        .select()
        .from(internships)
        .where(and(...conditions));
      return NextResponse.json(studentInternships);
    }

    // Companies can see internships for their company
    if (session.user.role === "company" && session.user.companyId) {
      const conditions = [eq(internships.companyId, session.user.companyId)];
      if (isSend !== null) {
        if (isSend === "0") {
          // Handle both null and "0" for not-sent
          conditions.push(or(sql`${internships.isSend} IS NULL`, eq(internships.isSend, "0")));
        } else {
          conditions.push(eq(internships.isSend, isSend));
        }
      }
      if (isConfirm !== null) {
        if (isConfirm === "0") {
          // Handle both null and "0" for not-confirmed
          conditions.push(or(sql`${internships.isConfirm} IS NULL`, eq(internships.isConfirm, "0")));
        } else {
          conditions.push(eq(internships.isConfirm, isConfirm));
        }
      }
      if (status) {
        conditions.push(eq(internships.status, status));
      }

      const companyInternships = await db
        .select()
        .from(internships)
        .where(and(...conditions));
      return NextResponse.json(companyInternships);
    }

    // Super-admin can see all internships
    if (session.user.role === "super-admin") {
      const conditions = [];
      if (isSend !== null) {
        if (isSend === "0") {
          // Handle both null and "0" for not-sent
          conditions.push(or(sql`${internships.isSend} IS NULL`, eq(internships.isSend, "0")));
        } else {
          conditions.push(eq(internships.isSend, isSend));
        }
      }
      if (isConfirm !== null) {
        if (isConfirm === "0") {
          // Handle both null and "0" for not-confirmed
          conditions.push(or(sql`${internships.isConfirm} IS NULL`, eq(internships.isConfirm, "0")));
        } else {
          conditions.push(eq(internships.isConfirm, isConfirm));
        }
      }
      if (status) {
        conditions.push(eq(internships.status, status));
      }

      const allInternships = await db
        .select()
        .from(internships)
        .where(conditions.length > 0 ? and(...conditions) : undefined);
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
      const conditions = [inArray(internships.studentId, studentIds)];
      if (isSend !== null) {
        if (isSend === "0") {
          // Handle both null and "0" for not-sent
          conditions.push(or(sql`${internships.isSend} IS NULL`, eq(internships.isSend, "0")));
        } else {
          conditions.push(eq(internships.isSend, isSend));
        }
      }
      if (isConfirm !== null) {
        if (isConfirm === "0") {
          // Handle both null and "0" for not-confirmed
          conditions.push(or(sql`${internships.isConfirm} IS NULL`, eq(internships.isConfirm, "0")));
        } else {
          conditions.push(eq(internships.isConfirm, isConfirm));
        }
      }
      if (status) {
        conditions.push(eq(internships.status, status));
      }

      const universityInternships = await db
        .select()
        .from(internships)
        .where(and(...conditions));
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

    // Send notification to company users when student applies
    if (validatedData.companyId) {
      try {
        const companyUserRecords = await db
          .select({ userId: companyUsers.userId })
          .from(companyUsers)
          .where(eq(companyUsers.companyId, validatedData.companyId));

        const companyUserIds = companyUserRecords.map((cu) => cu.userId);

        // Get user records to send notifications
        if (companyUserIds.length > 0) {
          const companyUserDetails = await db
            .select()
            .from(users)
            .where(inArray(users.id, companyUserIds));

          // Send notifications to all company users
          for (const companyUser of companyUserDetails) {
            await createNotification({
              userId: companyUser.id,
              type: "internship",
              title: "มีผู้สมัครใหม่",
              message: "มีนักศึกษาสมัครฝึกงานตำแหน่งงานของคุณ",
              link: `/company/applications`,
              sendEmail: false,
            });
          }
        }
      } catch (error) {
        console.error("Error sending notification to company:", error);
        // Don't fail the request if notification fails
      }
    }

    return NextResponse.json(newInternship[0], { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    console.error("Error creating internship:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
