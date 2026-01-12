import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notificationSettings } from "@/lib/db/schema";
import { updateNotificationSettingsSchema } from "@/lib/validations";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await db
      .select()
      .from(notificationSettings)
      .where(eq(notificationSettings.userId, session.user.id))
      .limit(1);

    if (settings.length === 0) {
      // Create default settings
      const [defaultSettings] = await db
        .insert(notificationSettings)
        .values({
          userId: session.user.id,
          emailEnabled: true,
          pushEnabled: false,
          inAppEnabled: true,
          types: {},
        })
        .returning();

      return NextResponse.json(defaultSettings);
    }

    return NextResponse.json(settings[0]);
  } catch (error) {
    console.error("Error fetching notification settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateNotificationSettingsSchema.parse(body);

    // Check if settings exist
    const existing = await db
      .select()
      .from(notificationSettings)
      .where(eq(notificationSettings.userId, session.user.id))
      .limit(1);

    if (existing.length === 0) {
      // Create new settings
      const [newSettings] = await db
        .insert(notificationSettings)
        .values({
          userId: session.user.id,
          emailEnabled: validatedData.emailEnabled ?? true,
          pushEnabled: validatedData.pushEnabled ?? false,
          inAppEnabled: validatedData.inAppEnabled ?? true,
          types: validatedData.types || {},
        })
        .returning();

      return NextResponse.json(newSettings);
    }

    // Update existing settings
    const [updated] = await db
      .update(notificationSettings)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(notificationSettings.userId, session.user.id))
      .returning();

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    console.error("Error updating notification settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
