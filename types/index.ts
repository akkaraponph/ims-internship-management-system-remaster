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
  workflows,
  workflowSteps,
  workflowStepResponsibilities,
  workflowInstances,
  workflowApprovals,
  workflowApprovalHistory,
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
export type Workflow = typeof workflows.$inferSelect;
export type WorkflowStep = typeof workflowSteps.$inferSelect;
export type WorkflowStepResponsibility = typeof workflowStepResponsibilities.$inferSelect;
export type WorkflowInstance = typeof workflowInstances.$inferSelect;
export type WorkflowApproval = typeof workflowApprovals.$inferSelect;
export type WorkflowApprovalHistory = typeof workflowApprovalHistory.$inferSelect;

export type UserRole = "admin" | "director" | "student" | "super-admin" | "company";
export type AnnouncementType = "info" | "warning" | "success" | "error";
export type AnnouncementPriority = "low" | "medium" | "high";
export type NotificationType = "system" | "internship" | "student" | "company" | "announcement";
export type BackupType = "full" | "partial";
export type WorkflowType = "internship" | "resume";
export type WorkflowStatus = "active" | "inactive";
export type WorkflowInstanceStatus = "pending" | "in_progress" | "approved" | "rejected" | "cancelled";
export type WorkflowFlowType = "sequential" | "parallel";
export type WorkflowResponsibilityType = "role" | "user" | "director";
export type ApprovalStatus = "pending" | "approved" | "rejected";
export type ApprovalAction = "created" | "approved" | "rejected" | "commented" | "cancelled";

export interface SessionUser {
  id: string;
  username: string;
  role: UserRole;
  isActive: boolean;
}
