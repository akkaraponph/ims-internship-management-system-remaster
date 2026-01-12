import { z } from "zod";

export const createJobPositionSchema = z.object({
  companyId: z.string().uuid("Invalid company ID"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  requirements: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  maxApplicants: z.number().int().positive().optional(),
  isActive: z.boolean().default(true),
});

export const updateJobPositionSchema = createJobPositionSchema.partial().extend({
  companyId: z.string().uuid().optional(),
});

export type CreateJobPositionInput = z.infer<typeof createJobPositionSchema>;
export type UpdateJobPositionInput = z.infer<typeof updateJobPositionSchema>;
