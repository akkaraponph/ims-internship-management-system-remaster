import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { universities } from "@/lib/db/schema";
import { createUniversitySchema, updateUniversitySchema } from "@/lib/validations";
import { eq } from "drizzle-orm";
import { generateInviteCode } from "@/lib/utils/invite-code";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Super-admin can see all universities
    if (session.user.role === "super-admin") {
      const allUniversities = await db.select().from(universities);
      return NextResponse.json(allUniversities);
    }

    // Directors can see their own university
    if (session.user.role === "director" && session.user.universityId) {
      const university = await db
        .select()
        .from(universities)
        .where(eq(universities.id, session.user.universityId))
        .limit(1);
      return NextResponse.json(university.length > 0 ? [university[0]] : []);
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } catch (error) {
    console.error("Error fetching universities:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "super-admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createUniversitySchema.parse(body);

    // Generate unique invite code
    let inviteCode = generateInviteCode();
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      const existing = await db
        .select()
        .from(universities)
        .where(eq(universities.inviteCode, inviteCode))
        .limit(1);
      
      if (existing.length === 0) {
        isUnique = true;
      } else {
        inviteCode = generateInviteCode();
        attempts++;
      }
    }

    if (!isUnique) {
      return NextResponse.json({ error: "Failed to generate unique invite code" }, { status: 500 });
    }

    const newUniversity = await db
      .insert(universities)
      .values({
        ...validatedData,
        inviteCode,
      })
      .returning();

    return NextResponse.json(newUniversity[0], { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    console.error("Error creating university:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
