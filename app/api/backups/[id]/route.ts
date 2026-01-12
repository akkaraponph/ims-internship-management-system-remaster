import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { backups } from "@/lib/db/schema";
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
    const backup = await db
      .select()
      .from(backups)
      .where(eq(backups.id, id))
      .limit(1);

    if (backup.length === 0) {
      return NextResponse.json({ error: "Backup not found" }, { status: 404 });
    }

    return NextResponse.json(backup[0]);
  } catch (error) {
    console.error("Error fetching backup:", error);
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

    // Get backup to delete file
    const backup = await db
      .select()
      .from(backups)
      .where(eq(backups.id, id))
      .limit(1);

    if (backup.length === 0) {
      return NextResponse.json({ error: "Backup not found" }, { status: 404 });
    }

    // Delete file
    try {
      const fs = await import("fs/promises");
      await fs.unlink(backup[0].filePath);
    } catch (error) {
      console.warn("Error deleting backup file:", error);
      // Continue even if file deletion fails
    }

    // Delete record
    await db.delete(backups).where(eq(backups.id, id));

    return NextResponse.json({ message: "Backup deleted successfully" });
  } catch (error) {
    console.error("Error deleting backup:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
