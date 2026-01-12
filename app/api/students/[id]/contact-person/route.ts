import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { contactPersons, students, addresses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const contactPersonSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  relationship: z.string().optional(),
  phone: z.string().optional(),
  addressId: z.string().uuid().optional().nullable(),
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

    const contactPersonRecords = await db
      .select()
      .from(contactPersons)
      .where(eq(contactPersons.studentId, id))
      .limit(1);

    if (contactPersonRecords.length === 0) {
      return NextResponse.json(null);
    }

    return NextResponse.json(contactPersonRecords[0]);
  } catch (error: any) {
    console.error("Error fetching contact person:", error);
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
    const validatedData = contactPersonSchema.parse(body);

    // Check if contact person exists
    const existingRecords = await db
      .select()
      .from(contactPersons)
      .where(eq(contactPersons.studentId, id))
      .limit(1);

    if (existingRecords.length > 0) {
      // Update existing
      await db
        .update(contactPersons)
        .set({
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          relationship: validatedData.relationship || null,
          phone: validatedData.phone || null,
          addressId: validatedData.addressId || null,
          updatedAt: new Date(),
        })
        .where(eq(contactPersons.studentId, id));
    } else {
      // Create new
      await db.insert(contactPersons).values({
        studentId: id,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        relationship: validatedData.relationship || null,
        phone: validatedData.phone || null,
        addressId: validatedData.addressId || null,
      });
    }

    // Fetch updated contact person
    const updatedRecords = await db
      .select()
      .from(contactPersons)
      .where(eq(contactPersons.studentId, id))
      .limit(1);

    return NextResponse.json(updatedRecords[0]);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating contact person:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
