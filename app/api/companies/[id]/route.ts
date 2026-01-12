import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { companies, addresses, companyUsers } from "@/lib/db/schema";
import { updateCompanySchema } from "@/lib/validations";
import { eq, and } from "drizzle-orm";

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
    
    // Check authorization
    const isAdmin = session.user.role === "admin" || session.user.role === "super-admin";
    const isDirector = session.user.role === "director";
    const isCompanyUser = session.user.role === "company" && session.user.companyId === id;
    
    if (!isAdmin && !isDirector && !isCompanyUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get company with address
    const companyResult = await db
      .select({
        company: companies,
        address: addresses,
      })
      .from(companies)
      .leftJoin(addresses, eq(companies.addressId, addresses.id))
      .where(eq(companies.id, id))
      .limit(1);

    if (companyResult.length === 0) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const { company, address } = companyResult[0];
    
    // Additional check for admin/director: must be from same university
    if ((isAdmin || isDirector) && company.universityId !== session.user.universityId && session.user.role !== "super-admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      ...company,
      address: address || null,
    });
  } catch (error) {
    console.error("Error fetching company:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    
    // Check if company exists
    const existingCompany = await db
      .select()
      .from(companies)
      .where(eq(companies.id, id))
      .limit(1);

    if (existingCompany.length === 0) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const company = existingCompany[0];

    // Authorization check
    const isSuperAdmin = session.user.role === "super-admin";
    const isAdmin = session.user.role === "admin";
    const isDirector = session.user.role === "director";
    const isCompanyUser = session.user.role === "company" && session.user.companyId === id;

    // Super-admin can edit any company
    // Admin/Director can edit companies in their university
    // Company users can edit their own company
    const canEdit = 
      isSuperAdmin ||
      (isAdmin && session.user.universityId === company.universityId) ||
      (isDirector && session.user.universityId === company.universityId) ||
      isCompanyUser;

    if (!canEdit) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateCompanySchema.parse(body);

    const updatedCompany = await db
      .update(companies)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(companies.id, id))
      .returning();

    if (updatedCompany.length === 0) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Fetch updated company with address
    const companyResult = await db
      .select({
        company: companies,
        address: addresses,
      })
      .from(companies)
      .leftJoin(addresses, eq(companies.addressId, addresses.id))
      .where(eq(companies.id, id))
      .limit(1);

    const { company: updated, address } = companyResult[0];

    return NextResponse.json({
      ...updated,
      address: address || null,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    console.error("Error updating company:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await db.delete(companies).where(eq(companies.id, id));

    return NextResponse.json({ message: "Company deleted successfully" });
  } catch (error) {
    console.error("Error deleting company:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
