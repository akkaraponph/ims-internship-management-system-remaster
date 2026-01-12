import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { announcementReads, announcements } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if announcement exists
    const announcement = await db
      .select()
      .from(announcements)
      .where(eq(announcements.id, id))
      .limit(1);

    if (announcement.length === 0) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
    }

    // Check if already read
    const existingRead = await db
      .select()
      .from(announcementReads)
      .where(
        and(
          eq(announcementReads.announcementId, id),
          eq(announcementReads.userId, session.user.id)
        )
      )
      .limit(1);

    if (existingRead.length > 0) {
      return NextResponse.json({ message: "Announcement already marked as read" });
    }

    // Mark as read
    const [read] = await db
      .insert(announcementReads)
      .values({
        announcementId: id,
        userId: session.user.id,
      })
      .returning();

    return NextResponse.json(read);
  } catch (error) {
    console.error("Error marking announcement as read:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
