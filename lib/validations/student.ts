import { z } from "zod";

export const createStudentSchema = z.object({
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
  resumeStatus: z.boolean().default(false),
  isCoInternship: z.boolean().default(false),
  presentAddressId: z.string().uuid().optional(),
  permanentAddressId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
});

export const updateStudentSchema = createStudentSchema.partial();

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
