import { z } from "zod";

export const createEmailTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required").max(255, "Template name is too long"),
  subject: z.string().min(1, "Subject is required").max(500, "Subject is too long"),
  body: z.string().min(1, "Body is required"),
  variables: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

export const updateEmailTemplateSchema = createEmailTemplateSchema.partial();

export const createEmailSettingsSchema = z.object({
  host: z.string().min(1, "SMTP host is required"),
  port: z.number().int().min(1).max(65535),
  secure: z.boolean().default(false),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  fromEmail: z.string().email("Invalid email address"),
  fromName: z.string().min(1, "From name is required"),
  isActive: z.boolean().default(true),
});

export const updateEmailSettingsSchema = createEmailSettingsSchema.partial();

export const sendEmailSchema = z.object({
  templateName: z.string().optional(),
  to: z.union([z.string().email(), z.array(z.string().email())]),
  subject: z.string().optional(),
  html: z.string().optional(),
  variables: z.record(z.any()).optional(),
  fromEmail: z.string().email().optional(),
  fromName: z.string().optional(),
});

export type CreateEmailTemplateInput = z.infer<typeof createEmailTemplateSchema>;
export type UpdateEmailTemplateInput = z.infer<typeof updateEmailTemplateSchema>;
export type CreateEmailSettingsInput = z.infer<typeof createEmailSettingsSchema>;
export type UpdateEmailSettingsInput = z.infer<typeof updateEmailSettingsSchema>;
export type SendEmailInput = z.infer<typeof sendEmailSchema>;
