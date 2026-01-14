import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { internships } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins, directors, and super-admins can perform bulk operations
    if (
      session.user.role !== "admin" &&
      session.user.role !== "director" &&
      session.user.role !== "super-admin"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { action, internshipIds, status } = body;

    if (!action || !Array.isArray(internshipIds) || internshipIds.length === 0) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    let result;
    switch (action) {
      case "approve":
        result = await db
          .update(internships)
          .set({ status: "approved" })
          .where(inArray(internships.id, internshipIds))
          .returning();
        break;

      case "reject":
        result = await db
          .update(internships)
          .set({ status: "rejected" })
          .where(inArray(internships.id, internshipIds))
          .returning();
        break;

      case "changeStatus":
        if (!status) {
          return NextResponse.json({ error: "Status is required" }, { status: 400 });
        }
        result = await db
          .update(internships)
          .set({ status })
          .where(inArray(internships.id, internshipIds))
          .returning();
        break;

      case "delete":
        result = await db
          .delete(internships)
          .where(inArray(internships.id, internshipIds))
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
    console.error("Error performing bulk internship operation:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
