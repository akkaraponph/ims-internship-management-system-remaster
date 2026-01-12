import { z } from "zod";

export const createAddressSchema = z.object({
  addressLine: z.string().optional(),
  provinceId: z.string().uuid().optional(),
  districtId: z.string().uuid().optional(),
  subDistrictId: z.string().uuid().optional(),
  postalCode: z.string().optional(),
});

export const updateAddressSchema = createAddressSchema.partial();

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
