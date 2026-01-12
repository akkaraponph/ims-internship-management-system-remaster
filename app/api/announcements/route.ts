import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { announcements, announcementReads } from "@/lib/db/schema";
import { createAnnouncementSchema } from "@/lib/validations";
import { eq, and, or, desc, sql } from "drizzle-orm";
import { createNotification } from "@/lib/notifications/notification-service";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includeRead = searchParams.get("includeRead") === "true";
    const activeOnly = searchParams.get("activeOnly") !== "false"; // Default to true

    // Build query conditions
    const conditions: any[] = [];

    if (activeOnly) {
      conditions.push(eq(announcements.isActive, true));
    }

    // Filter by expiration date
    conditions.push(
      or(
        sql`${announcements.expiresAt} IS NULL`,
        sql`${announcements.expiresAt} > NOW()`
      )
    );

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

    let query = db.select().from(announcements);

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const allAnnouncements = await query.orderBy(desc(announcements.createdAt));

    // Get read status for each announcement
    if (!includeRead) {
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
    }

    // Include read status
    const announcementsWithReadStatus = await Promise.all(
      allAnnouncements.map(async (announcement) => {
        const read = await db
          .select()
          .from(announcementReads)
          .where(
            and(
              eq(announcementReads.announcementId, announcement.id),
              eq(announcementReads.userId, session.user.id)
            )
          )
          .limit(1);

        return {
          ...announcement,
          isRead: read.length > 0,
        };
      })
    );

    return NextResponse.json(announcementsWithReadStatus);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "admin" && session.user.role !== "director" && session.user.role !== "super-admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createAnnouncementSchema.parse(body);

    const [newAnnouncement] = await db
      .insert(announcements)
      .values({
        title: validatedData.title,
        content: validatedData.content,
        type: validatedData.type || "info",
        priority: validatedData.priority || "medium",
        isActive: validatedData.isActive ?? true,
        targetRoles: validatedData.targetRoles || [],
        targetUniversities: validatedData.targetUniversities || null,
        createdBy: session.user.id,
        expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : null,
      })
      .returning();

    // Create notifications for target users
    // This is a simplified version - in production, you'd want to query users based on targetRoles and targetUniversities
    // For now, we'll skip automatic notification creation

    return NextResponse.json(newAnnouncement, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    console.error("Error creating announcement:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
