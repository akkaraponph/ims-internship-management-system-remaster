import { z } from "zod";

export const studentRegistrationSchema = z.object({
  inviteCode: z.string().min(1, "Invite code is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email address"),
  idCard: z.string().min(1, "ID card is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  program: z.string().optional(),
  department: z.string().optional(),
  skill: z.string().optional(),
  interest: z.string().optional(),
  projectTopic: z.string().optional(),
  dateOfBirth: z.date().optional(),
  experience: z.string().optional(),
  religion: z.string().optional(),
  fatherName: z.string().optional(),
  fatherJob: z.string().optional(),
  motherName: z.string().optional(),
  motherJob: z.string().optional(),
  presentGpa: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid GPA format").optional(),
  presentAddressId: z.string().uuid().optional(),
  permanentAddressId: z.string().uuid().optional(),
});

export type StudentRegistrationInput = z.infer<typeof studentRegistrationSchema>;
