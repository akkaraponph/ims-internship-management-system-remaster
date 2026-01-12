import type { 
  users, 
  students, 
  companies, 
  internships, 
  addresses, 
  directors, 
  universities,
  emailTemplates,
  emailSettings,
  announcements,
  announcementReads,
  notifications,
  notificationSettings,
  roles,
  rolePermissions,
  backups,
  jobPositions,
  companyUsers,
} from "@/lib/db/schema";

export type User = typeof users.$inferSelect;
export type Student = typeof students.$inferSelect;
export type Company = typeof companies.$inferSelect;
export type Internship = typeof internships.$inferSelect;
export type Address = typeof addresses.$inferSelect;
export type Director = typeof directors.$inferSelect;
export type University = typeof universities.$inferSelect;
export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type EmailSetting = typeof emailSettings.$inferSelect;
export type Announcement = typeof announcements.$inferSelect;
export type AnnouncementRead = typeof announcementReads.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type NotificationSetting = typeof notificationSettings.$inferSelect;
export type Role = typeof roles.$inferSelect;
export type RolePermission = typeof rolePermissions.$inferSelect;
export type Backup = typeof backups.$inferSelect;
export type JobPosition = typeof jobPositions.$inferSelect;
export type CompanyUser = typeof companyUsers.$inferSelect;

export type UserRole = "admin" | "director" | "student" | "super-admin" | "company";
export type AnnouncementType = "info" | "warning" | "success" | "error";
export type AnnouncementPriority = "low" | "medium" | "high";
export type NotificationType = "system" | "internship" | "student" | "company" | "announcement";
export type BackupType = "full" | "partial";

export interface SessionUser {
  id: string;
  username: string;
  role: UserRole;
  isActive: boolean;
}
