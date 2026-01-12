export const DEMO_STORAGE_KEYS = {
  MODE: "demo_mode",
  USERS: "demo_users",
  STUDENTS: "demo_students",
  COMPANIES: "demo_companies",
  INTERNSHIPS: "demo_internships",
  JOB_POSITIONS: "demo_jobPositions",
  UNIVERSITIES: "demo_universities",
  ANNOUNCEMENTS: "demo_announcements",
  NOTIFICATIONS: "demo_notifications",
  SESSION: "demo_session",
  COMPANY_USERS: "demo_companyUsers",
  SELECTED_ROLE: "demo_selectedRole",
} as const;

export type DemoStorageKey = typeof DEMO_STORAGE_KEYS[keyof typeof DEMO_STORAGE_KEYS];
