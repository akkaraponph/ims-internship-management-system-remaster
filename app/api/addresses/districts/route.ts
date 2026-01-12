import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { districts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const provinceId = searchParams.get("provinceId");

    if (provinceId) {
      const provinceDistricts = await db
        .select()
        .from(districts)
        .where(eq(districts.provinceId, provinceId));
      return NextResponse.json(provinceDistricts);
    }

    const allDistricts = await db.select().from(districts);
    return NextResponse.json(allDistricts);
  } catch (error) {
    console.error("Error fetching districts:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
