import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { backups } from "@/lib/db/schema";
import { createBackupSchema } from "@/lib/validations";
import { createBackup } from "@/lib/backup/backup-service";
import { desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "admin" && session.user.role !== "super-admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allBackups = await db
      .select()
      .from(backups)
      .orderBy(desc(backups.createdAt));

    return NextResponse.json(allBackups);
  } catch (error) {
    console.error("Error fetching backups:", error);
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
    const validatedData = createBackupSchema.parse(body);

    const result = await createBackup({
      userId: session.user.id,
      type: validatedData.type,
      tables: validatedData.tables,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to create backup" }, { status: 500 });
    }

    const backup = await db
      .select()
      .from(backups)
      .where(eq(backups.id, result.backupId!))
      .limit(1);

    return NextResponse.json(backup[0], { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    console.error("Error creating backup:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
