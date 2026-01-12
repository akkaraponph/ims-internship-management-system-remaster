import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { students } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    
    // Check if student exists
    const existingStudent = await db
      .select()
      .from(students)
      .where(eq(students.id, id))
      .limit(1);

    if (existingStudent.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const student = existingStudent[0];

    // Authorization: Only student can generate token for their own profile
    if (session.user.role !== "student" || student.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Generate unique token (32-character hex string)
    let token: string = "";
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      token = randomBytes(16).toString("hex");
      
      // Check if token already exists
      const existingToken = await db
        .select()
        .from(students)
        .where(eq(students.publicProfileToken, token))
        .limit(1);

      if (existingToken.length === 0) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique || !token) {
      return NextResponse.json({ error: "Failed to generate unique token" }, { status: 500 });
    }

    // Update student with token
    const updatedStudent = await db
      .update(students)
      .set({
        publicProfileToken: token,
        updatedAt: new Date(),
      })
      .where(eq(students.id, id))
      .returning();

    const publicUrl = `${process.env.NEXTAUTH_URL || request.nextUrl.origin}/profile/public/${token}`;

    return NextResponse.json({
      token,
      publicUrl,
      message: "Public profile token generated successfully",
    });
  } catch (error) {
    console.error("Error generating token:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    
    // Check if student exists
    const existingStudent = await db
      .select()
      .from(students)
      .where(eq(students.id, id))
      .limit(1);

    if (existingStudent.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const student = existingStudent[0];

    // Authorization: Only student can disable their own profile
    if (session.user.role !== "student" || student.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Remove token (set to null)
    await db
      .update(students)
      .set({
        publicProfileToken: null,
        updatedAt: new Date(),
      })
      .where(eq(students.id, id));

    return NextResponse.json({ message: "Public profile disabled successfully" });
  } catch (error) {
    console.error("Error disabling token:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
