import { z } from "zod";

export const companyRegistrationSchema = z.object({
  inviteCode: z.string().min(1, "Invite code is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  companyName: z.string().min(1, "Company name is required"),
  contactPersonName: z.string().min(1, "Contact person name is required"),
  contactPersonEmail: z.string().email("Invalid email address"),
  contactPersonPhone: z.string().optional(),
  contactPersonPosition: z.string().optional(),
  position: z.string().optional(), // Position in company
  customRoleId: z.string().uuid("Invalid role ID").optional(), // Custom role for company user
  isPrimary: z.boolean().default(true),
});

export type CompanyRegistrationInput = z.infer<typeof companyRegistrationSchema>;
