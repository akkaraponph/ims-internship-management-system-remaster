import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPendingApprovalsForUser } from "@/lib/workflows/approval.service";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pendingApprovals = await getPendingApprovalsForUser(session.user.id);

    return NextResponse.json(pendingApprovals);
  } catch (error: any) {
    console.error("Error fetching pending approvals:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
