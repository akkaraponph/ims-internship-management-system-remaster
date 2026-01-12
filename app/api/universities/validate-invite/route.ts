import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { universities } from "@/lib/db/schema";
import { validateInviteCodeSchema } from "@/lib/validations";
import { eq } from "drizzle-orm";

// Public endpoint - no authentication required
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { inviteCode } = validateInviteCodeSchema.parse(body);

    const university = await db
      .select({
        id: universities.id,
        name: universities.name,
        code: universities.code,
        isActive: universities.isActive,
      })
      .from(universities)
      .where(eq(universities.inviteCode, inviteCode))
      .limit(1);

    if (university.length === 0) {
      return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
    }

    if (!university[0].isActive) {
      return NextResponse.json({ error: "University is not active" }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      university: university[0],
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    console.error("Error validating invite code:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
