import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { companies, companyUsers, users, roles } from "@/lib/db/schema";
import { createCompanyUserSchema } from "@/lib/validations";
import { eq, and, ne } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: companyId } = await params;

    // Check if company exists
    const company = await db
      .select()
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1);

    if (company.length === 0) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Authorization: admins/super-admins can view any company, company users can view their own company
    const isAdmin = session.user.role === "admin" || session.user.role === "super-admin";
    const isCompanyUser = session.user.role === "company" && session.user.companyId === companyId;

    if (!isAdmin && !isCompanyUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all company users with user details and roles
    const companyUserRecords = await db
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
      .where(eq(companyUsers.companyId, companyId));

    return NextResponse.json(companyUserRecords);
  } catch (error) {
    console.error("Error fetching company users:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: companyId } = await params;
    const body = await request.json();
    const validatedData = createCompanyUserSchema.parse(body);

    // Check if company exists
    const company = await db
      .select()
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1);

    if (company.length === 0) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
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

    // Check if username already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, validatedData.username))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 });
    }

    // Validate customRoleId if provided
    if (validatedData.customRoleId) {
      const role = await db
        .select()
        .from(roles)
        .where(eq(roles.id, validatedData.customRoleId))
        .limit(1);

      if (role.length === 0) {
        return NextResponse.json({ error: "Invalid role ID" }, { status: 400 });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create user account
    const newUser = await db
      .insert(users)
      .values({
        username: validatedData.username,
        password: hashedPassword,
        role: "company",
        universityId: company[0].universityId,
        customRoleId: validatedData.customRoleId || null,
        isActive: true,
      })
      .returning();

    // If setting as primary, unset other primary users
    if (validatedData.isPrimary) {
      await db
        .update(companyUsers)
        .set({ isPrimary: false })
        .where(
          and(
            eq(companyUsers.companyId, companyId),
            eq(companyUsers.isPrimary, true)
          )
        );
    }

    // Create company user record
    const newCompanyUser = await db
      .insert(companyUsers)
      .values({
        userId: newUser[0].id,
        companyId: companyId,
        position: validatedData.position || null,
        isPrimary: validatedData.isPrimary,
      })
      .returning();

    // Fetch the complete record with user and role details
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
      .where(eq(companyUsers.id, newCompanyUser[0].id))
      .limit(1);

    return NextResponse.json(result[0], { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    console.error("Error creating company user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
