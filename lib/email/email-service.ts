import { db } from "@/lib/db";
import { emailTemplates } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendEmail } from "./smtp-client";
import { renderTemplate, validateVariables, type TemplateVariables } from "./template-engine";

export interface SendEmailWithTemplateParams {
  templateName: string;
  to: string | string[];
  variables: TemplateVariables;
  fromEmail?: string;
  fromName?: string;
}

/**
 * Send an email using a template
 */
export async function sendEmailWithTemplate(
  params: SendEmailWithTemplateParams
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get template
    const templates = await db
      .select()
      .from(emailTemplates)
      .where(eq(emailTemplates.name, params.templateName))
      .limit(1);

    if (templates.length === 0) {
      return { success: false, error: "Template not found" };
    }

    const template = templates[0];

    if (!template.isActive) {
      return { success: false, error: "Template is not active" };
    }

    // Validate variables
    const validation = validateVariables(template.body, params.variables);
    if (!validation.valid) {
      return {
        success: false,
        error: `Missing required variables: ${validation.missing.join(", ")}`,
      };
    }

    // Render template
    const renderedSubject = renderTemplate(template.subject, params.variables);
    const renderedBody = renderTemplate(template.body, params.variables);

    // Send email
    const success = await sendEmail(
      params.to,
      renderedSubject,
      renderedBody,
      params.fromEmail,
      params.fromName
    );

    if (!success) {
      return { success: false, error: "Failed to send email" };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error sending email with template:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
}

/**
 * Send a simple email without template
 */
export async function sendSimpleEmail(
  to: string | string[],
  subject: string,
  html: string,
  fromEmail?: string,
  fromName?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const success = await sendEmail(to, subject, html, fromEmail, fromName);
    return success
      ? { success: true }
      : { success: false, error: "Failed to send email" };
  } catch (error: any) {
    console.error("Error sending simple email:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
}
