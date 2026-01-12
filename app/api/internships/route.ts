import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { internships } from "@/lib/db/schema";
import { createInternshipSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allInternships = await db.select().from(internships);
    return NextResponse.json(allInternships);
  } catch (error) {
    console.error("Error fetching internships:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createInternshipSchema.parse(body);

    const newInternship = await db.insert(internships).values(validatedData).returning();

    return NextResponse.json(newInternship[0], { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    console.error("Error creating internship:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
