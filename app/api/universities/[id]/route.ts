import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { universities } from "@/lib/db/schema";
import { updateUniversitySchema } from "@/lib/validations";
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
    const university = await db
      .select()
      .from(universities)
      .where(eq(universities.id, id))
      .limit(1);

    if (university.length === 0) {
      return NextResponse.json({ error: "University not found" }, { status: 404 });
    }

    // Check access permissions
    if (session.user.role !== "super-admin" && session.user.universityId !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(university[0]);
  } catch (error) {
    console.error("Error fetching university:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "super-admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateUniversitySchema.parse(body);

    const updatedUniversity = await db
      .update(universities)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(universities.id, id))
      .returning();

    if (updatedUniversity.length === 0) {
      return NextResponse.json({ error: "University not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUniversity[0]);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    console.error("Error updating university:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "super-admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const deletedUniversity = await db
      .delete(universities)
      .where(eq(universities.id, id))
      .returning();

    if (deletedUniversity.length === 0) {
      return NextResponse.json({ error: "University not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "University deleted successfully" });
  } catch (error) {
    console.error("Error deleting university:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
