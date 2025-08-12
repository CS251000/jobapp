import { NextResponse } from "next/server";
import { jobApplications } from "@/db/schema";
import { db } from "@/db";
import { eq } from "drizzle-orm";
export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const applicationId = searchParams.get("applicationId");

  if (!applicationId) {
    return NextResponse.json({ error: "Application ID is required" }, { status: 400 });
  }

  try {
    await db.delete(jobApplications)
      .where(eq(jobApplications.jobApplicationId, applicationId));
    return NextResponse.json({ message: "Application deleted successfully" });
  } catch (error) {
    console.error("Error deleting application:", error);
    return NextResponse.json({ error: "Failed to delete application" }, { status: 500 });
  }
}
