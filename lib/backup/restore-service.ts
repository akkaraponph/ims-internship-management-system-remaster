import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { readFile } from "fs/promises";
import { existsSync } from "fs";

export interface RestoreBackupParams {
  backupId: string;
  userId: string;
  tables?: string[]; // If provided, only restore these tables
}

/**
 * Restore from a backup
 */
export async function restoreBackup(
  params: RestoreBackupParams
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get backup record
    const backup = await db
      .select()
      .from(schema.backups)
      .where(eq(schema.backups.id, params.backupId))
      .limit(1);

    if (backup.length === 0) {
      return { success: false, error: "Backup not found" };
    }

    const backupRecord = backup[0];

    // Check if file exists
    if (!existsSync(backupRecord.filePath)) {
      return { success: false, error: "Backup file not found" };
    }

    // Read backup file
    const fileContent = await readFile(backupRecord.filePath, "utf-8");
    const backupData = JSON.parse(fileContent);

    // Validate backup format
    if (!backupData.tables || typeof backupData.tables !== "object") {
      return { success: false, error: "Invalid backup format" };
    }

    // Restore tables
    const tablesToRestore = params.tables || Object.keys(backupData.tables);

    for (const tableName of tablesToRestore) {
      if (!backupData.tables[tableName]) {
        console.warn(`Table ${tableName} not found in backup`);
        continue;
      }

      await restoreTable(tableName, backupData.tables[tableName]);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error restoring backup:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
}

/**
 * Restore a specific table
 */
async function restoreTable(tableName: string, data: any[]): Promise<void> {
  try {
    // Map table names to schema objects
    const tableMap: Record<string, any> = {
      universities: schema.universities,
      users: schema.users,
      students: schema.students,
      directors: schema.directors,
      companies: schema.companies,
      internships: schema.internships,
      coInternships: schema.coInternships,
      addresses: schema.addresses,
      provinces: schema.provinces,
      districts: schema.districts,
      subDistricts: schema.subDistricts,
      emailTemplates: schema.emailTemplates,
      emailSettings: schema.emailSettings,
      announcements: schema.announcements,
      announcementReads: schema.announcementReads,
      notifications: schema.notifications,
      notificationSettings: schema.notificationSettings,
      roles: schema.roles,
      rolePermissions: schema.rolePermissions,
    };

    const table = tableMap[tableName];
    if (!table) {
      throw new Error(`Table ${tableName} not found in schema`);
    }

    // Clear existing data (optional - you might want to merge instead)
    // For safety, we'll skip clearing and let the user handle conflicts

    // Insert data
    if (data.length > 0) {
      // Insert in batches to avoid overwhelming the database
      const batchSize = 100;
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        await db.insert(table).values(batch).onConflictDoNothing();
      }
    }
  } catch (error) {
    console.error(`Error restoring table ${tableName}:`, error);
    throw error;
  }
}
