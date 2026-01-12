import { z } from "zod";

export const createCompanySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  type: z.string().optional(),
  activities: z.string().optional(),
  proposeTo: z.string().optional(),
  phone: z.string().optional(),
  addressId: z.string().uuid().optional(),
  contactPersonName: z.string().optional(),
  contactPersonPosition: z.string().optional(),
  contactPersonPhone: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const updateCompanySchema = createCompanySchema.partial();

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
