import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createUserSchema } from "@/lib/validations";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "admin" && session.user.role !== "super-admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Super-admin can see all users
    if (session.user.role === "super-admin") {
      const allUsers = await db.select().from(users);
      return NextResponse.json(allUsers);
    }

    // Regular admins can see only their university's users
    if (session.user.universityId) {
      const universityUsers = await db
        .select()
        .from(users)
        .where(eq(users.universityId, session.user.universityId));
      return NextResponse.json(universityUsers);
    }

    return NextResponse.json([]);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "admin" && session.user.role !== "super-admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createUserSchema.parse(body);

    // Auto-assign universityId from session (unless super-admin specifies or creating super-admin)
    const universityId = 
      validatedData.role === "super-admin" 
        ? null 
        : session.user.role === "super-admin" && body.universityId 
          ? body.universityId 
          : session.user.universityId;

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const newUser = await db
      .insert(users)
      .values({
        username: validatedData.username,
        password: hashedPassword,
        role: validatedData.role,
        universityId,
        isActive: validatedData.isActive,
      })
      .returning();

    return NextResponse.json(newUser[0], { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
