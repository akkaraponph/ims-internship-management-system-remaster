import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getApproval,
  approve,
  reject,
  addComment,
  checkApprovalPermissions,
} from "@/lib/workflows/approval.service";
import { z } from "zod";

const approveSchema = z.object({
  action: z.enum(["approve", "reject"]),
  comments: z.string().optional(),
});

const commentSchema = z.object({
  comments: z.string().min(1),
});

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

    const approval = await getApproval(id);
    if (!approval) {
      return NextResponse.json({ error: "Approval not found" }, { status: 404 });
    }

    // Check permissions
    const permissions = await checkApprovalPermissions(id, session.user.id);

    return NextResponse.json({
      ...approval,
      permissions,
    });
  } catch (error: any) {
    console.error("Error fetching approval:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = approveSchema.parse(body);

    let result;
    if (validatedData.action === "approve") {
      result = await approve(id, session.user.id, validatedData.comments);
    } else {
      result = await reject(id, session.user.id, validatedData.comments);
    }

    return NextResponse.json(result);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    if (error.message) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error processing approval:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
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
    const body = await request.json();
    const validatedData = commentSchema.parse(body);

    const result = await addComment(id, session.user.id, validatedData.comments);

    return NextResponse.json(result);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    if (error.message) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
