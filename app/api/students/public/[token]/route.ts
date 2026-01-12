import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { students, addresses, educations, contactPersons } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Find student by public profile token
    const studentRecords = await db
      .select()
      .from(students)
      .where(eq(students.publicProfileToken, token))
      .limit(1);

    if (studentRecords.length === 0 || !studentRecords[0].publicProfileToken) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const student = studentRecords[0];

    // Fetch related data
    const [presentAddress, permanentAddress, educationRecords, contactPersonRecord] = await Promise.all([
      student.presentAddressId
        ? db.select().from(addresses).where(eq(addresses.id, student.presentAddressId)).limit(1)
        : Promise.resolve([]),
      student.permanentAddressId
        ? db.select().from(addresses).where(eq(addresses.id, student.permanentAddressId)).limit(1)
        : Promise.resolve([]),
      db
        .select()
        .from(educations)
        .where(eq(educations.studentId, student.id))
        .orderBy(educations.order),
      db
        .select()
        .from(contactPersons)
        .where(eq(contactPersons.studentId, student.id))
        .limit(1),
    ]);

    // Fetch contact person address if exists
    let contactPersonAddress = null;
    if (contactPersonRecord.length > 0 && contactPersonRecord[0].addressId) {
      const addressRecords = await db
        .select()
        .from(addresses)
        .where(eq(addresses.id, contactPersonRecord[0].addressId))
        .limit(1);
      if (addressRecords.length > 0) {
        contactPersonAddress = addressRecords[0];
      }
    }

    // Filter sensitive data for public view
    const publicProfile = {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phone: student.phone,
      program: student.program,
      department: student.department,
      skill: student.skill,
      interest: student.interest,
      projectTopic: student.projectTopic,
      experience: student.experience,
      presentGpa: student.presentGpa,
      image: student.image,
      resume: student.resumeApproved ? student.resume : null, // Only show if approved
      resumeApproved: student.resumeApproved,
      isCoInternship: student.isCoInternship,
      // Hide: idCard, dateOfBirth, religion, fatherName, fatherJob, motherName, motherJob
      presentAddress: presentAddress.length > 0 ? presentAddress[0] : null,
      permanentAddress: permanentAddress.length > 0 ? permanentAddress[0] : null,
      educations: educationRecords,
      contactPerson: contactPersonRecord.length > 0
        ? {
            firstName: contactPersonRecord[0].firstName,
            lastName: contactPersonRecord[0].lastName,
            relationship: contactPersonRecord[0].relationship,
            phone: contactPersonRecord[0].phone,
            // Hide contact person address for public view
          }
        : null,
    };

    return NextResponse.json(publicProfile);
  } catch (error) {
    console.error("Error fetching public profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
