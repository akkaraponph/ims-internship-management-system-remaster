import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sendEmailSchema } from "@/lib/validations";
import { sendEmailWithTemplate, sendSimpleEmail } from "@/lib/email/email-service";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "admin" && session.user.role !== "super-admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = sendEmailSchema.parse(body);

    let result;

    if (validatedData.templateName) {
      // Send using template
      if (!validatedData.variables) {
        return NextResponse.json({ error: "Variables are required when using template" }, { status: 400 });
      }

      result = await sendEmailWithTemplate({
        templateName: validatedData.templateName,
        to: validatedData.to,
        variables: validatedData.variables,
        fromEmail: validatedData.fromEmail,
        fromName: validatedData.fromName,
      });
    } else {
      // Send simple email
      if (!validatedData.subject || !validatedData.html) {
        return NextResponse.json({ error: "Subject and HTML are required for simple email" }, { status: 400 });
      }

      result = await sendSimpleEmail(
        validatedData.to,
        validatedData.subject,
        validatedData.html,
        validatedData.fromEmail,
        validatedData.fromName
      );
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ message: "Email sent successfully" });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    console.error("Error sending email:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
