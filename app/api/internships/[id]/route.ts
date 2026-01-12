import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { internships } from "@/lib/db/schema";
import { updateInternshipSchema } from "@/lib/validations";
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
    const internship = await db.select().from(internships).where(eq(internships.id, id)).limit(1);

    if (internship.length === 0) {
      return NextResponse.json({ error: "Internship not found" }, { status: 404 });
    }

    return NextResponse.json(internship[0]);
  } catch (error) {
    console.error("Error fetching internship:", error);
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
    const body = await request.json();
    const validatedData = updateInternshipSchema.parse(body);

    const updateData: any = {};
    if (validatedData.studentId) updateData.studentId = validatedData.studentId;
    if (validatedData.companyId) updateData.companyId = validatedData.companyId;
    if (validatedData.isSend !== undefined) updateData.isSend = validatedData.isSend;
    if (validatedData.isConfirm !== undefined) updateData.isConfirm = validatedData.isConfirm;
    if (validatedData.status) updateData.status = validatedData.status;
    if (validatedData.startDate) updateData.startDate = validatedData.startDate;
    if (validatedData.endDate) updateData.endDate = validatedData.endDate;

    const updatedInternship = await db
      .update(internships)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(internships.id, id))
      .returning();

    if (updatedInternship.length === 0) {
      return NextResponse.json({ error: "Internship not found" }, { status: 404 });
    }

    return NextResponse.json(updatedInternship[0]);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    console.error("Error updating internship:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "admin" && session.user.role !== "super-admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await db.delete(internships).where(eq(internships.id, id));

    return NextResponse.json({ message: "Internship deleted successfully" });
  } catch (error) {
    console.error("Error deleting internship:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
