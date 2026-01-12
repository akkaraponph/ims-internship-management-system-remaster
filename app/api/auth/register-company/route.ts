import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, companies, companyUsers, universities, roles } from "@/lib/db/schema";
import { companyRegistrationSchema } from "@/lib/validations/company-registration";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

// Public endpoint for company registration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = companyRegistrationSchema.parse(body);

    // Validate invite code and get university
    const university = await db
      .select()
      .from(universities)
      .where(eq(universities.inviteCode, validatedData.inviteCode))
      .limit(1);

    if (university.length === 0) {
      return NextResponse.json({ error: "Invalid invite code" }, { status: 400 });
    }

    if (!university[0].isActive) {
      return NextResponse.json({ error: "University is not active" }, { status: 400 });
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

    // Check if company already exists for this university
    const existingCompany = await db
      .select()
      .from(companies)
      .where(eq(companies.name, validatedData.companyName))
      .limit(1);

    let companyId: string;

    if (existingCompany.length > 0 && existingCompany[0].universityId === university[0].id) {
      // Use existing company
      companyId = existingCompany[0].id;
    } else {
      // Create new company
      const newCompany = await db
        .insert(companies)
        .values({
          name: validatedData.companyName,
          universityId: university[0].id,
          contactPersonName: validatedData.contactPersonName,
          contactPersonPhone: validatedData.contactPersonPhone || null,
          contactPersonPosition: validatedData.contactPersonPosition || null,
          isActive: true,
        })
        .returning();
      
      companyId = newCompany[0].id;
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
        universityId: university[0].id,
        customRoleId: validatedData.customRoleId || null,
        isActive: true,
      })
      .returning();

    // Create company user record
    await db
      .insert(companyUsers)
      .values({
        userId: newUser[0].id,
        companyId: companyId,
        position: validatedData.position || null,
        isPrimary: validatedData.isPrimary,
      })
      .returning();

    return NextResponse.json(
      {
        message: "Registration successful",
        user: {
          id: newUser[0].id,
          username: newUser[0].username,
          role: newUser[0].role,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    console.error("Error registering company:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
