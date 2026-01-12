import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { universities } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateInviteCode } from "@/lib/utils/invite-code";

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

    // Check if user has permission (super-admin or director of this university)
    if (session.user.role !== "super-admin" && session.user.universityId !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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

    const updatedUniversity = await db
      .update(universities)
      .set({
        inviteCode,
        updatedAt: new Date(),
      })
      .where(eq(universities.id, id))
      .returning();

    if (updatedUniversity.length === 0) {
      return NextResponse.json({ error: "University not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUniversity[0]);
  } catch (error) {
    console.error("Error regenerating invite code:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
