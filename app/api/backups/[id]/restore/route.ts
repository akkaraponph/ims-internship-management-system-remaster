import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { restoreBackupSchema } from "@/lib/validations";
import { restoreBackup } from "@/lib/backup/restore-service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    // Only super-admin can restore backups
    if (!session || session.user.role !== "super-admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = restoreBackupSchema.parse({
      backupId: id,
      ...body,
    });

    const result = await restoreBackup({
      backupId: validatedData.backupId,
      userId: session.user.id,
      tables: validatedData.tables,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to restore backup" }, { status: 500 });
    }

    return NextResponse.json({ message: "Backup restored successfully" });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    console.error("Error restoring backup:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
