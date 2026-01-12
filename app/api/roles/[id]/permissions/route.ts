import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { roles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updatePermissionsSchema = z.object({
  permissions: z.array(z.string()),
});

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
    const role = await db
      .select()
      .from(roles)
      .where(eq(roles.id, id))
      .limit(1);

    if (role.length === 0) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    return NextResponse.json({ permissions: role[0].permissions });
  } catch (error) {
    console.error("Error fetching role permissions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "super-admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updatePermissionsSchema.parse(body);

    // Check if role exists
    const existing = await db
      .select()
      .from(roles)
      .where(eq(roles.id, id))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    // Prevent editing system roles
    if (existing[0].isSystemRole) {
      return NextResponse.json({ error: "Cannot edit system role permissions" }, { status: 400 });
    }

    const [updated] = await db
      .update(roles)
      .set({
        permissions: validatedData.permissions,
        updatedAt: new Date(),
      })
      .where(eq(roles.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    console.error("Error updating role permissions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
