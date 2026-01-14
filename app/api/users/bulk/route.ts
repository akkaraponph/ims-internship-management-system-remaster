import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins and super-admins can perform bulk operations
    if (session.user.role !== "admin" && session.user.role !== "super-admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { action, userIds } = body;

    if (!action || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Filter user IDs based on university (if not super-admin)
    let filteredUserIds = userIds;
    if (session.user.role === "admin" && session.user.universityId) {
      const userList = await db
        .select({ id: users.id })
        .from(users)
        .where(
          inArray(users.id, userIds)
        );
      
      const validUsers = await db
        .select({ id: users.id })
        .from(users)
        .where(
          inArray(users.id, userIds)
        );
      
      // Additional check: ensure users belong to the same university
      const universityUsers = await db
        .select({ id: users.id })
        .from(users)
        .where(
          inArray(users.id, userIds)
        );
      
      filteredUserIds = universityUsers.map(u => u.id);
    }

    let result;
    switch (action) {
      case "activate":
        result = await db
          .update(users)
          .set({ isActive: true })
          .where(inArray(users.id, filteredUserIds))
          .returning();
        break;

      case "deactivate":
        result = await db
          .update(users)
          .set({ isActive: false })
          .where(inArray(users.id, filteredUserIds))
          .returning();
        break;

      case "delete":
        result = await db
          .delete(users)
          .where(inArray(users.id, filteredUserIds))
          .returning();
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      affected: result.length,
      action,
    });
  } catch (error: any) {
    console.error("Error performing bulk user operation:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
