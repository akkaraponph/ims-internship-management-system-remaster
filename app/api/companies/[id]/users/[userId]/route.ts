import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { companies, companyUsers, users, roles } from "@/lib/db/schema";
import { updateCompanyUserSchema } from "@/lib/validations";
import { eq, and, ne } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: companyId, userId } = await params;
    const body = await request.json();
    const validatedData = updateCompanyUserSchema.parse(body);

    // Check if company exists
    const company = await db
      .select()
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1);

    if (company.length === 0) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Check if company user exists
    const existingCompanyUser = await db
      .select()
      .from(companyUsers)
      .where(
        and(
          eq(companyUsers.companyId, companyId),
          eq(companyUsers.userId, userId)
        )
      )
      .limit(1);

    if (existingCompanyUser.length === 0) {
      return NextResponse.json({ error: "Company user not found" }, { status: 404 });
    }

    // Authorization: admins/super-admins or company primary users
    const isAdmin = session.user.role === "admin" || session.user.role === "super-admin";
    
    let isPrimaryUser = false;
    if (session.user.role === "company" && session.user.companyId === companyId) {
      const currentCompanyUser = await db
        .select()
        .from(companyUsers)
        .where(
          and(
            eq(companyUsers.userId, session.user.id),
            eq(companyUsers.companyId, companyId)
          )
        )
        .limit(1);
      
      isPrimaryUser = currentCompanyUser.length > 0 && currentCompanyUser[0].isPrimary === true;
    }

    if (!isAdmin && !isPrimaryUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Validate customRoleId if provided
    if (validatedData.customRoleId !== undefined && validatedData.customRoleId !== null) {
      const role = await db
        .select()
        .from(roles)
        .where(eq(roles.id, validatedData.customRoleId))
        .limit(1);

      if (role.length === 0) {
        return NextResponse.json({ error: "Invalid role ID" }, { status: 400 });
      }
    }

    // Update company user record
    const updateData: any = {};
    if (validatedData.position !== undefined) updateData.position = validatedData.position;
    if (validatedData.isPrimary !== undefined) {
      updateData.isPrimary = validatedData.isPrimary;
      
      // If setting as primary, unset other primary users (excluding current user)
      if (validatedData.isPrimary) {
        await db
          .update(companyUsers)
          .set({ isPrimary: false })
          .where(
            and(
              eq(companyUsers.companyId, companyId),
              eq(companyUsers.isPrimary, true),
              ne(companyUsers.userId, userId) // Exclude current user
            )
          );
      }
    }

    const updatedCompanyUser = await db
      .update(companyUsers)
      .set(updateData)
      .where(
        and(
          eq(companyUsers.companyId, companyId),
          eq(companyUsers.userId, userId)
        )
      )
      .returning();

    // Update user's customRoleId if provided
    if (validatedData.customRoleId !== undefined) {
      await db
        .update(users)
        .set({ customRoleId: validatedData.customRoleId })
        .where(eq(users.id, userId));
    }

    // Fetch the complete updated record
    const result = await db
      .select({
        id: companyUsers.id,
        userId: companyUsers.userId,
        companyId: companyUsers.companyId,
        position: companyUsers.position,
        isPrimary: companyUsers.isPrimary,
        createdAt: companyUsers.createdAt,
        updatedAt: companyUsers.updatedAt,
        user: {
          id: users.id,
          username: users.username,
          role: users.role,
          isActive: users.isActive,
          customRoleId: users.customRoleId,
        },
        customRole: {
          id: roles.id,
          name: roles.name,
          description: roles.description,
          permissions: roles.permissions,
        },
      })
      .from(companyUsers)
      .innerJoin(users, eq(companyUsers.userId, users.id))
      .leftJoin(roles, eq(users.customRoleId, roles.id))
      .where(
        and(
          eq(companyUsers.companyId, companyId),
          eq(companyUsers.userId, userId)
        )
      )
      .limit(1);

    return NextResponse.json(result[0]);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    console.error("Error updating company user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: companyId, userId } = await params;

    // Check if company exists
    const company = await db
      .select()
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1);

    if (company.length === 0) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Check if company user exists
    const existingCompanyUser = await db
      .select()
      .from(companyUsers)
      .where(
        and(
          eq(companyUsers.companyId, companyId),
          eq(companyUsers.userId, userId)
        )
      )
      .limit(1);

    if (existingCompanyUser.length === 0) {
      return NextResponse.json({ error: "Company user not found" }, { status: 404 });
    }

    // Authorization: admins/super-admins or company primary users
    const isAdmin = session.user.role === "admin" || session.user.role === "super-admin";
    
    let isPrimaryUser = false;
    if (session.user.role === "company" && session.user.companyId === companyId) {
      const currentCompanyUser = await db
        .select()
        .from(companyUsers)
        .where(
          and(
            eq(companyUsers.userId, session.user.id),
            eq(companyUsers.companyId, companyId)
          )
        )
        .limit(1);
      
      isPrimaryUser = currentCompanyUser.length > 0 && currentCompanyUser[0].isPrimary === true;
    }

    if (!isAdmin && !isPrimaryUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Prevent deleting the last primary user
    if (existingCompanyUser[0].isPrimary) {
      const otherPrimaryUsers = await db
        .select()
        .from(companyUsers)
        .where(
          and(
            eq(companyUsers.companyId, companyId),
            eq(companyUsers.isPrimary, true),
            eq(companyUsers.userId, userId) // Exclude current user
          )
        )
        .limit(1);

      if (otherPrimaryUsers.length === 0) {
        return NextResponse.json(
          { error: "Cannot delete the last primary user. Please assign another primary user first." },
          { status: 400 }
        );
      }
    }

    // Delete company user record (this doesn't delete the user account, just the association)
    await db
      .delete(companyUsers)
      .where(
        and(
          eq(companyUsers.companyId, companyId),
          eq(companyUsers.userId, userId)
        )
      );

    return NextResponse.json({ message: "Company user removed successfully" });
  } catch (error) {
    console.error("Error deleting company user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
