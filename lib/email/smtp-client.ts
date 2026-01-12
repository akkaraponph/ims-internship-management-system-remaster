import nodemailer, { Transporter } from "nodemailer";
import { db } from "@/lib/db";
import { emailSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

let transporter: Transporter | null = null;
let lastSettingsId: string | null = null;

export async function getSMTPTransporter(): Promise<Transporter | null> {
  try {
    // Get active email settings
    const settings = await db
      .select()
      .from(emailSettings)
      .where(eq(emailSettings.isActive, true))
      .limit(1);

    if (settings.length === 0) {
      console.warn("No active email settings found");
      return null;
    }

    const setting = settings[0];

    // Reuse transporter if settings haven't changed
    if (transporter && lastSettingsId === setting.id) {
      return transporter;
    }

    // Create new transporter
    transporter = nodemailer.createTransport({
      host: setting.host,
      port: setting.port,
      secure: setting.secure,
      auth: {
        user: setting.username,
        pass: setting.password,
      },
    });

    // Verify connection
    await transporter.verify();
    lastSettingsId = setting.id;

    return transporter;
  } catch (error) {
    console.error("Error creating SMTP transporter:", error);
    return null;
  }
}

export async function sendEmail(
  to: string | string[],
  subject: string,
  html: string,
  fromEmail?: string,
  fromName?: string
): Promise<boolean> {
  try {
    const transport = await getSMTPTransporter();
    if (!transport) {
      throw new Error("SMTP transporter not available");
    }

    // Get default from email/name from settings
    const settings = await db
      .select()
      .from(emailSettings)
      .where(eq(emailSettings.isActive, true))
      .limit(1);

    if (settings.length === 0) {
      throw new Error("No active email settings found");
    }

    const defaultFromEmail = fromEmail || settings[0].fromEmail;
    const defaultFromName = fromName || settings[0].fromName;

    const recipients = Array.isArray(to) ? to : [to];

    for (const recipient of recipients) {
      await transport.sendMail({
        from: `"${defaultFromName}" <${defaultFromEmail}>`,
        to: recipient,
        subject,
        html,
      });
    }

    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}
