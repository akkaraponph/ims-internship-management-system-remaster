import type { UserRole } from "@/types";

/**
 * Check if a user has a specific permission
 */
export function hasPermission(
  userRole: UserRole,
  customRolePermissions: string[] | null | undefined,
  requiredPermission: string
): boolean {
  // Super-admin has all permissions
  if (userRole === "super-admin") {
    return true;
  }

  // Check custom role permissions if available
  if (customRolePermissions && customRolePermissions.includes(requiredPermission)) {
    return true;
  }

  // Check default role permissions
  const defaultPermissions = getDefaultRolePermissions(userRole);
  return defaultPermissions.includes(requiredPermission);
}

/**
 * Get default permissions for a role
 */
export function getDefaultRolePermissions(role: UserRole): string[] {
  const permissions: Record<UserRole, string[]> = {
    "super-admin": ["*"], // All permissions
    "admin": [
      "users.view",
      "users.create",
      "users.update",
      "users.delete",
      "students.view",
      "students.create",
      "students.update",
      "students.delete",
      "companies.view",
      "companies.create",
      "companies.update",
      "companies.delete",
      "internships.view",
      "internships.create",
      "internships.update",
      "internships.delete",
      "announcements.view",
      "announcements.create",
      "announcements.update",
      "announcements.delete",
    ],
    "director": [
      "students.view",
      "students.update",
      "companies.view",
      "internships.view",
      "internships.update",
      "announcements.view",
      "announcements.create",
      "reports.view",
    ],
    "student": [
      "profile.view",
      "profile.update",
      "internships.view",
      "internships.create",
    ],
  };

  return permissions[role] || [];
}

/**
 * Check if user can access a resource
 */
export function canAccessResource(
  userRole: UserRole,
  customRolePermissions: string[] | null | undefined,
  resource: string,
  action: string
): boolean {
  const permission = `${resource}.${action}`;
  return hasPermission(userRole, customRolePermissions, permission) ||
         hasPermission(userRole, customRolePermissions, "*");
}
