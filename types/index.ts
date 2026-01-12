import type { users, students, companies, internships, addresses, directors } from "@/lib/db/schema";

export type User = typeof users.$inferSelect;
export type Student = typeof students.$inferSelect;
export type Company = typeof companies.$inferSelect;
export type Internship = typeof internships.$inferSelect;
export type Address = typeof addresses.$inferSelect;
export type Director = typeof directors.$inferSelect;

export type UserRole = "admin" | "director" | "student";

export interface SessionUser {
  id: string;
  username: string;
  role: UserRole;
  isActive: boolean;
}
