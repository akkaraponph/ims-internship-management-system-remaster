import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { emailSettings } from "@/lib/db/schema";
import { createEmailSettingsSchema, updateEmailSettingsSchema } from "@/lib/validations";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "admin" && session.user.role !== "super-admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await db.select().from(emailSettings);
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching email settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "admin" && session.user.role !== "super-admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createEmailSettingsSchema.parse(body);

    // If this is set as active, deactivate all other settings
    if (validatedData.isActive) {
      await db
        .update(emailSettings)
        .set({ isActive: false })
        .where(eq(emailSettings.isActive, true));
    }

    const newSettings = await db
      .insert(emailSettings)
      .values({
        host: validatedData.host,
        port: validatedData.port,
        secure: validatedData.secure ?? false,
        username: validatedData.username,
        password: validatedData.password,
        fromEmail: validatedData.fromEmail,
        fromName: validatedData.fromName,
        isActive: validatedData.isActive ?? true,
      })
      .returning();

    return NextResponse.json(newSettings[0], { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    console.error("Error creating email settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
