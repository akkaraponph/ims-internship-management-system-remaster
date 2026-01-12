import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { emailTemplates } from "@/lib/db/schema";
import { createEmailTemplateSchema, updateEmailTemplateSchema } from "@/lib/validations";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "admin" && session.user.role !== "super-admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const templates = await db.select().from(emailTemplates);
    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching email templates:", error);
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
    const validatedData = createEmailTemplateSchema.parse(body);

    // Check if template name already exists
    const existing = await db
      .select()
      .from(emailTemplates)
      .where(eq(emailTemplates.name, validatedData.name))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ error: "Template name already exists" }, { status: 400 });
    }

    const newTemplate = await db
      .insert(emailTemplates)
      .values({
        name: validatedData.name,
        subject: validatedData.subject,
        body: validatedData.body,
        variables: validatedData.variables || [],
        isActive: validatedData.isActive ?? true,
      })
      .returning();

    return NextResponse.json(newTemplate[0], { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    console.error("Error creating email template:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
