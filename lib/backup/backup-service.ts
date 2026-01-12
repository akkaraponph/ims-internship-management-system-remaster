import { db } from "@/lib/db";
import { backups } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import * as schema from "@/lib/db/schema";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export interface CreateBackupParams {
  userId: string;
  type: "full" | "partial";
  tables?: string[];
}

/**
 * Create a backup of the database
 */
export async function createBackup(
  params: CreateBackupParams
): Promise<{ success: boolean; backupId?: string; error?: string }> {
  try {
    const backupDir = process.env.BACKUP_DIR || "./backups";
    
    // Ensure backup directory exists
    if (!existsSync(backupDir)) {
      await mkdir(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `backup-${params.type}-${timestamp}.json`;
    const filePath = join(backupDir, filename);

    let backupData: any = {
      version: "1.0",
      type: params.type,
      createdAt: new Date().toISOString(),
      tables: {},
    };

    if (params.type === "full") {
      // Backup all tables
      backupData.tables = await backupAllTables();
    } else if (params.type === "partial" && params.tables && params.tables.length > 0) {
      // Backup specific tables
      for (const tableName of params.tables) {
        backupData.tables[tableName] = await backupTable(tableName);
      }
    } else {
      return { success: false, error: "Partial backup requires table names" };
    }

    // Write backup file
    await writeFile(filePath, JSON.stringify(backupData, null, 2), "utf-8");

    // Get file size
    const fs = await import("fs/promises");
    const stats = await fs.stat(filePath);
    const fileSize = stats.size;

    // Save backup record to database
    const [backup] = await db
      .insert(backups)
      .values({
        filename,
        filePath,
        fileSize,
        type: params.type,
        tables: params.tables || null,
        createdBy: params.userId,
        expiresAt: params.type === "full" 
          ? new Date(Date.now() + (parseInt(process.env.BACKUP_RETENTION_DAYS || "30") * 24 * 60 * 60 * 1000))
          : null,
      } as any)
      .returning();

    return { success: true, backupId: backup.id };
  } catch (error: any) {
    console.error("Error creating backup:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
}

/**
 * Backup all tables
 */
async function backupAllTables(): Promise<Record<string, any[]>> {
  const tables: Record<string, any[]> = {};

  // List of all tables to backup
  const tableNames = [
    "universities",
    "users",
    "students",
    "directors",
    "companies",
    "internships",
    "coInternships",
    "addresses",
    "provinces",
    "districts",
    "subDistricts",
    "emailTemplates",
    "emailSettings",
    "announcements",
    "announcementReads",
    "notifications",
    "notificationSettings",
    "roles",
    "rolePermissions",
  ];

  for (const tableName of tableNames) {
    tables[tableName] = await backupTable(tableName);
  }

  return tables;
}

/**
 * Backup a specific table
 */
async function backupTable(tableName: string): Promise<any[]> {
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
      console.warn(`Table ${tableName} not found in schema`);
      return [];
    }

    const data = await db.select().from(table);
    return data;
  } catch (error) {
    console.error(`Error backing up table ${tableName}:`, error);
    return [];
  }
}

/**
 * Get backup file path
 */
export async function getBackupFilePath(backupId: string): Promise<string | null> {
  try {
    const backup = await db
      .select()
      .from(backups)
      .where(eq(backups.id, backupId))
      .limit(1);

    if (backup.length === 0) {
      return null;
    }

    return backup[0].filePath;
  } catch (error) {
    console.error("Error getting backup file path:", error);
    return null;
  }
}
