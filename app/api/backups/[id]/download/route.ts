import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getBackupFilePath } from "@/lib/backup/backup-service";
import { readFile } from "fs/promises";
import { existsSync } from "fs";

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
    const filePath = await getBackupFilePath(id);

    if (!filePath) {
      return NextResponse.json({ error: "Backup not found" }, { status: 404 });
    }

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "Backup file not found" }, { status: 404 });
    }

    const fileContent = await readFile(filePath, "utf-8");
    const filename = filePath.split("/").pop() || "backup.json";

    return new NextResponse(fileContent, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error downloading backup:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
