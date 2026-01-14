import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { announcements } from "@/lib/db/schema";
import { eq, and, or, desc, sql, ilike } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const type = searchParams.get("type");
    const priority = searchParams.get("priority");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Build query conditions - only public announcements
    const conditions: any[] = [
      eq(announcements.isActive, true),
      // Only show announcements that are public (no specific target roles or all roles)
      or(
        sql`${announcements.targetRoles} = '[]'::jsonb`,
        sql`${announcements.targetRoles} IS NULL`
      )
    ];

    // Filter by expiration date
    conditions.push(
      or(
        sql`${announcements.expiresAt} IS NULL`,
        sql`${announcements.expiresAt} > NOW()`
      )
    );

    // Search filter
    if (search) {
      conditions.push(
        or(
          ilike(announcements.title, `%${search}%`),
          ilike(announcements.content, `%${search}%`)
        )!
      );
    }

    // Type filter
    if (type) {
      conditions.push(eq(announcements.type, type));
    }

    // Priority filter
    if (priority) {
      conditions.push(eq(announcements.priority, priority));
    }

    // Get total count for pagination
    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(announcements)
      .where(and(...conditions));

    // Get announcements
    const publicAnnouncements = await db
      .select()
      .from(announcements)
      .where(and(...conditions))
      .orderBy(desc(announcements.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      announcements: publicAnnouncements,
      pagination: {
        page,
        limit,
        total: Number(totalCount[0]?.count || 0),
        totalPages: Math.ceil(Number(totalCount[0]?.count || 0) / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching public announcements:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
