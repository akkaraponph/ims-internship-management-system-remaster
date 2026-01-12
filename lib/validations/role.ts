import { z } from "zod";

export const createRoleSchema = z.object({
  name: z.string().min(1, "Role name is required").max(255, "Role name is too long"),
  description: z.string().optional(),
  permissions: z.array(z.string()).default([]),
  isSystemRole: z.boolean().default(false),
});

export const updateRoleSchema = createRoleSchema.partial().omit({ isSystemRole: true });

export const assignRoleToUserSchema = z.object({
  userId: z.string().uuid(),
  roleId: z.string().uuid().optional(),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type AssignRoleToUserInput = z.infer<typeof assignRoleToUserSchema>;
