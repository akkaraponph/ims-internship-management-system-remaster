import { z } from "zod";

export const internshipStatusSchema = z.enum(["pending", "approved", "rejected"]);

export const coInternshipStudentSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  studentIdString: z.string().optional(), // Student ID as string
  phone: z.string().optional(),
  studentId: z.string().uuid().optional(), // If registered student
});

export const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  type: z.string().optional(), // "เอกชน", "รัฐวิสาหกิจ", "รัฐบาล"
  activities: z.string().optional(),
  proposeTo: z.string().optional(),
  phone: z.string().optional(),
  contactPersonName: z.string().optional(),
  contactPersonPosition: z.string().optional(),
  contactPersonPhone: z.string().optional(),
  addressId: z.string().uuid().optional(),
  address: z.object({
    addressLine: z.string().optional(),
    provinceId: z.string().uuid().optional(),
    districtId: z.string().uuid().optional(),
    subDistrictId: z.string().uuid().optional(),
    postalCode: z.string().optional(),
    houseNumber: z.string().optional(),
    road: z.string().optional(),
  }).optional(),
});

export const createInternshipSchema = z.object({
  studentId: z.string().uuid("Invalid student ID"),
  companyId: z.string().uuid("Invalid company ID").optional(), // Optional if creating new company
  company: companySchema.optional(), // If creating new company
  isSend: z.string().optional(),
  isConfirm: z.string().optional(),
  status: internshipStatusSchema.default("pending"),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  coStudents: z.array(coInternshipStudentSchema).optional(), // Up to 4 co-internship students
});

export const updateInternshipSchema = z.object({
  studentId: z.string().uuid().optional(),
  companyId: z.string().uuid().optional(),
  company: companySchema.optional(),
  isSend: z.string().optional(),
  isConfirm: z.string().optional(),
  status: internshipStatusSchema.optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  coStudents: z.array(coInternshipStudentSchema).optional(),
});

export type CreateInternshipInput = z.infer<typeof createInternshipSchema>;
export type UpdateInternshipInput = z.infer<typeof updateInternshipSchema>;
