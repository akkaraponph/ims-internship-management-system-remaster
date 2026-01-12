/**
 * Simple in-memory queue for notifications
 * In production, consider using a proper queue system like Bull, RabbitMQ, etc.
 */

interface QueuedNotification {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  sendEmail?: boolean;
}

const notificationQueue: QueuedNotification[] = [];
let processing = false;

/**
 * Add notification to queue
 */
export function queueNotification(notification: QueuedNotification): void {
  notificationQueue.push(notification);
  processQueue();
}

/**
 * Process notification queue
 */
async function processQueue(): Promise<void> {
  if (processing || notificationQueue.length === 0) {
    return;
  }

  processing = true;

  while (notificationQueue.length > 0) {
    const notification = notificationQueue.shift();
    if (!notification) continue;

    try {
      const { createNotification } = await import("./notification-service");
      await createNotification(notification);
    } catch (error) {
      console.error("Error processing queued notification:", error);
    }
  }

  processing = false;
}

/**
 * Get queue length
 */
export function getQueueLength(): number {
  return notificationQueue.length;
}
