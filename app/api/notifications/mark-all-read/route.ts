import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { markAllNotificationsAsRead } from "@/lib/notifications/notification-service";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const success = await markAllNotificationsAsRead(session.user.id);
    
    if (!success) {
      return NextResponse.json({ error: "Failed to mark notifications as read" }, { status: 500 });
    }

    return NextResponse.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
