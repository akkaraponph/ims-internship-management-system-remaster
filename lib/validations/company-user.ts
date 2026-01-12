import { z } from "zod";

export const createCompanyUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  position: z.string().optional(),
  customRoleId: z.string().uuid("Invalid role ID").optional(),
  isPrimary: z.boolean().default(false),
});

export const updateCompanyUserSchema = z.object({
  position: z.string().optional(),
  customRoleId: z.string().uuid("Invalid role ID").nullable().optional(),
  isPrimary: z.boolean().optional(),
});

export type CreateCompanyUserInput = z.infer<typeof createCompanyUserSchema>;
export type UpdateCompanyUserInput = z.infer<typeof updateCompanyUserSchema>;
