import { z } from "zod";

export const internshipStatusSchema = z.enum(["pending", "approved", "rejected"]);

export const createInternshipSchema = z.object({
  studentId: z.string().uuid("Invalid student ID"),
  companyId: z.string().uuid("Invalid company ID"),
  isSend: z.string().optional(),
  isConfirm: z.string().optional(),
  status: internshipStatusSchema.default("pending"),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

export const updateInternshipSchema = z.object({
  studentId: z.string().uuid().optional(),
  companyId: z.string().uuid().optional(),
  isSend: z.string().optional(),
  isConfirm: z.string().optional(),
  status: internshipStatusSchema.optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

export type CreateInternshipInput = z.infer<typeof createInternshipSchema>;
export type UpdateInternshipInput = z.infer<typeof updateInternshipSchema>;
