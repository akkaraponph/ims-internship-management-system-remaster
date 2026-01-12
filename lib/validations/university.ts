import { z } from "zod";

export const createUniversitySchema = z.object({
  name: z.string().min(1, "University name is required"),
  code: z.string().min(2, "University code must be at least 2 characters").max(50, "University code must be at most 50 characters"),
  isActive: z.boolean().default(true),
});

export const updateUniversitySchema = createUniversitySchema.partial();

export const validateInviteCodeSchema = z.object({
  inviteCode: z.string().min(1, "Invite code is required"),
});

export type CreateUniversityInput = z.infer<typeof createUniversitySchema>;
export type UpdateUniversityInput = z.infer<typeof updateUniversitySchema>;
export type ValidateInviteCodeInput = z.infer<typeof validateInviteCodeSchema>;
