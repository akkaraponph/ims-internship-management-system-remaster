import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { students } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "student") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get student record
    const studentRecords = await db
      .select()
      .from(students)
      .where(eq(students.userId, session.user.id))
      .limit(1);

    if (studentRecords.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const student = studentRecords[0];
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF and DOCX files are allowed." },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads", "resumes");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Delete old resume file if exists
    if (student.resume) {
      const oldResumePath = join(process.cwd(), "public", student.resume);
      if (existsSync(oldResumePath)) {
        try {
          await unlink(oldResumePath);
        } catch (error) {
          console.error("Error deleting old resume:", error);
        }
      }
    }

    // Generate unique filename
    const fileExtension = file.name.split(".").pop();
    const fileName = `${student.id}-${Date.now()}.${fileExtension}`;
    const filePath = join(uploadsDir, fileName);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Update student record with resume file path and reset approval status
    const fileUrl = `/uploads/resumes/${fileName}`;
    await db
      .update(students)
      .set({
        resume: fileUrl,
        resumeStatus: true,
        resumeApproved: false,
        resumeApprovedBy: null,
        resumeApprovedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(students.id, student.id));

    // Return file URL

    return NextResponse.json({
      message: "Resume uploaded successfully",
      fileUrl,
      fileName: file.name,
    });
  } catch (error: any) {
    console.error("Error uploading resume:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
