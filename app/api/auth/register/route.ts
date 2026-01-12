import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, students, universities } from "@/lib/db/schema";
import { studentRegistrationSchema } from "@/lib/validations";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

// Public endpoint for student registration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = studentRegistrationSchema.parse(body);

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

    // Check if email already exists
    const existingStudent = await db
      .select()
      .from(students)
      .where(eq(students.email, validatedData.email))
      .limit(1);

    if (existingStudent.length > 0) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // Check if ID card already exists
    const existingIdCard = await db
      .select()
      .from(students)
      .where(eq(students.idCard, validatedData.idCard))
      .limit(1);

    if (existingIdCard.length > 0) {
      return NextResponse.json({ error: "ID card already registered" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create user account
    const newUser = await db
      .insert(users)
      .values({
        username: validatedData.username,
        password: hashedPassword,
        role: "student",
        universityId: university[0].id,
        isActive: true,
      })
      .returning();

    // Create student record
    const { inviteCode, username, password, ...studentData } = validatedData;
    const newStudent = await db
      .insert(students)
      .values({
        ...studentData,
        userId: newUser[0].id,
        universityId: university[0].id,
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
    console.error("Error registering student:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
