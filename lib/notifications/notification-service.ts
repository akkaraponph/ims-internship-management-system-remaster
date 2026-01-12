import { db } from "@/lib/db";
import { notifications, notificationSettings } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import type { NotificationType } from "@/types";
import { sendEmailWithTemplate } from "@/lib/email/email-service";

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  sendEmail?: boolean;
}

/**
 * Create a notification for a user
 */
export async function createNotification(
  params: CreateNotificationParams
): Promise<string | null> {
  try {
    const [notification] = await db
      .insert(notifications)
      .values({
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        link: params.link || null,
        isRead: false,
      })
      .returning();

    // Send email if requested and user has email notifications enabled
    if (params.sendEmail) {
      const settings = await db
        .select()
        .from(notificationSettings)
        .where(eq(notificationSettings.userId, params.userId))
        .limit(1);

      if (settings.length > 0 && settings[0].emailEnabled) {
        // Try to send email notification (don't fail if email fails)
        try {
          await sendEmailWithTemplate({
            templateName: "notification",
            to: "", // Will need to get user email from users/students table
            variables: {
              title: params.title,
              message: params.message,
              link: params.link || "",
            },
          });
        } catch (error) {
          console.error("Failed to send notification email:", error);
        }
      }
    }

    return notification.id;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
}

/**
 * Create notifications for multiple users
 */
export async function createNotificationsForUsers(
  userIds: string[],
  params: Omit<CreateNotificationParams, "userId">
): Promise<number> {
  let count = 0;
  for (const userId of userIds) {
    const id = await createNotification({ ...params, userId });
    if (id) count++;
  }
  return count;
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(
  notificationId: string,
  userId: string
): Promise<boolean> {
  try {
    const updated = await db
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId)
        )
      )
      .returning();

    return updated.length > 0;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return false;
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  try {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));

    return true;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return false;
  }
}

/**
 * Get unread count for a user
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    const result = await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )
      );

    return result.length;
  } catch (error) {
    console.error("Error getting unread notification count:", error);
    return 0;
  }
}
