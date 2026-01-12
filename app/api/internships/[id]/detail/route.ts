import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { internships, students, companies, addresses, coInternships, provinces, districts, subDistricts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get internship
    const internshipRecords = await db
      .select()
      .from(internships)
      .where(eq(internships.id, id))
      .limit(1);

    if (internshipRecords.length === 0) {
      return NextResponse.json({ error: "Internship not found" }, { status: 404 });
    }

    const internship = internshipRecords[0];

    // Get student
    let student = null;
    if (internship.studentId) {
      const studentRecords = await db
        .select()
        .from(students)
        .where(eq(students.id, internship.studentId))
        .limit(1);
      if (studentRecords.length > 0) {
        student = studentRecords[0];
      }
    }

    // Get company with address
    let company: any = null;
    if (internship.companyId) {
      const companyRecords = await db
        .select()
        .from(companies)
        .where(eq(companies.id, internship.companyId))
        .limit(1);
      if (companyRecords.length > 0) {
        company = { ...companyRecords[0] };

        // Get company address
        if (company.addressId) {
          const addressRecords = await db
            .select()
            .from(addresses)
            .where(eq(addresses.id, company.addressId))
            .limit(1);
          if (addressRecords.length > 0) {
            const address = addressRecords[0];

            // Get province, district, sub-district
            let province = null;
            let district = null;
            let subDistrict = null;

            if (address.provinceId) {
              const provinceRecords = await db
                .select()
                .from(provinces)
                .where(eq(provinces.id, address.provinceId))
                .limit(1);
              if (provinceRecords.length > 0) {
                province = provinceRecords[0];
              }
            }

            if (address.districtId) {
              const districtRecords = await db
                .select()
                .from(districts)
                .where(eq(districts.id, address.districtId))
                .limit(1);
              if (districtRecords.length > 0) {
                district = districtRecords[0];
              }
            }

            if (address.subDistrictId) {
              const subDistrictRecords = await db
                .select()
                .from(subDistricts)
                .where(eq(subDistricts.id, address.subDistrictId))
                .limit(1);
              if (subDistrictRecords.length > 0) {
                subDistrict = subDistrictRecords[0];
              }
            }

            company.address = {
              ...address,
              province,
              district,
              subDistrict,
            };
          }
        }
      }
    }

    // Get co-internship students
    const coStudentRecords = await db
      .select()
      .from(coInternships)
      .where(eq(coInternships.internshipId, id));

    return NextResponse.json({
      ...internship,
      student,
      company,
      coStudents: coStudentRecords,
    });
  } catch (error: any) {
    console.error("Error fetching internship detail:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
