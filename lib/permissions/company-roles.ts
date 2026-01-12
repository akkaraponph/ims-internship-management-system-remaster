/**
 * Default company-specific roles
 * These are custom roles that can be assigned to company users via customRoleId
 */

export interface CompanyRole {
  name: string;
  description: string;
  permissions: string[];
}

export const companyRoles: CompanyRole[] = [
  {
    name: "Company HR",
    description: "Human Resources role for company",
    permissions: [
      "profile.view",
      "profile.update",
      "job-positions.view",
      "job-positions.create",
      "job-positions.update",
      "internships.view",
      "students.view",
      "announcements.view",
    ],
  },
  {
    name: "Company Manager",
    description: "Management role for company",
    permissions: [
      "profile.view",
      "profile.update",
      "job-positions.view",
      "job-positions.create",
      "job-positions.update",
      "job-positions.delete",
      "internships.view",
      "internships.update",
      "students.view",
      "announcements.view",
      "reports.view",
    ],
  },
  {
    name: "Company Staff",
    description: "Basic staff role for company",
    permissions: [
      "profile.view",
      "profile.update",
      "job-positions.view",
      "internships.view",
      "students.view",
      "announcements.view",
    ],
  },
];
