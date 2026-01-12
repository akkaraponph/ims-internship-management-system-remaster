import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { subDistricts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const districtId = searchParams.get("districtId");

    if (districtId) {
      const districtSubDistricts = await db
        .select()
        .from(subDistricts)
        .where(eq(subDistricts.districtId, districtId));
      return NextResponse.json(districtSubDistricts);
    }

    const allSubDistricts = await db.select().from(subDistricts);
    return NextResponse.json(allSubDistricts);
  } catch (error) {
    console.error("Error fetching sub-districts:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
