import type { UserRole } from "@/types";

export interface DefaultRole {
  name: string;
  description: string;
  permissions: string[];
  isSystemRole: boolean;
}

export const defaultRoles: Record<UserRole, DefaultRole> = {
  "super-admin": {
    name: "Super Admin",
    description: "Full system access",
    permissions: ["*"],
    isSystemRole: true,
  },
  "admin": {
    name: "Admin",
    description: "University administrator",
    permissions: [
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
    isSystemRole: true,
  },
  "director": {
    name: "Director",
    description: "Academic director/advisor",
    permissions: [
      "students.view",
      "students.update",
      "companies.view",
      "internships.view",
      "internships.update",
      "announcements.view",
      "announcements.create",
      "reports.view",
    ],
    isSystemRole: true,
  },
  "student": {
    name: "Student",
    description: "Student user",
    permissions: [
      "profile.view",
      "profile.update",
      "internships.view",
      "internships.create",
    ],
    isSystemRole: true,
  },
};
