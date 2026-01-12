import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUnreadNotificationCount } from "@/lib/notifications/notification-service";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const count = await getUnreadNotificationCount(session.user.id);
    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error getting unread notification count:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
