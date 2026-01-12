import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { emailSettings } from "@/lib/db/schema";
import { updateEmailSettingsSchema } from "@/lib/validations";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "admin" && session.user.role !== "super-admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const setting = await db
      .select()
      .from(emailSettings)
      .where(eq(emailSettings.id, id))
      .limit(1);

    if (setting.length === 0) {
      return NextResponse.json({ error: "Settings not found" }, { status: 404 });
    }

    return NextResponse.json(setting[0]);
  } catch (error) {
    console.error("Error fetching email settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "admin" && session.user.role !== "super-admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateEmailSettingsSchema.parse(body);

    // Check if settings exist
    const existing = await db
      .select()
      .from(emailSettings)
      .where(eq(emailSettings.id, id))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "Settings not found" }, { status: 404 });
    }

    // If this is being set as active, deactivate all other settings
    if (validatedData.isActive === true) {
      await db
        .update(emailSettings)
        .set({ isActive: false })
        .where(eq(emailSettings.isActive, true));
    }

    const updated = await db
      .update(emailSettings)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(emailSettings.id, id))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    console.error("Error updating email settings:", error);
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

    const deleted = await db
      .delete(emailSettings)
      .where(eq(emailSettings.id, id))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Settings not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Settings deleted successfully" });
  } catch (error) {
    console.error("Error deleting email settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
