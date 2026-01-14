import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getApprovalHistory } from "@/lib/workflows/approval.service";
import { getWorkflowInstance } from "@/lib/workflows/workflow.service";

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

    // Verify instance exists and user has access
    const instance = await getWorkflowInstance(id);
    if (!instance) {
      return NextResponse.json(
        { error: "Workflow instance not found" },
        { status: 404 }
      );
    }

    // TODO: Add proper access control based on resource type and user role
    // For now, allow if user is the creator or has appropriate role

    const history = await getApprovalHistory(id);

    return NextResponse.json(history);
  } catch (error: any) {
    console.error("Error fetching approval history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
