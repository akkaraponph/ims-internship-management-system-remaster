import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { announcements, announcementReads } from "@/lib/db/schema";
import { eq, and, or, sql, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all active announcements that match user's role and university
    const conditions: any[] = [
      eq(announcements.isActive, true),
      or(
        sql`${announcements.expiresAt} IS NULL`,
        sql`${announcements.expiresAt} > NOW()`
      ),
    ];

    // Filter by target roles
    if (session.user.role !== "super-admin") {
      conditions.push(
        or(
          sql`${announcements.targetRoles} = '[]'::jsonb`,
          sql`${announcements.targetRoles} @> ${JSON.stringify([session.user.role])}::jsonb`
        )
      );
    }

    // Filter by target universities
    if (session.user.role !== "super-admin" && session.user.universityId) {
      conditions.push(
        or(
          sql`${announcements.targetUniversities} IS NULL`,
          sql`${announcements.targetUniversities} @> ${JSON.stringify([session.user.universityId])}::jsonb`
        )
      );
    }

    const allAnnouncements = await db
      .select()
      .from(announcements)
      .where(and(...conditions))
      .orderBy(desc(announcements.createdAt));

    // Get read announcements for this user
    const readAnnouncements = await db
      .select({ announcementId: announcementReads.announcementId })
      .from(announcementReads)
      .where(eq(announcementReads.userId, session.user.id));

    const readIds = new Set(readAnnouncements.map((r) => r.announcementId));

    // Filter out read announcements
    const unreadAnnouncements = allAnnouncements.filter(
      (a) => !readIds.has(a.id)
    );

    return NextResponse.json(unreadAnnouncements);
  } catch (error) {
    console.error("Error fetching unread announcements:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
